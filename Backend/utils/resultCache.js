const crypto = require("crypto");
const redis = require("../config/redis");

/**
 * PIPELINE RESULT CACHE (L1 MEMORY + L2 REDIS)
 * Caches full analysis results based on the unique combination of resume and job description.
 */
const resultCache = new Map();
const inFlightPromises = new Map();
const MAX_CACHE_SIZE = 200;
const TTL_SECONDS = 3600; // 1h

function getHash(resumeData, jobDescription = "") {
  const content = JSON.stringify(resumeData) + jobDescription.trim().toLowerCase();
  return crypto.createHash("md5").update(content).digest("hex");
}

async function getCachedResult(resumeData, jobDescription, processFn) {
  const hash = getHash(resumeData, jobDescription);
  const redisKey = `result:${hash}`;
  
  // L1 Cache check
  if (resultCache.has(hash)) {
    console.log("PIPELINE CACHE HIT: Instant analysis returned from L1 memory.");
    const result = resultCache.get(hash);
    return { ...result, cached: true };
  }
  
  // L2 Cache check (fail open)
  try {
    if (redis.status === "ready") {
      const cachedData = await redis.get(redisKey);
      if (cachedData) {
        console.log("PIPELINE CACHE HIT: Instant analysis returned from L2 Redis.");
        const parsed = JSON.parse(cachedData);
        resultCache.set(hash, parsed); // backfill L1
        return { ...parsed, cached: true };
      }
    }
  } catch (error) {
    console.error("Redis Get Error (Result):", error.message);
  }
  
  // Deduplication lock for concurrent identical requests
  if (inFlightPromises.has(hash)) {
    console.log("PIPELINE CACHE DEDUP: Awaiting in-flight execution...");
    const result = await inFlightPromises.get(hash);
    return { ...result, cached: true };
  }

  const promise = processFn().then(async (result) => {
    if (result) {
      // Backfill L1
      if (resultCache.size >= MAX_CACHE_SIZE) {
        const firstKey = resultCache.keys().next().value;
        resultCache.delete(firstKey);
      }
      resultCache.set(hash, result);
      
      // Backfill L2 (fail open)
      try {
        if (redis.status === "ready") {
          await redis.set(redisKey, JSON.stringify(result), "EX", TTL_SECONDS);
        }
      } catch (error) {
        console.error("Redis Set Error (Result):", error.message);
      }
    }
    inFlightPromises.delete(hash);
    return result;
  }).catch(err => {
    inFlightPromises.delete(hash);
    throw err;
  });

  inFlightPromises.set(hash, promise);
  const result = await promise;
  
  return { ...result, cached: false };
}

module.exports = { getCachedResult };
