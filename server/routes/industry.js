const express = require('express');
const router = express.Router();
const { getInsights, generateInsights, deleteInsight } = require('../controllers/industryController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getInsights);
router.post('/generate', protect, generateInsights);
router.delete('/:id', protect, deleteInsight);

module.exports = router;
