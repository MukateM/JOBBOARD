const { supabase } = require('../config/database');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'your-secret-key-change-this',
    { expiresIn: '7d' }
  );
};

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    console.log('📝 Registration attempt:', { email, fullName, role });

    // Validate input
    if (!email || !password || !fullName || !role) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    if (!['applicant', 'employer'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role'
      });
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
        role: role
      }
    });

    if (authError) {
      console.error('❌ Supabase auth error:', authError);
      return res.status(400).json({
        success: false,
        error: authError.message || 'Failed to create user'
      });
    }

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        email: email.toLowerCase(),
        full_name: fullName,
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (profileError) {
      console.error('❌ Profile creation error:', profileError);
      // Cleanup: delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({
        success: false,
        error: 'Failed to create profile'
      });
    }

    // If employer, create company placeholder
    // If employer, create company placeholder
if (role === 'employer') {
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert([{
      user_id: user.id,
      name: fullName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (companyError) {
    console.error('❌ Company creation error:', companyError);
  } else {
    // Update profile with company_id
    await supabase
      .from('profiles')
      .update({ company_id: company.id })
      .eq('id', user.id);
    
    console.log('✅ Company created and linked to profile');
  }
}

    // Generate our own JWT token for the app
    const token = generateToken(profile.id, profile.role);

    console.log('✅ User registered successfully:', profile.email);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
        createdAt: profile.created_at
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password
    });

    if (authError) {
      console.error('❌ Auth error:', authError);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      console.error('❌ Profile not found:', profileError);
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    // Generate our own JWT token
    const token = generateToken(profile.id, profile.role);

    console.log('✅ Login successful:', profile.email);

    res.json({
      success: true,
      token,
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
        createdAt: profile.created_at
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.userId)
      .single();

    if (error || !profile) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
        phone: profile.phone,
        companyId: profile.company_id,
        createdAt: profile.created_at
      }
    });

  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const updates = {
      updated_at: new Date().toISOString()
    };

    if (fullName) updates.full_name = fullName;
    if (phone) updates.phone = phone;

    if (Object.keys(updates).length === 1) {
      return res.status(400).json({
        success: false,
        error: 'No updates provided'
      });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.user.userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Update error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }

    res.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
        phone: profile.phone,
        createdAt: profile.created_at
      }
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};