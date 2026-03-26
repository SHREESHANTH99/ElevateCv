/**
 * EMBEDDING CACHE (IN-MEMORY)
 * Prevents calling the Python service for identical text.
 */

const cache = new Map();

/**
 * Get embedding from cache or fetch from Python service
 */
async function getCachedEmbedding(text, fetchFn) {
  if (!text || text.length < 5) return null;
  
  const key = text.trim();
  if (cache.has(key)) {
    console.log("CACHE HIT: Embedding retrieved from memory.");
    return cache.get(key);
  }
  
  const embedding = await fetchFn(text);
  if (embedding) {
    // Basic LRU logic to prevent memory bloat (max 500 entries)
    if (cache.size > 500) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    cache.set(key, embedding);
  }
  
  return embedding;
}

module.exports = { getCachedEmbedding };
