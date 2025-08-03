const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const evaluateAnswersWithGROQ = async (questions, answers, role) => {
  const qaText = questions
    .map((q, i) => {
      const answer = answers[q.id] || '(No answer provided)';
      return `Q${i + 1}: ${q.text}\nA${i + 1}: ${answer}`;
    })
    .join('\n\n');

  const prompt = `
You are a professional technical interviewer. Evaluate the following answers from a candidate for the role of "${role}".

For each question, provide:
1. Clarity (short note)
2. Relevance (short note)
3. Suggestions for improvement
4. Score out of 10

At the end, also provide:
- Overall Score (/10)
- Strengths
- Areas for Improvement
- Recommendations

Return only the following JSON:

{
  "score": <overall_score>,
  "strengths": [<string>, ...],
  "improvements": [<string>, ...],
  "recommendations": "<string>"
}
No markdown, no explanation — only clean JSON response.
--- Begin ---

${qaText}

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

  // Parse JSON from Groq
  try {
    return JSON.parse(response.data.choices[0].message.content);
  } catch (err) {
    console.error('Failed to parse GROQ JSON:', err.message);
    throw new Error('Invalid JSON received from GROQ.');
  }
};

module.exports = evaluateAnswersWithGROQ;
