const evaluateAnswersWithGROQ = require('../utils/evaluateAnswersWithGROQ');

const handleAnswerEvaluation = async (req, res) => {
  try {
    const { questions, answers, role } = req.body;

    if (!questions || !answers || !role) {
      return res.status(400).json({ message: 'Questions, answers, and role are required' });
    }

    const feedbackMarkdown = await evaluateAnswersWithGROQ(questions, answers, role);

    // Optional: You can parse the markdown into structured data later if needed
    res.status(200).json({ feedback: feedbackMarkdown });
  } catch (err) {
    console.error('Error in evaluation:', err);
    res.status(500).json({
      message: 'Error evaluating answers',
      error: err.message,
    });
  }
};

module.exports = {
  handleAnswerEvaluation,
};
