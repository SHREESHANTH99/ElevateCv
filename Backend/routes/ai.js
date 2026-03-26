const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const { parseResumeWithAI } = require("../utils/geminiParser");
const { getEmbedding, getSimilarity } = require("../utils/aiServiceConnector");
const { scoreResume } = require("../utils/resumeScorer");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const { normalizeSkills } = require("../utils/skillExtractor");

router.get("/test", (req, res) => {
  res.json({ status: "Route verified", context: "AI Routes Online" });
});

const { getCachedResult } = require("../utils/resultCache");

/**
 * 👑 THE CENTRAL ORCHESTRATOR (PHASE 1.75 UPGRADE)
 * Highly optimized, parallelized, and cached intelligence pipeline.
 */
router.post("/analyze-resume", auth, async (req, res) => {
  const startTime = Date.now();
  const timings = {};

  try {
    const { resumeData, jobDescription } = req.body;
    if (!resumeData) return res.status(400).json({ message: "Resume data is required" });

    // Use Result Caching (Hash of Resume + Job)
    const finalResult = await getCachedResult(resumeData, jobDescription, async () => {
      // 1. Light Processing (Scoring & Normalization)
      const sectionStart = Date.now();
      const analysis = scoreResume(resumeData, jobDescription);
      const rawSkills = resumeData.skills?.map(s => s.name) || [];
      const normalizedSkills = normalizeSkills(rawSkills);
      timings.foundation = Date.now() - sectionStart;

      let jobMatchInfo = null;
      let matchScore = 0;
      let missingSkills = [];

      // 2. Heavy Processing (Parallelize LLM and Similarity)
      if (jobDescription) {
        const heavyStart = Date.now();
        
        // Parallelized tasks: LLM skill extraction AND semantic embedding match
        const [llmResult, similarity] = await Promise.all([
          // Task A: Skill Extraction via Gemini
          (async () => {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Extract skills/reqs from: ${jobDescription}. Return EXCLUSIVELY JSON: {"Job Skills":[], "Experience":""}`;
            const res = await model.generateContent(prompt);
            const text = (await res.response).text().replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(text);
          })(),
          // Task B: Semantic Similarity via Python service (Cached in aiServiceConnector)
          getSimilarity(JSON.stringify(resumeData), jobDescription)
        ]);

        jobMatchInfo = llmResult;
        const jobSkills = normalizeSkills(jobMatchInfo["Job Skills"] || []);
        const matched = jobSkills.filter(s => normalizedSkills.includes(s));
        missingSkills = jobSkills.filter(s => !normalizedSkills.includes(s));

        const skillScore = jobSkills.length > 0 ? (matched.length / jobSkills.length) : 1;
        matchScore = Math.round((similarity * 0.5 + skillScore * 0.5) * 100);
        
        timings.heavy_alignment = Date.now() - heavyStart;
      }

      // 3. Assemble Suggestion Context
      const improvementContext = `
        ATS Score: ${analysis.score} (${analysis.label})
        Feedback: ${analysis.feedback.slice(0, 2).join(". ")}
        ${missingSkills.length > 0 ? "Missing: " + missingSkills.slice(0, 3).join(", ") : ""}
      `;

      return {
        score: analysis.score,
        label: analysis.label,
        color: analysis.color,
        sectionScores: analysis.sectionScores,
        reasoning: analysis.reasoning,
        feedback: analysis.feedback,
        match: jobDescription ? {
          score: matchScore,
          missingSkills,
          matchDetails: jobMatchInfo
        } : null,
        context: improvementContext
      };
    });

    // Add Latency Metadata
    timings.total = Date.now() - startTime;
    res.json({
      ...finalResult,
      pipelineId: Date.now(),
      metadata: {
        timings,
        cached: finalResult.cached || false,
        engine: "ElevateCV-v1.75-Parallel"
      }
    });

  } catch (error) {
    console.error("Orchestration Pipeline Error:", error);
    res.status(500).json({ message: "Intelligence pipeline failure" });
  }
});

/**
 * 🔗 SMART IMPROVEMENT: Score-Aware Generator
 */
router.post("/improve-smart", auth, async (req, res) => {
  try {
    const { section, content, feedbackContext } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Inject the intelligent "feedback loop" into the prompt
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
    
    const result = await model.generateContent(prompt);
    const text = (await result.response).text().replace(/```json/g, "").replace(/```/g, "").trim();
    res.json({ improvedContent: JSON.parse(text) });
  } catch (error) {
    console.error("Smart Improve Error:", error);
    res.status(500).json({ message: "Failed to improve with context" });
  }
});

/**
 * 🧩 1. RESUME PARSING LAYER
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
 * 🔍 3. JOB MATCHER ENGINE (CORE FEATURE)
 */
router.post(
  "/match-job",
  auth,
  [
    body("resumeData").isObject(),
    body("jobDescription").isString().isLength({ min: 50 }),
  ],
  async (req, res) => {
    try {
      const { resumeData, jobDescription } = req.body;

      // 1. Extract job keywords using LLM
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        Job Description:
        ${jobDescription}

        Extract EXACTLY:
        1. "Job Skills": array of technical skills
        2. "Experience": Required years or level
        3. "Primary Responsibilities": top 3 bullets
        Return JSON format.
      `;
      const result = await model.generateContent(prompt);
      const text = (await result.response).text().replace(/```json/g, "").replace(/```/g, "").trim();
      const jobMatchInfo = JSON.parse(text);

      // 2. Semantic Similarity via Python Service
      const similarity = await getSimilarity(JSON.stringify(resumeData), jobDescription);

      // 3. Keyword Overlap
      const resumeSkills = resumeData.skills?.map(s => s.name.toLowerCase()) || [];
      const jobSkills = jobMatchInfo["Job Skills"]?.map(s => s.toLowerCase()) || [];
      const matchedSkills = jobSkills.filter(s => resumeSkills.some(rs => rs.includes(s) || s.includes(rs)));
      const missingSkills = jobSkills.filter(s => !matchedSkills.includes(s));

      res.json({
        matchScore: Math.round(similarity * 100),
        matchedSkills,
        missingSkills,
        jobMatchInfo,
        suggestions: [
          `Focus on ${missingSkills.slice(0, 3).join(", ")} to improve your match score.`,
          "Tailor your profile using these extracted job responsibilities."
        ]
      });
    } catch (error) {
      console.error("AI Job Match Error:", error);
      res.status(500).json({ message: "Failed to match job" });
    }
  }
);

/**
 * 📊 4. RESUME SCORING ENGINE (ATS SIMULATION)
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
 * 🤖 5. CONTROLLED AI GENERATION PIPELINE
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
    
    const result = await model.generateContent(prompt);
    const text = (await result.response).text().replace(/```json/g, "").replace(/```/g, "").trim();
    const improvedContent = JSON.parse(text);
    
    res.json({ improvedContent });
  } catch (error) {
    console.error("AI Improve Error:", error);
    res.status(500).json({ message: "Failed to improve content" });
  }
});

/**
 * Compatibility Aliases for Frontend (if any)
 */
router.post("/optimize", auth, async (req, res) => {
  // Alias for match-job to avoid breaking mobile/old web
  res.redirect(307, "./match-job");
});

router.post("/suggestions", auth, async (req, res) => {
  // Mock generic suggestions as before but using the new scorer logic
  try {
    const { section, currentData } = req.body;
    const analysis = scoreResume({ [section]: currentData });
    res.json({ suggestions: analysis.feedback, section });
  } catch (error) {
    res.status(500).json({ message: "Failure in suggestions" });
  }
});

module.exports = router;