const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Get pending jobs for approval
router.get('/jobs/pending',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { data: jobs, error } = await supabase
        .from('job_listings')
        .select(`
          *,
          companies (name, contact_email, verified)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      res.json({
        success: true,
        jobs
      });
      
    } catch (error) {
      console.error('Get pending jobs error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch pending jobs'
      });
    }
  }
);

// Approve/reject job
router.put('/jobs/:id/status',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status'
        });
      }
      
      // Get job details
      const { data: job, error: jobError } = await supabase
        .from('job_listings')
        .select('*, companies(contact_email, name)')
        .eq('id', id)
        .single();
      
      if (jobError) throw jobError;
      
      // Update job status
      const { data: updatedJob, error } = await supabase
        .from('job_listings')
        .update({
          status,
          published_at: status === 'approved' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Notify employer
      const notification = status === 'approved' 
        ? `
          <h1>Job Listing Approved!</h1>
          <p>Your job listing "<strong>${job.title}</strong>" has been approved and is now live on ZedLink Careers.</p>
          <p>Candidates can now view and apply for this position.</p>
          <p><a href="${process.env.FRONTEND_URL}/jobs/${id}">View Job Listing</a></p>
        `
        : `
          <h1>Job Listing Rejected</h1>
          <p>Your job listing "<strong>${job.title}</strong>" has been rejected.</p>
          ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
          <p>Please review our guidelines and submit a revised listing.</p>
        `;
      
      // Send email notification
      const { sendEmail } = require('../config/email');
      await sendEmail(
        job.companies.contact_email,
        `Job Listing ${status === 'approved' ? 'Approved' : 'Rejected'}: ${job.title}`,
        notification
      );
      
      res.json({
        success: true,
        message: `Job ${status} successfully`,
        job: updatedJob
      });
      
    } catch (error) {
      console.error('Update job status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update job status'
      });
    }
  }
);

// Get platform statistics
router.get('/statistics',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      // Get counts
      const [
        { count: totalJobs },
        { count: pendingJobs },
        { count: totalApplications },
        { count: totalUsers },
        { count: totalCompanies }
      ] = await Promise.all([
        supabase.from('job_listings').select('*', { count: 'exact', head: true }),
        supabase.from('job_listings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('companies').select('*', { count: 'exact', head: true })
      ]);
      
      // Get recent activity
      const { data: recentApplications } = await supabase
        .from('applications')
        .select(`
          *,
          profiles (full_name),
          job_listings (title)
        `)
        .order('submitted_at', { ascending: false })
        .limit(10);
      
      // Get user growth (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: userGrowth } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString());
      
      res.json({
        success: true,
        statistics: {
          totalJobs,
          pendingJobs,
          totalApplications,
          totalUsers,
          totalCompanies,
          recentApplications,
          userGrowth: userGrowth?.length || 0
        }
      });
      
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics'
      });
    }
  }
);

// Get all companies
router.get('/companies',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { data: companies, error } = await supabase
        .from('companies')
        .select('*, profiles(count)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      res.json({
        success: true,
        companies
      });
      
    } catch (error) {
      console.error('Get companies error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch companies'
      });
    }
  }
);

// Verify company
router.put('/companies/:id/verify',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { verified } = req.body;
      
      const { data: company, error } = await supabase
        .from('companies')
        .update({ verified })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      res.json({
        success: true,
        message: `Company ${verified ? 'verified' : 'unverified'} successfully`,
        company
      });
      
    } catch (error) {
      console.error('Verify company error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update company verification'
      });
    }
  }
);

module.exports = router;