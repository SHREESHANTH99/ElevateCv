const { expandSkills } = require("./skillExtractor");

/**
 * PRODUCTION-GRADE ATS Scoring Engine (Calibrated)
 */
const BASE_WEIGHTS = {
  experience: 0.40,
  skills: 0.30,
  projects: 0.15,
  summary: 0.10,
  education: 0.05
};

const ALIGNED_WEIGHTS = {
  jobMatch: 0.50,      // 50% on how well it fits the JOB
  experience: 0.25,
  skills: 0.15,
  projects: 0.05,
  summary: 0.05
};

function scoreResume(resumeData, jobDescription = "") {
  const isAligned = !!jobDescription;
  const weights = isAligned ? ALIGNED_WEIGHTS : BASE_WEIGHTS;

  // 1. Calculate Section Scores
  const sections = {
    experience: scoreExperience(resumeData.experiences || []),
    skills: scoreSkills(resumeData.skills || []),
    projects: scoreProjects(resumeData.projects || []),
    summary: scoreSummary(resumeData.summary || ""),
    education: 100 // Minimal baseline
  };

  // 2. Handle Job Matching (if applicable)
  let jobMatchScore = 0;
  if (isAligned) {
    jobMatchScore = calculateAlignment(resumeData, jobDescription);
  }

  // 3. Weighted Sum
  let total = isAligned ? (jobMatchScore * weights.jobMatch) : 0;
  for (const [key, weight] of Object.entries(weights)) {
    if (key !== "jobMatch") {
      total += (sections[key] || 0) * weight;
    }
  }

  // 4. Calibration & Labeling
  const finalScore = Math.min(Math.round(total), 100);
  let label = "Needs Improvement";
  let color = "#f43f5e"; // rose-500
  
  if (finalScore >= 80) { label = "Strong Match"; color = "#10b981"; }
  else if (finalScore >= 60) { label = "Average"; color = "#f59e0b"; }

  // 5. Reasoning Layer
  const reasoning = generateReasoning(sections, finalScore, isAligned);

  return {
    score: finalScore,
    label,
    color,
    sectionScores: sections,
    reasoning,
    feedback: reasoning.map(r => r.message)
  };
}

function scoreExperience(exp) {
  if (!exp.length) return 0;
  let s = 60;
  const text = JSON.stringify(exp);
  if (text.match(/[\d]+%|[\d]+k|\$[\d]+/)) s += 20;
  if (text.toLowerCase().match(/optimized|led|built|orchestrated/)) s += 20;
  return Math.min(s, 100);
}

function scoreSkills(skills) {
  return Math.min((skills?.length || 0) * 15, 100);
}

function scoreProjects(projects) {
  return projects?.length > 0 ? 100 : 0;
}

function scoreSummary(summary) {
  return (summary?.length > 30) ? 100 : 0;
}

function calculateAlignment(data, jobDesc) {
  const resumeRawSkills = data.skills?.map(s => s.name) || [];
  const expandedSkills = expandSkills(resumeRawSkills).map(s => s.toLowerCase());
  const resumeText = (JSON.stringify(data) + expandedSkills.join(" ")).toLowerCase();
  const jobText = jobDesc.toLowerCase();
  
  // More robust keyword list for semantic overlap (Calibrated)
  const keywords = [
    "react", "node", "aws", "python", "javascript", "docker", "typescript", "mongodb",
    "cloud", "infrastructure", "backend", "frontend", "devops", "sql", "postgresql",
    "engineer", "developer", "architect", "kubernetes", "containerization"
  ];
  const matches = keywords.filter(kw => resumeText.includes(kw) && jobText.includes(kw));
  
  return (matches.length / 4) * 100; // Calibrated for 4 key overlap
}

function generateReasoning(sections, total, isAligned) {
  const reasons = [];
  if (total < 60) reasons.push({ type: "critical", section: "Impact", message: "Low overall impact. Add metrics and specific technologies." });
  if (sections.experience < 70) reasons.push({ type: "suggestion", section: "Experience", message: "Use stronger action verbs." });
  if (isAligned && total < 75) reasons.push({ type: "critical", section: "Match", message: "Keywords don't align perfectly with Job Description." });
  return reasons;
}

module.exports = { scoreResume };
