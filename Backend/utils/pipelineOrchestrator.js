const { extractLayout, extractEntities } = require('./pythonConnector');
const { parseAllSectionsBatched } = require('./scopedParser');
const { parseResumeWithAI } = require('./geminiParser');
const { resolveOntologyMatches } = require('./skillOntology');
const { simulateATSParsing } = require('./atsSimulator');
const { scoreResume } = require('./resumeScorer');
const { analyzeJobDescription } = require('./jobAnalyzer');
const { analyzeSkillGaps } = require('./gapAnalyzer');
const { getSimilarity } = require('./aiServiceConnector');

/**
 * Multi-Stage Deep Architecture Pipeline Orchestrator.
 * 
 * Stage 1: Python pdfplumber Layout & Typography Extraction
 * Stage 2: Deterministic Section Heading Segmentation
 * Stage 3: Soft spaCy NER + Single Batched Scoped Section Gemini Parsing
 * Stage 4: Zod Schema Validation & Fallback Repair
 * Stage 5: Skill Ontology + Fuzzy Embedding Matching
 * Stage 6: Multi-Dimensional Weighted Scorer + ATS Simulator
 */
async function processMultiStageResumeAnalysis(pdfBuffer, filename = 'resume.pdf', rawTextOverride = '', jobDescriptionText = '') {
  const startTime = Date.now();
  let layoutResult = { layoutAnalysisUsed: false, fallbackUsed: true, blocks: [], sections: {} };
  let nerResult = { success: false, entities: { dates: [], organizations: [], locations: [] } };

  // 1. Stage 1 & 2: Call Python Microservice for Layout Extraction & Section Segmentation
  if (pdfBuffer && pdfBuffer.length > 0) {
    layoutResult = await extractLayout(pdfBuffer, filename);
  }

  // 2. Extract Raw Text (either from layout blocks or override)
  let fullText = rawTextOverride || '';
  if (!fullText && layoutResult.blocks?.length > 0) {
    fullText = layoutResult.blocks.map(b => b.content).join('\n');
  }

  // 3. Stage 3a: Soft spaCy NER Entity Extraction (Display / Confidence signal)
  if (fullText) {
    nerResult = await extractEntities(fullText);
  }

  // 4. Stage 3b & 4: Batched Scoped Gemini Parsing + Zod Schema Validation (1 Single LLM Call for Sections)
  let batchedSections = {
    workHistory: [],
    categorizedSkills: { programmingLanguages: [], frameworks: [], databases: [], cloudTechnologies: [], aiMlSkills: [], toolsAndOther: [] },
    rawSkills: [],
    education: [],
    projects: []
  };

  if (layoutResult.layoutAnalysisUsed && Object.keys(layoutResult.sections || {}).length > 0) {
    batchedSections = await parseAllSectionsBatched(layoutResult.sections);
  } else {
    // Graceful Fallback to Monolithic Gemini Parsing if Python service is offline
    try {
      const fallbackData = await parseResumeWithAI(fullText);
      batchedSections = {
        workHistory: fallbackData.experiences || [],
        categorizedSkills: { programmingLanguages: [], frameworks: [], databases: [], cloudTechnologies: [], aiMlSkills: [], toolsAndOther: [] },
        rawSkills: (fallbackData.skills || []).map(s => typeof s === 'string' ? s : s.name),
        education: fallbackData.education || [],
        projects: fallbackData.projects || []
      };
    } catch (err) {
      console.warn('[Orchestrator] Monolithic parser fallback warning:', err.message);
    }
  }

  // Build unified structured candidate resume object
  const candidateResume = {
    personalInfo: { fullName: "Candidate" },
    summary: fullText.slice(0, 300),
    skills: (batchedSections.rawSkills || []).map(s => ({ name: s })),
    categorizedSkills: batchedSections.categorizedSkills || {},
    experiences: (batchedSections.workHistory || []).map(w => ({
      company: w.company,
      position: w.title,
      location: w.location,
      startDate: w.startDate,
      endDate: w.endDate,
      duration: w.dates,
      description: w.bullets,
      technologies: w.technologies
    })),
    education: (batchedSections.education || []).map(e => ({
      institution: e.institution,
      degree: e.degree,
      fieldOfStudy: e.fieldOfStudy,
      location: e.location,
      startDate: e.dates,
      endDate: e.dates
    })),
    projects: (batchedSections.projects || []).map(p => ({
      title: p.title,
      description: p.description,
      technologies: p.technologies,
      link: p.link
    }))
  };

  // 5. Stage 5: Skill Ontology & Embedding Fuzzy Match
  const ontologyResolution = resolveOntologyMatches(batchedSections.rawSkills || []);

  // 6. Stage 6: Job Analysis, Multi-Dimensional Scorer & ATS Simulation
  let jobAnalysis = null;
  let similarityScore = 0;
  let semanticMatchDegraded = false;
  let embeddingSource = "none";
  let geminiCalls = 1; // 1 call for batched section parsing

  if (jobDescriptionText && jobDescriptionText.trim().length > 0) {
    const [jobDetails, simResult] = await Promise.all([
      analyzeJobDescription(jobDescriptionText),
      getSimilarity(JSON.stringify(candidateResume), jobDescriptionText)
    ]);
    jobAnalysis = jobDetails;
    geminiCalls += 1; // 1 for job analyzer
    
    if (typeof simResult === 'object') {
      similarityScore = Math.round((simResult.similarity || 0) * 100);
      semanticMatchDegraded = simResult.semanticMatchDegraded || false;
      embeddingSource = simResult.embeddingSource || "none";
      // Only count Gemini embedding calls if Gemini was actually used
      if (embeddingSource === "gemini") {
        geminiCalls += 2; // 2 Gemini embedding calls
      }
    } else {
      similarityScore = Math.round((simResult || 0) * 100);
    }
  }

  const scoreResult = scoreResume(candidateResume, jobAnalysis, similarityScore);
  const gaps = jobAnalysis ? analyzeSkillGaps(candidateResume, jobAnalysis) : null;
  const atsSimulation = simulateATSParsing(candidateResume, fullText, layoutResult);

  const processingTimeMs = Date.now() - startTime;

  return {
    candidateResume,
    scoreResult,
    jobAnalysis,
    gaps,
    atsSimulation,
    ontologyResolution,
    metadata: {
      processingTimeMs,
      geminiCallCount: geminiCalls,
      layoutAnalysisUsed: layoutResult.layoutAnalysisUsed,
      fallbackUsed: layoutResult.fallbackUsed,
      semanticMatchDegraded: semanticMatchDegraded,
      embeddingSource: embeddingSource,
      nerConfidenceSignals: nerResult.entities,
      layoutSummary: layoutResult.summary || null,
      engine: layoutResult.layoutAnalysisUsed ? "ElevateCV-v2.0-MultiStagePipeline" : "ElevateCV-v2.0-HeuristicFallback"
    }
  };
}

module.exports = { processMultiStageResumeAnalysis };
