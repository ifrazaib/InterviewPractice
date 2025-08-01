const express = require('express');
const { handleAnswerEvaluation } = require('../controllers/evaluateController');

const router = express.Router();

router.post('/evaluate', handleAnswerEvaluation);

module.exports = router;
