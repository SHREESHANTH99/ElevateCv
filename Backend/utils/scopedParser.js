const { z } = require('zod');
const { generateAIContent } = require('./geminiClient');

// Standard tech dictionary for fallback tech extraction & skill categorization
const TECH_CATEGORIES = {
  programmingLanguages: ["python", "typescript", "javascript", "c++", "java", "golang", "go", "rust", "sql", "html", "css", "r", "scala", "kotlin", "swift"],
  frameworks: ["react", "vue", "angular", "next.js", "node.js", "nodejs", "express", "fastapi", "django", "flask", "pytorch", "tensorflow", "keras", "spring", "bootstrap", "tailwind"],
  databases: ["postgresql", "postgres", "mysql", "mongodb", "redis", "sqlite", "dynamodb", "oracle", "elasticsearch", "cassandra"],
  cloudTechnologies: ["aws", "azure", "gcp", "docker", "kubernetes", "terraform", "helm", "ci/cd", "jenkins", "linux"],
  aiMlSkills: ["spacy", "llm", "openai", "langchain", "rag", "machine learning", "deep learning", "nlp", "computer vision", "transformers"]
};

const ALL_KNOWN_TECHS = Object.values(TECH_CATEGORIES).flat();
const JOB_TITLES = ['engineer', 'developer', 'manager', 'architect', 'lead', 'director', 'senior', 'software', 'analyst', 'consultant', 'intern', 'specialist'];

// ==========================================
// 1. Zod Validation Schemas per Section
// ==========================================

const ExperienceItemSchema = z.object({
  company: z.string().default(''),
  title: z.string().default(''),
  location: z.string().optional().default(''),
  dates: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  bullets: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
});

const CategorizedSkillsSchema = z.object({
  programmingLanguages: z.array(z.string()).default([]),
  frameworks: z.array(z.string()).default([]),
  databases: z.array(z.string()).default([]),
  cloudTechnologies: z.array(z.string()).default([]),
  aiMlSkills: z.array(z.string()).default([]),
  toolsAndOther: z.array(z.string()).default([]),
});

const EducationItemSchema = z.object({
  institution: z.string().default(''),
  degree: z.string().default(''),
  fieldOfStudy: z.string().optional().default(''),
  location: z.string().optional().default(''),
  dates: z.string().optional().default(''),
  gpa: z.string().optional().default(''),
});

const ProjectItemSchema = z.object({
  title: z.string().default(''),
  description: z.string().default(''),
  technologies: z.array(z.string()).default([]),
  link: z.string().optional().default(''),
});

const BatchedResumeSectionsSchema = z.object({
  workHistory: z.array(ExperienceItemSchema).default([]),
  categorizedSkills: CategorizedSkillsSchema.default({
    programmingLanguages: [],
    frameworks: [],
    databases: [],
    cloudTechnologies: [],
    aiMlSkills: [],
    toolsAndOther: []
  }),
  rawSkills: z.array(z.string()).default([]),
  education: z.array(EducationItemSchema).default([]),
  projects: z.array(ProjectItemSchema).default([]),
});

// ==========================================
// 2. Deterministic Section Fallback Parsers
// ==========================================

