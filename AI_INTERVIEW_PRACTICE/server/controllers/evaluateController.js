const evaluateAnswersWithGROQ = require('../utils/evaluateAnswersWithGROQ');

const handleAnswerEvaluation = async (req, res) => {
  try {
    const { questions, answers, role, mediapipeMetrics } = req.body;

    if (!questions || !answers || !role) {
      return res.status(400).json({
        message: 'Questions, answers, and role are required',
      });
    }

    // Evaluate using GROQ – media metrics included only if provided
    const feedback = await evaluateAnswersWithGROQ(
      questions,
      answers,
      role,
      mediapipeMetrics || null
    );

    res.status(200).json({ feedback });
  } catch (err) {
    console.error('Evaluation error:', err.message);
    res.status(500).json({
      message: 'Error evaluating answers',
      error: err.message,
    });
  }
};

module.exports = {
  handleAnswerEvaluation,
};
