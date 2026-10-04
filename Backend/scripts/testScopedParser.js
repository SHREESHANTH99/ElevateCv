const fs = require('fs');
const path = require('path');
const { extractLayout } = require('../utils/pythonConnector');
const { parseExperienceSection, parseSkillsSection, parseEducationSection } = require('../utils/scopedParser');

async function testScopedParser() {
  console.log("1. Extracting PDF layout and segmenting sections via Python Service...");
  const pdfPath = path.join(__dirname, '../../PythonService/sample_resume.pdf');
  const pdfBuffer = fs.readFileSync(pdfPath);
  const layoutResult = await extractLayout(pdfBuffer, 'sample_resume.pdf');

  if (!layoutResult.layoutAnalysisUsed) {
    console.error("Layout extraction failed. Exiting test.");
    process.exit(1);
  }

  console.log("\nAvailable Pre-Segmented Sections:", Object.keys(layoutResult.sections));

  console.log("\n2. Running Scoped Gemini Parsing on EXPERIENCE Section...");
  const experienceBlocks = layoutResult.sections["Experience"] || [];
  console.log("Raw Experience Blocks Passed:", experienceBlocks.length);
  
  const parsedExperience = await parseExperienceSection(experienceBlocks);
  console.log("\n--- Scoped Experience Output (Zod Validated) ---");
  console.log(JSON.stringify(parsedExperience, null, 2));

  console.log("\n3. Running Scoped Gemini Parsing on SKILLS Section...");
  const skillsBlocks = layoutResult.sections["Skills"] || [];
  const parsedSkills = await parseSkillsSection(skillsBlocks);
  console.log("\n--- Scoped Skills Output (Zod Validated) ---");
  console.log(JSON.stringify(parsedSkills, null, 2));

  console.log("\n4. Running Scoped Gemini Parsing on EDUCATION Section...");
  const educationBlocks = layoutResult.sections["Education"] || [];
  const parsedEducation = await parseEducationSection(educationBlocks);
  console.log("\n--- Scoped Education Output (Zod Validated) ---");
  console.log(JSON.stringify(parsedEducation, null, 2));

  console.log("\n✅ Scoped Gemini Parser & Zod Validation Test PASSED!");
}

testScopedParser().catch(err => {
  console.error("Scoped Parser Test Failed:", err);
  process.exit(1);
});
