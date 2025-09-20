const express = require("express");
const { body, validationResult } = require("express-validator");
const puppeteer = require("puppeteer");
const Resume = require("../models/Resume");
const auth = require("../middleware/auth");
const inMemoryStorage = require("../utils/inMemoryStorage.js");
const router = express.Router();
router.get("/", auth, async (req, res) => {
  try {
    if (process.env.USE_IN_MEMORY_STORAGE === "true") {
      const resumes = await inMemoryStorage.findResumesByUserId(req.user._id);
      return res.json({ resumes });
    }
    const resumes = await Resume.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select(
        "-personalInfo -summary -experiences -education -skills -projects"
      );
    res.json({ resumes });
  } catch (error) {
    console.error("Get resumes error:", error);
    res.status(500).json({ message: "Server error while fetching resumes" });
  }
});
router.get("/:id", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.json({ resume });
  } catch (error) {
    console.error("Get resume error:", error);
    res.status(500).json({ message: "Server error while fetching resume" });
  }
});
router.post(
  "/",
  auth,
  [
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Title cannot be empty if provided"),
    body("personalInfo.fullName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Full name cannot be empty if provided"),
    body("personalInfo.email")
      .optional()
      .isEmail()
      .withMessage("Please provide a valid email"),
    body("personalInfo.phone")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Phone number cannot be empty if provided"),
    body("personalInfo.location")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Location cannot be empty if provided"),
    body("summary")
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage("Summary must be at least 10 characters long if provided"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array().map((err) => ({
            param: err.param,
            msg: err.msg,
          })),
        });
      }
      if (process.env.USE_IN_MEMORY_STORAGE === "true") {
        return res.status(400).json({
          success: false,
          message:
            "Cannot save resume: Running in in-memory storage mode. Please check your MongoDB connection.",
        });
      }
      const isUpdate = req.body._id;
      let resumeData;
      if (isUpdate) {
        const existingResume = await Resume.findOne({
          _id: req.body._id,
          userId: req.user._id,
        });
        if (!existingResume) {
          return res
            .status(404)
            .json({ success: false, message: "Resume not found" });
        }
        resumeData = {
          ...existingResume.toObject(),
          ...req.body,
          lastModified: new Date(),
          personalInfo: {
            ...existingResume.personalInfo.toObject(),
            ...(req.body.personalInfo || {}),
          },
        };
      } else {
        resumeData = {
          ...req.body,
          userId: req.user._id,
          lastModified: new Date(),
          title: req.body.title || "My Resume",
          personalInfo: {
            fullName: req.body.personalInfo?.fullName || "",
            email: req.body.personalInfo?.email || "",
            phone: req.body.personalInfo?.phone || "",
            location: req.body.personalInfo?.location || "",
            linkedin: req.body.personalInfo?.linkedin || "",
            website: req.body.personalInfo?.website || "",
          },
          summary: req.body.summary || "",
          experiences: req.body.experiences || [],
          education: req.body.education || [],
          skills: req.body.skills || [],
          projects: req.body.projects || [],
          template: req.body.template || "modern",
          isPublic: req.body.isPublic || false,
        };
      }
      let resume;
      if (process.env.USE_IN_MEMORY_STORAGE === "true") {
        if (isUpdate) {
          resume = await inMemoryStorage.updateResume(req.body._id, resumeData);
        } else {
          resume = await inMemoryStorage.createResume(resumeData);
        }
      } else {
        if (isUpdate) {
          const { _id, ...updateData } = resumeData;
          resume = await Resume.findOneAndUpdate(
            { _id: req.body._id, userId: req.user._id },
            { $set: updateData },
            { new: true, runValidators: true }
          );
        } else {
          resume = new Resume(resumeData);
          await resume.save();
        }
      }
      if (!resume) {
        return res.status(500).json({
          success: false,
          message: "Failed to save resume",
        });
      }
      res.json({
        success: true,
        message: "Resume saved successfully",
        resume,
      });
    } catch (error) {
      console.error("Save resume error:", error);
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: Object.values(error.errors).map((e) => ({
            field: e.path,
            message: e.message,
          })),
        });
      }
      res.status(500).json({
        success: false,
        message: "Error saving resume",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);
router.put(
  "/:id",
  auth,
  [
    body("personalInfo.fullName").notEmpty(),
    body("personalInfo.email").isEmail(),
    body("personalInfo.phone").notEmpty(),
    body("personalInfo.location").notEmpty(),
    body("summary").isLength({ min: 10 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }
      const { _id, ...updateData } = req.body;
      const resume = await Resume.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        {
          ...updateData,
          lastModified: new Date(),
        },
        { new: true, runValidators: true }
      );
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      res.json({
        message: "Resume updated successfully",
        resume,
      });
    } catch (error) {
      console.error("Update resume error:", error);
      res.status(500).json({ message: "Server error while updating resume" });
    }
  }
);
router.delete("/:id?", auth, async (req, res) => {
  try {
    const resumeId = req.params.id || req.body.id;
    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: "Resume ID is required",
      });
    }
    const resume = await Resume.findOneAndDelete({
      _id: resumeId,
      userId: req.user._id,
    });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }
    res.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error("Delete resume error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting resume",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
router.get("/export/:id?", auth, async (req, res) => {
  try {
    if (process.env.USE_IN_MEMORY_STORAGE === "true") {
      return res.status(400).json({
        success: false,
        message:
          "PDF export is not available in in-memory storage mode. Please connect to MongoDB to use this feature.",
      });
    }
    const resumeId = req.params.id || req.query.id;
    const query = resumeId
      ? { _id: resumeId, userId: req.user._id }
      : { userId: req.user._id };
    const resume = await Resume.findOne(query);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }
    try {
      let html;
      try {
        html = generateResumeHTML(resume);
      } catch (htmlError) {
        console.error("HTML generation error:", htmlError);
        throw new Error("Failed to generate resume content");
      }
      const browser = await puppeteer.launch({
        headless: "new",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
        timeout: 30000,
      });
      const page = await browser.newPage();
      try {
        page.setDefaultNavigationTimeout(30000);
        page.setDefaultTimeout(30000);
        await page.setViewport({ width: 1200, height: 1600 });
        await page.setContent(html, {
          waitUntil: ["networkidle0", "domcontentloaded"],
          timeout: 30000,
        });
        await page.evaluateHandle("document.fonts.ready");
        const pdf = await page.pdf({
          format: "A4",
          printBackground: true,
          margin: {
            top: "5mm",
            right: "5mm",
            bottom: "5mm",
            left: "5mm",
          },
          preferCSSPageSize: true,
          displayHeaderFooter: false,
          timeout: 60000,
        });
        const filename = `${
          resume.personalInfo?.fullName?.replace(/\s+/g, "_") || "resume"
        }_${new Date().toISOString().split("T")[0]}.pdf`;
        console.log("🔍 PDF generated:", {
          pdfType: typeof pdf,
          pdfConstructor: pdf.constructor.name,
          pdfLength: pdf.length,
          isBuffer: Buffer.isBuffer(pdf),
          firstBytes: pdf.slice(0, 10),
        });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`
        );
        res.setHeader("Content-Length", pdf.length);
        res.send(pdf);
      } finally {
        try {
          await browser.close();
        } catch (browserCloseError) {
          console.error("Error closing browser:", browserCloseError);
        }
      }
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
      return res.status(500).json({
        success: false,
        message: "Failed to generate PDF. Please try again later.",
        error:
          process.env.NODE_ENV === "development" ? pdfError.message : undefined,
        details:
          process.env.NODE_ENV === "development" ? pdfError.stack : undefined,
      });
    }
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while exporting PDF",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
function generateResumeHTML(resume) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${resume.personalInfo.fullName} - Professional Resume</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          line-height: 1.4;
          color: #1f2937;
          font-size: 10px;
          background-color: white;
          padding: 12px;
          height: 100vh;
          overflow: hidden;
        }
        .container {
          max-width: 100%;
          margin: 0 auto;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .header {
          background: linear-gradient(to right, #eff6ff, #e0e7ff);
          padding: 16px;
          margin: -12px -12px 12px -12px;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .header h1 {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 4px;
          letter-spacing: -0.5px;
        }
        .headline {
          font-size: 12px;
          color: #1d4ed8;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .contact-info {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          color: #6b7280;
          font-size: 8px;
        }
        .contact-item {
          display: flex;
          align-items: center;
          margin-right: 12px;
        }
        .contact-item svg {
          width: 8px;
          height: 8px;
          margin-right: 4px;
          fill: currentColor;
        }
        .section {
          margin-bottom: 12px;
          page-break-inside: avoid;
        }
        .section h2 {
          font-size: 12px;
          font-weight: 700;
          color: #1f2937;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 3px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
        }
        .section h2::before {
          content: '';
          display: block;
          width: 2px;
          height: 12px;
          background-color: #2563eb;
          border-radius: 2px;
          margin-right: 6px;
        }
        .summary-text {
          font-size: 9px;
          line-height: 1.4;
          color: #374151;
        }
        .experience-item, .education-item, .project-item {
          margin-bottom: 8px;
          position: relative;
          padding-left: 12px;
          border-left: 1px solid #dbeafe;
        }
        .experience-item::before {
          content: '';
          position: absolute;
          left: -3px;
          top: 2px;
          width: 6px;
          height: 6px;
          background-color: #3b82f6;
          border-radius: 50%;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2px;
        }
        .item-title {
          font-size: 10px;
          font-weight: 600;
          color: #1f2937;
        }
        .item-company {
          font-size: 9px;
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 2px;
        }
        .item-date {
          font-size: 7px;
          font-weight: 500;
          color: #2563eb;
          background-color: #eff6ff;
          padding: 1px 4px;
          border-radius: 3px;
          white-space: nowrap;
        }
        .description {
          font-size: 8px;
          color: #374151;
          line-height: 1.3;
        }
        .description ul {
          list-style: none;
          padding: 0;
        }
        .description li {
          margin-bottom: 1px;
          position: relative;
          padding-left: 10px;
        }
        .description li::before {
          content: '•';
          color: #3b82f6;
          font-weight: bold;
          position: absolute;
          left: 0;
        }
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 6px;
        }
        .skill-category h3 {
          font-size: 9px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 3px;
        }
        .skill-list {
          font-size: 8px;
          color: #6b7280;
          line-height: 1.2;
        }
        .two-column {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 16px;
          flex-grow: 1;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header class="header">
          <h1>${resume.personalInfo.fullName}</h1>
          ${resume.personalInfo.headline ? `<p class="headline">${resume.personalInfo.headline}</p>` : ''}
          <div class="contact-info">
            <span class="contact-item">
              <svg viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
              ${resume.personalInfo.email}
            </span>
            <span class="contact-item">
              <svg viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
              ${resume.personalInfo.phone}
            </span>
            <span class="contact-item">
              <svg viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>
              ${resume.personalInfo.location}
            </span>
            ${resume.personalInfo.linkedin ? `
              <span class="contact-item">
                <svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </span>
            ` : ''}
            ${resume.personalInfo.website ? `
              <span class="contact-item">
                <svg viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.559-.499-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.559.499.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.497-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clip-rule="evenodd"></path></svg>
                Website
              </span>
            ` : ''}
          </div>
        </header>
        ${resume.summary ? `
          <section class="section">
            <h2>Professional Summary</h2>
            <p class="summary-text">${resume.summary}</p>
          </section>
        ` : ''}
        <div class="two-column">
          <div class="left-column">
            ${resume.experiences && resume.experiences.length > 0 ? `
              <section class="section">
                <h2>Professional Experience</h2>
                ${resume.experiences.slice(0, 3).map(exp => `
                  <div class="experience-item">
                    <div class="item-header">
                      <div>
                        <div class="item-title">${exp.position}</div>
                        <div class="item-company">${exp.company}${exp.location ? ' • ' + exp.location : ''}</div>
                      </div>
                      <div class="item-date">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
                    </div>
                    ${exp.description && exp.description.length > 0 ? `
                      <div class="description">
                        <ul>
                          ${exp.description.slice(0, 2).map(desc => `<li>${desc}</li>`).join('')}
                        </ul>
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </section>
            ` : ''}
            ${resume.projects && resume.projects.length > 0 ? `
              <section class="section">
                <h2>Projects</h2>
                ${resume.projects.slice(0, 2).map(project => `
                  <div class="project-item">
                    <div class="item-header">
                      <div class="item-title">${project.name}</div>
                      <div class="item-date">${project.startDate} - ${project.endDate || 'Present'}</div>
                    </div>
                    <div class="description">${project.description}</div>
                    ${project.technologies && project.technologies.length > 0 ? `
                      <div class="description" style="font-style: italic; margin-top: 2px;">
                        <strong>Tech:</strong> ${project.technologies.slice(0, 4).join(', ')}
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </section>
            ` : ''}
          </div>
          <div class="right-column">
            ${resume.education && resume.education.length > 0 ? `
              <section class="section">
                <h2>Education</h2>
                ${resume.education.slice(0, 2).map(edu => `
                  <div class="education-item">
                    <div class="item-header">
                      <div>
                        <div class="item-title">${edu.degree} in ${edu.field}</div>
                        <div class="item-company">${edu.institution}</div>
                        ${edu.gpa ? `<div style="font-size: 8px; color: #6b7280;">GPA: ${edu.gpa}</div>` : ''}
                      </div>
                      <div class="item-date">${edu.startDate} - ${edu.endDate || 'Present'}</div>
                    </div>
                  </div>
                `).join('')}
              </section>
            ` : ''}
            ${resume.skills && resume.skills.length > 0 ? `
              <section class="section">
                <h2>Skills</h2>
                <div class="skills-grid">
                  ${Object.entries(resume.skills.slice(0, 15).reduce((acc, skill) => {
                    if (!acc[skill.category]) acc[skill.category] = [];
                    acc[skill.category].push(`${skill.name}${skill.level ? ' (' + skill.level + ')' : ''}`);
                    return acc;
                  }, {})).map(([category, skills]) => `
                    <div class="skill-category">
                      <h3>${category}</h3>
                      <div class="skill-list">${skills.slice(0, 4).join(', ')}</div>
                    </div>
                  `).join('')}
                </div>
              </section>
            ` : ''}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${resume.personalInfo.fullName} - Professional Resume</title>
      <style>
        body {
          font-family: ${templateStyles.fontFamily};
          line-height: 1.6;
          color: ${templateStyles.textColor};
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: ${templateStyles.backgroundColor};
        }
        .header {
          text-align: ${templateStyles.headerAlignment};
          border-bottom: ${templateStyles.headerBorder};
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: ${templateStyles.primaryColor};
          margin: 0;
          font-size: 2.5em;
          font-weight: ${templateStyles.headerFontWeight};
          letter-spacing: ${templateStyles.headerLetterSpacing};
        }
        .contact-info {
          margin-top: 10px;
          color: ${templateStyles.secondaryTextColor};
          display: ${templateStyles.contactInfoDisplay};
          justify-content: ${templateStyles.contactInfoJustify};
          flex-wrap: wrap;
          gap: 10px;
        }
        .contact-info-item {
          display: inline-flex;
          align-items: center;
          margin-right: 15px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h2 {
          color: ${templateStyles.primaryColor};
          border-bottom: ${templateStyles.sectionBorder};
          padding-bottom: 5px;
          margin-bottom: 15px;
          font-weight: ${templateStyles.sectionHeadingWeight};
        }
        .experience-item, .education-item, .project-item {
          margin-bottom: 20px;
          position: relative;
          ${
            templateStyles.itemLeftBorder
              ? `padding-left: 15px;
          border-left: ${templateStyles.itemLeftBorder};`
              : ""
          }
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 5px;
        }
        .item-title {
          font-weight: bold;
          color: ${templateStyles.itemTitleColor};
          font-size: ${templateStyles.itemTitleSize};
        }
        .item-company {
          color: ${templateStyles.itemCompanyColor};
          font-weight: ${templateStyles.itemCompanyWeight};
        }
        .item-date {
          color: ${templateStyles.dateColor};
          font-size: 0.9em;
          ${templateStyles.dateStyle}
        }
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        .skill-category {
          margin-bottom: 15px;
        }
        .skill-category h3 {
          margin: 0 0 5px 0;
          color: ${templateStyles.skillCategoryColor};
          font-size: 1em;
          font-weight: ${templateStyles.skillCategoryWeight};
        }
        .skill-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
          ${templateStyles.skillItemStyle}
        }
        .description {
          margin-top: 10px;
          color: ${templateStyles.descriptionColor};
        }
        .technologies {
          margin-top: 5px;
          font-style: italic;
          color: ${templateStyles.technologiesColor};
        }
        .bullet-point {
          margin-bottom: 3px;
          position: relative;
          padding-left: ${
            templateStyles.bulletStyle === "custom" ? "18px" : "0"
          };
        }
        ${
          templateStyles.bulletStyle === "custom"
            ? `.bullet-point:before {
          content: '';
          position: absolute;
          left: 0;
          top: 8px;
          width: 6px;
          height: 6px;
          background-color: ${templateStyles.primaryColor};
          border-radius: 50%;
        }`
            : ""
        }
      </style>
    </head>
    <body>
      <div class="header" style="${templateStyles.headerExtraStyles || ""}">
        <h1>${resume.personalInfo.fullName}</h1>
        <div class="contact-info">
          <span class="contact-info-item">${resume.personalInfo.email}</span>
          <span class="contact-info-item">${resume.personalInfo.phone}</span>
          <span class="contact-info-item">${resume.personalInfo.location}</span>
          ${
            resume.personalInfo.linkedin
              ? `<span class="contact-info-item">LinkedIn: ${resume.personalInfo.linkedin}</span>`
              : ""
          }
          ${
            resume.personalInfo.website
              ? `<span class="contact-info-item">Website: ${resume.personalInfo.website}</span>`
              : ""
          }
        </div>
      </div>
      ${
        resume.summary
          ? `
        <div class="section">
          <h2>Professional Summary</h2>
          <p>${resume.summary}</p>
        </div>
      `
          : ""
      }
      ${
        resume.experiences && resume.experiences.length > 0
          ? `
        <div class="section">
          <h2>Experience</h2>
          ${resume.experiences
            .map(
              (exp) => `
            <div class="experience-item">
              <div class="item-header">
                <div>
                  <div class="item-title">${exp.position}</div>
                  <div class="item-company">${exp.company}</div>
                </div>
                <div class="item-date">
                  ${exp.startDate} - ${exp.current ? "Present" : exp.endDate}
                  ${exp.location ? `<br>${exp.location}` : ""}
                </div>
              </div>
              ${
                exp.description && exp.description.length > 0
                  ? `
                <div class="description">
                  ${exp.description
                    .map((desc) => `<div class="bullet-point">${desc}</div>`)
                    .join("")}
                </div>
              `
                  : ""
              }
            </div>
          `
            )
            .join("")}
        </div>
      `
          : ""
      }
      ${
        resume.education && resume.education.length > 0
          ? `
        <div class="section">
          <h2>Education</h2>
          ${resume.education
            .map(
              (edu) => `
            <div class="education-item">
              <div class="item-header">
                <div>
                  <div class="item-title">${edu.degree} in ${edu.field}</div>
                  <div class="item-company">${edu.institution}</div>
                  ${
                    edu.gpa
                      ? `<div class="bullet-point">GPA: ${edu.gpa}</div>`
                      : ""
                  }
                </div>
                <div class="item-date">
                  ${edu.startDate} - ${edu.endDate}
                  ${edu.location ? `<br>${edu.location}` : ""}
                </div>
              </div>
              ${
                edu.description
                  ? `<div class="description bullet-point">${edu.description}</div>`
                  : ""
              }
            </div>
          `
            )
            .join("")}
        </div>
      `
          : ""
      }
      ${
        resume.skills && resume.skills.length > 0
          ? `
        <div class="section">
          <h2>Skills</h2>
          <div class="skills-grid">
            ${Object.entries(
              resume.skills.reduce((acc, skill) => {
                if (!acc[skill.category]) acc[skill.category] = [];
                acc[skill.category].push(skill);
                return acc;
              }, {})
            )
              .map(
                ([category, skills]) => `
              <div class="skill-category">
                <h3>${category}</h3>
                ${skills
                  .map(
                    (skill) => `
                  <div class="skill-item">
                    <span>${skill.name}</span>
                    <span class="skill-level">${skill.level}</span>
                  </div>
                `
                  )
                  .join("")}
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }
      ${
        resume.projects && resume.projects.length > 0
          ? `
        <div class="section">
          <h2>Projects</h2>
          ${resume.projects
            .map(
              (project) => `
            <div class="project-item">
              <div class="item-header">
                <div class="item-title">${project.name}</div>
                <div class="item-date">
                  ${project.startDate} - ${project.endDate || "Present"}
                </div>
              </div>
              <div class="description bullet-point">${project.description}</div>
              ${
                project.technologies && project.technologies.length > 0
                  ? `
                <div class="technologies">
                  <strong>Technologies:</strong> ${project.technologies.join(
                    ", "
                  )}
                </div>
              `
                  : ""
              }
              ${
                project.url
                  ? `<div class="bullet-point"><strong>URL:</strong> <a href="${project.url}" target="_blank">${project.url}</a></div>`
                  : ""
              }
              ${
                project.github
                  ? `<div class="bullet-point"><strong>GitHub:</strong> <a href="${project.github}" target="_blank">${project.github}</a></div>`
                  : ""
              }
            </div>
          `
            )
            .join("")}
        </div>
      `
          : ""
      }
    </body>
    </html>
  `;
}
function getTemplateStyles(templateName) {
  const templates = {
    modern: {
      fontFamily: "'Roboto', 'Arial', sans-serif",
      textColor: "#333",
      backgroundColor: "#ffffff",
      primaryColor: "#2563eb",
      secondaryTextColor: "#666",
      headerAlignment: "left",
      headerBorder: "2px solid #2563eb",
      headerFontWeight: "500",
      headerLetterSpacing: "0.5px",
      contactInfoDisplay: "flex",
      contactInfoJustify: "flex-start",
      sectionBorder: "1px solid #e5e7eb",
      sectionHeadingWeight: "600",
      itemTitleColor: "#1f2937",
      itemTitleSize: "1.1em",
      itemCompanyColor: "#374151",
      itemCompanyWeight: "500",
      dateColor: "#6b7280",
      dateStyle: "",
      skillCategoryColor: "#374151",
      skillCategoryWeight: "600",
      skillItemStyle: "",
      descriptionColor: "#4b5563",
      technologiesColor: "#6b7280",
      bulletStyle: "custom",
      itemLeftBorder: "",
    },
    classic: {
      fontFamily: "'Georgia', 'Times New Roman', serif",
      textColor: "#333",
      backgroundColor: "#ffffff",
      primaryColor: "#1f2937",
      secondaryTextColor: "#666",
      headerAlignment: "center",
      headerBorder: "1px solid #1f2937",
      headerFontWeight: "700",
      headerLetterSpacing: "0",
      contactInfoDisplay: "block",
      contactInfoJustify: "center",
      sectionBorder: "1px solid #e5e7eb",
      sectionHeadingWeight: "700",
      itemTitleColor: "#1f2937",
      itemTitleSize: "1.05em",
      itemCompanyColor: "#374151",
      itemCompanyWeight: "600",
      dateColor: "#6b7280",
      dateStyle: "font-style: italic;",
      skillCategoryColor: "#1f2937",
      skillCategoryWeight: "700",
      skillItemStyle: "",
      descriptionColor: "#4b5563",
      technologiesColor: "#6b7280",
      bulletStyle: "default",
      itemLeftBorder: "",
    },
    creative: {
      fontFamily: "'Montserrat', 'Helvetica', sans-serif",
      textColor: "#333",
      backgroundColor: "#ffffff",
      primaryColor: "#7c3aed",
      secondaryTextColor: "#666",
      headerAlignment: "left",
      headerBorder: "none",
      headerFontWeight: "800",
      headerLetterSpacing: "1px",
      contactInfoDisplay: "flex",
      contactInfoJustify: "flex-start",
      sectionBorder: "none",
      sectionHeadingWeight: "700",
      itemTitleColor: "#7c3aed",
      itemTitleSize: "1.15em",
      itemCompanyColor: "#374151",
      itemCompanyWeight: "600",
      dateColor: "#6b7280",
      dateStyle:
        "border-radius: 15px; background-color: #f3f4f6; padding: 2px 8px;",
      skillCategoryColor: "#7c3aed",
      skillCategoryWeight: "700",
      skillItemStyle:
        "background-color: #f3f4f6; padding: 3px 8px; border-radius: 4px; margin-bottom: 5px;",
      descriptionColor: "#4b5563",
      technologiesColor: "#6b7280",
      bulletStyle: "custom",
      headerExtraStyles:
        "background-color: #f9fafb; padding: 20px; border-radius: 8px;",
      itemLeftBorder: "",
    },
    minimal: {
      fontFamily: "'Inter', 'Arial', sans-serif",
      textColor: "#333",
      backgroundColor: "#ffffff",
      primaryColor: "#111827",
      secondaryTextColor: "#666",
      headerAlignment: "left",
      headerBorder: "1px solid #e5e7eb",
      headerFontWeight: "400",
      headerLetterSpacing: "0",
      contactInfoDisplay: "flex",
      contactInfoJustify: "flex-start",
      sectionBorder: "none",
      sectionHeadingWeight: "500",
      itemTitleColor: "#111827",
      itemTitleSize: "1em",
      itemCompanyColor: "#374151",
      itemCompanyWeight: "400",
      dateColor: "#6b7280",
      dateStyle: "",
      skillCategoryColor: "#111827",
      skillCategoryWeight: "500",
      skillItemStyle: "",
      descriptionColor: "#4b5563",
      technologiesColor: "#6b7280",
      bulletStyle: "default",
      itemLeftBorder: "2px solid #e5e7eb",
    },
  };
  return templates[templateName] || templates.modern;
}
module.exports = router;