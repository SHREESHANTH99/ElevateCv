const { generateTailoredBullet, verifyTailoredGroundedness } = require("../utils/tailoringEngine");

async function runDirectRouteLogicTest() {
  console.log("=================================================");
  console.log("Testing Tailor Resume Pipeline Logic");
  console.log("=================================================\n");

  const sampleResumeData = {
    skills: [
      { name: "Node.js", level: "Expert", category: "Backend" },
      { name: "REST APIs", level: "Advanced", category: "Backend" },
      { name: "PostgreSQL", level: "Intermediate", category: "Database" },
      { name: "Docker", level: "Intermediate", category: "DevOps" }
    ],
    technologies: ["Node.js", "REST APIs", "PostgreSQL", "Docker", "Express"],
    experiences: [
      {
        company: "Acme Corp",
        position: "Software Engineer",
        startDate: "2022-01",
        endDate: "2024-05",
        description: [
          "Worked on backend services for the checkout flow",
          "Engineered distributed message queue processing 50,000 events/sec",
          "Responsible for database query optimization"
        ]
      }
    ]
  };

  const jobDescription = `
    Senior Backend Engineer
    Requirements:
    - Experience building scalable backend services with REST APIs.
    - Strong knowledge of database query optimization and PostgreSQL.
    - Experience with Kubernetes and Golang is a plus.
  `;

  const candidateSkills = [
    ...(Array.isArray(sampleResumeData.skills) ? sampleResumeData.skills.map(s => typeof s === "string" ? s : s?.name) : []),
    ...(Array.isArray(sampleResumeData.technologies) ? sampleResumeData.technologies : [])
  ].filter(Boolean);

  const resumeContext = {
    skills: candidateSkills,
    summary: sampleResumeData.summary || ""
  };

  const tailoredExperiences = [];
  let totalBullets = 0;
  let tailoredCount = 0;
  let unchangedCount = 0;

  for (const exp of sampleResumeData.experiences) {
    const tailoredBullets = [];
    for (const text of exp.description) {
      totalBullets++;
      const tailoredResult = await generateTailoredBullet(text, jobDescription, resumeContext);
      if (tailoredResult.tailored && tailoredResult.tailored !== text) {
        tailoredCount++;
      } else {
        unchangedCount++;
      }

      tailoredBullets.push({
        original: text,
        tailored: tailoredResult.tailored,
        changesExplained: tailoredResult.changesExplained || [],
        grounded: tailoredResult.grounded !== false,
        fallbackUsed: tailoredResult.fallbackUsed || false
      });
    }

    tailoredExperiences.push({
      company: exp.company,
      position: exp.position,
      bullets: tailoredBullets
    });
  }

  const response = {
    tailoredExperiences,
    summary: {
      totalBullets,
      tailoredCount,
      unchangedCount
    }
  };

  console.log(JSON.stringify(response, null, 2));

  console.log("\n=================================================");
  console.log("Summary of Output Verification:");
  console.log(`Total Bullets: ${response.summary.totalBullets}`);
  console.log(`Tailored: ${response.summary.tailoredCount}`);
  console.log(`Unchanged: ${response.summary.unchangedCount}`);
  console.log("=================================================");
}

runDirectRouteLogicTest().catch(console.error);
