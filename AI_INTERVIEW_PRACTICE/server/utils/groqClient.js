const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const generateQuestionsFromCV = async (cvText, role) => {
  const prompt = `
Act strictly as an AI interviewer.

Your task:
- Based on the following candidate CV and the job role of "${role}", generate exactly 5 interview questions.
- The questions must be a mix of technical and behavioral, directly relevant to the role.

Strict instructions:
- DO NOT include any introduction, summary, explanation, or extra phrases.
- DO NOT say things like "Here are the questions".
- DO NOT include anything before question one.
- Your response must begin with:
  1- <question>
  2- <question>
  3- <question>
  4- <question>
  5- <question>
  must be 5 questions
Only output this format. Anything else is incorrect.


---CV START---
${cvText}
---CV END---
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

  const raw = response.data.choices[0].message.content;
  const questions = raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line);

  return questions;
};

module.exports = {
  generateQuestionsFromCV,
};
