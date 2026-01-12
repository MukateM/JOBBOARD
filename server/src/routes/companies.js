const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', 
  authenticate,
  authorize('employer'),
  async (req, res) => {
    try {
      const { name, description = '', logo_url = '', website = '', location = '' } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Company name is required'
        });
      }

      const { data: company, error } = await supabase
        .from('companies')
        .insert([{
          name,
          description,
          logo_url,
          website,
          location,
          created_by: req.user.userId,  // matches your token structure
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Create company DB error:', error);
        throw error;
      }

      res.status(201).json({
        success: true,
        company
      });

    } catch (error) {
      console.error('Create company error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create company',
        details: error.message
      });
    }
  }
);

module.exports = router;