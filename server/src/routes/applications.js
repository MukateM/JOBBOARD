const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const { sendEmail } = require('../config/email');

// Submit application
router.post('/',
  authenticate,
  authorize('applicant'),
  [
    body('jobId').notEmpty(),
    body('email').isEmail(),
    body('phone').notEmpty(),
    body('experienceYears').isInt({ min: 0 }),
    body('qualifications').isArray(),
    body('skills').isArray(),
    body('coverLetter').notEmpty().trim()
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
      
      // Check if job exists and is approved
      const { data: job, error: jobError } = await supabase
        .from('job_listings')
        .select('id, title, company_id, companies(name)')
        .eq('id', jobId)
        .eq('status', 'approved')
        .single();
      
      if (jobError || !job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found or not approved'
        });
      }
      
      // Check if already applied
      const { data: existingApp } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('applicant_id', req.user.id)
        .single();
      
      if (existingApp) {
        return res.status(400).json({
          success: false,
          error: 'You have already applied for this job'
        });
      }
      
      // Calculate AI score (simplified)
      const aiScore = calculateAIScore(job, {
        experienceYears,
        skills,
        qualifications
      });
      
      // Create application
      const { data: application, error: appError } = await supabase
        .from('applications')
        .insert([{
          job_id: jobId,
          applicant_id: req.user.id,
          email,
          phone,
          experience_years: experienceYears,
          qualifications,
          skills,
          cover_letter: coverLetter,
          linkedin_url: linkedinUrl,
          portfolio_url: portfolioUrl,
          ai_score: aiScore
        }])
        .select()
        .single();
      
      if (appError) throw appError;
      
      // Notify employer
      const employerNotification = `
        <h1>New Application Received</h1>
        <p>You have received a new application for the position: <strong>${job.title}</strong></p>
        <p>Applicant: ${req.user.full_name}</p>
        <p>AI Match Score: ${aiScore}%</p>
        <p>Login to your dashboard to review the application.</p>
      `;
      
      // Get employer email
      const { data: company } = await supabase
        .from('companies')
        .select('contact_email')
        .eq('id', job.company_id)
        .single();
      
      if (company?.contact_email) {
        await sendEmail(
          company.contact_email,
          `New Application: ${job.title}`,
          employerNotification
        );
      }
      
      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        application,
        aiScore
      });
      
    } catch (error) {
      console.error('Submit application error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit application'
      });
    }
  }
);

// Get user's applications
router.get('/my-applications',
  authenticate,
  authorize('applicant'),
  async (req, res) => {
    try {
      const { data: applications, error } = await supabase
        .from('applications')
        .select(`
          *,
          job_listings (
            title,
            companies (name),
            location
          )
        `)
        .eq('applicant_id', req.user.id)
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      
      res.json({
        success: true,
        applications
      });
      
    } catch (error) {
      console.error('Get applications error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch applications'
      });
    }
  }
);

// Get applications for a job (employer only)
router.get('/job/:jobId',
  authenticate,
  async (req, res) => {
    try {
      const { jobId } = req.params;
      
      // Verify employer owns this job
      const { data: job } = await supabase
        .from('job_listings')
        .select('company_id')
        .eq('id', jobId)
        .single();
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, company_id')
        .eq('id', req.user.id)
        .single();
      
      const isOwner = profile.company_id === job?.company_id;
      const isAdmin = profile.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view these applications'
        });
      }
      
      const { data: applications, error } = await supabase
        .from('applications')
        .select(`
          *,
          profiles (full_name, email, phone)
        `)
        .eq('job_id', jobId)
        .order('ai_score', { ascending: false });
      
      if (error) throw error;
      
      res.json({
        success: true,
        applications
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

// Update application status
router.put('/:id/status',
  authenticate,
  [
    body('status').isIn(['reviewing', 'shortlisted', 'rejected', 'hired']),
    body('notes').optional().trim()
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      
      // Get application with job details
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select(`
          *,
          job_listings (
            title,
            company_id
          )
        `)
        .eq('id', id)
        .single();
      
      if (appError) throw appError;
      
      // Verify permissions
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, company_id')
        .eq('id', req.user.id)
        .single();
      
      const isOwner = profile.company_id === application.job_listings.company_id;
      const isAdmin = profile.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this application'
        });
      }
      
      // Update application
      const { data: updatedApp, error } = await supabase
        .from('applications')
        .update({
          status,
          notes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Notify applicant
      const statusMessages = {
        reviewing: 'is being reviewed',
        shortlisted: 'has been shortlisted',
        rejected: 'was not selected',
        hired: 'was successful! Congratulations!'
      };
      
      const notification = `
        <h1>Application Status Update</h1>
        <p>Your application for <strong>${application.job_listings.title}</strong> ${statusMessages[status]}.</p>
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        <p>Login to your account to view details.</p>
      `;
      
      const { data: applicant } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', application.applicant_id)
        .single();
      
      if (applicant?.email) {
        await sendEmail(
          applicant.email,
          `Application Update: ${application.job_listings.title}`,
          notification
        );
      }
      
      res.json({
        success: true,
        message: 'Application status updated',
        application: updatedApp
      });
      
    } catch (error) {
      console.error('Update application error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update application'
      });
    }
  }
);

