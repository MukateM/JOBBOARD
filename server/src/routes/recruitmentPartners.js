// server/src/routes/recruitmentPartners.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Get featured partners (public - for homepage)
router.get('/featured', async (req, res) => {
  try {
    const { data: partners, error } = await supabase
      .from('recruitment_partners')
      .select('*')
      .eq('status', 'approved')
      .eq('is_featured', true)
      .or('featured_until.is.null,featured_until.gt.' + new Date().toISOString())
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) throw error;

    res.json({
      success: true,
      partners: partners || []
    });
  } catch (error) {
    console.error('Get featured partners error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured partners'
    });
  }
});

// Get all approved partners (public - for directory page)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      search,
      specialty 
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('recruitment_partners')
      .select('*', { count: 'exact' })
      .eq('status', 'approved');

    if (search) {
      query = query.or(`company_name.ilike.%${search}%,specialty.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (specialty) {
      query = query.ilike('specialty', `%${specialty}%`);
    }

    const { data: partners, error, count } = await query
      .order('is_featured', { ascending: false })
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      partners: partners || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get partners error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch partners'
    });
  }
});

// Get single partner by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: partner, error } = await supabase
      .from('recruitment_partners')
      .select(`
        *,
        partner_reviews (
          id,
          rating,
          review_text,
          company_name,
          position_filled,
          created_at
        )
      `)
      .eq('id', id)
      .eq('status', 'approved')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Partner not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      partner
    });
  } catch (error) {
    console.error('Get partner error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch partner'
    });
  }
});

// Submit partner application (authenticated employers only)
router.post('/',
  authenticate,
  authorize('employer'),
  [
    body('companyName').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('phone').notEmpty().trim(),
    body('specialty').notEmpty().trim(),
    body('description').notEmpty().trim(),
    body('website').optional({ checkFalsy: true }).isURL(),
    body('yearsInBusiness').optional({ checkFalsy: true }).isInt({ min: 0 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const {
        companyName,
        email,
        phone,
        specialty,
        description,
        website,
        address,
        contactPerson,
        registrationNumber,
        yearsInBusiness,
        teamSize,
        linkedinUrl,
        facebookUrl,
        pricingModel
      } = req.body;

      // Check if partner already exists with this email
      const { data: existing } = await supabase
        .from('recruitment_partners')
        .select('id')
        .eq('email', email)
        .single();

      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'A partner with this email already exists'
        });
      }

      const { data: partner, error } = await supabase
        .from('recruitment_partners')
        .insert([{
          company_name: companyName,
          email,
          phone,
          specialty,
          description,
          website_url: website,
          address,
          contact_person: contactPerson,
          registration_number: registrationNumber,
          years_in_business: yearsInBusiness,
          team_size: teamSize,
          linkedin_url: linkedinUrl,
          facebook_url: facebookUrl,
          pricing_model: pricingModel,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully. We will review and contact you soon.',
        partner
      });
    } catch (error) {
      console.error('Submit partner application error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit application'
      });
    }
  }
);

// Upload partner logo
router.post('/:id/logo',
  authenticate,
  authorize('employer'),
  async (req, res) => {
    try {
      // This would typically use multer or another file upload middleware
      // For now, just accepting a logo URL
      const { id } = req.params;
      const { logoUrl } = req.body;

      if (!logoUrl) {
        return res.status(400).json({
          success: false,
          error: 'Logo URL is required'
        });
      }

      const { data: partner, error } = await supabase
        .from('recruitment_partners')
        .update({ logo_url: logoUrl })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        message: 'Logo updated successfully',
        partner
      });
    } catch (error) {
      console.error('Update logo error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update logo'
      });
    }
  }
);

// ADMIN ROUTES

// Get pending partner applications (admin only)
router.get('/admin/pending',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { data: partners, error } = await supabase
        .from('recruitment_partners')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;

      res.json({
        success: true,
        partners: partners || []
      });
    } catch (error) {
      console.error('Get pending partners error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch pending partners'
      });
    }
  }
);

// Approve/Reject partner (admin only)
router.put('/:id/status',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, rejectionReason, isFeatured, featuredDuration } = req.body;

      if (!['approved', 'rejected', 'suspended'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status'
        });
      }

      const updates = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'approved') {
        updates.approved_at = new Date().toISOString();
        
        if (isFeatured) {
          updates.is_featured = true;
          if (featuredDuration) {
            const featuredUntil = new Date();
            featuredUntil.setMonth(featuredUntil.getMonth() + parseInt(featuredDuration));
            updates.featured_until = featuredUntil.toISOString();
          }
        }
      } else if (status === 'rejected') {
        updates.rejection_reason = rejectionReason;
      }

      const { data: partner, error } = await supabase
        .from('recruitment_partners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        message: `Partner ${status} successfully`,
        partner
      });
    } catch (error) {
      console.error('Update partner status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update partner status'
      });
    }
  }
);

// Update featured status (admin only)
router.put('/:id/featured',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { isFeatured, duration } = req.body; // duration in months

      const updates = {
        is_featured: isFeatured
      };

      if (isFeatured && duration) {
        const featuredUntil = new Date();
        featuredUntil.setMonth(featuredUntil.getMonth() + parseInt(duration));
        updates.featured_until = featuredUntil.toISOString();
      } else if (!isFeatured) {
        updates.featured_until = null;
      }

      const { data: partner, error } = await supabase
        .from('recruitment_partners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        message: isFeatured ? 'Partner featured successfully' : 'Featured status removed',
        partner
      });
    } catch (error) {
      console.error('Update featured status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update featured status'
      });
    }
  }
);

module.exports = router;