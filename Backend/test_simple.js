require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testSimpleGen() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log("Testing Basic Gemini Call...");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say hello in one word.");
    const response = await result.response;
    console.log("SUCCESS! Response:", response.text());
  } catch (error) {
    console.error("BASIC TEST FAILED:", error);
  }
}

testSimpleGen();
