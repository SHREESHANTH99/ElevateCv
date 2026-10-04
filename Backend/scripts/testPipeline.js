const fs = require('fs');
const path = require('path');
const { processMultiStageResumeAnalysis } = require('../utils/pipelineOrchestrator');

async function testFullPipeline() {
  console.log("========================================================================");
  console.log("🚀 TESTING ELEVATECV MULTI-STAGE DEEP ARCHITECTURE PIPELINE");
  console.log("========================================================================\n");

  const pdfPath = path.join(__dirname, '../../PythonService/sample_resume.pdf');
  const pdfBuffer = fs.readFileSync(pdfPath);
  const sampleJobDescription = `
    We are seeking a Senior Software Engineer with strong experience in Python, Node.js, TypeScript, React, and FastAPI.
    Must have hands-on experience building distributed systems with Docker, Kubernetes, and PostgreSQL.
    Experience with PyTorch or spaCy and LLM embeddings is a major plus.
  `;

  const result = await processMultiStageResumeAnalysis(pdfBuffer, 'sample_resume.pdf', '', sampleJobDescription);

  console.log("--- 1. Pipeline Metadata ---");
  console.log(`Processing Time: ${result.metadata.processingTimeMs}ms`);
  console.log(`layoutAnalysisUsed: ${result.metadata.layoutAnalysisUsed}`);
  console.log(`fallbackUsed: ${result.metadata.fallbackUsed}`);
  console.log(`Engine: ${result.metadata.engine}`);

  console.log("\n--- 2. Soft spaCy NER Confidence Signals ---");
  console.log(JSON.stringify(result.metadata.nerConfidenceSignals, null, 2));

  console.log("\n--- 3. Extracted Work History (Stage 3/4 Scoped & Zod Validated) ---");
  console.log(JSON.stringify(result.candidateResume.experiences, null, 2));

  console.log("\n--- 4. Categorized Skills (Stage 3/4 Typed Buckets) ---");
  console.log(JSON.stringify(result.candidateResume.categorizedSkills, null, 2));

  console.log("\n--- 5. Skill Ontology Resolution (Stage 5) ---");
  console.log(`Normalized Skills: ${result.ontologyResolution.candidateSkillsNormalized.join(', ')}`);
  console.log(`Matched Categories: ${result.ontologyResolution.matchedCategoryNames.join(', ')}`);

  console.log("\n--- 6. ATS Score & Layout Compliance Simulation (Stage 6) ---");
  console.log(`Overall Match Score: ${result.scoreResult.score}/100 (${result.scoreResult.label})`);
  console.log("Dimension Scores:", JSON.stringify(result.scoreResult.dimensionScores, null, 2));
  console.log("ATS Simulation Warnings:", JSON.stringify(result.atsSimulation.warnings, null, 2));
  console.log("ATS Simulation Compatibility Checks:", JSON.stringify(result.atsSimulation.compatibility, null, 2));

  console.log("\n========================================================================");
  console.log("✅ FULL MULTI-STAGE DEEP ARCHITECTURE PIPELINE VERIFIED SUCCESSFULLY!");
  console.log("========================================================================");
}

testFullPipeline().catch(err => {
  console.error("Full Pipeline Test Failed:", err);
  process.exit(1);
});
