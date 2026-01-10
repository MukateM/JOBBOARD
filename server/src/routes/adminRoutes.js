const express = require('express');
const { 
  getPendingJobs, 
  approveJob, 
  rejectJob, 
  getAllJobs 
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// Job management
router.get('/jobs/pending', getPendingJobs);
router.get('/jobs', getAllJobs);
router.put('/jobs/:id/approve', approveJob);
router.put('/jobs/:id/reject', rejectJob);

module.exports = router;