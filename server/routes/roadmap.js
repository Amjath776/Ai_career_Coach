const express = require('express');
const router = express.Router();
const { getRoadmaps, getRoadmap, generateRoadmap, updatePhaseProgress, deleteRoadmap } = require('../controllers/roadmapController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getRoadmaps);
router.get('/:id', protect, getRoadmap);
router.post('/generate', protect, generateRoadmap);
router.put('/:id/phase/:month', protect, updatePhaseProgress);
router.delete('/:id', protect, deleteRoadmap);

module.exports = router;