// Generate application PDF
router.get('/:id/pdf',
  authenticate,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const { data: application, error } = await supabase
        .from('applications')
        .select(`
          *,
          profiles (full_name, email, phone),
          job_listings (
            title,
            companies (name)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error || !application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found'
        });
      }
      
      // Verify permissions
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, company_id, id')
        .eq('id', req.user.id)
        .single();
      
      const isApplicant = profile.id === application.applicant_id;
      const isOwner = profile.company_id === application.job_listings.company_id;
      const isAdmin = profile.role === 'admin';
      
      if (!isApplicant && !isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this PDF'
        });
      }
      
      // Create PDF
      const doc = new PDFDocument({ margin: 50 });
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=application-${id}.pdf`);
      
      doc.pipe(res);
      
      // PDF content
      doc.fontSize(20).text('Job Application', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(14).text(`Position: ${application.job_listings.title}`);
      doc.text(`Company: ${application.job_listings.companies.name}`);
      doc.moveDown();
      
      doc.fontSize(16).text('Applicant Information');
      doc.fontSize(12).text(`Name: ${application.profiles.full_name}`);
      doc.text(`Email: ${application.profiles.email}`);
      doc.text(`Phone: ${application.phone}`);
      doc.text(`Experience: ${application.experience_years} years`);
      doc.moveDown();
      
      doc.fontSize(16).text('Qualifications');
      application.qualifications.forEach(qual => {
        doc.fontSize(12).text(`• ${qual}`);
      });
      doc.moveDown();
      
      doc.fontSize(16).text('Skills');
      application.skills.forEach(skill => {
        doc.fontSize(12).text(`• ${skill}`);
      });
      doc.moveDown();
      
      doc.fontSize(16).text('Cover Letter');
      doc.fontSize(12).text(application.cover_letter);
      doc.moveDown();
      
      doc.fontSize(10).text(`Application ID: ${id}`, { align: 'right' });
      doc.text(`Submitted: ${new Date(application.submitted_at).toLocaleDateString()}`, { align: 'right' });
      
      doc.end();
      
    } catch (error) {
      console.error('Generate PDF error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate PDF'
      });
    }
  }
);

// Helper function for AI scoring
function calculateAIScore(job, applicant) {
  let score = 50; // Base score
  
  // Experience match
  const jobTitle = job.title.toLowerCase();
  const applicantSkills = applicant.skills.map(s => s.toLowerCase());
  
  // Check for keyword matches
  const keywords = ['javascript', 'react', 'node', 'python', 'java', 'sql', 'aws'];
  const matchedKeywords = keywords.filter(keyword => 
    jobTitle.includes(keyword) && applicantSkills.some(skill => skill.includes(keyword))
  );
  
  score += matchedKeywords.length * 5;
  
  // Experience years bonus
  if (applicant.experienceYears >= 3) score += 10;
  if (applicant.experienceYears >= 5) score += 15;
  
  // Cap at 100
  return Math.min(score, 100);
}

module.exports = router;