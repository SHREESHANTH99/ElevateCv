/**
 * Deep Job Description Analyzer Engine for ElevateCV.
 * 
 * Extracts 16 structured dimensions from raw job descriptions using Gemini 1.5 Flash
 * with heuristic fallback parsing if API is unavailable.
 */

const { generateAIContent } = require("./geminiClient");
const { normalizeSkill } = require("./skillOntology");

const DEFAULT_JOB_ANALYSIS = {
  jobTitle: "Software Engineer",
  company: "Technology Employer",
  seniority: "Mid-Senior",
  domain: "Software Development",
  requiredSkills: ["JavaScript", "TypeScript", "Problem Solving", "Git"],
  preferredSkills: ["Cloud Infrastructure", "CI/CD", "Docker", "REST APIs"],
  programmingLanguages: ["JavaScript", "TypeScript", "Python"],
  frameworks: ["React", "Node.js", "Express"],
  databases: ["PostgreSQL", "MongoDB"],
  cloudTechnologies: ["AWS", "Docker", "Kubernetes"],
  aiMlSkills: [],
  softSkills: ["Communication", "Team Collaboration", "Problem Solving"],
  responsibilities: [
    "Design, develop, and maintain clean, scalable software solutions",
    "Collaborate with cross-functional product and design teams",
    "Participate in code reviews and architectural discussions"
  ],
  educationRequirements: ["Bachelor's degree in Computer Science, Software Engineering, or related field"],
  experienceRequirements: ["2+ years of professional software engineering experience"],
  keywords: ["software engineer", "full stack", "react", "node", "typescript", "api", "git", "cloud"]
};

/**
 * Performs 16-field deep structural analysis on raw job description text.
 */
async function analyzeJobDescription(jobText) {
  if (!jobText || jobText.trim().length < 30) {
    return DEFAULT_JOB_ANALYSIS;
  }

  const prompt = `
You are an expert ATS System Architect and Technical Recruiter.
Analyze the following Job Description and extract structured details strictly in JSON format matching this exact schema:

{
  "jobTitle": "Extracted Job Title (string)",
  "company": "Company Name if present, else empty string",
  "seniority": "Entry / Mid / Senior / Lead / Principal / Executive",
  "domain": "Primary domain (e.g. Artificial Intelligence, Cloud Infrastructure, Full Stack, Mobile)",
  "requiredSkills": ["Array of MANDATORY technical & domain skills"],
  "preferredSkills": ["Array of OPTIONAL or NICE-TO-HAVE skills"],
  "programmingLanguages": ["Array of programming languages mentioned"],
  "frameworks": ["Array of frameworks/libraries mentioned"],
  "databases": ["Array of database technologies mentioned"],
  "cloudTechnologies": ["Array of cloud, devops & infrastructure tools mentioned"],
  "aiMlSkills": ["Array of AI/ML/Data Science skills if mentioned"],
  "softSkills": ["Array of leadership, communication, process skills mentioned"],
  "responsibilities": ["Array of key job duties & responsibilities"],
  "educationRequirements": ["Array of degree or education requirements"],
  "experienceRequirements": ["Array of years or depth of experience required"],
  "keywords": ["Array of 10-15 high-weight ATS indexing keywords"]
}

Job Description Text:
"""
${jobText.substring(0, 4000)}
"""

Return ONLY valid JSON.
`;

  try {
    const fallback = buildHeuristicFallback(jobText);
    const result = await generateAIContent(prompt, fallback);
    const sanitized = sanitizeAnalysis(result, fallback);
    sanitized.fallbackUsed = false;
    return sanitized;
  } catch (error) {
    console.warn("[JOB ANALYZER] Using heuristic extraction fallback:", error.message);
    const fallback = buildHeuristicFallback(jobText);
    fallback.fallbackUsed = true;
    return fallback;
  }
}

/**
 * Heuristic fallback parser when AI API is unreachable or rate limited.
 */
