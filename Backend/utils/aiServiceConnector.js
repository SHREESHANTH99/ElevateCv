const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getCachedEmbedding } = require("./embeddingCache");
const { limiter } = require("./geminiClient");
const axios = require("axios");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://127.0.0.1:8000";

function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Call the Python FastAPI /embed endpoint (all-MiniLM-L6-v2, 384-dim).
 * PRIMARY EMBEDDING ENGINE: Fast, local CPU sentence-transformers (~35-100ms),
 * zero external API dependency, zero rate-limit/quota impact.
 */
async function getPythonEmbedding(text) {
  try {
    const t0 = performance.now();
    const res = await axios.post(`${PYTHON_SERVICE_URL}/embed`, {
      texts: [text]
    }, { timeout: 30000 });

    if (res.data?.success && res.data.embeddings?.length > 0) {
      console.log(`[PERF] Python sentence-transformer latency: ${(performance.now() - t0).toFixed(2)}ms (model: ${res.data.model}, dims: ${res.data.dimensions})`);
      return res.data.embeddings[0];
    }
    return null;
  } catch (err) {
    console.warn(`[EMBEDDING] Python /embed endpoint unavailable: ${err.message}`);
    return null;
  }
}

/**
 * Get embedding for text with tiered architecture:
 *   Tier 1 (PRIMARY): Python all-MiniLM-L6-v2 (local sentence-transformer, real neural semantics, no quota)
 *   Tier 2 (FALLBACK): Gemini text-embedding-004 (remote API fallback if Python service is offline)
 *   Tier 3 (FAILURE): null (total failure — triggers keyword-only fallback)
 *
 * Returns: { values: number[], source: "local-semantic" | "gemini" } | null
 * Cached via embeddingCache.js (L1 memory + L2 Redis, 24h TTL).
 */
async function getEmbedding(text) {
  return await getCachedEmbedding(text, async (txt) => {

    // Tier 1 (PRIMARY): Local Python sentence-transformer (all-MiniLM-L6-v2)
    const localVec = await getPythonEmbedding(txt);
    if (localVec) {
      return { values: localVec, source: "local-semantic" };
    }

    // Tier 2 (FALLBACK): Gemini text-embedding-004 via Bottleneck limiter (if Python service is offline)
    try {
      const result = await limiter.schedule(async () => {
        const t0 = performance.now();
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const res = await model.embedContent(txt);
        console.log(`[PERF] Gemini Embedding latency: ${(performance.now() - t0).toFixed(2)}ms`);
        return res.embedding.values;
      });
      if (result) {
        return { values: result, source: "gemini" };
      }
    } catch (err) {
      console.warn(`[EMBEDDING] Remote Gemini embedding fallback also failed: ${err.message}`);
    }

    // Tier 3: Total failure
    console.error("[EMBEDDING] All embedding sources failed (Python service + Gemini API).");
    return null;
  });
}

/**
 * Compute semantic similarity between two texts.
 *
 * semanticMatchDegraded semantics:
 *   false — Real neural embedding similarity computed (via Python all-MiniLM-L6-v2 or Gemini)
 *   true  — Embedding generation failed entirely (source: "none"), similarity is 0
 *
 * embeddingSource:
 *   "local-semantic" — Python all-MiniLM-L6-v2 (Primary local transformer)
 *   "gemini"         — Gemini text-embedding-004 (Remote fallback)
 *   "none"           — Complete failure
 */
async function getSimilarity(text1, text2) {
  try {
    const t0 = performance.now();
    const [embed1, embed2] = await Promise.all([
      getEmbedding(text1),
      getEmbedding(text2)
    ]);

    if (!embed1 || !embed2 || !embed1.values || !embed2.values) {
      return { similarity: 0, semanticMatchDegraded: true, embeddingSource: "none" };
    }

    const source = embed1.source === embed2.source ? embed1.source : `${embed1.source}+${embed2.source}`;
    const similarity = cosineSimilarity(embed1.values, embed2.values);
    const isGemini = source === "gemini";
    console.log(`[PERF] Cosine Similarity latency: ${(performance.now() - t0).toFixed(2)}ms (sim: ${similarity.toFixed(4)}, source: ${source}, degraded: ${!isGemini})`);
    return { similarity, semanticMatchDegraded: !isGemini, embeddingSource: source };
  } catch (error) {
    console.error("Similarity Error:", error.message);
    return { similarity: 0, semanticMatchDegraded: true, embeddingSource: "none" };
  }
}

module.exports = { getEmbedding, getSimilarity, cosineSimilarity };
