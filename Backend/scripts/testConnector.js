const fs = require('fs');
const path = require('path');
const { checkHealth, extractLayout, extractEntities } = require('../utils/pythonConnector');

async function testConnector() {
  console.log("1. Checking Python Service Health...");
  const isHealthy = await checkHealth();
  console.log(`Service Health: ${isHealthy ? 'ONLINE (200 OK)' : 'OFFLINE'}`);

  if (!isHealthy) {
    console.error("Python microservice is not reachable. Exiting test.");
    process.exit(1);
  }

  console.log("\n2. Testing extractLayout with sample_resume.pdf...");
  const pdfPath = path.join(__dirname, '../../PythonService/sample_resume.pdf');
  if (!fs.existsSync(pdfPath)) {
    console.error(`PDF not found at ${pdfPath}`);
    process.exit(1);
  }

  const pdfBuffer = fs.readFileSync(pdfPath);
  const layoutResult = await extractLayout(pdfBuffer, 'sample_resume.pdf');

  console.log("\n--- Layout Extraction Result ---");
  console.log(`layoutAnalysisUsed: ${layoutResult.layoutAnalysisUsed}`);
  console.log(`fallbackUsed: ${layoutResult.fallbackUsed}`);
  console.log(`Page Count: ${layoutResult.summary?.page_count}`);
  console.log(`Block Count: ${layoutResult.summary?.block_count}`);
  console.log(`Segmented Sections: ${Object.keys(layoutResult.sections || {}).join(', ')}`);

  console.log("\n3. Testing extractEntities with extracted text...");
  const allText = layoutResult.blocks.map(b => b.content).join('\n');
  const entityResult = await extractEntities(allText);

  console.log("\n--- Soft NER Entity Result ---");
  console.log(JSON.stringify(entityResult, null, 2));

  console.log("\n✅ pythonConnector.js REAL request/response test passed successfully!");
}

testConnector().catch(err => {
  console.error("Connector test failed:", err);
  process.exit(1);
});
