/**
 * PIPELINE RESULT CACHE (IN-MEMORY)
 * Caches full analysis results based on the unique combination of resume and job description.
 */

const crypto = require("crypto");

const resultCache = new Map();
const MAX_CACHE_SIZE = 200;

/**
 * Generate a unique hash for the resume and job description
 */
function getHash(resumeData, jobDescription = "") {
  const content = JSON.stringify(resumeData) + jobDescription.trim().toLowerCase();
  return crypto.createHash("md5").update(content).digest("hex");
}

/**
 * Retrieve cached result or execute full pipeline
 */
async function getCachedResult(resumeData, jobDescription, processFn) {
  const hash = getHash(resumeData, jobDescription);
  
  if (resultCache.has(hash)) {
    console.log("🚀 PIPELINE CACHE HIT: Instant analysis returned.");
    const result = resultCache.get(hash);
    return { ...result, cached: true };
  }
  
  const result = await processFn();
  
  if (result) {
    if (resultCache.size >= MAX_CACHE_SIZE) {
      const firstKey = resultCache.keys().next().value;
      resultCache.delete(firstKey);
    }
    resultCache.set(hash, result);
  }
  
  return { ...result, cached: false };
}

module.exports = { getCachedResult };
