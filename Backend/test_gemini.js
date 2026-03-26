require("dotenv").config();
const { parseResumeWithAI } = require("./utils/geminiParser");

const dummyText = `
John Doe
Email: john@example.com
Phone: 1234567890
Summary: Passionate developer with React/Node expertise.
Experience:
Software Engineer at Google, 2020-2023.
- Built search algorithms.
- Optimized performance by 15%.
Education:
Stanford BS CS, 2015-2019.
Skills: Python, Javascript, React, C++.
`;

async function testParser() {
  console.log("Testing Gemini Resume Parser...");
  try {
    const data = await parseResumeWithAI(dummyText);
    console.log("Successfully Parsed!");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Gemini Parser Failed:", error);
  }
}

testParser();
