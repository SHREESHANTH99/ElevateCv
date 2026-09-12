/**
 * Hierarchical Skill Ontology Engine for ElevateCV.
 * 
 * Maps skills into structured domains/categories (AI/ML, Cloud/DevOps, Frontend, Backend, etc.)
 * and handles alias normalization so child skills automatically register parent category alignment.
 */

const ALIAS_MAP = {
  "k8s": "kubernetes",
  "react.js": "react",
  "reactjs": "react",
  "node.js": "node",
  "nodejs": "node",
  "vue.js": "vue",
  "vuejs": "vue",
  "next.js": "nextjs",
  "nextjs": "next.js",
  "ts": "typescript",
  "js": "javascript",
  "py": "python",
  "aws": "amazon web services",
  "gcp": "google cloud platform",
  "postgres": "postgresql",
  "mongo": "mongodb",
  "tf": "tensorflow",
  "scikit": "scikit-learn",
  "sklearn": "scikit-learn",
  "ml": "machine learning",
  "dl": "deep learning",
  "nlp": "natural language processing",
  "cv": "computer vision",
};

const SKILL_ONTOLOGY_TREE = {
  "ai_ml": {
    name: "AI & Machine Learning",
    subcategories: {
      "machine_learning": {
        name: "Machine Learning",
        keywords: ["machine learning", "ml", "supervised learning", "unsupervised learning", "reinforcement learning"],
        skills: ["scikit-learn", "xgboost", "lightgbm", "catboost", "pandas", "numpy", "scipy"]
      },
      "deep_learning": {
        name: "Deep Learning",
        keywords: ["deep learning", "dl", "neural networks", "cnn", "rnn", "lstm"],
        skills: ["pytorch", "tensorflow", "keras", "jax", "tensorrt", "onnx"]
      },
      "nlp": {
        name: "Natural Language Processing",
        keywords: ["nlp", "natural language processing", "llm", "large language models", "generative ai"],
        skills: ["transformers", "bert", "roberta", "hugging face", "spacy", "nltk", "langchain", "llama-index", "vector databases", "chromadb", "pinecone", "qdrant"]
      },
      "computer_vision": {
        name: "Computer Vision",
        keywords: ["computer vision", "cv", "image processing", "object detection"],
        skills: ["opencv", "yolo", "torchvision", "detectron2", "pillow"]
      }
    }
  },
  "cloud_devops": {
    name: "Cloud & DevOps",
    subcategories: {
      "cloud_platforms": {
        name: "Cloud Platforms",
        keywords: ["cloud", "cloud computing", "infrastructure"],
        skills: ["aws", "amazon web services", "azure", "google cloud platform", "gcp", "cloudflare", "digitalocean"]
      },
      "containerization": {
        name: "Containerization & Orchestration",
        keywords: ["containers", "containerization", "microservices"],
        skills: ["docker", "kubernetes", "k8s", "helm", "podman", "docker-compose"]
      },
      "ci_cd_iac": {
        name: "CI/CD & Infrastructure as Code",
        keywords: ["devops", "ci/cd", "continuous integration", "infrastructure as code"],
        skills: ["github actions", "gitlab ci", "jenkins", "terraform", "ansible", "cloudformation", "pulumi"]
      }
    }
  },
  "frontend": {
    name: "Frontend Development",
    subcategories: {
      "frameworks": {
        name: "Frontend Frameworks & Libraries",
        keywords: ["frontend", "web development", "ui development"],
        skills: ["react", "react.js", "next.js", "nextjs", "vue", "vue.js", "angular", "svelte", "solidjs"]
      },
      "languages_styling": {
        name: "Languages & Styling",
        keywords: ["styling", "css", "web standards"],
        skills: ["javascript", "typescript", "html5", "css3", "tailwind css", "styled-components", "sass", "framer motion", "shadcn/ui"]
      }
    }
  },
  "backend": {
    name: "Backend & Systems",
    subcategories: {
      "runtime_frameworks": {
        name: "Backend Runtimes & Frameworks",
        keywords: ["backend", "server-side", "api development"],
        skills: ["node", "node.js", "express", "express.js", "fastapi", "flask", "django", "spring boot", "nest.js", "gin"]
      },
      "databases_caching": {
        name: "Databases & Caching",
        keywords: ["database", "data persistence", "caching"],
        skills: ["postgresql", "postgres", "mongodb", "mongo", "redis", "mysql", "sqlite", "dynamodb", "elasticsearch", "supabase", "prisma"]
      },
      "api_architecture": {
        name: "API & System Design",
        keywords: ["api", "system architecture", "distributed systems"],
        skills: ["rest", "rest api", "graphql", "grpc", "websockets", "kafka", "rabbitmq", "pub/sub"]
      }
    }
  }
};

/**
 * Normalizes skill string by trimming, lowercasing, and applying alias mappings.
 */
function normalizeSkill(skill) {
  if (!skill) return "";
  const cleaned = skill.trim().toLowerCase();
  return ALIAS_MAP[cleaned] || cleaned;
}

/**
 * Maps a list of candidate skills into ontology categories and identifies implicit matches.
 * e.g., candidate has ["PyTorch", "TensorFlow"] => returns category match for "Deep Learning".
 */
function resolveOntologyMatches(candidateSkills = []) {
  const normalizedCandidate = candidateSkills.map(normalizeSkill);
  const matchedCategories = new Set();
  const detailedMatches = [];

  for (const [domainKey, domainObj] of Object.entries(SKILL_ONTOLOGY_TREE)) {
    for (const [subKey, subObj] of Object.entries(domainObj.subcategories)) {
      const matchedSkills = subObj.skills.filter(s => 
        normalizedCandidate.includes(normalizeSkill(s))
      );

      if (matchedSkills.length > 0) {
        matchedCategories.add(subObj.name.toLowerCase());
        subObj.keywords.forEach(kw => matchedCategories.add(kw.toLowerCase()));
        
        detailedMatches.push({
          domain: domainObj.name,
          category: subObj.name,
          matchedSkills
        });
      }
    }
  }

  return {
    candidateSkillsNormalized: normalizedCandidate,
    matchedCategoryNames: Array.from(matchedCategories),
    detailedMatches
  };
}

module.exports = {
  SKILL_ONTOLOGY_TREE,
  ALIAS_MAP,
  normalizeSkill,
  resolveOntologyMatches
};