function buildHeuristicFallback(text) {
  const lower = text.toLowerCase();
  
  const techMap = {
    programmingLanguages: ["python", "javascript", "typescript", "java", "c++", "c#", "go", "ruby", "php", "rust", "sql"],
    frameworks: ["react", "next.js", "vue", "angular", "express", "fastapi", "django", "flask", "spring boot", "tailwind"],
    databases: ["postgresql", "postgres", "mongodb", "redis", "mysql", "sqlite", "dynamodb", "elasticsearch"],
    cloudTechnologies: ["aws", "azure", "gcp", "docker", "kubernetes", "k8s", "terraform", "jenkins", "github actions"],
    aiMlSkills: ["machine learning", "deep learning", "pytorch", "tensorflow", "scikit-learn", "llm", "nlp", "rag", "langchain"]
  };

  const extracted = {
    programmingLanguages: [],
    frameworks: [],
    databases: [],
    cloudTechnologies: [],
    aiMlSkills: []
  };

  for (const [category, list] of Object.entries(techMap)) {
    extracted[category] = list.filter(item => lower.includes(item));
  }

  const allFound = [
    ...extracted.programmingLanguages,
    ...extracted.frameworks,
    ...extracted.databases,
    ...extracted.cloudTechnologies,
    ...extracted.aiMlSkills
  ];

  // Infer title
  let jobTitle = "Software Engineer";
  if (lower.includes("ai engineer") || lower.includes("machine learning engineer")) jobTitle = "AI / ML Engineer";
  else if (lower.includes("frontend")) jobTitle = "Frontend Engineer";
  else if (lower.includes("backend")) jobTitle = "Backend Engineer";
  else if (lower.includes("devops") || lower.includes("cloud")) jobTitle = "DevOps / Cloud Engineer";
  else if (lower.includes("full stack")) jobTitle = "Full Stack Engineer";

  // Infer seniority
  let seniority = "Mid-Senior";
  if (lower.includes("senior") || lower.includes("sr.")) seniority = "Senior";
  else if (lower.includes("lead") || lower.includes("principal")) seniority = "Lead";
  else if (lower.includes("junior") || lower.includes("entry") || lower.includes("intern")) seniority = "Entry-Level";

  return {
    jobTitle,
    company: "",
    seniority,
    domain: "Software Engineering",
    requiredSkills: allFound.slice(0, 6).map(s => s.toUpperCase()),
    preferredSkills: allFound.slice(6, 10).map(s => s.toUpperCase()),
    programmingLanguages: extracted.programmingLanguages.map(s => s.toUpperCase()),
    frameworks: extracted.frameworks.map(s => s.toUpperCase()),
    databases: extracted.databases.map(s => s.toUpperCase()),
    cloudTechnologies: extracted.cloudTechnologies.map(s => s.toUpperCase()),
    aiMlSkills: extracted.aiMlSkills.map(s => s.toUpperCase()),
    softSkills: ["Communication", "Team Collaboration", "Problem Solving"],
    responsibilities: [
      "Develop high quality software solutions matching specifications",
      "Collaborate with engineering leadership and cross-functional teams"
    ],
    educationRequirements: ["Bachelor's degree in Computer Science or related field"],
    experienceRequirements: ["Relevant professional development experience"],
    keywords: Array.from(new Set([...allFound, "engineering", "software", "development", "architecture"])).slice(0, 15)
  };
}

function sanitizeAnalysis(data, fallback) {
  return {
    jobTitle: data.jobTitle || fallback.jobTitle,
    company: data.company || "",
    seniority: data.seniority || fallback.seniority,
    domain: data.domain || fallback.domain,
    requiredSkills: Array.isArray(data.requiredSkills) ? data.requiredSkills : fallback.requiredSkills,
    preferredSkills: Array.isArray(data.preferredSkills) ? data.preferredSkills : fallback.preferredSkills,
    programmingLanguages: Array.isArray(data.programmingLanguages) ? data.programmingLanguages : fallback.programmingLanguages,
    frameworks: Array.isArray(data.frameworks) ? data.frameworks : fallback.frameworks,
    databases: Array.isArray(data.databases) ? data.databases : fallback.databases,
    cloudTechnologies: Array.isArray(data.cloudTechnologies) ? data.cloudTechnologies : fallback.cloudTechnologies,
    aiMlSkills: Array.isArray(data.aiMlSkills) ? data.aiMlSkills : fallback.aiMlSkills,
    softSkills: Array.isArray(data.softSkills) ? data.softSkills : fallback.softSkills,
    responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : fallback.responsibilities,
    educationRequirements: Array.isArray(data.educationRequirements) ? data.educationRequirements : fallback.educationRequirements,
    experienceRequirements: Array.isArray(data.experienceRequirements) ? data.experienceRequirements : fallback.experienceRequirements,
    keywords: Array.isArray(data.keywords) ? data.keywords : fallback.keywords
  };
}

module.exports = {
  analyzeJobDescription,
  DEFAULT_JOB_ANALYSIS
};
