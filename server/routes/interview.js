const express = require('express');
const router = express.Router();
const { getSessions, startSession, submitAnswer, completeSession, deleteSession } = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getSessions);
router.post('/start', protect, startSession);
router.put('/:id/answer', protect, submitAnswer);
router.put('/:id/complete', protect, completeSession);
router.delete('/:id', protect, deleteSession);

module.exports = router;
