// routes/videoFeedbackRoutes.js
const express = require('express');
const {
  handleVideoAnswerSubmission,
  handleVideoFinalEvaluation
} = require('../controllers/videoFeedbackController');
const router = express.Router();

// Per‐question submission
router.post('/submit', handleVideoAnswerSubmission);
// After all questions answered
router.post('/final-evaluate', handleVideoFinalEvaluation);

module.exports = router;
