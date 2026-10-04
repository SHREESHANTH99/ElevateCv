const { generateTailoredBullet, verifyTailoredGroundedness } = require('../utils/tailoringEngine');

async function runTailoringTests() {
  console.log("========================================================================");
  console.log("🧪 RESUME -> JOB TAILORING ENGINE: EMPIRICAL 3-CASE VERIFICATION");
  console.log("========================================================================\n");

  // ------------------------------------------------------------------------
  // CASE 1: Bullet with clear existing tech mentions
  // ------------------------------------------------------------------------
  console.log("------------------------------------------------------------------------");
  console.log("📌 TEST CASE 1: Bullet with clear existing tech mentions");
  console.log("------------------------------------------------------------------------");
  const bullet1 = "Built backend endpoints using Node.js and PostgreSQL for data storage";
  const job1 = "Senior Backend Engineer. We require deep experience in Node.js, PostgreSQL database optimization, RESTful API architecture, and scalable microservices.";
  const resume1 = {
    skills: ["Node.js", "PostgreSQL", "JavaScript", "REST APIs"],
    technologies: ["Node.js", "PostgreSQL"]
  };

  const res1 = await generateTailoredBullet(bullet1, job1, resume1);
  console.log("Original: ", res1.original);
  console.log("Tailored: ", res1.tailored);
  console.log("Changes:  ", JSON.stringify(res1.changesExplained, null, 2));
  console.log("Grounded: ", res1.grounded);
  console.log("Fallback: ", res1.fallbackUsed);

  // ------------------------------------------------------------------------
  // CASE 2: Vague / Generic bullet with no specific facts
  // ------------------------------------------------------------------------
  console.log("\n------------------------------------------------------------------------");
  console.log("📌 TEST CASE 2: Vague/generic bullet with no technical depth");
  console.log("------------------------------------------------------------------------");
  const bullet2 = "Helped team with daily tasks and meetings";
  const job2 = "Cloud Infrastructure Architect. Responsible for multi-region AWS cloud migrations, Kubernetes clusters, and Terraform infrastructure as code.";
  const resume2 = {
    skills: ["Communication", "Agile", "Scrum"],
    technologies: []
  };

  const res2 = await generateTailoredBullet(bullet2, job2, resume2);
  console.log("Original: ", res2.original);
  console.log("Tailored: ", res2.tailored);
  console.log("Changes:  ", JSON.stringify(res2.changesExplained, null, 2));
  console.log("Grounded: ", res2.grounded);
  console.log("Fallback: ", res2.fallbackUsed);

  // ------------------------------------------------------------------------
  // CASE 3: Job requires missing skill (Kubernetes/Golang) absent from candidate
  // ------------------------------------------------------------------------
  console.log("\n------------------------------------------------------------------------");
  console.log("📌 TEST CASE 3: Job demands missing skills (MUST NOT fabricate them)");
  console.log("------------------------------------------------------------------------");
  const bullet3 = "Developed user interface components using React and CSS";
  const job3 = "Senior Infrastructure Platform Engineer. Must have 5+ years of experience with Kubernetes container orchestration, AWS IAM, Golang services, and Docker.";
  const resume3 = {
    skills: ["React", "CSS", "HTML", "JavaScript"],
    technologies: ["React", "CSS"]
  };

  const res3 = await generateTailoredBullet(bullet3, job3, resume3);
  console.log("Original: ", res3.original);
  console.log("Tailored: ", res3.tailored);
  console.log("Changes:  ", JSON.stringify(res3.changesExplained, null, 2));
  console.log("Grounded: ", res3.grounded);
  console.log("Fallback: ", res3.fallbackUsed);

  // Direct verification check on Case 3
  const hasFabricatedK8s = /kubernetes|k8s|golang|aws|docker/i.test(res3.tailored);
  console.log(`\nAnti-Fabrication Check for Case 3 (Should be FALSE): ${hasFabricatedK8s}`);

  console.log("\n========================================================================");
  console.log("✅ 3-CASE TAILORING VERIFICATION COMPLETE");
  console.log("========================================================================");
}

runTailoringTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
