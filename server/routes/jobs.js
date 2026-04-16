const express = require('express');
const router = express.Router();
const { getJobs, generateJobs, toggleSaveJob, markApplied } = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getJobs);
router.post('/generate', protect, generateJobs);
router.put('/:jobId/save', protect, toggleSaveJob);
router.put('/:jobId/apply', protect, markApplied);

module.exports = router;
