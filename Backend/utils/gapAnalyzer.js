/**
 * Missing Skills & Gap Analysis Engine for ElevateCV.
 * 
 * Compares candidate skills & experiences against analyzed Job Description requirements,
 * categorizing into Matched (✓), Missing (✗), and Partially Matched (◐) with actionable recommendations.
 */

const { normalizeSkill, resolveOntologyMatches } = require("./skillOntology");

/**
 * Performs skill & experience gap analysis.
 */
function analyzeSkillGaps(resumeData = {}, jobAnalysis = {}) {
  const candidateRawSkills = (resumeData.skills || []).map(s => typeof s === "string" ? s : (s.name || ""));
  const candidateNormalized = candidateRawSkills.map(normalizeSkill);
  
  const ontologyResult = resolveOntologyMatches(candidateRawSkills);

  const required = (jobAnalysis.requiredSkills || []).map(s => String(s).trim());
  const preferred = (jobAnalysis.preferredSkills || []).map(s => String(s).trim());
  const allJobSkills = Array.from(new Set([...required, ...preferred]));

  const matched = [];
  const missing = [];
  const partiallyMatched = [];

  allJobSkills.forEach(jobSkill => {
    const normJobSkill = normalizeSkill(jobSkill);

    // 1. Direct exact match
    const isDirectMatch = candidateNormalized.some(cs => cs === normJobSkill || cs.includes(normJobSkill) || normJobSkill.includes(cs));

    if (isDirectMatch) {
      matched.push({ skill: jobSkill, type: "direct", status: "✓" });
      return;
    }

    // 2. Ontology category match
    const isCategoryMatch = ontologyResult.matchedCategoryNames.some(cat => 
      cat.includes(normJobSkill) || normJobSkill.includes(cat)
    );

    if (isCategoryMatch) {
      partiallyMatched.push({
        skill: jobSkill,
        type: "ontology",
        status: "◐",
        reason: `Matched parent domain category via related experience.`
      });
      return;
    }

    // 3. Missing
    missing.push({ skill: jobSkill, type: required.includes(jobSkill) ? "required" : "preferred", status: "✗" });
  });

  // Calculate coverage metrics
  const requiredCount = required.length || 1;
  const matchedRequiredCount = required.filter(req => 
    matched.some(m => normalizeSkill(m.skill) === normalizeSkill(req))
  ).length;
  
  const skillCoveragePercentage = Math.min(Math.round((matchedRequiredCount / requiredCount) * 100), 100);

  // Generate actionable recommendations
  const recommendedActions = generateRecommendations(missing, candidateRawSkills, resumeData);

  return {
    skillCoveragePercentage,
    matched,
    missing,
    partiallyMatched,
    recommendedActions
  };
}

function generateRecommendations(missingSkills, candidateSkills, resumeData) {
  const recommendations = [];
  const topMissing = missingSkills.slice(0, 4);

  topMissing.forEach((item, idx) => {
    if (idx === 0) {
      recommendations.push(`Add ${item.skill} experience to your primary work experience or project section.`);
    } else if (idx === 1) {
      recommendations.push(`Highlight ${item.skill} implementation details in your technical skills inventory.`);
    } else {
      recommendations.push(`Include fundamental ${item.skill} concepts or course projects if applicable.`);
    }
  });

  if (recommendations.length === 0) {
    recommendations.push("Your skill inventory aligns strongly with the job description requirements.");
  }

  return recommendations;
}

module.exports = {
  analyzeSkillGaps
};