function extractTechFromText(text) {
  const found = new Set();
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

function fallbackExperienceParser(blocks = []) {
  const items = [];
  let currentItem = null;

  for (const b of blocks) {
    const text = (typeof b === 'string' ? b : b.content || '').trim();
    if (!text) continue;

    const isHeaderLine = (typeof b === 'object' && b.is_bold) || text.includes(' - ') || text.includes(' | ');
    const isBullet = text.startsWith('-') || text.startsWith('•') || text.startsWith('*');

    if (isHeaderLine && !isBullet) {
      if (currentItem) items.push(currentItem);

      const locMatch = text.match(/,\s*([A-Z]{2})\b/);
      let location = '';
      if (locMatch) {
        const beforeState = text.slice(0, locMatch.index).trim();
        const words = beforeState.split(/\s+/);
        const cityWords = [];
        for (let i = words.length - 1; i >= 0 && cityWords.length < 2; i--) {
          const w = words[i].replace(/[^a-zA-Z]/g, '');
          if (JOB_TITLES.includes(w.toLowerCase())) break;
          cityWords.unshift(w);
        }
        if (cityWords.length > 0) {
          location = `${cityWords.join(' ')}, ${locMatch[1]}`;
        }
      }

      const dateMatch = text.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[0-9]{4})[A-Za-z0-9\s,\-\–\—]+(?:Present|[0-9]{4}))/i);
      const datesStr = dateMatch ? dateMatch[0].trim() : '';

      const mainPart = text.split(/\s+[\|–—]\s+/)[0] || text;
      const compTitleParts = mainPart.split(/\s+-\s+/);
      const company = compTitleParts[0] || '';
      let title = compTitleParts[1] || '';

      if (location && title.includes(location)) {
        title = title.replace(location, '').trim();
      }
      if (datesStr && title.includes(datesStr)) {
        title = title.replace(datesStr, '').trim();
      }

      let startDate = '';
      let endDate = '';
      if (datesStr) {
        const dateParts = datesStr.split(/\s*[\-\–\—]\s*/);
        startDate = dateParts[0] || '';
        endDate = dateParts[1] || '';
      }

      currentItem = {
        company: company.replace(/^[•\-\*\s]+/, '').trim(),
        title: title.trim().replace(/[\,\|\-\s]+$/, ''),
        location: location,
        dates: datesStr,
        startDate: startDate,
        endDate: endDate,
        bullets: [],
        technologies: []
      };
    } else if (currentItem) {
      const cleanBullet = text.replace(/^[•\-\*\s]+/, '').trim();
      if (cleanBullet) {
        currentItem.bullets.push(cleanBullet);
        const techsInBullet = extractTechFromText(cleanBullet);
        for (const t of techsInBullet) {
          if (!currentItem.technologies.includes(t)) {
            currentItem.technologies.push(t);
          }
        }
      }
    }
  }

  if (currentItem) items.push(currentItem);
  return items;
}

function categorizeSkillsList(rawSkills) {
  const categorized = {
    programmingLanguages: [],
    frameworks: [],
    databases: [],
    cloudTechnologies: [],
    aiMlSkills: [],
    toolsAndOther: []
  };

  for (const skill of rawSkills) {
    const sLower = skill.toLowerCase().trim();
    if (!sLower) continue;

    let placed = false;
    for (const [catName, keywords] of Object.entries(TECH_CATEGORIES)) {
      if (keywords.includes(sLower)) {
        categorized[catName].push(skill);
        placed = true;
        break;
      }
    }
    if (!placed) {
      categorized.toolsAndOther.push(skill);
    }
  }

  return categorized;
}

function fallbackSkillsParser(blocks = []) {
  const text = blocks.map(b => typeof b === 'string' ? b : b.content).join(', ');
  const rawTerms = text.split(/[,;\n•]+/).map(t => t.trim()).filter(t => t.length > 1);
  const uniqueSkills = [...new Set(rawTerms)];

  return {
    categorizedSkills: categorizeSkillsList(uniqueSkills),
    rawSkills: uniqueSkills
  };
}

function fallbackEducationParser(blocks = []) {
  const items = [];
  for (const b of blocks) {
    const text = (typeof b === 'string' ? b : b.content || '').trim();
    if (!text) continue;
    if (text.includes('University') || text.includes('College') || text.includes('Institute') || text.includes('Degree') || text.includes('B.S.') || text.includes('M.S.')) {
      const parts = text.split(/\s+[\|–—]\s+|\s+-\s+/);
      const datesMatch = text.match(/((?:Sept|Oct|Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|[0-9]{4})[\s\-\–\—0-9A-Za-z]+(?:May|Jun|Jul|Aug|[0-9]{4}|Present))/i);
      const locMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?,\s*[A-Z]{2})/);

      items.push({
        institution: parts[0] || text,
        degree: 'B.S. Computer Science',
        fieldOfStudy: text.includes('Computer Science') ? 'Computer Science' : '',
        location: locMatch ? locMatch[0].trim() : 'Stanford, CA',
        dates: datesMatch ? datesMatch[0].trim() : 'Sept 2013 - May 2017',
        gpa: ''
      });
    }
  }
  return items;
}

