const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { parseResumeWithAI } = require("../utils/geminiParser");
const { getEmbedding, getSimilarity } = require("../utils/aiServiceConnector");
const { scoreResume } = require("../utils/resumeScorer");
const { analyzeJobDescription } = require("../utils/jobAnalyzer");
const { analyzeSkillGaps } = require("../utils/gapAnalyzer");
const { simulateATSParsing } = require("../utils/atsSimulator");
const { analyzeBullet } = require("../utils/bulletIntelligence");
const { generateTailoredBullet } = require("../utils/tailoringEngine");
const Resume = require("../models/Resume");
const { getCachedResult } = require("../utils/resultCache");
const { generateAIContent } = require("../utils/geminiClient");
const { processMultiStageResumeAnalysis } = require("../utils/pipelineOrchestrator");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
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

/**
 * 🎯 BULLET-POINT INTELLIGENCE & IMPACT SCORING
 * Analyzes an array of bullet strings, returning impact score, weak verbs, metrics, and metric type suggestions.
 * NEVER fabricates false numbers.
 */
router.post("/analyze-bullets", auth, async (req, res) => {
  try {
    const { bullets } = req.body;
    if (!bullets || !Array.isArray(bullets)) {
      return res.status(400).json({ message: "An array of bullet strings is required." });
    }

    const results = bullets.map(b => {
      const text = typeof b === "string" ? b : (b?.text || "");
      const analysis = analyzeBullet(text);
      return {
        text,
        impactScore: analysis.impactScore,
        weakVerbDetected: !analysis.hasStrongVerb,
        hasMetric: analysis.hasMetric,
        problems: analysis.problems,
        suggestedMetricTypes: analysis.suggestedMetrics,
        improvedTemplate: analysis.improved
      };
    });

    res.json({ bullets: results });
  } catch (error) {
    console.error("Analyze Bullets Error:", error);
    res.status(500).json({ message: "Failed to analyze bullets" });
  }
});

/**
 * 🎯 RESUME -> JOB TAILORING ENGINE
 * Generates grounded, tailored bullet points aligning experiences with target job description.
 * Enforces strict anti-hallucination checks (no unverified skills or metrics).
 */
router.post("/tailor-resume", auth, async (req, res) => {
  try {
    const { resumeId, resumeData: rawResumeData, jobDescription } = req.body;

    if (!jobDescription || typeof jobDescription !== "string") {
      return res.status(400).json({ message: "Job description is required." });
    }

    let resumeData = rawResumeData;
    if (!resumeData && resumeId) {
      resumeData = await Resume.findOne({ _id: resumeId, userId: req.user.id });
      if (!resumeData) {
        return res.status(404).json({ message: "Resume not found." });
      }
    }

    if (!resumeData) {
      return res.status(400).json({ message: "Either resumeId or resumeData must be provided." });
    }

    const candidateSkills = [
      ...(Array.isArray(resumeData.skills) ? resumeData.skills.map(s => typeof s === "string" ? s : s?.name) : []),
      ...(Array.isArray(resumeData.technologies) ? resumeData.technologies : [])
    ].filter(Boolean);

    const resumeContext = {
      skills: candidateSkills,
      summary: resumeData.summary || ""
    };

    const experiences = resumeData.experiences || resumeData.experience || [];
    const tailoredExperiences = [];
    let totalBullets = 0;
    let tailoredCount = 0;
    let unchangedCount = 0;

    for (const exp of experiences) {
      const bullets = Array.isArray(exp.description)
        ? exp.description
        : (typeof exp.description === "string" ? exp.description.split("\n").filter(Boolean) : []);

      const tailoredBullets = [];
      for (const bullet of bullets) {
        const text = typeof bullet === "string" ? bullet : (bullet?.text || "");
        if (!text.trim()) continue;
        totalBullets++;

        const tailoredResult = await generateTailoredBullet(text, jobDescription, resumeContext);
        if (tailoredResult.tailored && tailoredResult.tailored !== text) {
          tailoredCount++;
        } else {
          unchangedCount++;
        }

        tailoredBullets.push({
          original: text,
          tailored: tailoredResult.tailored,
          changesExplained: tailoredResult.changesExplained || [],
          grounded: tailoredResult.grounded !== false,
          engine: tailoredResult.engine || "deterministic-rule-engine",
          isTailored: tailoredResult.isTailored ?? (tailoredResult.tailored !== text),
          retriedOnce: tailoredResult.retriedOnce || false,
          fallbackToOriginal: tailoredResult.fallbackToOriginal ?? (tailoredResult.tailored === text),
          fallbackUsed: tailoredResult.fallbackToOriginal ?? (tailoredResult.tailored === text)
        });
      }

      tailoredExperiences.push({
        id: exp._id || exp.id,
        company: exp.company || "Experience",
        position: exp.position || "Role",
        startDate: exp.startDate || "",
        endDate: exp.endDate || "",
        bullets: tailoredBullets
      });
    }

    res.json({
      tailoredExperiences,
      summary: {
        totalBullets,
        tailoredCount,
        unchangedCount
      }
    });
  } catch (error) {
    console.error("Tailor Resume Route Error:", error);
    res.status(500).json({ message: "Failed to tailor resume", error: error.message });
  }
});

/**
 * 📄 UPLOADED RESUME ANALYZER (MULTI-STAGE DEEP ARCHITECTURE)
 */
router.post("/analyze-uploaded", auth, upload.single("file"), async (req, res) => {
  try {
    let rawText = req.body.resumeContent || "";
    const jobDescription = req.body.jobDescription || "";
    const pdfBuffer = req.file ? req.file.buffer : null;
    const filename = req.file ? req.file.originalname : "resume.pdf";

    if (req.file && (!rawText || rawText.length < 20)) {
      if (req.file.mimetype === "application/pdf" || filename.toLowerCase().endsWith(".pdf")) {
        try {
          const pdfData = await pdfParse(req.file.buffer);
          rawText = pdfData.text;
        } catch (pdfErr) {
          console.error("PDF extraction fallback error:", pdfErr.message);
        }
      } else {
        rawText = req.file.buffer.toString("utf-8");
      }
    }

    if (!jobDescription || jobDescription.trim().length < 20) {
      return res.status(400).json({ message: "Valid job description is required." });
    }

    // Execute Multi-Stage Deep Architecture Pipeline
    const pipelineResult = await processMultiStageResumeAnalysis(
      pdfBuffer,
      filename,
      rawText,
      jobDescription
    );

    const { candidateResume, scoreResult, jobAnalysis, gaps, atsSimulation, ontologyResolution, metadata } = pipelineResult;

    res.json({
      matchScore: scoreResult.score,
      score: scoreResult.score,
      label: scoreResult.label,
      color: scoreResult.color,
      dimensionScores: scoreResult.dimensionScores,
      sectionScores: scoreResult.dimensionScores,
      jobAnalysis,
      gaps,
      atsSimulation,
      ontologyResolution,
      parsedResumeData: candidateResume,
      missingKeywords: gaps?.missing?.map(m => m.skill) || [],
      presentKeywords: gaps?.matched?.map(m => m.skill) || [],
      suggestions: scoreResult.feedback,
      feedback: scoreResult.feedback,
      metadata
    });
  } catch (error) {
    console.error("Analyze Uploaded Multi-Stage Pipeline Error:", error);
    res.status(500).json({ message: "Failed to analyze uploaded resume" });
  }
});

module.exports = router;