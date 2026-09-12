/**
 * Multi-Dimensional Weighted ATS Scoring Engine for ElevateCV.
 * 
 * Replaces hardcoded keyword lists and arbitrary heuristics with a research-grade
 * 8-dimension weighted model:
 * 
 * - Job Keyword Alignment (25%)
 * - Required Skill Coverage (20%)
 * - Experience Relevance (15%)
 * - Project Relevance (15%)
 * - Quantified Impact (10%)
 * - Resume Structure & ATS Compatibility (5%)
 * - Education Alignment (5%)
 * - Summary Quality (5%)
 */

const { analyzeSkillGaps } = require("./gapAnalyzer");
const { analyzeBullet } = require("./bulletIntelligence");
const { simulateATSParsing } = require("./atsSimulator");
const { normalizeSkill } = require("./skillOntology");

const DIMENSION_WEIGHTS = {
  keywordAlignment: 0.25,
  requiredSkillCoverage: 0.20,
  experienceRelevance: 0.15,
  projectRelevance: 0.15,
  quantifiedImpact: 0.10,
  resumeStructure: 0.05,
  educationAlignment: 0.05,
  summaryQuality: 0.05
};

/**
 * Calculates multi-dimensional ATS Score.
 * 
 * @param {Object} resumeData - Candidate resume JSON.
 * @param {Object|String} jobInput - Analyzed Job Object or raw Job Description text.
 * @param {Number} semanticSimScore - Optional Gemini vector similarity score (0-100).
 */
function scoreResume(resumeData = {}, jobInput = null, semanticSimScore = null) {
  let jobAnalysis = null;
  let isAligned = false;

  if (jobInput) {
    isAligned = true;
    if (typeof jobInput === "object" && jobInput.keywords) {
      jobAnalysis = jobInput;
    } else if (typeof jobInput === "string" && jobInput.trim().length > 0) {
      // Build lightweight job analysis object from string if full object not passed
      const words = Array.from(new Set(jobInput.toLowerCase().match(/\b[a-z]{3,}\b/g) || []));
      jobAnalysis = {
        requiredSkills: words.slice(0, 8).map(w => w.toUpperCase()),
        preferredSkills: words.slice(8, 14).map(w => w.toUpperCase()),
        keywords: words.slice(0, 15)
      };
    }
  }

  // 1. Calculate Individual Dimension Scores (0 - 100 each)
  const gaps = isAligned ? analyzeSkillGaps(resumeData, jobAnalysis) : null;
  const atsSim = simulateATSParsing(resumeData);

  const keywordMatchScore = isAligned ? calculateKeywordAlignment(resumeData, jobAnalysis, semanticSimScore) : 80;
  const skillCoverageScore = gaps ? gaps.skillCoveragePercentage : scoreStandaloneSkills(resumeData.skills || []);
  const experienceScore = scoreExperienceSection(resumeData.experiences || []);
  const projectScore = scoreProjectSection(resumeData.projects || []);
  const impactScore = scoreQuantifiedImpact(resumeData);
  const structureScore = atsSim.parseRate;
  const educationScore = scoreEducationSection(resumeData.education || []);
  const summaryScore = scoreSummarySection(resumeData.summary || "");

  const dimensionScores = {
    keywordMatch: Math.round(keywordMatchScore),
    requiredSkills: Math.round(skillCoverageScore),
    experience: Math.round(experienceScore),
    projects: Math.round(projectScore),
    quantification: Math.round(impactScore),
    structure: Math.round(structureScore),
    education: Math.round(educationScore),
    summary: Math.round(summaryScore)
  };

  // 2. Weighted Sum
  let overallScore = 0;
  overallScore += dimensionScores.keywordMatch * DIMENSION_WEIGHTS.keywordAlignment;
  overallScore += dimensionScores.requiredSkills * DIMENSION_WEIGHTS.requiredSkillCoverage;
  overallScore += dimensionScores.experience * DIMENSION_WEIGHTS.experienceRelevance;
  overallScore += dimensionScores.projects * DIMENSION_WEIGHTS.projectRelevance;
  overallScore += dimensionScores.quantification * DIMENSION_WEIGHTS.quantifiedImpact;
  overallScore += dimensionScores.structure * DIMENSION_WEIGHTS.resumeStructure;
  overallScore += dimensionScores.education * DIMENSION_WEIGHTS.educationAlignment;
  overallScore += dimensionScores.summary * DIMENSION_WEIGHTS.summaryQuality;

  const finalScore = Math.min(Math.max(Math.round(overallScore), 0), 100);

  // 3. Labeling
  let label = "Needs Improvement";
  let color = "#f43f5e"; // rose-500
  if (finalScore >= 80) { label = "Strong Match"; color = "#10b981"; }
  else if (finalScore >= 65) { label = "Good Match"; color = "#3b82f6"; }
  else if (finalScore >= 50) { label = "Moderate Match"; color = "#f59e0b"; }

  // 4. Feedback & Top Fixes
  const feedback = generateActionableFeedback(dimensionScores, gaps, atsSim);

  return {
    score: finalScore,
    label,
    color,
    dimensionScores,
    sectionScores: dimensionScores, // Backward compatibility
    gaps,
    atsSimulation: atsSim,
    feedback
  };
}

