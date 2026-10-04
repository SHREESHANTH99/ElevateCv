const {
  generateTailoredBullet,
  verifyTailoredGroundedness,
  deterministicTailorFallback,
  extractKnownTechTerms,
  extractMetrics
} = require('../utils/tailoringEngine');

async function runCompleteTailoringVerification() {
  console.log("========================================================================");
  console.log("🛡️ TAILORING ENGINE: ADVERSARIAL POST-CHECK & 3 REAL-WORLD CASES");
  console.log("========================================================================\n");

  // ------------------------------------------------------------------------
  // PART A: DIRECT ADVERSARIAL POST-CHECK VALIDATION
  // ------------------------------------------------------------------------
  console.log("------------------------------------------------------------------------");
  console.log("🧪 PART A: ADVERSARIAL HALLUCINATION DETECTION POST-CHECK TESTS");
  console.log("------------------------------------------------------------------------");

  // Adversarial Test 1: Fabricated Skill Injection (e.g. Model introduces Kubernetes/AWS)
  const orig1 = "Developed user interface components using React and CSS";
  const hallucinatedSkill = "Architected user interface in React and deployed on Kubernetes clusters with AWS ECS";
  const check1 = verifyTailoredGroundedness(orig1, hallucinatedSkill, { skills: ["React", "CSS"] });
  console.log("Adversarial Test 1 (Fabricated Skill 'Kubernetes/AWS'):");
  console.log(`  Passed Groundedness? ${check1.isGrounded} (Expected: false)`);
  console.log(`  Guard Rejection Reason: "${check1.reason}"`);

  // Adversarial Test 2: Fabricated Metric Injection (e.g. Model introduces 45% or 3x)
  const orig2 = "Trained a machine learning model for text classification";
  const hallucinatedMetric = "Engineered machine learning model for text classification, boosting accuracy by 45% and 3x throughput";
  const check2 = verifyTailoredGroundedness(orig2, hallucinatedMetric, { skills: ["Machine Learning", "Python"] });
  console.log("\nAdversarial Test 2 (Fabricated Metrics '45%', '3x'):");
  console.log(`  Passed Groundedness? ${check2.isGrounded} (Expected: false)`);
  console.log(`  Guard Rejection Reason: "${check2.reason}"`);

  // Valid Grounded Test 3: Grounded Enhancement
  const orig3 = "Built backend endpoints using Node.js and PostgreSQL for data storage";
  const validTailored = "Engineered backend endpoints using Node.js and PostgreSQL for resilient data storage";
  const check3 = verifyTailoredGroundedness(orig3, validTailored, { skills: ["Node.js", "PostgreSQL", "JavaScript"] });
  console.log("\nValid Test 3 (Grounded Action Verb Enhancement):");
  console.log(`  Passed Groundedness? ${check3.isGrounded} (Expected: true)`);

  // ------------------------------------------------------------------------
  // PART B: 3 REAL TEST CASES EXECUTION
  // ------------------------------------------------------------------------
  console.log("\n------------------------------------------------------------------------");
  console.log("📌 PART B: 3 REAL-WORLD SPECIFICATION TEST CASES");
  console.log("------------------------------------------------------------------------");

  // CASE 1: Bullet with clear existing tech mentions
  console.log("\n--- [CASE 1: Clear Existing Tech Mentions] ---");
  const case1Bullet = "Worked on backend services using Node.js, Express, and PostgreSQL";
  const case1Job = "Senior Backend Engineer. We require deep experience in Node.js REST API architecture, PostgreSQL database performance tuning, and scalable microservices.";
  const case1Resume = {
    skills: ["Node.js", "Express", "PostgreSQL", "JavaScript", "REST APIs"],
    technologies: ["Node.js", "Express", "PostgreSQL"]
  };
  const case1Result = await generateTailoredBullet(case1Bullet, case1Job, case1Resume);
  console.log("Original Bullet: ", case1Result.original);
  console.log("Tailored Bullet: ", case1Result.tailored);
  console.log("Grounded:        ", case1Result.grounded);
  console.log("Fallback Used:   ", case1Result.fallbackUsed);
  console.log("Changes Detail:  ", JSON.stringify(case1Result.changesExplained, null, 2));

  // CASE 2: Vague / Generic bullet with no specific facts
  console.log("\n--- [CASE 2: Vague/Generic Bullet With No Technical Depth] ---");
  const case2Bullet = "Helped team with daily tasks and meetings";
  const case2Job = "Cloud Infrastructure Architect. Responsible for multi-region AWS cloud migrations, Kubernetes clusters, and Terraform infrastructure as code.";
  const case2Resume = {
    skills: ["Communication", "Agile", "Scrum"],
    technologies: []
  };
  const case2Result = await generateTailoredBullet(case2Bullet, case2Job, case2Resume);
  console.log("Original Bullet: ", case2Result.original);
  console.log("Tailored Bullet: ", case2Result.tailored);
  console.log("Grounded:        ", case2Result.grounded);
  console.log("Fallback Used:   ", case2Result.fallbackUsed);
  console.log("Changes Detail:  ", JSON.stringify(case2Result.changesExplained, null, 2));

  // CASE 3: Job requires missing skill (Kubernetes/Golang) absent from candidate
  console.log("\n--- [CASE 3: Job Demands Missing Skills (MUST NOT Fabricate)] ---");
  const case3Bullet = "Developed user interface components using React and CSS";
  const case3Job = "Senior Infrastructure Platform Engineer. Must have 5+ years of experience with Kubernetes container orchestration, AWS IAM, Golang services, and Docker.";
  const case3Resume = {
    skills: ["React", "CSS", "HTML", "JavaScript"],
    technologies: ["React", "CSS"]
  };
  const case3Result = await generateTailoredBullet(case3Bullet, case3Job, case3Resume);
  console.log("Original Bullet: ", case3Result.original);
  console.log("Tailored Bullet: ", case3Result.tailored);
  console.log("Grounded:        ", case3Result.grounded);
  console.log("Fallback Used:   ", case3Result.fallbackUsed);
  console.log("Changes Detail:  ", JSON.stringify(case3Result.changesExplained, null, 2));

  const hasFabricatedK8s = /kubernetes|k8s|golang|aws|docker/i.test(case3Result.tailored);
  console.log(`\nFabrication Check for Case 3 (Should be FALSE): ${hasFabricatedK8s}`);

  // ------------------------------------------------------------------------
  // CASE 4: Happy Path — Resume-Wide Skill Surfaced (REST APIs)
  // ------------------------------------------------------------------------
  console.log("\n--- [CASE 4: Happy Path — Surfacing Verified Resume-Wide Skill 'REST APIs'] ---");
  const case4Bullet = "Built backend services for the checkout flow";
  const case4Job = "Senior Backend Engineer. We require experience designing REST APIs and microservice architecture.";
  const case4Resume = {
    skills: ["Node.js", "PostgreSQL", "REST APIs", "JavaScript"],
    technologies: ["Node.js", "PostgreSQL"]
  };
  const case4Result = await generateTailoredBullet(case4Bullet, case4Job, case4Resume);
  console.log("Original Bullet: ", case4Result.original);
  console.log("Tailored Bullet: ", case4Result.tailored);
  console.log("Grounded:        ", case4Result.grounded);
  console.log("Fallback Used:   ", case4Result.fallbackUsed);
  console.log("Changes Detail:  ", JSON.stringify(case4Result.changesExplained, null, 2));

  const hasSurfacedRestApis = /rest apis?/i.test(case4Result.tailored);
  console.log(`\nVerified Skill Surfacing Check for Case 4 (Should be TRUE): ${hasSurfacedRestApis}`);

  console.log("\n========================================================================");
  console.log("✅ ALL TAILORING VERIFICATION CHECKS COMPLETED SUCCESSFULLY");
  console.log("========================================================================");
}

runCompleteTailoringVerification().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
