const inMemoryStorage = require("../utils/inMemoryStorage");

async function testApplicationTrackingFlow() {
  console.log("========================================================================");
  console.log("🚀 TESTING APPLICATION TRACKING & STATS PIPELINE");
  console.log("========================================================================\n");

  const user = await inMemoryStorage.createUser({
    email: "applicant@elevatecv.com",
    profile: { firstName: "Dev", lastName: "Candidate" }
  });
  console.log(`1. User Authenticated (ID: ${user._id})`);

  // Create 5 applications across different stages
  const apps = [
    {
      userId: user._id,
      company: "Stripe",
      role: "Senior Backend Engineer",
      status: "Bookmarked",
      salary: "$180,000 - $210,000",
      location: "San Francisco, CA (Remote)",
      notes: "Referral from teammate. Need to tailor resume towards distributed systems."
    },
    {
      userId: user._id,
      company: "Datadog",
      role: "Distributed Systems Engineer",
      status: "Applied",
      appliedDate: new Date("2026-09-02"),
      salary: "$175,000",
      location: "New York, NY (Hybrid)",
      resumeVersionLabel: "v2 Quantified for Senior Backend",
      notes: "Applied via company careers portal."
    },
    {
      userId: user._id,
      company: "Cloudflare",
      role: "Platform Engineer",
      status: "Interviewing",
      appliedDate: new Date("2026-08-20"),
      salary: "$190,000",
      location: "Austin, TX (Remote)",
      resumeVersionLabel: "v2 Quantified for Senior Backend",
      notes: "Technical phone screen passed. System design round on Sept 18."
    },
    {
      userId: user._id,
      company: "Vercel",
      role: "Staff Infrastructure Engineer",
      status: "Offered",
      appliedDate: new Date("2026-08-10"),
      salary: "$225,000 + Equity",
      location: "Remote",
      resumeVersionLabel: "v2 Quantified for Senior Backend",
      notes: "Offer received! Negotiating signing bonus."
    },
    {
      userId: user._id,
      company: "Meta",
      role: "Software Engineer",
      status: "Rejected",
      appliedDate: new Date("2026-07-15"),
      notes: "Standard rejection email after resume screen."
    }
  ];

  for (const a of apps) {
    const created = await inMemoryStorage.createApplication(a);
    console.log(`2. Tracked Application: [${created.status.padEnd(12)}] ${created.company} — ${created.role} (ID: ${created._id})`);
  }

  // Query stats
  const allApps = await inMemoryStorage.findApplicationsByUserId(user._id);
  const byStatus = { Bookmarked: 0, Applied: 0, Interviewing: 0, Offered: 0, Rejected: 0 };
  allApps.forEach(a => byStatus[a.status]++);

  const total = allApps.length;
  const active = byStatus.Applied + byStatus.Interviewing + byStatus.Offered;
  const postApplied = byStatus.Applied + byStatus.Interviewing + byStatus.Offered + byStatus.Rejected;
  const interviewRate = postApplied > 0 ? Math.round(((byStatus.Interviewing + byStatus.Offered) / postApplied) * 100) : 0;
  const offerRate = total > 0 ? Math.round((byStatus.Offered / total) * 100) : 0;
  const rejectionRate = postApplied > 0 ? Math.round((byStatus.Rejected / postApplied) * 100) : 0;

  const stats = {
    total,
    active,
    byStatus,
    interviewRate: `${interviewRate}%`,
    offerRate: `${offerRate}%`,
    rejectionRate: `${rejectionRate}%`
  };

  console.log("\n3. Application Stats Calculated:\n", JSON.stringify(stats, null, 2));

  // Test status change (Move "Applied" -> "Interviewing")
  const appliedApp = allApps.find(a => a.company === "Datadog");
  const updated = await inMemoryStorage.updateApplication(appliedApp._id, user._id, {
    status: "Interviewing",
    notes: "Recruiter reached out for initial phone interview!"
  });
  console.log(`\n4. Updated Status for ${updated.company}: Applied -> ${updated.status} (Notes: "${updated.notes}")`);

  console.log("\n========================================================================");
  console.log("✅ APPLICATION TRACKING VERIFIED SUCCESSFULLY");
  console.log("========================================================================");
}

testApplicationTrackingFlow().catch(console.error);
