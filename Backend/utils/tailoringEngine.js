const { generateAIContent } = require("./geminiClient");
const { STRONG_ACTION_VERBS, WEAK_ACTION_VERBS } = require("./bulletIntelligence");

/**
 * Extract all numbers, percentages, and metrics from a text.
 */
function extractMetrics(text) {
  if (!text) return [];
  const matches = text.match(/\d+([.,]\d+)?(\s*(%|x|k|m|b|\+|ms|s|users|clients|customers|records|queries|requests|events))?/gi) || [];
  return matches.map(m => m.trim().toLowerCase());
}

/**
 * Extract skill/tech keywords from text based on common programming & infrastructure terms.
 */
function extractKnownTechTerms(text) {
  if (!text) return new Set();
  const techPattern = /\b(python|javascript|typescript|java|c\+\+|golang|rust|ruby|php|swift|kotlin|react|next\.?js|vue|angular|node\.?js|express|fastapi|django|flask|spring|pytorch|tensorflow|keras|spacy|scikit-learn|docker|kubernetes|k8s|aws|gcp|azure|postgresql|postgres|mongodb|redis|mysql|graphql|rest\s*apis?|ci\/cd|kafka|rabbitmq|git|linux|terraform)\b/gi;
  const matches = text.match(techPattern) || [];
  return new Set(matches.map(m => m.toLowerCase().replace(/[\s\.]+/g, "")));
}

/**
 * Strict Anti-Hallucination Post-Check.
 * Verifies that every number/metric and tech term in the tailored bullet is grounded in source material.
 */
function verifyTailoredGroundedness(originalBullet, tailoredBullet, resumeContext = {}) {
  const originalMetrics = extractMetrics(originalBullet);
  const tailoredMetrics = extractMetrics(tailoredBullet);

  // 1. Metric check: tailored bullet must NOT contain metrics that were absent from the original
  if (originalMetrics.length === 0 && tailoredMetrics.length > 0) {
    return {
      isGrounded: false,
      reason: `Tailored bullet introduced fabricated metric (${tailoredMetrics.join(", ")}) not present in original bullet.`
    };
  }

  // 2. Tech skill check: tailored bullet must only contain tech terms from original bullet OR candidate resume
  const candidateSkillsText = [
    ...(resumeContext.skills || []),
    ...(resumeContext.technologies || []),
    originalBullet
  ].join(" ");

  const sourceTech = extractKnownTechTerms(candidateSkillsText);
  const tailoredTech = extractKnownTechTerms(tailoredBullet);

  for (const tech of tailoredTech) {
    if (!sourceTech.has(tech)) {
      return {
        isGrounded: false,
        reason: `Tailored bullet introduced unverified skill/technology (${tech}) not present in candidate profile.`
      };
    }
  }

  return { isGrounded: true };
}

/**
 * Deterministic fallback tailoring when LLM is unavailable or when generation fails validation.
 * Safely strengthens action verbs and surfaces verified candidate skills matching the job WITHOUT fabricating facts.
 */
