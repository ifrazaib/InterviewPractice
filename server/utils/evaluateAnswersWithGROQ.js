const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const evaluateAnswersWithGROQ = async (questions, answers, role) => {
  const pairs = questions.map((q, i) => ({
    question: q,
    answer: answers[i] || '',
  }));

  const prompt = `
You are a professional interview evaluator.

Evaluate the following answers provided by a candidate applying for the role of "${role}". For each question-answer pair, provide feedback with the following:

1. **Clarity** (Short note)
2. **Relevance** (Short note)
3. **Suggestions for Improvement**
4. **Score out of 10**

Return the response as a structured numbered list for each pair.

--- Begin ---

${pairs.map((pair, i) => `Q${i + 1}: ${pair.question}\nA${i + 1}: ${pair.answer}`).join('\n\n')}

--- End ---
`;

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].message.content;
};

module.exports = evaluateAnswersWithGROQ;