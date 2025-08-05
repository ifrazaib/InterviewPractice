// controllers/videoFeedbackController.js
exports.handleVideoAnswerSubmission = async (req, res) => {
  try {
    const { questionId, answerText, metrics } = req.body;
    if (!questionId || !answerText) {
      return res.status(400).json({ message: 'Missing questionId or answerText' });
    }

    // TODO: persist answerText + metrics to your DB here

    return res.status(200).json({ message: 'Answer received successfully!' });
  } catch (err) {
    console.error('❌ Video submission error:', err);
    return res.status(500).json({ message: 'Server error during answer submission' });
  }
};

exports.handleVideoFinalEvaluation = async (req, res) => {
  try {
    const { answers, role } = req.body;
    if (!answers || !role) {
      return res.status(400).json({ message: 'Missing answers or role' });
    }

    // TODO: call your evaluateAnswersWithGROQ(answers, role, metrics)
    // or aggregate the per‐question saves above, then return structured feedback.
    const dummyFeedback = {
      score: 8,
      strengths: ['Clear speech', 'Good eye contact'],
      improvements: ['Slow down pace slightly'],
      recommendations: 'Overall strong performance!'
    };

    res.status(200).json({ feedback: dummyFeedback });
  } catch (err) {
    console.error('❌ Final evaluation error:', err);
    res.status(500).json({ message: 'Server error during final evaluation' });
  }
};
