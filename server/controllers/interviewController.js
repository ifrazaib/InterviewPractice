const fs = require('fs');
const pdfParse = require('pdf-parse');
const { generateQuestionsFromCV } = require('../utils/groqClient');

const handleInterviewStart = async (req, res) => {
  try {
    const role = req.body.role;
    const cvFile = req.file;

    if (!role || !cvFile) {
      return res.status(400).json({ message: 'Role and CV file required' });
    }

    // Read the uploaded PDF
    const cvBuffer = fs.readFileSync(cvFile.path);
    const parsed = await pdfParse(cvBuffer);
    const extractedText = parsed.text?.trim();

    // Clean up: Delete the uploaded file
    fs.unlinkSync(cvFile.path);

    if (!extractedText) {
      return res.status(400).json({ message: 'Failed to extract text from CV' });
    }

    // Send CV text and role to GROQ to generate interview questions
    const questions = await generateQuestionsFromCV(extractedText, role);

    res.status(200).json({ questions });
  } catch (err) {
    console.error('[Interview Start Error]', err);
    res.status(500).json({
      message: 'Error generating questions',
      error: err.message || 'Internal server error',
    });
  }
};

// ✅ Correct export for named import
module.exports = {
  handleInterviewStart,
};
