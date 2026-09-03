const crypto = require("crypto");
const redis = require("../config/redis");

/**
 * EMBEDDING CACHE (L1 MEMORY + L2 REDIS)
 * Prevents calling the Python service for identical text.
 */
const cache = new Map();
const TTL_SECONDS = 86400; // 24h

function getHash(text) {
  return crypto.createHash("md5").update(text.trim()).digest("hex");
}

async function getCachedEmbedding(text, fetchFn) {
  if (!text || text.length < 5) return null;
  
  const hash = getHash(text);
  const redisKey = `embedding:${hash}`;
  
  // L1 Cache check
  if (cache.has(hash)) {
    console.log("CACHE HIT: Embedding retrieved from L1 memory.");
    return cache.get(hash);
  }
  
  // L2 Cache check (fail open)
  try {
    if (redis.status === "ready") {
      const cachedData = await redis.get(redisKey);
      if (cachedData) {
        console.log("CACHE HIT: Embedding retrieved from L2 Redis.");
        const parsed = JSON.parse(cachedData);
        cache.set(hash, parsed); // backfill L1
        return parsed;
      }
    }
  } catch (error) {
    console.error("Redis Get Error (Embedding):", error.message);
  }
  
  const embedding = await fetchFn(text);
  if (embedding) {
    // Backfill L1
    if (cache.size > 500) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    cache.set(hash, embedding);
    
    // Backfill L2 (fail open)
    try {
      if (redis.status === "ready") {
        await redis.set(redisKey, JSON.stringify(embedding), "EX", TTL_SECONDS);
      }
    } catch (error) {
      console.error("Redis Set Error (Embedding):", error.message);
    }
  }
  
  return embedding;
}

module.exports = { getCachedEmbedding };
