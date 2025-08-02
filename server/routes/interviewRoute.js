const express = require('express');
const upload = require('../middlewares/upload.js');
const { handleInterviewStart } = require('../controllers/interviewController.js');

const router = express.Router();

// ✅ Route to upload CV and get questions
router.post('/start', upload.single('cv'), handleInterviewStart);

module.exports = router;
