const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const { supabase } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Get all approved jobs with filters
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('search').optional().trim(),
  query('location').optional().trim(),
  query('remote').optional().isBoolean(),
  query('category').optional().trim()
], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      location,
      remote,
      category
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('job_listings')
      .select(`
        *,
        companies (name, logo_url),
        job_categories (name)
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    
    if (remote === 'true') {
      query = query.eq('remote_ok', true);
    }
    
    if (category) {
      query = query.eq('category_id', category);
    }
    
    const { data: jobs, error, count } = await query;
    
    if (error) throw error;
    
    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('job_listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');
    
    res.json({
      success: true,
      jobs,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
    
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs'
    });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: job, error } = await supabase
      .from('job_listings')
      .select(`
        *,
        companies (*),
        job_categories (*)
      `)
      .eq('id', id)
      .eq('status', 'approved')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Job not found'
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      job
    });
    
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job'
    });
  }
});

// Create job (employer only)
router.post('/', 
  authenticate,
  authorize('employer'),
  [
    body('title').notEmpty().trim(),
    body('description').notEmpty().trim(),
    body('location').notEmpty().trim(),
    body('requirements').isArray(),
    body('responsibilities').isArray(),
    body('jobType').isIn(['full-time', 'part-time', 'contract', 'internship']),
    body('experienceLevel').isIn(['entry', 'mid', 'senior', 'executive']),
    body('salaryMin').optional().isInt({ min: 0 }),
    body('salaryMax').optional().isInt({ min: 0 })
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
        title,
        description,
        location,
        remoteOk = false,
        requirements,
        responsibilities,
        benefits = [],
        jobType,
        experienceLevel,
        salaryMin,
        salaryMax,
        salaryCurrency = 'USD',
        categoryId
      } = req.body;
      
      // Get company ID from user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', req.user.id)
        .single();
      
      if (!profile?.company_id) {
        return res.status(400).json({
          success: false,
          error: 'You need to register a company first'
        });
      }
      
      const { data: job, error } = await supabase
        .from('job_listings')
        .insert([{
          company_id: profile.company_id,
          title,
          description,
          location,
          remote_ok: remoteOk,
          requirements,
          responsibilities,
          benefits,
          job_type: jobType,
          experience_level: experienceLevel,
          salary_min: salaryMin,
          salary_max: salaryMax,
          salary_currency: salaryCurrency,
          category_id: categoryId,
          status: 'pending'
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      res.status(201).json({
        success: true,
        message: 'Job created successfully and sent for approval',
        job
      });
      
    } catch (error) {
      console.error('Create job error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create job'
      });
    }
  }
);

// Update job (owner or admin)
router.put('/:id',
  authenticate,
  [
    body('title').optional().trim(),
    body('description').optional().trim(),
    body('status').optional().isIn(['pending', 'approved', 'rejected', 'closed'])
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Check if user can update this job
      const { data: job } = await supabase
        .from('job_listings')
        .select('company_id')
        .eq('id', id)
        .single();
      
      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found'
        });
      }
      
      // Check permissions
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, company_id')
        .eq('id', req.user.id)
        .single();
      
      const isOwner = profile.company_id === job.company_id;
      const isAdmin = profile.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this job'
        });
      }
      
      // Prepare update data
      const updateData = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.status) updateData.status = updates.status;
      if (updates.location) updateData.location = updates.location;
      if (updates.remoteOk !== undefined) updateData.remote_ok = updates.remoteOk;
      
      updateData.updated_at = new Date().toISOString();
      
      const { data: updatedJob, error } = await supabase
        .from('job_listings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      res.json({
        success: true,
        message: 'Job updated successfully',
        job: updatedJob
      });
      
    } catch (error) {
      console.error('Update job error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update job'
      });
    }
  }
);

// Get employer's jobs
router.get('/employer/mine',
  authenticate,
  authorize('employer'),
  async (req, res) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', req.user.id)
        .single();
      
      const { data: jobs, error } = await supabase
        .from('job_listings')
        .select(`
          *,
          companies (*),
          applications (count)
        `)
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      res.json({
        success: true,
        jobs
      });
      
    } catch (error) {
      console.error('Get employer jobs error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch jobs'
      });
    }
  }
);

module.exports = router;