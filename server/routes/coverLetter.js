const express = require('express');
const router = express.Router();
const { getCoverLetters, getCoverLetter, generateCoverLetter, updateCoverLetter, deleteCoverLetter } = require('../controllers/coverLetterController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCoverLetters);
router.get('/:id', protect, getCoverLetter);
router.post('/generate', protect, generateCoverLetter);
router.put('/:id', protect, updateCoverLetter);
router.delete('/:id', protect, deleteCoverLetter);

module.exports = router;
