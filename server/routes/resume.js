const express = require('express');
const router = express.Router();
const { getResume, saveResume, analyzeResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getResume);
router.put('/', protect, saveResume);
router.post('/analyze', protect, analyzeResume);

module.exports = router;
