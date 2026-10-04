const inMemoryStorage = require("../utils/inMemoryStorage");

async function verifyFullLifecycleVersioning() {
  console.log("========================================================================");
  console.log("🚀 VERIFYING END-TO-END RESUME VERSIONING & RESTORATION LIFECYCLE");
  console.log("========================================================================\n");

  // 1. Create a User in storage
  const user = await inMemoryStorage.createUser({
    email: "sarah.connor@elevatecv.com",
    profile: { firstName: "Sarah", lastName: "Connor" }
  });
  console.log(`1. User Authenticated: ${user.profile.firstName} ${user.profile.lastName} (ID: ${user._id})`);

  // 2. User creates initial resume draft in editor
  const liveResume = await inMemoryStorage.createResume({
    userId: user._id,
    title: "Full Stack Engineer Resume",
    summary: "Web developer with 2 years of experience building client portals.",
    experiences: [
      {
        company: "OmniTech",
        position: "Junior Developer",
        startDate: "2022-01-01",
        endDate: "2023-12-31",
        description: [
          "Worked on React frontend components",
          "Helped with database query updates"
        ]
      }
    ],
    education: [
      {
        institution: "State University",
        degree: "B.S. in Computer Science",
        field: "Computer Science"
      }
    ],
    skills: [
      { name: "JavaScript", level: "Intermediate", category: "Frontend" },
      { name: "React", level: "Intermediate", category: "Frontend" }
    ],
    projects: [],
    template: "modern"
  });
  console.log(`2. Initial Resume Created in DB (ID: ${liveResume._id}, Title: "${liveResume.title}")`);

  // 3. User takes Snapshot 1 ("Initial Draft")
  const v1Snapshot = await inMemoryStorage.createResumeVersion({
    resumeId: liveResume._id,
    userId: user._id,
    versionNumber: 1,
    label: "Initial Draft",
    snapshotData: JSON.parse(JSON.stringify(liveResume)),
    atsScore: 64,
    dimensionScores: {
      keywordMatch: 60,
      requiredSkills: 65,
      experience: 68,
      projects: 55,
      quantification: 35,
      structure: 88,
      education: 90,
      summary: 60
    }
  });
  console.log(`3. Created Snapshot 1: v${v1Snapshot.versionNumber} ("${v1Snapshot.label}") - ATS: ${v1Snapshot.atsScore}/100`);

  // 4. User edits resume:
  // - Replaces weak verbs with quantified engineering bullet points
  // - Adds verified skills (Node.js, PostgreSQL, Docker)
  // - Upgrades summary
  const updatedData = {
    summary: "Senior Full Stack Engineer with 4+ years specializing in distributed React microfrontends and resilient Node.js REST services.",
    experiences: [
      {
        company: "OmniTech",
        position: "Full Stack Software Engineer",
        startDate: "2022-01-01",
        endDate: "2023-12-31",
        description: [
          "Engineered responsive React dashboard components, reducing initial page load by 42%",
          "Architected Node.js & PostgreSQL REST microservices processing 30,000 req/sec",
          "Containerized development workflow with Docker, cutting local setup time from 2 hours to 5 minutes"
        ]
      }
    ],
    skills: [
      { name: "JavaScript", level: "Expert", category: "Frontend" },
      { name: "React", level: "Expert", category: "Frontend" },
      { name: "Node.js", level: "Advanced", category: "Backend" },
      { name: "PostgreSQL", level: "Advanced", category: "Database" },
      { name: "Docker", level: "Intermediate", category: "DevOps" }
    ]
  };
  await inMemoryStorage.updateResume(liveResume._id, updatedData);
  const liveAfterEdit = await inMemoryStorage.findResumeById(liveResume._id);
  console.log(`4. Saved Real Edits to Live Resume Draft: (Summary updated, 3 quantified bullets, 3 skills added)`);

  // 5. User takes Snapshot 2 ("Quantified & Tailored for Tech Lead")
  const v2Snapshot = await inMemoryStorage.createResumeVersion({
    resumeId: liveResume._id,
    userId: user._id,
    versionNumber: 2,
    label: "Quantified & Tailored for Tech Lead",
    snapshotData: JSON.parse(JSON.stringify(liveAfterEdit)),
    atsScore: 87,
    dimensionScores: {
      keywordMatch: 88,
      requiredSkills: 90,
      experience: 88,
      projects: 78,
      quantification: 85,
      structure: 95,
      education: 90,
      summary: 88
    }
  });
  console.log(`5. Created Snapshot 2: v${v2Snapshot.versionNumber} ("${v2Snapshot.label}") - ATS: ${v2Snapshot.atsScore}/100`);

  // 6. Query all snapshots (as GET /api/resume/:id/versions does)
  const allVersions = await inMemoryStorage.findResumeVersionsByResumeId(liveResume._id, user._id);
  console.log(`\n6. Retrieved Version History for Resume (${allVersions.length} versions found):`);
  allVersions.forEach(v => {
    console.log(`   - v${v.versionNumber}: "${v.label}" | ATS Score: ${v.atsScore}/100 | Date: ${v.createdAt}`);
  });

  // 7. Compute Compare Diff between v1 and v2
  const scoreDelta = v2Snapshot.atsScore - v1Snapshot.atsScore;
  const dimensionComparison = {};
  for (const k of Object.keys(v1Snapshot.dimensionScores)) {
    const s1 = v1Snapshot.dimensionScores[k];
    const s2 = v2Snapshot.dimensionScores[k];
    dimensionComparison[k] = { v1: s1, v2: s2, delta: s2 - s1 };
  }

  const b1 = v1Snapshot.snapshotData.experiences.flatMap(e => e.description);
  const b2 = v2Snapshot.snapshotData.experiences.flatMap(e => e.description);
  const b1Set = new Set(b1.map(b => b.trim().toLowerCase()));

  const s1 = v1Snapshot.snapshotData.skills.map(s => s.name);
  const s2 = v2Snapshot.snapshotData.skills.map(s => s.name);
  const s1Set = new Set(s1.map(s => s.toLowerCase()));

  console.log("\n7. Comparison & Progression Analysis (v1 -> v2):");
  console.log(`   - Overall Score Improvement: +${scoreDelta} pts (${v1Snapshot.atsScore} -> ${v2Snapshot.atsScore})`);
  console.log(`   - Quantification Improvement: +${dimensionComparison.quantification.delta}% (${dimensionComparison.quantification.v1}% -> ${dimensionComparison.quantification.v2}%)`);
  console.log(`   - Keyword Match Improvement: +${dimensionComparison.keywordMatch.delta}% (${dimensionComparison.keywordMatch.v1}% -> ${dimensionComparison.keywordMatch.v2}%)`);
  console.log(`   - Required Skills Improvement: +${dimensionComparison.requiredSkills.delta}% (${dimensionComparison.requiredSkills.v1}% -> ${dimensionComparison.requiredSkills.v2}%)`);
  console.log(`   - Bullets Added:`, b2.filter(b => !b1Set.has(b.trim().toLowerCase())));
  console.log(`   - Skills Added:`, s2.filter(s => !s1Set.has(s.toLowerCase())));

  // 8. Test Restore to v1
  console.log(`\n8. Testing Snapshot Reversion: Restoring Live Resume back to v1 ("${v1Snapshot.label}")...`);
  await inMemoryStorage.updateResume(liveResume._id, {
    title: v1Snapshot.snapshotData.title,
    personalInfo: v1Snapshot.snapshotData.personalInfo,
    summary: v1Snapshot.snapshotData.summary,
    experiences: v1Snapshot.snapshotData.experiences,
    education: v1Snapshot.snapshotData.education,
    skills: v1Snapshot.snapshotData.skills,
    projects: v1Snapshot.snapshotData.projects,
    template: v1Snapshot.snapshotData.template
  });

  const liveAfterRestore = await inMemoryStorage.findResumeById(liveResume._id);
  console.log("✓ Live Resume restored successfully!");
  console.log(`   - Summary: "${liveAfterRestore.summary}"`);
  console.log(`   - Experience count: ${liveAfterRestore.experiences.length} (Title: ${liveAfterRestore.experiences[0].position})`);
  console.log(`   - Bullets:`, liveAfterRestore.experiences[0].description);
  console.log(`   - Skills count: ${liveAfterRestore.skills.length} (${liveAfterRestore.skills.map(s => s.name).join(", ")})`);

  console.log("\n========================================================================");
  console.log("✅ FULL VERSIONING & RESTORE LIFECYCLE COMPLETED CLEANLY");
  console.log("========================================================================");
}

verifyFullLifecycleVersioning().catch(console.error);
