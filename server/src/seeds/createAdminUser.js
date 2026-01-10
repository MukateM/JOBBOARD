const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function seedAdminUser() {
  // Admin credentials from environment variables (secure!)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@zedlink.com';
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'System Administrator';

  if (!adminPassword) {
    console.error('❌ ADMIN_PASSWORD environment variable is required');
    console.log('Set it in your .env file: ADMIN_PASSWORD=your-secure-password');
    process.exit(1);
  }

  try {
    console.log('🌱 Seeding admin user...');
    console.log('📧 Email:', adminEmail);

    // Check if admin already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', adminEmail)
      .single();

    if (existingProfile) {
      console.log('⚠️  Admin user already exists');
      console.log('   ID:', existingProfile.id);
      console.log('   Email:', existingProfile.email);
      console.log('   Role:', existingProfile.role);
      
      if (existingProfile.role !== 'admin') {
        console.log('🔄 Updating role to admin...');
        await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', existingProfile.id);
        console.log('✅ Role updated to admin');
      }
      
      return;
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: adminName,
        role: 'admin'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  User exists in auth but not in profiles');
        console.log('Please manually check auth.users table');
      } else {
        console.error('❌ Auth error:', authError.message);
      }
      return;
    }

    console.log('✅ Auth user created');

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        email: adminEmail,
        full_name: adminName,
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (profileError) {
      console.error('❌ Profile error:', profileError.message);
      // Cleanup: delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return;
    }

    console.log('✅ Admin profile created successfully!');
    console.log('');
    console.log('📋 Admin Credentials:');
    console.log('   Email:', adminEmail);
    console.log('   Password: [hidden - check your .env]');
    console.log('');
    console.log('⚠️  IMPORTANT: Store these credentials securely!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the seed
seedAdminUser()
  .then(() => {
    console.log('🌱 Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });