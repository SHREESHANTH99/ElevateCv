/**
 * SKILL ONTOLOGY & HIERARCHY (PHASE 1.5 UPGRADE)
 * Enables smart matching even between specific tools and general categories.
 */

const SKILL_TAXONOMY = {
  // Mapping specific tools to standardized names
  "nodejs": "Node.js",
  "node": "Node.js",
  "node.js": "Node.js",
  "reactjs": "React",
  "react.js": "React",
  "native": "React Native",
  "mongodb": "MongoDB",
  "mongo": "MongoDB",
  "javascript": "JavaScript",
  "js": "JavaScript",
  "typescript": "TypeScript",
  "ts": "TypeScript",
  "aws": "AWS",
  "amazon web services": "AWS",
  "python": "Python",
  "py": "Python",
  "postgresql": "PostgreSQL",
  "postgres": "PostgreSQL"
};

const SKILL_HIERARCHY = {
  "AWS": ["Cloud", "DevOps", "Infrastructure"],
  "Azure": ["Cloud", "DevOps"],
  "GCP": ["Cloud", "Infrastructure"],
  "React": ["Frontend", "JavaScript", "Web Development"],
  "Node.js": ["Backend", "JavaScript", "Web Development"],
  "Docker": ["DevOps", "Infrastructure", "Containerization"],
  "Kubernetes": ["DevOps", "Cloud Native", "Containerization"],
  "MongoDB": ["Database", "NoSQL", "Backend"],
  "PostgreSQL": ["Database", "SQL", "Backend"]
};

/**
 * Standardize and normalize skills from various formats
 */
function normalizeSkills(skills = []) {
  if (!Array.isArray(skills)) return [];
  
  const normalized = skills.map(s => {
    const raw = s.toLowerCase().trim();
    return SKILL_TAXONOMY[raw] || s.trim();
  });
  
  return [...new Set(normalized)];
}

/**
 * Expand a skill list using ontology to capture implicit skills
 * Example: ["AWS"] -> ["AWS", "Cloud", "DevOps"]
 */
function expandSkills(skills = []) {
  const norm = normalizeSkills(skills);
  const expanded = new Set(norm);
  
  norm.forEach(s => {
    if (SKILL_HIERARCHY[s]) {
      SKILL_HIERARCHY[s].forEach(parent => expanded.add(parent));
    }
  });
  
  return Array.from(expanded);
}

module.exports = { normalizeSkills, expandSkills };