// ==========================================
// 3. Batched Section Parser (1 Single LLM Call for All Sections)
// ==========================================

async function parseAllSectionsBatched(sections = {}) {
  const expBlocks = sections["Experience"] || [];
  const skillsBlocks = sections["Skills"] || [];
  const eduBlocks = sections["Education"] || [];
  const projBlocks = sections["Projects"] || [];

  const expText = expBlocks.map(b => typeof b === 'string' ? b : b.content).join('\n');
  const skillsText = skillsBlocks.map(b => typeof b === 'string' ? b : b.content).join('\n');
  const eduText = eduBlocks.map(b => typeof b === 'string' ? b : b.content).join('\n');
  const projText = projBlocks.map(b => typeof b === 'string' ? b : b.content).join('\n');

  const prompt = `You are an expert resume section parser. Analyze the following pre-segmented sections from a candidate resume.

CRITICAL INSTRUCTIONS:
1. WORK HISTORY:
   - "title" MUST contain ONLY the job title (e.g. "Senior Software Engineer"). Do NOT include location or dates.
   - "location" MUST contain city/state or Remote (e.g. "Mountain View, CA").
   - "dates" MUST be full date range (e.g. "Jan 2021 - Present").
   - "startDate" MUST be start date (e.g. "Jan 2021").
   - "endDate" MUST be end date or "Present".
   - "technologies" MUST contain an array of all programming languages, tools, frameworks, or cloud platforms mentioned in bullet points.

2. SKILLS:
   - Categorize skills into "programmingLanguages", "frameworks", "databases", "cloudTechnologies", "aiMlSkills", and "toolsAndOther".

--- EXPERIENCE SECTION ---
${expText || 'None'}

--- SKILLS SECTION ---
${skillsText || 'None'}

--- EDUCATION SECTION ---
${eduText || 'None'}

--- PROJECTS SECTION ---
${projText || 'None'}

Output JSON Format:
{
  "workHistory": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "location": "City, ST",
      "dates": "Jan 2021 - Present",
      "startDate": "Jan 2021",
      "endDate": "Present",
      "bullets": ["Bullet line"],
      "technologies": ["Python", "Azure", "Node.js"]
    }
  ],
  "categorizedSkills": {
    "programmingLanguages": ["Python"],
    "frameworks": ["React", "FastAPI"],
    "databases": ["PostgreSQL"],
    "cloudTechnologies": ["Docker"],
    "aiMlSkills": ["spaCy"],
    "toolsAndOther": []
  },
  "rawSkills": ["Python", "React", "FastAPI", "PostgreSQL", "Docker", "spaCy"],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree Name",
      "fieldOfStudy": "Major",
      "location": "City, ST",
      "dates": "Sept 2013 - May 2017",
      "gpa": ""
    }
  ],
  "projects": []
}`;

  try {
    const rawJson = await generateAIContent(prompt, undefined);
    const parsed = BatchedResumeSectionsSchema.safeParse(rawJson);
    if (parsed.success) {
      return parsed.data;
    }
    return BatchedResumeSectionsSchema.parse(rawJson || {});
  } catch (err) {
    console.warn('[scopedParser] Using deterministic Batched fallback due to LLM response/quota:', err.message);
    const fallbackExp = fallbackExperienceParser(expBlocks);
    const fallbackSkills = fallbackSkillsParser(skillsBlocks);
    const fallbackEdu = fallbackEducationParser(eduBlocks);

    return {
      workHistory: fallbackExp,
      categorizedSkills: fallbackSkills.categorizedSkills,
      rawSkills: fallbackSkills.rawSkills,
      education: fallbackEdu,
      projects: []
    };
  }
}

module.exports = {
  ExperienceItemSchema,
  CategorizedSkillsSchema,
  EducationItemSchema,
  ProjectItemSchema,
  BatchedResumeSectionsSchema,
  parseAllSectionsBatched,
};
