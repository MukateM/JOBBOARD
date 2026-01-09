const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/database');
const { sendEmail } = require('../config/email');

// Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').notEmpty().trim(),
  body('role').isIn(['applicant', 'employer'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    const { email, password, fullName, role } = req.body;
    
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) throw authError;
    
    const userId = authData.user.id;
    
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        email,
        full_name: fullName,
        role
      }]);
    
    if (profileError) throw profileError;
    
    // Create JWT token
    const token = jwt.sign(
      { userId, email, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    // Send welcome email
    await sendEmail(
      email,
      'Welcome to ZedLink Careers!',
      `<h1>Welcome ${fullName}!</h1>
       <p>Your account has been created successfully as a ${role}.</p>
       <p>Start exploring job opportunities or posting jobs!</p>`
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        fullName,
        role
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    const { email, password } = req.body;
    
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    const userId = authData.user.id;
    
    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        companyId: user.company_id
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { data: user, error } = await supabase
      .from('profiles')
      .select(`
        *,
        companies (*)
      `)
      .eq('id', decoded.userId)
      .single();
    
    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        phone: user.phone,
        company: user.companies
      }
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to get user'
    });
  }
});

// Update profile
router.put('/profile', [
  body('fullName').optional().trim(),
  body('phone').optional().trim(),
  body('linkedinUrl').optional().isURL()
], async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const updates = req.body;
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.fullName,
        phone: updates.phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', decoded.userId);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

module.exports = router;