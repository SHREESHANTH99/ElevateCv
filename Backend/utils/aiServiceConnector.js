const axios = require("axios");
const { getCachedEmbedding } = require("./embeddingCache");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

async function getEmbedding(text) {
  return await getCachedEmbedding(text, async (txt) => {
    try {
      const t0 = performance.now();
      const response = await axios.post(`${AI_SERVICE_URL}/embed`, { text: txt });
      console.log(`[PERF] Python /embed latency: ${(performance.now() - t0).toFixed(2)}ms`);
      return response.data.embedding;
    } catch (error) {
      console.error("AI Service Embedding Error:", error.message);
      return null;
    }
  });
}

async function getSimilarity(text1, text2) {
  try {
    const t0 = performance.now();
    const response = await axios.post(`${AI_SERVICE_URL}/similarity`, { text1, text2 });
    console.log(`[PERF] Python /similarity latency: ${(performance.now() - t0).toFixed(2)}ms`);
    return response.data.similarity;
  } catch (error) {
    console.error("AI Service Similarity Error:", error.message);
    return 0;
  }
}

module.exports = { getEmbedding, getSimilarity };
