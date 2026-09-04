require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  const result = await model.embedContent("Hello world");
  console.log("Vector length:", result.embedding.values.length);
  console.log("First 3:", result.embedding.values.slice(0, 3));
}
test().catch(console.error);
