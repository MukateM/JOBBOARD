import { supabase } from '../config/supabase';

const api = {
  // Auth
  async register(data) {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: data.role
        }
      }
    });
    
    if (error) throw error;
    return { data: { success: true, user: authData.user } };
  },

  async login(data) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });
    
    if (error) throw error;
    return { data: { success: true, user: authData.user } };
  },

  // Jobs
  async get(url) {
    if (url.startsWith('/jobs')) {
      const { data, error } = await supabase
        .from('job_listings')
        .select(`
          *,
          companies (name, logo_url),
          job_categories (name)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data: { success: true, jobs: data, pagination: {} } };
    }
    
    // Add more routes as needed
    throw new Error('Route not implemented yet');
  },

  async post(url, data) {
    // Implementation for POST requests
    throw new Error('Route not implemented yet');
  }
};

export default api;