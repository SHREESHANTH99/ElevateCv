const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const { parseResumeWithAI } = require("../utils/geminiParser");
const { getEmbedding, getSimilarity } = require("../utils/aiServiceConnector");
const { scoreResume } = require("../utils/resumeScorer");
const { analyzeJobDescription } = require("../utils/jobAnalyzer");
const { analyzeSkillGaps } = require("../utils/gapAnalyzer");
const { simulateATSParsing } = require("../utils/atsSimulator");
const { analyzeBullet } = require("../utils/bulletIntelligence");
const { getCachedResult } = require("../utils/resultCache");
const { generateAIContent } = require("../utils/geminiClient");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

const withTimeout = (promise, ms, fallback) => {
  let timer;
  const timeoutPromise = new Promise((resolve) => {
    timer = setTimeout(() => {
      console.warn(`[TIMEOUT] External AI service call exceeded ${ms}ms`);
      resolve(fallback);
    }, ms);
  });
  return Promise.race([
    promise.then(res => { clearTimeout(timer); return res; }).catch(err => { clearTimeout(timer); throw err; }),
    timeoutPromise
  ]);
};

router.get("/test", (req, res) => {
  res.json({ status: "Route verified", context: "AI Routes Online", engine: "ElevateCV AI Intelligence v2.0" });
});

/**
 * 👑 THE CENTRAL ORCHESTRATOR
 * Multi-dimensional weighted scoring, gap analysis, ATS simulation & caching.
 */
router.post("/analyze-resume", auth, async (req, res) => {
  const startTime = Date.now();
  const timings = {};

  try {
    const { resumeData, jobDescription } = req.body;
    if (!resumeData) return res.status(400).json({ message: "Resume data is required" });

    const finalResult = await getCachedResult(resumeData, jobDescription, async () => {
      const sectionStart = Date.now();

      let jobAnalysis = null;
      let similarityScore = 0;

      if (jobDescription && jobDescription.trim().length > 0) {
        const [jobDetails, vectorSim] = await Promise.all([
          withTimeout(analyzeJobDescription(jobDescription), 6000, null),
          withTimeout(getSimilarity(JSON.stringify(resumeData), jobDescription), 6000, 0)
        ]);

        jobAnalysis = jobDetails;
        similarityScore = Math.round(vectorSim * 100);
      }

      timings.jobAnalysis = Date.now() - sectionStart;

      // Execute Multi-Dimensional Scorer & Gap Analyzer
      const scoreResult = scoreResume(resumeData, jobAnalysis, similarityScore);
      const gaps = jobAnalysis ? analyzeSkillGaps(resumeData, jobAnalysis) : null;
      const atsSim = simulateATSParsing(resumeData);

      timings.analysis = Date.now() - sectionStart;

      return {
        score: scoreResult.score,
        label: scoreResult.label,
        color: scoreResult.color,
        dimensionScores: scoreResult.dimensionScores,
        sectionScores: scoreResult.dimensionScores, // Backward compatibility
        jobAnalysis,
        gaps,
        atsSimulation: atsSim,
        feedback: scoreResult.feedback,
        context: `ATS Score: ${scoreResult.score} (${scoreResult.label}). ${scoreResult.feedback.slice(0, 2).join(". ")}`
      };
    });

    timings.total = Date.now() - startTime;

    res.json({
      ...finalResult,
      pipelineId: Date.now(),
      metadata: {
        timings,
        cached: finalResult.cached || false,
        fallbackUsed: finalResult.jobAnalysis?.fallbackUsed || false,
        engine: finalResult.jobAnalysis?.fallbackUsed ? "ElevateCV-v2.0-HeuristicFallback" : "ElevateCV-v2.0-GeminiLLM"
      }
    });

  } catch (error) {
    console.error("Orchestration Pipeline Error:", error);
    res.status(503).json({ message: "AI analysis temporarily busy, please try again." });
  }
});

/**
 * 📋 DEEP JOB DESCRIPTION ANALYZER (16-Field JSON Output)
 */
router.post("/analyze-job", auth, async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription || jobDescription.trim().length < 20) {
      return res.status(400).json({ message: "Valid job description text is required." });
    }

    const analysis = await analyzeJobDescription(jobDescription);
    res.json({ jobAnalysis: analysis });
  } catch (error) {
    console.error("Job Analysis Error:", error);
    res.status(500).json({ message: "Failed to analyze job description" });
  }
});

/**
 * 🎯 ATS PARSER SIMULATOR & STRUCTURE COMPLIANCE
 */
