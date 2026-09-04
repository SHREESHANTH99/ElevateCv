const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getCachedEmbedding } = require("./embeddingCache");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

function cosineSimilarity(vecA, vecB) {
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

async function getEmbedding(text) {
  return await getCachedEmbedding(text, async (txt) => {
    try {
      const t0 = performance.now();
      // Gemini's standard embedding model
      const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(txt);
      console.log(`[PERF] Gemini Embedding latency: ${(performance.now() - t0).toFixed(2)}ms`);
      return result.embedding.values;
    } catch (error) {
      console.error("Gemini Embedding Error:", error.message);
      return null;
    }
  });
}

async function getSimilarity(text1, text2) {
  try {
    const t0 = performance.now();
    const [embed1, embed2] = await Promise.all([
      getEmbedding(text1),
      getEmbedding(text2)
    ]);
    
    if (!embed1 || !embed2) return 0;
    
    // Math cosine similarity directly in Node
    const similarity = cosineSimilarity(embed1, embed2);
    console.log(`[PERF] JS Cosine Similarity latency: ${(performance.now() - t0).toFixed(2)}ms`);
    return similarity;
  } catch (error) {
    console.error("Gemini Similarity Error:", error.message);
    return 0;
  }
}

module.exports = { getEmbedding, getSimilarity };
