const express = require('express');
const router = express.Router();
const { getSkillGaps, analyzeSkillGap } = require('../controllers/skillGapController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getSkillGaps);
router.post('/analyze', protect, analyzeSkillGap);

module.exports = router;