function calculateKeywordAlignment(resumeData, jobAnalysis, semanticSimScore) {
  const resumeText = JSON.stringify(resumeData).toLowerCase();
  const jdKeywords = (jobAnalysis.keywords || []).map(k => k.toLowerCase());

  if (jdKeywords.length === 0) return semanticSimScore || 75;

  const matchedKeywords = jdKeywords.filter(kw => resumeText.includes(kw));
  const keywordRatio = (matchedKeywords.length / jdKeywords.length) * 100;

  if (semanticSimScore !== null && !isNaN(semanticSimScore)) {
    // 60% Keyword Ratio + 40% Vector Semantic Similarity
    return (keywordRatio * 0.6) + (semanticSimScore * 0.4);
  }

  return keywordRatio;
}

function scoreStandaloneSkills(skills = []) {
  if (!skills.length) return 0;
  if (skills.length >= 10) return 100;
  if (skills.length >= 6) return 85;
  return skills.length * 12;
}

function scoreExperienceSection(experiences = []) {
  if (!experiences.length) return 0;
  let score = 50;
  
  if (experiences.length >= 2) score += 20;
  else if (experiences.length === 1) score += 10;

  // Evaluate bullet impact across experiences
  let totalBulletScore = 0;
  let bulletCount = 0;

  experiences.forEach(exp => {
    const descs = Array.isArray(exp.description) ? exp.description : [exp.description || ""];
    descs.forEach(bullet => {
      if (bullet.trim().length > 0) {
        const analysis = analyzeBullet(bullet);
        totalBulletScore += analysis.impactScore;
        bulletCount++;
      }
    });
  });

  if (bulletCount > 0) {
    const avgBulletImpact = totalBulletScore / bulletCount;
    score += (avgBulletImpact * 0.3);
  }

  return Math.min(Math.round(score), 100);
}

function scoreProjectSection(projects = []) {
  if (!projects || !projects.length) return 20; // Baseline for no projects
  let score = 60;

  if (projects.length >= 3) score += 25;
  else if (projects.length >= 1) score += 15;

  const hasTechDetails = projects.some(p => p.technologies?.length > 0 || (p.description && p.description.length > 50));
  if (hasTechDetails) score += 15;

  return Math.min(score, 100);
}

function scoreQuantifiedImpact(resumeData) {
  let metricCount = 0;
  const fullText = JSON.stringify(resumeData);
  const matches = fullText.match(/[\d]+%|[\d]+k|\$[\d]+|ms|seconds|users|queries|requests/gi) || [];
  metricCount = matches.length;

  if (metricCount >= 5) return 100;
  if (metricCount >= 3) return 85;
  if (metricCount >= 1) return 65;
  return 30;
}

function scoreEducationSection(education = []) {
  if (!education || !education.length) return 40;
  return 100;
}

function scoreSummarySection(summary = "") {
  const len = summary.trim().length;
  if (len > 100) return 100;
  if (len > 30) return 75;
  if (len > 0) return 40;
  return 0;
}

function generateActionableFeedback(scores, gaps, atsSim) {
  const fixes = [];

  if (scores.keywordMatch < 80) {
    fixes.push("Add key job description keywords into your experience bullet points.");
  }
  if (scores.requiredSkills < 80 && gaps && gaps.missing.length > 0) {
    const missingNames = gaps.missing.slice(0, 3).map(m => m.skill).join(", ");
    fixes.push(`Include missing required technical skills: ${missingNames}.`);
  }
  if (scores.quantification < 75) {
    fixes.push("Add metrics (% improvement, dollar value, latency ms, user volume) to quantify your experience bullets.");
  }
  if (atsSim && atsSim.warnings.length > 0) {
    fixes.push(atsSim.warnings[0]);
  }

  if (fixes.length === 0) {
    fixes.push("Your resume meets high ATS standards across all evaluated dimensions.");
  }

  return fixes;
}

module.exports = {
  scoreResume,
  DIMENSION_WEIGHTS
};
