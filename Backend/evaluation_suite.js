/**
 * CALIBRATED AI CORE EVALUATION SUITE
 * Measures the quality and accuracy of the Scoring and Matching engines.
 */

const { scoreResume } = require("./utils/resumeScorer");

const TEST_CASES = [
  {
    name: "Perfect Backend Match (Full Profile)",
    resume: {
       personalInfo: { fullName: "Jane Smith", email: "jane@test.com" },
       summary: "Seasoned Backend Developer with 5+ years experience building scalable Node.js microservices on AWS.",
       experiences: [{ position: "Senior Engineer", company: "TechCorp", description: ["Optimized backend performance by 40% using Node.js and AWS."] }],
       skills: [{ name: "Node.js" }, { name: "AWS" }, { name: "MongoDB" }, { name: "Docker" }],
       education: [{ institution: "MIT", degree: "BS CS" }],
       projects: [{ name: "CloudScale", description: "Open source AWS scaling toolkit." }]
    },
    job: "Senior Backend Engineer with AWS and Node.js experience using MongoDB and Docker. Must demonstrate measurable impact.",
    expectedMinScore: 80
  },
  {
    name: "Total Mismatch (Graphic Design)",
    resume: {
      experiences: [{ description: ["Graphic Designer with 5 years of Photoshop experience."] }],
      skills: [{ name: "Photoshop" }, { name: "Illustrator" }]
    },
    job: "Embedded C++ Developer for Firmware engineering.",
    expectedMaxScore: 30
  },
  {
    name: "Skill Hierarchy Test (AWS -> Cloud)",
    resume: {
      skills: [{ name: "AWS" }, { name: "Node.js" }, { name: "Kubernetes" }, { name: "Docker" }]
    },
    job: "Senior Cloud Infrastructure Engineer with Devops experience.",
    expectedMinScore: 40 // Hierarchy should pass 40+ because no full sections
  }
];

function runEvaluation() {
  console.log("\n🚀 Starting CALIBRATED AI Evaluation Suite...");
  let passed = 0;

  TEST_CASES.forEach((tc, i) => {
    console.log(`\n[Test ${i + 1}] ${tc.name}`);
    
    // Scoring logic
    const analysis = scoreResume(tc.resume, tc.job);
    console.log(`- Final Score: ${analysis.score}`);
    console.log(`- Status: ${analysis.label}`);

    let tcPassed = true;
    if (tc.expectedMinScore && analysis.score < tc.expectedMinScore) tcPassed = false;
    if (tc.expectedMaxScore && analysis.score > tc.expectedMaxScore) tcPassed = false;

    if (tcPassed) {
      console.log("✅ PASSED");
      passed++;
    } else {
      console.log(`❌ FAILED (Score ${analysis.score} fell outside expected bounds)`);
    }
  });

  console.log(`\n-----------------------------------`);
  console.log(`Evaluation Complete: ${passed}/${TEST_CASES.length} Cases Passed.`);
}

runEvaluation();