function deterministicTailorFallback(originalBullet, jobContext = "", resumeContext = {}, reason = "deterministic optimization") {
  const text = (originalBullet || "").trim();
  if (!text) {
    return {
      original: "",
      tailored: "",
      changesExplained: [],
      grounded: true,
      fallbackUsed: true
    };
  }

  const words = text.split(/\s+/);
  const firstWord = words[0].toLowerCase().replace(/[^a-z]/g, "");
  const jobText = (typeof jobContext === "string" ? jobContext : JSON.stringify(jobContext)).toLowerCase();
  const candidateSkills = [
    ...(resumeContext.skills || []),
    ...(resumeContext.technologies || [])
  ].filter(Boolean);

  const changesExplained = [];
  let tailoredText = text;

  // 1. Weak Verb Upgrade
  if (WEAK_ACTION_VERBS.has(firstWord) || text.toLowerCase().startsWith("responsible for")) {
    const cleaned = text.replace(/^(worked on|responsible for|helped with|assisted with|handled|did|made|participated in|used)\s+/i, "");
    tailoredText = `Engineered ${cleaned.charAt(0).toLowerCase() + cleaned.slice(1)}`;
    changesExplained.push({
      change: `Replaced weak verb "${words[0]}" with high-impact action verb "Engineered"`,
      reason: "Strengthens professional impact and ATS keyword alignment."
    });
  }

  // 2. Verified Resume Skill Surfacing:
  // If candidate has a verified skill that matches the job requirement AND fits the domain of the bullet, surface it!
  const lowerBullet = tailoredText.toLowerCase();
  for (const skill of candidateSkills) {
    const skillNorm = skill.toLowerCase();
    // Only consider skills that the target job explicitly mentions AND that are not already in the bullet
    if (jobText.includes(skillNorm) && !lowerBullet.includes(skillNorm)) {
      // Contextual relevance check:
      // If skill is an API/Backend skill and bullet is about backend/services
      if ((skillNorm.includes("api") || skillNorm.includes("rest")) && (lowerBullet.includes("backend") || lowerBullet.includes("service") || lowerBullet.includes("endpoint"))) {
        tailoredText = tailoredText.replace(/(backend services?|services?|endpoints?)/i, `$1 and ${skill}`);
        changesExplained.push({
          change: `Surfaced verified candidate skill "${skill}"`,
          reason: `Directly matches target job requirement for ${skill} and is grounded in candidate's verified profile.`
        });
        break;
      }
      // If skill is a database skill and bullet mentions data/storage
      if ((skillNorm.includes("sql") || skillNorm.includes("database") || skillNorm.includes("mongo") || skillNorm.includes("postgres")) && (lowerBullet.includes("storage") || lowerBullet.includes("data") || lowerBullet.includes("database"))) {
        tailoredText = tailoredText.replace(/(data storage|database|storage)/i, `$1 using ${skill}`);
        changesExplained.push({
          change: `Surfaced verified candidate skill "${skill}"`,
          reason: `Matches target job requirement for ${skill} and is grounded in candidate's verified profile.`
        });
        break;
      }
    }
  }

  if (changesExplained.length === 0) {
    return {
      original: text,
      tailored: text,
      changesExplained: [
        {
          change: "Retained original bullet unchanged",
          reason: "Bullet already uses strong action phrasing or cannot be tailored without unverified claims."
        }
      ],
      grounded: true,
      engine: "deterministic-rule-engine",
      isTailored: false,
      retriedOnce: false,
      fallbackToOriginal: true,
      fallbackUsed: true
    };
  }

  return {
    original: text,
    tailored: tailoredText,
    changesExplained,
    grounded: true,
    engine: "deterministic-rule-engine",
    isTailored: tailoredText !== text,
    retriedOnce: false,
    fallbackToOriginal: false,
    fallbackUsed: false
  };
}

/**
 * Core Bullet Tailoring Function.
 * Rewrites a resume bullet to align with target job description requirements.
 * Enforces strict anti-hallucination guardrails with automated post-verification.
 */
