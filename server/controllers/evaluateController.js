const evaluateAnswersWithGROQ = require('../utils/evaluateAnswersWithGROQ');

const handleAnswerEvaluation = async (req, res) => {
  try {
    const { questions, answers, role } = req.body;

    if (!questions || !answers || !role) {
      return res.status(400).json({ message: 'Questions, answers, and role are required' });
    }

    const feedback = await evaluateAnswersWithGROQ(questions, answers, role);

    res.status(200).json({ feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Error evaluating answers',
      error: err.message,
    });
  }
};

module.exports = {
    handleAnswerEvaluation,
};