router.post("/ats-simulate", auth, async (req, res) => {
  try {
    const { resumeData, rawText } = req.body;
    const simulation = simulateATSParsing(resumeData || {}, rawText || "");
    res.json({ simulation });
  } catch (error) {
    console.error("ATS Simulation Error:", error);
    res.status(500).json({ message: "Failed to simulate ATS parsing" });
  }
});

/**
 * 💡 BULLET-POINT INTELLIGENCE
 */
router.post("/analyze-bullet", auth, async (req, res) => {
  try {
    const { bulletText } = req.body;
    if (!bulletText) return res.status(400).json({ message: "Bullet text is required" });
    const analysis = analyzeBullet(bulletText);
    res.json({ bulletAnalysis: analysis });
  } catch (error) {
    console.error("Bullet Intelligence Error:", error);
    res.status(500).json({ message: "Failed to analyze bullet" });
  }
});

/**
 * 🔍 JOB MATCHER ROUTE (Compatibility + Upgraded Gap Analysis)
 */
router.post(
  "/match-job",
  auth,
  [
    body("resumeData").isObject(),
    body("jobDescription").isString().isLength({ min: 20 }),
  ],
  async (req, res) => {
    try {
      const { resumeData, jobDescription } = req.body;

      const [jobAnalysis, vectorSim] = await Promise.all([
        analyzeJobDescription(jobDescription),
        withTimeout(getSimilarity(JSON.stringify(resumeData), jobDescription), 6000, 0)
      ]);

      const gaps = analyzeSkillGaps(resumeData, jobAnalysis);
      const scoreResult = scoreResume(resumeData, jobAnalysis, Math.round(vectorSim * 100));

      res.json({
        matchScore: scoreResult.score,
        dimensionScores: scoreResult.dimensionScores,
        jobAnalysis,
        matchedSkills: gaps.matched.map(m => m.skill),
        missingSkills: gaps.missing.map(m => m.skill),
        partiallyMatchedSkills: gaps.partiallyMatched,
        recommendedActions: gaps.recommendedActions,
        suggestions: scoreResult.feedback
      });
    } catch (error) {
      console.error("AI Job Match Error:", error);
      res.status(500).json({ message: "Failed to match job" });
    }
  }
);

/**
 * 🧩 RESUME PARSING LAYER
 */
router.post("/parse-resume", auth, async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText) return res.status(400).json({ message: "Raw text is required" });
    const parsedData = await parseResumeWithAI(rawText);
    res.json({ parsedData });
  } catch (error) {
    console.error("AI Parse Error:", error);
    res.status(500).json({ message: "Failed to parse resume" });
  }
});

/**
 * 📊 RESUME SCORING ROUTE
 */
router.post("/score-resume", auth, async (req, res) => {
  try {
    const { resumeData, jobDescription } = req.body;
    const analysis = scoreResume(resumeData, jobDescription);
    res.json(analysis);
  } catch (error) {
    console.error("AI Scoring Error:", error);
    res.status(500).json({ message: "Failed to score resume" });
  }
});

/**
 * 🤖 CONTROLLED AI GENERATION PIPELINE
 */
router.post("/improve-resume", auth, async (req, res) => {
  try {
    const { section, content, context } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Task: Improve this resume section.
      Section: ${section}
      Content: ${JSON.stringify(content)}
      Context: ${context || "Optimize for impact and professional clarity."}

      Output: EXCLUSIVELY a JSON object with the improved content.
      Format: Same as the input JSON.
    `;
    
    const improvedContent = await withTimeout(
      generateAIContent(prompt, content),
      10000,
      content
    );
    
    res.json({ improvedContent });
  } catch (error) {
    console.error("AI Improve Error:", error);
    res.status(500).json({ message: "Failed to improve content" });
  }
});

router.post("/improve-smart", auth, async (req, res) => {
  try {
    const { section, content, feedbackContext } = req.body;
    const prompt = `
      You are a professional resume optimizer.
      Section: ${section}
      Current Content: ${JSON.stringify(content)}
      
      CRITICAL FEEDBACK TO ADDRESS:
      ${feedbackContext || "General optimization for professional quality."}
      
      Task: Improve the content specifically to address the feedback. 
      Use stronger action verbs, add metrics where requested, and ensure professional phrasing.
      Return EXCLUSIVELY the improved JSON object.
    `;
    
    const improvedContent = await generateAIContent(prompt, content);
    res.json({ improvedContent });
  } catch (error) {
    console.error("Smart Improve Error:", error);
    res.status(500).json({ message: "Failed to improve with context" });
  }
});

module.exports = router;