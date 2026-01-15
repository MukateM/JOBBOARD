// server/src/routes/applications.js
const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Submit application (applicant only)
router.post('/',
  authenticate,
  authorize('applicant'),
  async (req, res) => {
    try {
      const { 
        jobId, 
        email,
        phone,
        experienceYears,
        qualifications,
        skills,
        coverLetter,
        linkedinUrl,
        portfolioUrl
      } = req.body;
      
      if (!jobId) {
        return res.status(400).json({
          success: false,
          error: 'Job ID is required'
        });
      }

      // Check if already applied
      const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('user_id', req.user.userId)
        .single();

      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'You have already applied to this job'
        });
      }

      // Create application (trigger will auto-calculate ai_score)
      const { data: application, error } = await supabase
        .from('applications')
        .insert([{
          job_id: jobId,
          user_id: req.user.userId,
          email,
          phone,
          experience_years: experienceYears,
          qualifications: qualifications || [],
          skills: skills || [],
          cover_letter: coverLetter,
          linkedin_url: linkedinUrl || null,
          portfolio_url: portfolioUrl || null,
          status: 'pending',
          submitted_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Create application error:', error);
        throw error;
      }

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        application
      });

    } catch (error) {
      console.error('Submit application error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit application',
        details: error.message
      });
    }
  }
);

// Get user's applications (applicant only)
router.get('/me',
  authenticate,
  authorize('applicant'),
  async (req, res) => {
    try {
      const { data: applications, error } = await supabase
        .from('applications')
        .select(`
          *,
          job_listings (
            id,
            title,
            location,
            job_type,
            companies (
              name,
              logo_url
            )
          )
        `)
        .eq('user_id', req.user.userId)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Get applications error:', error);
        throw error;
      }

      res.json({
        success: true,
        applications: applications || []
      });

    } catch (error) {
      console.error('Get applications error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch applications',
        details: error.message
      });
    }
  }
);

// Get single application
router.get('/:id',
  authenticate,
  async (req, res) => {
    try {
      const { id } = req.params;

      const { data: application, error } = await supabase
        .from('applications')
        .select(`
          *,
          job_listings (
            *,
            companies (*)
          ),
          profiles (
            full_name,
            email,
            phone
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            error: 'Application not found'
          });
        }
        throw error;
      }

      // Check permissions
      const isOwner = application.user_id === req.user.userId;
      const isEmployer = req.user.role === 'employer';
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isEmployer && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this application'
        });
      }

      res.json({
        success: true,
        application
      });

    } catch (error) {
      console.error('Get application error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch application'
      });
    }
  }
);

// Withdraw application (applicant only)
router.delete('/:id',
  authenticate,
  authorize('applicant'),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check ownership
      const { data: application } = await supabase
        .from('applications')
        .select('user_id')
        .eq('id', id)
        .single();

      if (!application || application.user_id !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to withdraw this application'
        });
      }

      // Delete application
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({
        success: true,
        message: 'Application withdrawn successfully'
      });

    } catch (error) {
      console.error('Withdraw application error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to withdraw application'
      });
    }
  }
);

// ✨ NEW: Get RANKED applications for a job (employer/admin only)
router.get('/job/:jobId/ranked',
  authenticate,
  async (req, res) => {
    try {
      const { jobId } = req.params;
      const { minScore = 0, limit = 50 } = req.query;

      // Check if user is employer/admin and owns the job
      if (req.user.role === 'employer') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', req.user.userId)
          .single();

        const { data: job } = await supabase
          .from('job_listings')
          .select('company_id')
          .eq('id', jobId)
          .single();

        if (!job || profile.company_id !== job.company_id) {
          return res.status(403).json({
            success: false,
            error: 'Not authorized to view these applications'
          });
        }
      } else if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized'
        });
      }

      // Call the Postgres function to get ranked candidates
      const { data: rankedCandidates, error } = await supabase
        .rpc('get_ranked_candidates', {
          p_job_id: jobId,
          p_min_score: parseInt(minScore) || 0,
          p_limit: parseInt(limit) || 50
        });

      if (error) {
        console.error('Get ranked candidates error:', error);
        throw error;
      }

      res.json({
        success: true,
        candidates: rankedCandidates || [],
        count: rankedCandidates?.length || 0
      });

    } catch (error) {
      console.error('Get ranked applications error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch ranked applications',
        details: error.message
      });
    }
  }
);

// Get applications for a job (employer/admin only) - UPDATED with scores
router.get('/job/:jobId',
  authenticate,
  async (req, res) => {
    try {
      const { jobId } = req.params;

      // Check if user is employer/admin and owns the job
      if (req.user.role === 'employer') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', req.user.userId)
          .single();

        const { data: job } = await supabase
          .from('job_listings')
          .select('company_id')
          .eq('id', jobId)
          .single();

        if (!job || profile.company_id !== job.company_id) {
          return res.status(403).json({
            success: false,
            error: 'Not authorized to view these applications'
          });
        }
      } else if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized'
        });
      }

      // Now returns applications sorted by match score
      const { data: applications, error } = await supabase
        .from('applications')
        .select(`
          *,
          profiles (
            full_name,
            email,
            phone,
            location
          )
        `)
        .eq('job_id', jobId)
        .order('ai_score', { ascending: false, nullsLast: true })
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        applications: applications || []
      });

    } catch (error) {
      console.error('Get job applications error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch applications'
      });
    }
  }
);

// Update application status (employer/admin only)
router.patch('/:id/status',
  authenticate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status'
        });
      }

      // Check permissions
      if (req.user.role !== 'admin' && req.user.role !== 'employer') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized'
        });
      }

      const { data: application, error } = await supabase
        .from('applications')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        message: 'Application status updated',
        application
      });

    } catch (error) {
      console.error('Update application status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update application status'
      });
    }
  }
);

module.exports = router;