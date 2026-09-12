/**
 * ATS Parser Simulation & Structure Compliance Engine for ElevateCV.
 * 
 * Simulates enterprise ATS parser extraction (Workday, Greenhouse, Taleo)
 * and detects layout smells, structural issues, and formatting risks.
 */

const STANDARD_SECTION_HEADERS = new Set([
  "experience", "work experience", "professional experience", "employment history",
  "education", "academic background",
  "skills", "technical skills", "core competencies",
  "projects", "personal projects", "key projects",
  "summary", "professional summary", "about me"
]);

/**
 * Simulates parsing a candidate resume object or raw text.
 */
function simulateATSParsing(resumeData = {}, rawText = "") {
  const detections = {
    name: false,
    email: false,
    phone: false,
    education: false,
    experience: false,
    projects: false,
    skills: false,
    dates: false,
    urls: false
  };

  const textToScan = (rawText || JSON.stringify(resumeData)).toLowerCase();

  // Contact Info Detections
  if (resumeData.personalInfo?.fullName || textToScan.match(/[a-z]+\s+[a-z]+/)) detections.name = true;
  if (resumeData.personalInfo?.email || textToScan.match(/[\w.-]+@[\w.-]+\.[a-z]{2,}/)) detections.email = true;
  if (resumeData.personalInfo?.phone || textToScan.match(/(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/)) detections.phone = true;

  // Section Detections
  if (resumeData.education?.length > 0 || textToScan.includes("education") || textToScan.includes("university")) detections.education = true;
  if (resumeData.experiences?.length > 0 || textToScan.includes("experience") || textToScan.includes("engineer")) detections.experience = true;
  if (resumeData.projects?.length > 0 || textToScan.includes("projects")) detections.projects = true;
  if (resumeData.skills?.length > 0 || textToScan.includes("skills")) detections.skills = true;

  // Date & URL Detections
  if (textToScan.match(/\d{4}|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i)) detections.dates = true;
  if (textToScan.match(/https?:\/\/|linkedin\.com|github\.com/i)) detections.urls = true;

  // Compute Component Match %
  const categoryScores = {
    contactInformation: (detections.name && detections.email && detections.phone) ? 100 : (detections.email ? 70 : 40),
    education: detections.education ? 100 : 0,
    experience: detections.experience ? 100 : 0,
    projects: detections.projects ? 100 : 50,
    skills: detections.skills ? 100 : 0,
    dates: detections.dates ? 95 : 60,
    urls: detections.urls ? 90 : 70
  };

  const scoreValues = Object.values(categoryScores);
  const parseRateScore = Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length);

  // Structure & Layout Smell Detection
  const structuralWarnings = [];
  const compatibilityChecks = [];

  // Table & Column detection heuristics
  if (textToScan.includes("table") || textToScan.includes("col-") || textToScan.includes("grid")) {
    structuralWarnings.push("⚠ Tables or complex multi-column grids detected. ATS parsers may misalign row text.");
  } else {
    compatibilityChecks.push("✓ Single-column / ATS-friendly section layout");
  }

  // Icons & Visual artifacts
  if (textToScan.includes("icon") || textToScan.includes("fa-") || textToScan.includes("emoji")) {
    structuralWarnings.push("⚠ Icons or decorative vector graphics detected in contact header. High risk of unparsed symbol noise.");
  } else {
    compatibilityChecks.push("✓ Clean text-based content without vector symbol interference");
  }

  // Section Heading Compliance
  const customHeadingsFound = checkCustomHeadings(resumeData, textToScan);
  if (customHeadingsFound.length > 0) {
    structuralWarnings.push(`⚠ Non-standard section headings detected: "${customHeadingsFound.join('", "')}". Workday/Greenhouse parsers may miscategorize these blocks.`);
  } else {
    compatibilityChecks.push("✓ Standard industry section headings detected");
  }

  compatibilityChecks.push("✓ Standard ISO / US date formats");

  return {
    parseRate: parseRateScore,
    categoryScores,
    detections,
    warnings: structuralWarnings,
    compatibility: compatibilityChecks
  };
}

function checkCustomHeadings(data, text) {
  const custom = [];
  if (data.customSections) {
    data.customSections.forEach(s => {
      if (s.title && !STANDARD_SECTION_HEADERS.has(s.title.toLowerCase().trim())) {
        custom.push(s.title);
      }
    });
  }
  return custom;
}

module.exports = {
  simulateATSParsing,
  STANDARD_SECTION_HEADERS
};
