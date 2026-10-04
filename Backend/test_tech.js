const TECH_CATEGORIES = {
  programmingLanguages: ["python", "typescript", "javascript", "c++", "java", "golang", "go", "rust", "sql", "html", "css", "r", "scala", "kotlin", "swift"],
  frameworks: ["react", "vue", "angular", "next.js", "node.js", "nodejs", "express", "fastapi", "django", "flask", "pytorch", "tensorflow", "keras", "spring", "bootstrap", "tailwind"],
  databases: ["postgresql", "postgres", "mysql", "mongodb", "redis", "sqlite", "dynamodb", "oracle", "elasticsearch", "cassandra"],
  cloudTechnologies: ["aws", "azure", "gcp", "docker", "kubernetes", "terraform", "helm", "ci/cd", "jenkins", "linux"],
  aiMlSkills: ["spacy", "llm", "openai", "langchain", "rag", "machine learning", "deep learning", "nlp", "computer vision", "transformers"]
};

const ALL_KNOWN_TECHS = Object.values(TECH_CATEGORIES).flat();

function extractTechFromText(text) {
  const found = new Set();
  // Strip trailing sentence punctuation if attached
  const normalizedText = text.replace(/[\.\,\;\:]+(\s|$)/g, ' $1');
  const lower = normalizedText.toLowerCase();

  for (const tech of ALL_KNOWN_TECHS) {
    const escaped = tech.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9#])${escaped}(?:$|[^a-zA-Z0-9#])`, 'i');
    if (regex.test(lower)) {
      const originalName = (tech === 'node.js' || tech === 'nodejs') ? 'Node.js' : tech === 'spacy' ? 'spaCy' : tech === 'fastapi' ? 'FastAPI' : tech === 'pytorch' ? 'PyTorch' : tech === 'postgresql' ? 'PostgreSQL' : tech === 'llm' ? 'LLM' : tech.charAt(0).toUpperCase() + tech.slice(1);
      found.add(originalName);
    }
  }
  return Array.from(found);
}

const sentence = "Built real-time analytics backend using Python, Azure, and Node.js.";
console.log("Extracted techs:", extractTechFromText(sentence));
