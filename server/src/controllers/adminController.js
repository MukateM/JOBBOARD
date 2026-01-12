const { supabase } = require('../config/database');

// Get all pending jobs
const getPendingJobs = async (req, res) => {
  try {
    const { data: jobs, error } = await supabase
      .from('job_listings')
      .select(`
        *,
        company:companies(
          id,
          name,
          logo_url,
          location
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching pending jobs:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch pending jobs'
      });
    }

    res.json({
      success: true,
      jobs: jobs || [],
      total: jobs?.length || 0
    });

  } catch (error) {
    console.error('❌ Get pending jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Approve a job
const approveJob = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('✅ Admin approving job:', id);

    const { data: job, error } = await supabase
      .from('job_listings')
      .update({
        status: 'approved',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Approve error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to approve job'
      });
    }

    res.json({
      success: true,
      message: 'Job approved successfully',
      job
    });

  } catch (error) {
    console.error('❌ Approve job error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Reject a job
const rejectJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    console.log('❌ Admin rejecting job:', id);

    const { data: job, error } = await supabase
      .from('job_listings')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
        // Optional: add rejection_reason column to store reason
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Reject error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to reject job'
      });
    }

    res.json({
      success: true,
      message: 'Job rejected',
      job
    });

  } catch (error) {
    console.error('❌ Reject job error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Get all jobs (for admin overview)
const getAllJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let query = supabase
      .from('job_listings')
      .select(`
        *,
        company:companies(
          id,
          name,
          logo_url,
          location
        )
      `, { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: jobs, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('❌ Error fetching jobs:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch jobs'
      });
    }

    res.json({
      success: true,
      jobs: jobs || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('❌ Get all jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  getPendingJobs,
  approveJob,
  rejectJob,
  getAllJobs
};