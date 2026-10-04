const fs = require('fs');
const path = require('path');
const { processMultiStageResumeAnalysis } = require('../utils/pipelineOrchestrator');

async function runEmpiricalBenchmark() {
  console.log("========================================================================");
  console.log("📊 ELEVATECV MULTI-STAGE PIPELINE: EMPIRICAL BENCHMARK (PAIR A & PAIR B)");
  console.log("========================================================================\n");

  const pdfPath = path.join(__dirname, '../../PythonService/sample_resume.pdf');
  const pdfBuffer = fs.readFileSync(pdfPath);

  // ------------------------------------------------------------------------
  // TEST PAIR A: High-Fit Candidate & Matching Senior AI/ML Engineer Role
  // ------------------------------------------------------------------------
  const jobPairA = `
    Senior AI/ML Software Engineer
    We are seeking a Senior Software Engineer with 5+ years of experience in Python, PyTorch, LLM context retrieval, and distributed system architecture. Must be skilled in Docker, Kubernetes, FastAPI, and PostgreSQL. Position involves optimizing AI model inference and building scalable cloud pipelines.
  `;

  console.log("------------------------------------------------------------------------");
  console.log("🔥 RUNNING TEST PAIR A (HIGH FIT)");
  console.log("Candidate: Alex Johnson (Senior ML/AI Engineer)");
  console.log("Job Title: Senior AI/ML Software Engineer");
  console.log("------------------------------------------------------------------------");

  const resultA = await processMultiStageResumeAnalysis(pdfBuffer, 'sample_resume.pdf', '', jobPairA);

  console.log(`\n▶ Pair A Match Score: ${resultA.scoreResult.score}/100 (${resultA.scoreResult.label})`);
  console.log(`▶ Processing Time: ${resultA.metadata.processingTimeMs}ms`);
  console.log(`▶ Gemini Call Count: ${resultA.metadata.geminiCallCount}`);
  console.log(`▶ semanticMatchDegraded: ${resultA.metadata.semanticMatchDegraded}`);
  console.log(`▶ embeddingSource: ${resultA.metadata.embeddingSource}`);
  console.log("Pair A Dimension Scores:", JSON.stringify(resultA.scoreResult.dimensionScores, null, 2));

  // ------------------------------------------------------------------------
  // TEST PAIR B: Mismatched Candidate & ICU Registered Nurse Role
  // ------------------------------------------------------------------------
  const jobPairB = `
    Registered Nurse (ICU Healthcare Coordinator)
    Seeking a licensed Registered Nurse (RN) with 3+ years of Clinical ICU patient care experience. Must hold active BLS/ACLS certifications, possess deep experience with EMR chart documentation, medication administration, and patient triage protocols.
  `;

  console.log("\n------------------------------------------------------------------------");
  console.log("🧊 RUNNING TEST PAIR B (MISMATCHED)");
  console.log("Candidate: Alex Johnson (Senior ML/AI Engineer)");
  console.log("Job Title: Registered Nurse (ICU Healthcare Coordinator)");
  console.log("------------------------------------------------------------------------");

  const resultB = await processMultiStageResumeAnalysis(pdfBuffer, 'sample_resume.pdf', '', jobPairB);

  console.log(`\n▶ Pair B Match Score: ${resultB.scoreResult.score}/100 (${resultB.scoreResult.label})`);
  console.log(`▶ Processing Time: ${resultB.metadata.processingTimeMs}ms`);
  console.log(`▶ Gemini Call Count: ${resultB.metadata.geminiCallCount}`);
  console.log(`▶ semanticMatchDegraded: ${resultB.metadata.semanticMatchDegraded}`);
  console.log(`▶ embeddingSource: ${resultB.metadata.embeddingSource}`);
  console.log("Pair B Dimension Scores:", JSON.stringify(resultB.scoreResult.dimensionScores, null, 2));

  console.log("\n========================================================================");
  console.log("📈 BENCHMARK SUMMARY & COMPARISON");
  console.log("========================================================================");
  console.log(`Pair A (High-Fit AI Role):    ${resultA.scoreResult.score}/100 [degraded: ${resultA.metadata.semanticMatchDegraded}, source: ${resultA.metadata.embeddingSource}]`);
  console.log(`Pair B (Mismatched Nurse):    ${resultB.scoreResult.score}/100 [degraded: ${resultB.metadata.semanticMatchDegraded}, source: ${resultB.metadata.embeddingSource}]`);
  console.log(`Score Separation Gap:          ${resultA.scoreResult.score - resultB.scoreResult.score} points`);
  console.log("========================================================================");
}

runEmpiricalBenchmark().catch(err => {
  console.error("Empirical Benchmark Failed:", err);
  process.exit(1);
});
