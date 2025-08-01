const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const generateQuestionsFromCV = async (cvText, role) => {
  const prompt = `
You are an AI interviewer. Based on the following candidate CV and the role of "${role}", generate 5 relevant technical and behavioral interview questions: and make sure that only questions are given noa a sinlge extra word other than questions are required

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
