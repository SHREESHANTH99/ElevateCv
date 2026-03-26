const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function parseResumeWithAI(rawText) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert recruitment AI. Extract structured data from the following raw resume text.
      Return EXCLUSIVELY a valid JSON object matching this schema:
      {
        "personalInfo": {
          "fullName": "",
          "email": "",
          "phone": "",
          "location": "",
          "linkedin": "",
          "website": ""
        },
        "summary": "Short professional overview",
        "skills": [
          { "name": "Skill Name", "level": "Beginner|Intermediate|Advanced|Expert", "category": "Technical|Soft|etc" }
        ],
        "experiences": [
          {
            "company": "",
            "position": "",
            "location": "",
            "startDate": "",
            "endDate": "Present or date",
            "current": false,
            "description": ["bullet 1", "bullet 2"]
          }
        ],
        "education": [
          {
            "institution": "",
            "degree": "",
            "field": "",
            "location": "",
            "startDate": "",
            "endDate": "",
            "gpa": "",
            "description": ""
          }
        ],
        "projects": [
          {
            "name": "",
            "description": "",
            "technologies": [],
            "url": "",
            "github": "",
            "startDate": "",
            "endDate": ""
          }
        ]
      }

      RAW TEXT:
      ${rawText}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up potential markdown formatting if Gemini includes it
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    throw new Error("Failed to parse resume with AI");
  }
}

module.exports = { parseResumeWithAI };
