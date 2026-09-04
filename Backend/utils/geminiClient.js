const Bottleneck = require("bottleneck");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

// Configure exactly to Google's Free Tier: 15 Requests Per Minute
const limiter = new Bottleneck({
  reservoir: 15, // initial capacity
  reservoirRefreshAmount: 15,
  reservoirRefreshInterval: 60 * 1000, // refresh every 60s
  minTime: 2000, // wait at least 2 seconds between requests (prevents burst blocking)
  maxConcurrent: 2
});

// Explicit retry logic on 429
limiter.on("failed", async (error, jobInfo) => {
  const isRateLimit = error.status === 429 || (error.message && error.message.includes("429"));
  if (isRateLimit && jobInfo.retryCount < 1) {
    console.warn(`[GEMINI] 429 Rate Limit Hit. Retrying in 2 seconds (Attempt ${jobInfo.retryCount + 1})...`);
    return 2000; // wait 2 seconds before retrying
  }
});

async function generateAIContent(prompt, fallback, modelName = "gemini-1.5-flash") {
  return limiter.schedule(async () => {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = (await result.response).text().replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(text);
    } catch (error) {
      console.error("[GEMINI ERROR]", error.message);
      // If it STILL fails after the retry, throw so the caller can catch and fallback
      throw error;
    }
  }).catch(err => {
    console.warn("[GEMINI FALLBACK] Pipeline degrading gracefully due to error:", err.message);
    if (fallback !== undefined) return fallback;
    throw err;
  });
}

module.exports = { generateAIContent, limiter };
