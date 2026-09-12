/**
 * Bullet-Point Intelligence & Impact Engine for ElevateCV.
 * 
 * Evaluates individual bullet points for impact score, action verb strength,
 * technology context, and metric quantification.
 * 
 * CRITICAL DIRECTIVE: Does NOT fabricate false metrics. Provides suggested metric types
 * for the user to add responsibly.
 */

const STRONG_ACTION_VERBS = new Set([
  "architected", "engineered", "spearheaded", "orchestrated", "developed", "launched",
  "optimized", "scaled", "reduced", "increased", "accelerated", "implemented", "overhauled",
  "automated", "streamlined", "constructed", "pioneered", "designed", "executed", "transformed"
]);

const WEAK_ACTION_VERBS = new Set([
  "worked", "helped", "assisted", "responsible for", "handled", "did", "made",
  "participated", "involved", "used", "created", "looked after"
]);

const METRIC_PATTERNS = [
  /(\d+[\d,]*\s*%)|(\d+[\d,]*x)/i,               // percentage or multiplier (45%, 2x)
  /(\$[\d,]+(\.\d+)?[kmb]?)/i,                     // dollar amounts ($2M, $50k)
  /(\d+[\d,]*\s*\+?\s*(users|clients|customers|records|requests|queries|events|downloads))/i, // user/record volume
  /(\d+[\d,]*\s*(ms|seconds|min|hours|days|%))/i // speed/latency metrics
];

const SUGGESTED_METRIC_PROMPTS = [
  { name: "dataset_size", prompt: "Dataset size (e.g. 50,000+ records processed)" },
  { name: "latency_speed", prompt: "Response speed/latency (e.g. reduced API response time by 35ms)" },
  { name: "accuracy_rate", prompt: "Accuracy or precision % (e.g. improved model accuracy to 94%)" },
  { name: "scale_users", prompt: "User / Traffic volume (e.g. serving 10,000+ daily active users)" },
  { name: "cost_savings", prompt: "Cost or resource reduction (e.g. reduced cloud infrastructure cost by 20%)" },
  { name: "throughput", prompt: "Throughput / Request capacity (e.g. handling 1,500 requests/sec)" }
];

/**
 * Analyzes a single resume bullet point.
 */
function analyzeBullet(bulletText = "") {
  const text = bulletText.trim();
  if (!text) {
    return {
      bullet: text,
      impactScore: 0,
      problems: ["Empty bullet point"],
      suggestedMetrics: SUGGESTED_METRIC_PROMPTS.map(m => m.prompt),
      improved: ""
    };
  }

  const words = text.toLowerCase().split(/\s+/);
  const firstWord = words[0].replace(/[^a-z]/g, "");

  const hasStrongVerb = STRONG_ACTION_VERBS.has(firstWord);
  const hasWeakVerb = WEAK_ACTION_VERBS.has(firstWord) || text.toLowerCase().startsWith("responsible for");
  const hasMetric = METRIC_PATTERNS.some(pattern => pattern.test(text));

  const problems = [];
  let score = 50; // base score

  if (hasMetric) {
    score += 30;
  } else {
    problems.push("⚠ Missing metric or quantified impact");
  }

  if (hasStrongVerb) {
    score += 20;
  } else if (hasWeakVerb) {
    score -= 15;
    problems.push(`⚠ Weak action verb "${firstWord}". Replace with a high-impact verb.`);
  } else {
    problems.push("⚠ Action verb could be stronger.");
  }

  if (text.length < 40) {
    score -= 10;
    problems.push("⚠ Bullet is too short; detail your specific engineering contribution.");
  }

  const finalScore = Math.max(10, Math.min(score, 100));

  // Generate suggested metric prompts specific to the bullet context
  const suggestedMetrics = suggestMetricsForBullet(text);

  // Generate non-hallucinated template improvement
  const improved = generateImprovedBulletTemplate(text, firstWord, hasMetric);

  return {
    bullet: text,
    impactScore: finalScore,
    hasMetric,
    hasStrongVerb,
    problems,
    suggestedMetrics,
    improved
  };
}

function suggestMetricsForBullet(text) {
  const lower = text.toLowerCase();
  const suggestions = [];

  if (lower.includes("model") || lower.includes("ml") || lower.includes("data") || lower.includes("pipeline")) {
    suggestions.push("Dataset volume (e.g., 500,000+ records)");
    suggestions.push("Accuracy / Precision % (e.g., +15% F1 score improvement)");
  }
  if (lower.includes("api") || lower.includes("backend") || lower.includes("service") || lower.includes("server")) {
    suggestions.push("Latency reduction (e.g., cut p99 response time from 350ms to 90ms)");
    suggestions.push("Throughput (e.g., scaled capacity to 5,000 requests/sec)");
  }
  if (lower.includes("frontend") || lower.includes("ui") || lower.includes("react") || lower.includes("user")) {
    suggestions.push("Load time reduction (e.g., reduced initial bundle render time by 40%)");
    suggestions.push("User adoption (e.g., adopted by 25,000+ active monthly users)");
  }

  // Fallback defaults
  if (suggestions.length === 0) {
    suggestions.push("Percentage improvement (e.g., +25% efficiency boost)");
    suggestions.push("Scale or dataset size (e.g., processing 10,000+ daily events)");
  }

  return suggestions;
}

function generateImprovedBulletTemplate(text, firstWord, hasMetric) {
  let verb = "Engineered";
  if (STRONG_ACTION_VERBS.has(firstWord)) {
    verb = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
  }

  if (!hasMetric) {
    return `${verb} ${text.replace(/^(worked on|responsible for|helped|assisted|did|built|created)\s+/i, "")} [Insert Metric: e.g. reducing latency by 35% or serving 10,000+ active users].`;
  }
  
  return text;
}

module.exports = {
  analyzeBullet,
  STRONG_ACTION_VERBS,
  WEAK_ACTION_VERBS
};
