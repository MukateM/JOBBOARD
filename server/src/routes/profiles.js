const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');
const { authenticate } = require('../middleware/auth');

// GET /api/profiles/me - Get current user's profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.userId)
      .single();

    if (error) {
      console.error('Get profile error:', error);
      throw error;
    }

    res.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
      details: error.message
    });
  }
});

// PATCH /api/profiles/me - Update current user's profile
router.patch('/me', authenticate, async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.created_at;
    
    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.user.userId)
      .select()
      .single();

    if (error) {
      console.error('Update profile error:', error);
      throw error;
    }

    res.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      details: error.message
    });
  }
});

module.exports = router;