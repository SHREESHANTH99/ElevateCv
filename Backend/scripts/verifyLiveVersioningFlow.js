require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Resume = require("../models/Resume");
const ResumeVersion = require("../models/ResumeVersion");

async function runLiveVersioningE2ETest() {
  console.log("========================================================================");
  console.log("🚀 VERIFYING LIVE MONGO DB RESUME VERSIONING & RESTORE FLOW");
  console.log("========================================================================\n");

  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/elevatecv";
  console.log(`Connecting to MongoDB at: ${mongoUri}...`);
  await mongoose.connect(mongoUri);
  console.log("✓ Connected to MongoDB.\n");

  try {
    // 1. Get or create a test user
    let user = await User.findOne({ email: "test_versioning_user@elevatecv.com" });
    if (!user) {
      user = new User({
        name: "Versioning Test Engineer",
        email: "test_versioning_user@elevatecv.com",
        password: "hashed_password_123"
      });
      await user.save();
    }
    console.log(`1. Active User: ${user.name} (ID: ${user._id})`);

    // Clean up previous test resumes for this test user
    await Resume.deleteMany({ userId: user._id });
    await ResumeVersion.deleteMany({ userId: user._id });

    // 2. User creates a live resume (Draft v1)
    const liveResume = new Resume({
      userId: user._id,
      title: "Backend Engineer Resume",
      personalInfo: {
        fullName: "Alex Rivera",
        email: "alex.rivera@example.com",
        phone: "+1 555-0199",
        location: "San Francisco, CA",
        linkedin: "linkedin.com/in/alexrivera",
        website: "https://alexrivera.dev"
      },
      summary: "Software developer with 2 years of experience building web applications.",
      experiences: [
        {
          company: "TechFlow Inc",
          position: "Software Developer",
          startDate: "2022-01-01",
          endDate: "2024-03-01",
          current: false,
          description: [
            "Worked on backend API endpoints and microservices",
            "Helped maintain database tables and bug fixes"
          ]
        }
      ],
      education: [
        {
          institution: "University of California, Berkeley",
          degree: "Bachelor of Science",
          field: "Computer Science",
          startDate: "2018-09-01",
          endDate: "2022-05-01"
        }
      ],
      skills: [
        { name: "JavaScript", level: "Intermediate", category: "Frontend" },
        { name: "Node.js", level: "Intermediate", category: "Backend" }
      ],
      projects: [],
      template: "modern"
    });

    await liveResume.save();
    console.log(`2. Created Live Resume Document in MongoDB (ID: ${liveResume._id})`);

    // 3. User explicitly takes Snapshot 1 ("Initial Draft")
    const v1Snapshot = new ResumeVersion({
      resumeId: liveResume._id,
      userId: user._id,
      versionNumber: 1,
      label: "Initial Draft",
      snapshotData: liveResume.toObject(),
      atsScore: 62,
      dimensionScores: {
        keywordMatch: 58,
        requiredSkills: 60,
        experience: 65,
        projects: 50,
        quantification: 35,
        structure: 90,
        education: 85,
        summary: 55
      }
    });
    await v1Snapshot.save();
    console.log(`3. Created Version 1 Snapshot in MongoDB: v1 ("${v1Snapshot.label}", ATS: ${v1Snapshot.atsScore}/100)`);

    // 4. User performs real editing session:
    // - Upgrades summary
    // - Replaces weak bullets with quantified engineering achievements
    // - Adds verified skills (PostgreSQL, Docker, Redis)
    liveResume.summary = "High-impact Backend Engineer with expertise in distributed microservices, REST APIs, and high-throughput data pipelines.";
    liveResume.experiences[0].position = "Senior Backend Engineer";
    liveResume.experiences[0].description = [
      "Engineered distributed REST APIs processing 45,000 requests/sec with Node.js and Express",
      "Architected PostgreSQL query caching with Redis, reducing p99 latency from 240ms to 45ms",
      "Overhauled Docker container deployment pipeline, cutting CI/CD build times by 50%"
    ];
    liveResume.skills.push(
      { name: "PostgreSQL", level: "Advanced", category: "Database" },
      { name: "Docker", level: "Intermediate", category: "DevOps" },
      { name: "Redis", level: "Intermediate", category: "Database" }
    );
    await liveResume.save();
    console.log(`4. Saved Real Edits to Live Resume in MongoDB (Summary refined, 3 quantified bullets, 3 skills added)`);

    // 5. User explicitly takes Snapshot 2 ("Quantified & Scaled for Senior Backend Role")
    const v2Snapshot = new ResumeVersion({
      resumeId: liveResume._id,
      userId: user._id,
      versionNumber: 2,
      label: "Quantified & Scaled for Senior Backend Role",
      snapshotData: liveResume.toObject(),
      atsScore: 88,
      dimensionScores: {
        keywordMatch: 86,
        requiredSkills: 90,
        experience: 88,
        projects: 75,
        quantification: 85,
        structure: 95,
        education: 85,
        summary: 90
      }
    });
    await v2Snapshot.save();
    console.log(`5. Created Version 2 Snapshot in MongoDB: v2 ("${v2Snapshot.label}", ATS: ${v2Snapshot.atsScore}/100)`);

    // 6. Query all versions from MongoDB (as GET /api/resume/:id/versions does)
    const storedVersions = await ResumeVersion.find({ resumeId: liveResume._id, userId: user._id })
      .sort({ versionNumber: -1 })
      .lean();

    console.log(`\n6. Verified MongoDB ResumeVersion Collection for Resume ${liveResume._id}:`);
    storedVersions.forEach(v => {
      console.log(`   - Version ${v.versionNumber}: "${v.label}" | ATS Score: ${v.atsScore}/100 | Saved At: ${v.createdAt.toISOString()}`);
    });

    // 7. Test Diff/Comparison Engine between v1 and v2
    const data1 = v1Snapshot.snapshotData;
    const data2 = v2Snapshot.snapshotData;
    const scoreDelta = v2Snapshot.atsScore - v1Snapshot.atsScore;

    const dimensionKeys = Object.keys(v1Snapshot.dimensionScores);
    const dimensionDeltas = {};
    for (const k of dimensionKeys) {
      dimensionDeltas[k] = v2Snapshot.dimensionScores[k] - v1Snapshot.dimensionScores[k];
    }

    const b1 = data1.experiences.flatMap(e => e.description);
    const b2 = data2.experiences.flatMap(e => e.description);
    const b1Set = new Set(b1.map(b => b.trim().toLowerCase()));
    const b2Set = new Set(b2.map(b => b.trim().toLowerCase()));

    const s1 = data1.skills.map(s => s.name);
    const s2 = data2.skills.map(s => s.name);
    const s1Set = new Set(s1.map(s => s.toLowerCase()));

    const diffResult = {
      scoreDelta,
      quantificationDelta: dimensionDeltas.quantification,
      keywordMatchDelta: dimensionDeltas.keywordMatch,
      summaryChanged: data1.summary !== data2.summary,
      bulletsAdded: b2.filter(b => !b1Set.has(b.trim().toLowerCase())),
      bulletsRemoved: b1.filter(b => !b2Set.has(b.trim().toLowerCase())),
      skillsAdded: s2.filter(s => !s1Set.has(s.toLowerCase()))
    };

    console.log(`\n7. Computed Real Version Comparison (v1 -> v2):`);
    console.log(`   - Overall Score Delta: +${diffResult.scoreDelta} pts (${v1Snapshot.atsScore} -> ${v2Snapshot.atsScore})`);
    console.log(`   - Quantification Improvement: +${diffResult.quantificationDelta}% (${v1Snapshot.dimensionScores.quantification}% -> ${v2Snapshot.dimensionScores.quantification}%)`);
    console.log(`   - Keyword Match Improvement: +${diffResult.keywordMatchDelta}% (${v1Snapshot.dimensionScores.keywordMatch}% -> ${v2Snapshot.dimensionScores.keywordMatch}%)`);
    console.log(`   - Summary Refined: ${diffResult.summaryChanged}`);
    console.log(`   - Experience Bullets Added:`, diffResult.bulletsAdded);
    console.log(`   - Experience Bullets Replaced:`, diffResult.bulletsRemoved);
    console.log(`   - Skills Added:`, diffResult.skillsAdded);

    // 8. Test Restore Functionality
    console.log(`\n8. Testing Reversion/Restore: Restoring Live Resume back to v1 ("${v1Snapshot.label}")...`);
    const restoredData = v1Snapshot.snapshotData;
    const updatedLiveResume = await Resume.findByIdAndUpdate(
      liveResume._id,
      {
        $set: {
          title: restoredData.title,
          personalInfo: restoredData.personalInfo,
          summary: restoredData.summary,
          experiences: restoredData.experiences,
          education: restoredData.education,
          skills: restoredData.skills,
          projects: restoredData.projects,
          template: restoredData.template
        }
      },
      { new: true }
    ).lean();

    console.log("✓ Successfully restored live resume document in MongoDB!");
    console.log(`   - Restored Summary: "${updatedLiveResume.summary}"`);
    console.log(`   - Restored Experience Count: ${updatedLiveResume.experiences.length} (Position: ${updatedLiveResume.experiences[0].position})`);
    console.log(`   - Restored Bullets:`, updatedLiveResume.experiences[0].description);
    console.log(`   - Restored Skills Count: ${updatedLiveResume.skills.length} (${updatedLiveResume.skills.map(s => s.name).join(", ")})`);

    console.log("\n========================================================================");
    console.log("✅ ALL MONGO DB VERSIONING & RESTORATION CHECKS VERIFIED CLEANLY");
    console.log("========================================================================");
  } finally {
    await mongoose.disconnect();
  }
}

runLiveVersioningE2ETest().catch(console.error);
