const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function parseResumeWithAI(rawText) {
  // Defense in Depth 1: Pre-check for scanned/empty PDFs
  const cleanedText = rawText ? rawText.replace(/\s+/g, '').trim() : '';
  if (cleanedText.length < 50) {
    throw new Error("INSUFFICIENT_TEXT: We couldn't extract enough text from this file. It may be a scanned image or heavily formatted in a way we can't read.");
  }

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

      
      CRITICAL INSTRUCTION: Extract ONLY facts explicitly stated in the text. DO NOT invent, hallucinate, or assume any information (like missing dates, names, or locations). If a field is not present in the text, leave it empty or null.
      
      RAW TEXT:
      ${rawText}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up potential markdown formatting if Gemini includes it
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsedData = JSON.parse(text);
    
    // Defense in Depth 2: Post-check for hallucinated placeholders
    const name = parsedData?.personalInfo?.fullName?.toLowerCase() || '';
    const email = parsedData?.personalInfo?.email?.toLowerCase() || '';
    const phone = parsedData?.personalInfo?.phone || '';
    
    const hallucinatedNames = ["john doe", "jane doe", "your name"];
    const hallucinatedEmails = ["john.doe@example.com", "john@example.com", "your.email@example.com", "johndoe@email.com"];
    
    if (hallucinatedNames.includes(name) || hallucinatedEmails.includes(email) || phone.includes("123-456-7890") || phone.includes("1234567890")) {
      throw new Error("HALLUCINATION_DETECTED: The AI returned placeholder data instead of your actual resume content.");
    }
    
    return parsedData;
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    throw new Error("Failed to parse resume with AI");
  }
}

module.exports = { parseResumeWithAI };
