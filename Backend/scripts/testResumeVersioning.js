const mongoose = require("mongoose");
const ResumeVersion = require("../models/ResumeVersion");

async function testVersioningLogicDirectly() {
  console.log("=================================================");
  console.log("Testing Resume Versioning & Comparison Engine");
  console.log("=================================================\n");

  const v1Data = {
    title: "Full Stack Engineer Resume",
    summary: "Software engineer with 2 years of experience building web apps.",
    skills: [
      { name: "JavaScript", level: "Intermediate", category: "Frontend" },
      { name: "React", level: "Intermediate", category: "Frontend" }
    ],
    experiences: [
      {
        company: "Startup Co",
        position: "Frontend Dev",
        description: [
          "Worked on React dashboard components",
          "Helped team with code reviews"
        ]
      }
    ]
  };

  const v2Data = {
    title: "Senior Full Stack Engineer Resume",
    summary: "Results-driven Software Engineer with 4+ years architecting scalable cloud services and microservices.",
    skills: [
      { name: "JavaScript", level: "Expert", category: "Frontend" },
      { name: "React", level: "Expert", category: "Frontend" },
      { name: "Node.js", level: "Advanced", category: "Backend" },
      { name: "PostgreSQL", level: "Advanced", category: "Database" },
      { name: "Docker", level: "Intermediate", category: "DevOps" }
    ],
    experiences: [
      {
        company: "Startup Co",
        position: "Senior Frontend Engineer",
        description: [
          "Engineered responsive React dashboard components, cutting load time by 38%",
          "Spearheaded automated CI/CD code reviews and test coverage",
          "Architected PostgreSQL indexing, reducing p99 latency to 85ms"
        ]
      }
    ]
  };

  const ver1 = {
    versionNumber: 1,
    label: "Initial Draft",
    atsScore: 68,
    dimensionScores: {
      keywordMatch: 60,
      requiredSkills: 65,
      experience: 70,
      projects: 65,
      quantification: 40,
      structure: 85,
      education: 90,
      summary: 60
    },
    snapshotData: v1Data,
    createdAt: new Date("2026-09-01")
  };

  const ver2 = {
    versionNumber: 2,
    label: "Optimized & Quantified for Senior Role",
    atsScore: 86,
    dimensionScores: {
      keywordMatch: 88,
      requiredSkills: 90,
      experience: 85,
      projects: 80,
      quantification: 85,
      structure: 95,
      education: 90,
      summary: 85
    },
    snapshotData: v2Data,
    createdAt: new Date("2026-09-14")
  };

  // Run Comparison Engine
  const scoreDelta = ver2.atsScore - ver1.atsScore;
  const dimensionKeys = [
    "keywordMatch",
    "requiredSkills",
    "experience",
    "projects",
    "quantification",
    "structure",
    "education",
    "summary"
  ];

  const dimensionComparison = {};
  for (const dim of dimensionKeys) {
    const s1 = ver1.dimensionScores[dim] || 0;
    const s2 = ver2.dimensionScores[dim] || 0;
    dimensionComparison[dim] = { v1: s1, v2: s2, delta: s2 - s1 };
  }

  const getBullets = (exps = []) =>
    exps.flatMap((e) =>
      Array.isArray(e.description)
        ? e.description
        : typeof e.description === "string"
        ? [e.description]
        : []
    );

  const bullets1 = getBullets(v1Data.experiences);
  const bullets2 = getBullets(v2Data.experiences);
  const b1Set = new Set(bullets1.map((b) => (b || "").trim().toLowerCase()));
  const b2Set = new Set(bullets2.map((b) => (b || "").trim().toLowerCase()));

  const getSkillNames = (skills = []) =>
    skills.map((s) => (typeof s === "string" ? s.trim() : (s?.name || "").trim())).filter(Boolean);

  const s1 = getSkillNames(v1Data.skills);
  const s2 = getSkillNames(v2Data.skills);
  const s1Set = new Set(s1.map((s) => s.toLowerCase()));

  const fieldChanges = {
    summaryChanged: (v1Data.summary || "").trim() !== (v2Data.summary || "").trim(),
    experiences: {
      totalBulletsV1: bullets1.length,
      totalBulletsV2: bullets2.length,
      bulletsAdded: bullets2.filter((b) => !b1Set.has((b || "").trim().toLowerCase())),
      bulletsRemoved: bullets1.filter((b) => !b2Set.has((b || "").trim().toLowerCase()))
    },
    skills: {
      added: s2.filter((s) => !s1Set.has(s.toLowerCase())),
      retained: s2.filter((s) => s1Set.has(s.toLowerCase()))
    }
  };

  const comparisonResult = {
    v1: { versionNumber: ver1.versionNumber, label: ver1.label, atsScore: ver1.atsScore },
    v2: { versionNumber: ver2.versionNumber, label: ver2.label, atsScore: ver2.atsScore },
    scoreDelta,
    dimensionComparison,
    fieldChanges
  };

  console.log("Comparison Result:\n", JSON.stringify(comparisonResult, null, 2));

  console.log("\n=================================================");
  console.log(`ATS Score Delta: ${scoreDelta > 0 ? "+" : ""}${scoreDelta} points (${ver1.atsScore} -> ${ver2.atsScore})`);
  console.log(`Quantification Score Delta: +${dimensionComparison.quantification.delta} points (${dimensionComparison.quantification.v1} -> ${dimensionComparison.quantification.v2})`);
  console.log(`Keyword Match Score Delta: +${dimensionComparison.keywordMatch.delta} points (${dimensionComparison.keywordMatch.v1} -> ${dimensionComparison.keywordMatch.v2})`);
  console.log(`Skills Added: ${fieldChanges.skills.added.join(", ")}`);
  console.log("=================================================");
}

testVersioningLogicDirectly().catch(console.error);
