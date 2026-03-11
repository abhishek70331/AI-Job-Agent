const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  // Fail fast in dev if the key is missing.
  console.warn(
    '[AI] GEMINI_API_KEY is not set. /api/resume/generate will fail until it is configured.'
  );
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Generate / tailor a resume using Gemini based on a job description
 * and a structured user profile.
 */
async function generateAiResume({ jobDescription, userProfile }) {
  if (!apiKey || !genAI) {
    throw new Error('GEMINI_API_KEY is not configured on the server');
  }

  // Use a generally-available Gemini model; adjust if your dashboard
  // shows a different recommended name. Most current SDKs expose
  // "-latest" variants.
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
You are an expert technical recruiter and resume writer.
Using the job description and candidate profile below, generate a concise,
ATS-friendly resume tailored specifically to this role.

Requirements:
- Use clear section headings (Summary, Experience, Skills, Projects, Education).
- Emphasize skills and experience that match the job description.
- Keep the tone professional and focused on measurable impact.
- Use bullet points where appropriate.
- Do NOT invent degrees or companies; only infer reasonable responsibilities from given info.

Job description:
${jobDescription}

Candidate profile (JSON):
${JSON.stringify(userProfile, null, 2)}

Return ONLY the final resume text, no extra commentary.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return {
    resumeText: text,
  };
}

module.exports = {
  generateAiResume,
};

