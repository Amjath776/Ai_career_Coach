const express = require('express');
const router = express.Router();
const { getCareerPaths, generateCareerPath, deleteCareerPath } = require('../controllers/careerPathController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCareerPaths);
router.post('/generate', protect, generateCareerPath);
router.delete('/:id', protect, deleteCareerPath);

module.exports = router;
