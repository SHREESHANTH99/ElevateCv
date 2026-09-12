require('dotenv').config();
const { faker } = require('@faker-js/faker');
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

faker.seed(42);

const templates = [
  'modern', 'executive', 'creative', 'minimalist', 'ats', 
  'tech', 'classic', 'corporate', 'engineer', 'graduate'
];

const sampleData = {
  title: "Professional Resume",
  personalInfo: {
    fullName: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    phone: "(555) 867-5309",
    location: "Seattle, WA",
    linkedin: "https://linkedin.com/in/" + faker.internet.username(),
    website: "https://example.com",
    github: faker.internet.username(),
    headline: "Senior Product Engineer",
    photo: "",
  },
  summary: "Results-driven product engineer with 6+ years of experience scaling consumer applications and leading cross-functional teams. Expert in React, Node.js, and cloud infrastructure. Passionate about building accessible, performant user experiences.",
  experiences: [
    {
      id: "1",
      company: "Starlight Metrics",
      title: "Lead Frontend Engineer",
      location: "Seattle, WA",
      startDate: "2021-06",
      endDate: "",
      current: true,
      description: [
        "Architected and launched a real-time analytics dashboard used by 50,000+ monthly active enterprise users.",
        "Reduced initial load time by 45% through aggressive bundle splitting and L1/L2 Redis caching strategies.",
        "Managed a team of 4 engineers, conducting code reviews and defining frontend architecture standards."
      ]
    },
    {
      id: "2",
      company: "Nexus Software",
      title: "Software Engineer",
      location: "Austin, TX",
      startDate: "2018-09",
      endDate: "2021-05",
      current: false,
      description: [
        "Developed core features for a B2B SaaS platform using React, TypeScript, and Express.",
        "Integrated secure payment gateways processing over $2M in monthly transactions.",
        "Migrated legacy REST APIs to GraphQL, improving data fetching efficiency by 30%."
      ]
    }
  ],
  education: [
    {
      id: "1",
      school: "University of Washington",
      degree: "Bachelor of Science",
      field: "Computer Science",
      location: "Seattle, WA",
      startDate: "2014-09",
      endDate: "2018-06",
      current: false,
      description: "Graduated with Honors. Focus on Human-Computer Interaction and Distributed Systems.",
      gpa: "3.8"
    }
  ],
  skills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS", "Redis", "System Architecture", "Team Leadership"],
  projects: [],
  languages: [],
  customSections: []
};

async function run() {
  console.log("[PLAYWRIGHT] Launching browser instance...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1000, height: 1294 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  const targetUrl = 'http://localhost:4173/template-render';
  
  console.log("Warming up frontend connection (vite preview on 4173)...");
  try {
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 10000 });
  } catch (e) {
    console.error("Failed to reach frontend preview server:", e.message);
  }

  const outDir = path.join(__dirname, '../../Frontend/public/template-previews');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const t of templates) {
    console.log(`Rendering template: ${t}...`);
    await page.goto(`${targetUrl}?t=${t}`, { waitUntil: 'networkidle', timeout: 10000 });
    
    // Wait explicitly for element signaling ready state
    try {
      await page.waitForSelector('[data-ready="true"]', { timeout: 5000 });
    } catch (e) {
      console.log('Timeout waiting for data-ready. HTML is:');
      console.log(await page.content());
      throw e;
    }

    // Capture screenshot with animations disabled to prevent Framer Motion artifacts
    await page.screenshot({ 
      path: path.join(outDir, `${t}.png`),
      animations: 'disabled'
    });
  }

  console.log(`Rendering poor template...`);
  const poorHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: 'Times New Roman', serif; padding: 40px; color: #000; font-size: 14px; line-height: 1.1; }
      h1 { font-size: 20px; text-transform: uppercase; text-align: center; }
      p { margin: 0; padding: 0; }
      .header { text-align: center; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      td, th { border: 1px solid black; padding: 4px; text-align: left; }
      .section { border-bottom: 2px solid black; margin-top: 20px; font-weight: bold; text-transform: uppercase; padding-bottom: 2px; }
      .dense { margin-top: 5px; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>${sampleData.personalInfo.fullName}</h1>
      <p>${sampleData.personalInfo.email} | ${sampleData.personalInfo.phone} | ${sampleData.personalInfo.location}</p>
    </div>
    <div class="section">Summary</div>
    <p class="dense">${sampleData.summary} This text is intentionally cramped to look like a bad resume without enough whitespace. It runs on and on. It shows no distinct formatting or modern design sensibilities. It is extremely dense and hard to parse for a human reader.</p>
    
    <div class="section">Experience</div>
    ${sampleData.experiences.map(e => `
      <p class="dense"><strong>${e.company}</strong> - ${e.title} (${e.startDate} to ${e.endDate || 'Present'})</p>
      <p class="dense">${e.description.join(" ")}</p>
    `).join("")}
    
    <div class="section">Skills Table</div>
    <table>
      <tr><th>Category 1</th><th>Category 2</th><th>Category 3</th></tr>
      <tr><td>React</td><td>Node.js</td><td>GraphQL</td></tr>
      <tr><td>TypeScript</td><td>AWS</td><td>Redis</td></tr>
      <tr><td>Architecture</td><td>Leadership</td><td>Agile</td></tr>
    </table>
  </body>
  </html>
  `;
  await page.setContent(poorHtml, { waitUntil: 'load' });
  await page.screenshot({ 
    path: path.join(outDir, `before-example.png`),
    animations: 'disabled'
  });

  await browser.close();
  console.log("Done generating all template previews using Playwright.");
  process.exit(0);
}

run().catch(console.error);