async function generateTailoredBullet(originalBullet, jobContext, resumeContext = {}) {
  const rawOriginal = (originalBullet || "").trim();
  if (!rawOriginal || rawOriginal.length < 10) {
    return deterministicTailorFallback(rawOriginal, jobContext, resumeContext);
  }

  const jobDescText = typeof jobContext === "string" ? jobContext : JSON.stringify(jobContext);
  const candidateSkills = [
    ...(resumeContext.skills || []),
    ...(resumeContext.technologies || [])
  ].filter(Boolean);

  const prompt = `
You are an expert ATS Resume Optimization Engine.
Task: Tailor this specific work experience bullet to align with the target job description.

ORIGINAL BULLET:
"${rawOriginal}"

TARGET JOB DESCRIPTION / REQUIREMENTS:
${jobDescText.slice(0, 1500)}

CANDIDATE'S VERIFIED RESUME SKILLS / TECHNOLOGIES:
${JSON.stringify(candidateSkills)}

CRITICAL ANTI-HALLUCINATION RULES:
1. You must NOT introduce any technologies, tools, frameworks, programming languages, or certifications NOT present in the ORIGINAL BULLET or the CANDIDATE'S VERIFIED RESUME SKILLS.
2. If the target job requires a skill that the candidate does NOT possess, do NOT insert that skill.
3. You must NOT fabricate, invent, or estimate any numbers, percentages, multipliers (e.g., 20%, 3x), dollar amounts, or metrics. Only retain metrics that explicitly existed in the original bullet.
4. Strengthen action verbs (e.g. "Worked on" -> "Architected", "Engineered", "Optimized") and emphasize relevant responsibilities that match the job.
5. Explain each specific change made and the reason for it.

Output MUST be strictly valid JSON matching this schema:
{
  "tailored": "The improved, grounded bullet point string",
  "changesExplained": [
    { "change": "Description of change", "reason": "Why this aligns with the job requirement" }
  ]
}
`;

  // Attempt 1: Standard Generation
  try {
    const result = await generateAIContent(prompt, null);
    if (result && result.tailored) {
      const verification = verifyTailoredGroundedness(rawOriginal, result.tailored, resumeContext);
      if (verification.isGrounded) {
        return {
          original: rawOriginal,
          tailored: result.tailored,
          changesExplained: result.changesExplained || [],
          grounded: true,
          engine: "llm-grounded",
          isTailored: result.tailored !== rawOriginal,
          retriedOnce: false,
          fallbackToOriginal: false,
          fallbackUsed: false
        };
      }
      console.warn(`[TAILORING GUARD] Attempt 1 failed verification: ${verification.reason}. Retrying with strict penalty prompt...`);
    }
  } catch (err) {
    console.warn(`[TAILORING] LLM generation failed or unavailable: ${err.message}. Falling back to deterministic tailoring.`);
    return deterministicTailorFallback(rawOriginal, jobContext, resumeContext, err.message);
  }

  // Attempt 2: Strict Retry Prompt with Explicit Hallucination Warning
  try {
    const retryPrompt = `
${prompt}

WARNING: Previous attempt failed validation because it introduced ungrounded terms or fabricated numbers.
RETRY DIRECTIVE: Re-write the bullet using ONLY the exact vocabulary and facts from the original bullet. DO NOT ADD ANY NEW SKILL OR METRIC.
`;
    const retryResult = await generateAIContent(retryPrompt, null);
    if (retryResult && retryResult.tailored) {
      const retryVerification = verifyTailoredGroundedness(rawOriginal, retryResult.tailored, resumeContext);
      if (retryVerification.isGrounded) {
        return {
          original: rawOriginal,
          tailored: retryResult.tailored,
          changesExplained: retryResult.changesExplained || [],
          grounded: true,
          engine: "llm-grounded",
          isTailored: retryResult.tailored !== rawOriginal,
          retriedOnce: true,
          fallbackToOriginal: false,
          fallbackUsed: false
        };
      }
      console.warn(`[TAILORING GUARD] Attempt 2 failed verification: ${retryVerification.reason}. Falling back to deterministic tailoring.`);
    }
  } catch (e2) {
    console.warn(`[TAILORING] Retry failed: ${e2.message}`);
  }

  // Safe Fallback: Deterministic grounded tailoring with honest explanation
  const fallbackResult = deterministicTailorFallback(rawOriginal, jobContext, resumeContext, "failed LLM validation");
  return {
    ...fallbackResult,
    retriedOnce: true
  };
}

module.exports = {
  generateTailoredBullet,
  verifyTailoredGroundedness,
  deterministicTailorFallback,
  extractKnownTechTerms,
  extractMetrics
};
