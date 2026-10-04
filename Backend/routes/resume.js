const express = require("express");
const { body, validationResult } = require("express-validator");
const puppeteer = require("puppeteer");
const Resume = require("../models/Resume");
const ResumeVersion = require("../models/ResumeVersion");
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
      ).lean();
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
    }).lean();
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.json({ resume });
  } catch (error) {
    console.error("Get resume error:", error);
    res.status(500).json({ message: "Server error while fetching resume" });
  }
});

/**
 * 🏷️ RESUME VERSIONING: GET COMPARE (Diff two versions)
 */
router.get("/:id/versions/compare", auth, async (req, res) => {
  try {
    const { v1, v2 } = req.query;
    if (!v1 || !v2) {
      return res.status(400).json({ message: "Both v1 and v2 parameters are required (version numbers or IDs)." });
    }

    const resumeId = req.params.id;
    const userId = req.user._id;

    let ver1, ver2;
    if (process.env.USE_IN_MEMORY_STORAGE === "true") {
      ver1 = await inMemoryStorage.findResumeVersionByIdOrNumber(v1, resumeId, userId);
      ver2 = await inMemoryStorage.findResumeVersionByIdOrNumber(v2, resumeId, userId);
    } else {
      const findVersion = async (val) => {
        if (val.match(/^[0-9a-fA-F]{24}$/)) {
          const byId = await ResumeVersion.findOne({ _id: val, resumeId, userId }).lean();
          if (byId) return byId;
        }
        const num = parseInt(val, 10);
        if (!isNaN(num)) {
          return await ResumeVersion.findOne({ versionNumber: num, resumeId, userId }).lean();
        }
        return null;
      };
      [ver1, ver2] = await Promise.all([findVersion(v1), findVersion(v2)]);
    }

    if (!ver1 || !ver2) {
      return res.status(404).json({ message: "One or both specified resume versions were not found." });
    }

    const scoreDelta = (ver2.atsScore || 0) - (ver1.atsScore || 0);

    const dims1 = ver1.dimensionScores || {};
    const dims2 = ver2.dimensionScores || {};
    const dimensionKeys = [
      "keywordMatch",
      "requiredSkills",
      "experience",
      "projects",
      "quantification",
      "structure",
      "education",
      "summary",
    ];

    const dimensionDeltas = {};
    const dimensionComparison = {};
    for (const dim of dimensionKeys) {
      const s1 = dims1[dim] ?? 0;
      const s2 = dims2[dim] ?? 0;
      dimensionDeltas[dim] = s2 - s1;
      dimensionComparison[dim] = { v1: s1, v2: s2, delta: s2 - s1 };
    }

    // Field-by-field diff
    const data1 = ver1.snapshotData || {};
    const data2 = ver2.snapshotData || {};

    const getBullets = (exps = []) =>
      exps.flatMap((e) =>
        Array.isArray(e.description)
          ? e.description
          : typeof e.description === "string"
          ? [e.description]
          : []
      );
    const bullets1 = getBullets(data1.experiences || []);
    const bullets2 = getBullets(data2.experiences || []);
    const b1Set = new Set(bullets1.map((b) => (b || "").trim().toLowerCase()));
    const b2Set = new Set(bullets2.map((b) => (b || "").trim().toLowerCase()));

    const getSkillNames = (skills = []) =>
      skills
        .map((s) => (typeof s === "string" ? s.trim() : (s?.name || "").trim()))
        .filter(Boolean);
    const s1 = getSkillNames(data1.skills || []);
    const s2 = getSkillNames(data2.skills || []);
    const s1Set = new Set(s1.map((s) => s.toLowerCase()));
    const s2Set = new Set(s2.map((s) => s.toLowerCase()));

    const fieldChanges = {
      summaryChanged: (data1.summary || "").trim() !== (data2.summary || "").trim(),
      experiences: {
        totalBulletsV1: bullets1.length,
        totalBulletsV2: bullets2.length,
        bulletsAdded: bullets2.filter((b) => !b1Set.has((b || "").trim().toLowerCase())),
        bulletsRemoved: bullets1.filter((b) => !b2Set.has((b || "").trim().toLowerCase())),
      },
      skills: {
        added: s2.filter((s) => !s1Set.has(s.toLowerCase())),
        removed: s1.filter((s) => !s2Set.has(s.toLowerCase())),
        retained: s2.filter((s) => s1Set.has(s.toLowerCase())),
      },
      projectsChanged:
        JSON.stringify(data1.projects || []) !== JSON.stringify(data2.projects || []),
    };

    res.json({
      v1: {
        id: ver1._id,
        versionNumber: ver1.versionNumber,
        label: ver1.label,
        atsScore: ver1.atsScore,
        dimensionScores: ver1.dimensionScores,
        createdAt: ver1.createdAt,
      },
      v2: {
        id: ver2._id,
        versionNumber: ver2.versionNumber,
        label: ver2.label,
        atsScore: ver2.atsScore,
        dimensionScores: ver2.dimensionScores,
        createdAt: ver2.createdAt,
      },
      scoreDelta,
      dimensionDeltas,
      dimensionComparison,
      fieldChanges,
    });
  } catch (error) {
    console.error("Compare versions error:", error);
    res.status(500).json({ message: "Failed to compare resume versions", error: error.message });
  }
});

/**
 * 🏷️ RESUME VERSIONING: GET ALL VERSIONS
 */
router.get("/:id/versions", auth, async (req, res) => {
  try {
    const resumeId = req.params.id;
    const userId = req.user._id;

    if (process.env.USE_IN_MEMORY_STORAGE === "true") {
      const versions = await inMemoryStorage.findResumeVersionsByResumeId(resumeId, userId);
      const scoreProgression = versions
        .map((v) => ({
          versionNumber: v.versionNumber,
          label: v.label,
          atsScore: v.atsScore,
          createdAt: v.createdAt,
        }))
        .reverse();

      return res.json({
        versions,
        totalVersions: versions.length,
        scoreProgression,
      });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId }).lean();
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const versions = await ResumeVersion.find({ resumeId, userId })
      .sort({ versionNumber: -1 })
      .lean();

    // Calculate progression overview
    const scoreProgression = versions
      .map((v) => ({
        versionNumber: v.versionNumber,
        label: v.label,
        atsScore: v.atsScore,
        createdAt: v.createdAt,
      }))
      .reverse();

    res.json({
      versions,
      totalVersions: versions.length,
      scoreProgression,
    });
  } catch (error) {
    console.error("Get resume versions error:", error);
    res.status(500).json({ message: "Failed to fetch resume versions" });
  }
});

/**
 * 🏷️ RESUME VERSIONING: CREATE SNAPSHOT VERSION
 */
router.post("/:id/versions", auth, async (req, res) => {
  try {
    const resumeId = req.params.id;
    const userId = req.user._id;

    let resume;
    if (process.env.USE_IN_MEMORY_STORAGE === "true") {
      resume = await inMemoryStorage.findResumeById(resumeId);
    } else {
      resume = await Resume.findOne({ _id: resumeId, userId }).lean();
    }

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const { label, snapshotData: customSnapshot, atsScore, dimensionScores } = req.body;
    const snapshotData = customSnapshot || resume;

    let nextVersionNumber = 1;
    if (process.env.USE_IN_MEMORY_STORAGE === "true") {
      const existing = await inMemoryStorage.findResumeVersionsByResumeId(resumeId, userId);
      nextVersionNumber = existing.length > 0 ? existing[0].versionNumber + 1 : 1;
    } else {
      const latestVersion = await ResumeVersion.findOne({ resumeId, userId })
        .sort({ versionNumber: -1 })
        .select("versionNumber")
        .lean();
      nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
    }

    const versionLabel = label?.trim() || `v${nextVersionNumber} Snapshot`;

    const finalDimensions = dimensionScores || {
      keywordMatch: 70,
      requiredSkills: 75,
      experience: 80,
      projects: 70,
      quantification: 65,
      structure: 90,
      education: 85,
      summary: 75,
    };

    const finalAtsScore =
      typeof atsScore === "number"
        ? Math.max(0, Math.min(100, Math.round(atsScore)))
        : Math.round(
            (finalDimensions.keywordMatch * 0.25 +
              finalDimensions.requiredSkills * 0.2 +
              finalDimensions.experience * 0.15 +
              finalDimensions.projects * 0.15 +
              finalDimensions.quantification * 0.1 +
              finalDimensions.structure * 0.05 +
              finalDimensions.education * 0.05 +
              finalDimensions.summary * 0.05)
          );

    if (process.env.USE_IN_MEMORY_STORAGE === "true") {
      const newVer = await inMemoryStorage.createResumeVersion({
        resumeId,
        userId,
        versionNumber: nextVersionNumber,
        label: versionLabel,
        snapshotData,
        atsScore: finalAtsScore,
        dimensionScores: finalDimensions,
      });
      return res.status(201).json({
        message: "Resume version snapshot created successfully",
        version: newVer,
      });
    }

    const newVersion = new ResumeVersion({
      resumeId,
      userId,
      versionNumber: nextVersionNumber,
      label: versionLabel,
      snapshotData,
      atsScore: finalAtsScore,
      dimensionScores: finalDimensions,
    });

    await newVersion.save();

    res.status(201).json({
      message: "Resume version snapshot created successfully",
      version: newVersion,
    });
  } catch (error) {
    console.error("Create resume version error:", error);
    res.status(500).json({ message: "Failed to create resume version snapshot", error: error.message });
  }
});

/**
 * 🏷️ RESUME VERSIONING: RESTORE SNAPSHOT
 */
router.post("/:id/versions/:versionId/restore", auth, async (req, res) => {
  try {
    const { id: resumeId, versionId } = req.params;
    const userId = req.user._id;

    let version;
    if (process.env.USE_IN_MEMORY_STORAGE === "true") {
      version = await inMemoryStorage.findResumeVersionByIdOrNumber(versionId, resumeId, userId);
      if (!version) {
        return res.status(404).json({ message: "Snapshot version not found" });
      }
      const updated = await inMemoryStorage.updateResume(resumeId, {
        title: version.snapshotData.title || "My Resume",
        personalInfo: version.snapshotData.personalInfo,
        summary: version.snapshotData.summary,
        experiences: version.snapshotData.experiences,
        education: version.snapshotData.education,
        skills: version.snapshotData.skills,
        projects: version.snapshotData.projects,
        template: version.snapshotData.template || "modern",
      });
      return res.json({
        message: `Restored resume to version ${version.versionNumber} (${version.label})`,
        resume: updated,
      });
    }

    version = await ResumeVersion.findOne({
      _id: versionId,
      resumeId,
      userId,
    }).lean();

    if (!version) {
      return res.status(404).json({ message: "Snapshot version not found" });
    }

    const { snapshotData } = version;
    const updated = await Resume.findOneAndUpdate(
      { _id: resumeId, userId },
      {
        $set: {
          title: snapshotData.title || "My Resume",
          personalInfo: snapshotData.personalInfo,
          summary: snapshotData.summary,
          experiences: snapshotData.experiences,
          education: snapshotData.education,
          skills: snapshotData.skills,
          projects: snapshotData.projects,
          template: snapshotData.template || "modern",
        },
      },
      { new: true }
    );

    res.json({
      message: `Restored resume to version ${version.versionNumber} (${version.label})`,
      resume: updated,
    });
  } catch (error) {
    console.error("Restore version error:", error);
    res.status(500).json({ message: "Failed to restore resume version" });
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
        const isUpdate = req.body._id;
        if (isUpdate) {
          const updated = await inMemoryStorage.updateResume(req.body._id, {
            ...req.body,
            userId: req.user._id,
          });
          return res.status(200).json({
            success: true,
            message: "Resume updated successfully",
            resume: updated,
            _id: updated._id,
          });
        } else {
          const created = await inMemoryStorage.createResume({
            ...req.body,
            userId: req.user._id,
          });
          return res.status(201).json({
            success: true,
            message: "Resume created successfully",
            resume: created,
            _id: created._id,
          });
        }
      }
      const isUpdate = req.body._id;
      let resumeData;
      if (isUpdate) {
        const existingResume = await Resume.findOne({
          _id: req.body._id,
          userId: req.user._id,
        }).lean();
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
          ).lean();
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
      ).lean();
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
    }).lean();
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

    // Check if Puppeteer is available in this environment
    // Warm browser handles availability checks now.

    const resumeId = req.params.id || req.query.id;
    const query = resumeId
      ? { _id: resumeId, userId: req.user._id }
      : { userId: req.user._id };
    const resume = await Resume.findOne(query).lean();
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

      const { acquireBrowser, releaseBrowser } = require("../utils/puppeteerService");
      console.log("🚀 Attempting to acquire worker from pool...");
      const t0_browser = performance.now();
      const browser = await acquireBrowser();
      console.log(`✅ Worker acquired in ${(performance.now() - t0_browser).toFixed(2)}ms`);
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
          if (page && !page.isClosed()) {
            await page.close();
          }
          if (browser) {
            await releaseBrowser(browser);
          }
        } catch (pageCloseError) {
          console.error("Error cleaning up worker:", pageCloseError);
        }
      }
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);

      // Fallback: return HTML for client-side PDF generation
      if (
        pdfError.message.includes("browser") ||
        pdfError.message.includes("executable")
      ) {
        try {
          const html = generateResumeHTML(resume);
          return res.status(200).json({
            success: true,
            fallback: true,
            message:
              "PDF generation unavailable. Returning HTML for client-side generation.",
            html: html,
            resumeData: resume,
          });
        } catch (fallbackError) {
          console.error("Fallback HTML generation error:", fallbackError);
        }
      }

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
          font-size: 12px;
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
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 4px;
          letter-spacing: -0.5px;
        }
        .headline {
          font-size: 14px;
          color: #1d4ed8;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .contact-info {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          color: #6b7280;
          font-size: 10px;
        }
        .contact-item {
          display: flex;
          align-items: center;
          margin-right: 12px;
        }
        .contact-item svg {
          width: 10px;
          height: 10px;
          margin-right: 4px;
          fill: currentColor;
        }
        .contact-link {
          color: #2563eb;
          text-decoration: none;
        }
        .contact-link:hover {
          text-decoration: underline;
        }
        .section {
          margin-bottom: 20px;
          margin-top: 16px;
          page-break-inside: avoid;
        }
        .section h2 {
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 6px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
        }
        .section h2::before {
          content: '';
          display: block;
          width: 3px;
          height: 16px;
          background-color: #2563eb;
          border-radius: 2px;
          margin-right: 8px;
        }
        .summary-text {
          font-size: 13px;
          line-height: 1.5;
          color: #374151;
        }
        .experience-item, .education-item, .project-item {
          margin-bottom: 16px;
          position: relative;
          padding-left: 16px;
          border-left: 2px solid #dbeafe;
        }
        .experience-item::before {
          content: '';
          position: absolute;
          left: -4px;
          top: 4px;
          width: 8px;
          height: 8px;
          background-color: #3b82f6;
          border-radius: 50%;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 6px;
        }
        .item-title {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }
        .item-company {
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 4px;
        }
        .item-date {
          font-size: 11px;
          font-weight: 500;
          color: #2563eb;
          background-color: #eff6ff;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
        }
        .description {
          font-size: 12px;
          color: #374151;
          line-height: 1.4;
        }
        .description ul {
          list-style: none;
          padding: 0;
        }
        .description li {
          margin-bottom: 3px;
          position: relative;
          padding-left: 12px;
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
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
        }
        .skill-category h3 {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }
        .skill-list {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.3;
        }
        .content-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          flex-grow: 1;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header class="header">
          <h1>${resume.personalInfo.fullName}</h1>
          ${
            resume.personalInfo.headline
              ? `<p class="headline">${resume.personalInfo.headline}</p>`
              : ""
          }
          <div class="contact-info">
            <span class="contact-item">
              <svg viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
              <a href="mailto:${
                resume.personalInfo.email
              }" class="contact-link">${resume.personalInfo.email}</a>
            </span>
            <span class="contact-item">
              <svg viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
              <a href="tel:${resume.personalInfo.phone}" class="contact-link">${
    resume.personalInfo.phone
  }</a>
            </span>
            <span class="contact-item">
              <svg viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>
              ${resume.personalInfo.location}
            </span>
            ${
              resume.personalInfo.linkedin
                ? `
              <span class="contact-item">
                <svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                <a href="${
                  resume.personalInfo.linkedin.startsWith("http")
                    ? resume.personalInfo.linkedin
                    : "https://linkedin.com/in/" + resume.personalInfo.linkedin
                }" class="contact-link" target="_blank">LinkedIn</a>
              </span>
            `
                : ""
            }
            ${
              resume.personalInfo.website
                ? `
              <span class="contact-item">
                <svg viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.559-.499-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.559.499.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.497-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clip-rule="evenodd"></path></svg>
                <a href="${
                  resume.personalInfo.website.startsWith("http")
                    ? resume.personalInfo.website
                    : "https://" + resume.personalInfo.website
                }" class="contact-link" target="_blank">Website</a>
              </span>
            `
                : ""
            }
          </div>
        </header>
        ${
          resume.summary
            ? `
          <section class="section">
            <h2>Professional Summary</h2>
            <p class="summary-text">${resume.summary}</p>
          </section>
        `
            : ""
        }
        <div class="content-container">
          ${
            resume.experiences && resume.experiences.length > 0
              ? `
            <section class="section">
              <h2>Professional Experience</h2>
              ${resume.experiences
                .slice(0, 4)
                .map(
                  (exp) => `
                <div class="experience-item">
                  <div class="item-header">
                    <div>
                      <div class="item-title">${exp.position}</div>
                      <div class="item-company">${exp.company}${
                    exp.location ? " • " + exp.location : ""
                  }</div>
                    </div>
                    <div class="item-date">${exp.startDate} - ${
                    exp.current ? "Present" : exp.endDate
                  }</div>
                  </div>
                  ${
                    exp.description && exp.description.length > 0
                      ? `
                    <div class="description">
                      <ul>
                        ${exp.description
                          .slice(0, 3)
                          .map((desc) => `<li>${desc}</li>`)
                          .join("")}
                      </ul>
                    </div>
                  `
                      : ""
                  }
                </div>
              `
                )
                .join("")}
            </section>
          `
              : ""
          }
          ${
            resume.education && resume.education.length > 0
              ? `
            <section class="section">
              <h2>Education</h2>
              ${resume.education
                .slice(0, 3)
                .map(
                  (edu) => `
                <div class="education-item">
                  <div class="item-header">
                    <div>
                      <div class="item-title">${edu.degree} in ${
                    edu.field
                  }</div>
                      <div class="item-company">${edu.institution}</div>
                      ${
                        edu.gpa
                          ? `<div style="font-size: 11px; color: #6b7280;">GPA: ${edu.gpa}</div>`
                          : ""
                      }
                    </div>
                    <div class="item-date">${edu.startDate} - ${
                    edu.endDate || "Present"
                  }</div>
                  </div>
                </div>
              `
                )
                .join("")}
            </section>
          `
              : ""
          }
          ${
            resume.skills && resume.skills.length > 0
              ? `
            <section class="section">
              <h2>Skills</h2>
              <div class="skills-grid">
                ${Object.entries(
                  resume.skills.slice(0, 20).reduce((acc, skill) => {
                    if (!acc[skill.category]) acc[skill.category] = [];
                    acc[skill.category].push(
                      `${skill.name}${
                        skill.level ? " (" + skill.level + ")" : ""
                      }`
                    );
                    return acc;
                  }, {})
                )
                  .map(
                    ([category, skills]) => `
                  <div class="skill-category">
                    <h3>${category}</h3>
                    <div class="skill-list">${skills
                      .slice(0, 6)
                      .join(", ")}</div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </section>
          `
              : ""
          }
          ${
            resume.projects && resume.projects.length > 0
              ? `
            <section class="section">
              <h2>Projects</h2>
              ${resume.projects
                .slice(0, 3)
                .map(
                  (project) => `
                <div class="project-item">
                  <div class="item-header">
                    <div class="item-title">${project.name}</div>
                    <div class="item-date">${project.startDate} - ${
                    project.endDate || "Present"
                  }</div>
                  </div>
                  <div class="description">${project.description}</div>
                  ${
                    project.technologies && project.technologies.length > 0
                      ? `
                    <div class="description" style="font-style: italic; margin-top: 4px;">
                      <strong>Tech:</strong> ${project.technologies
                        .slice(0, 6)
                        .join(", ")}
                    </div>
                  `
                      : ""
                  }
                  ${
                    project.url
                      ? `
                    <div class="description" style="margin-top: 4px;">
                      <strong>URL:</strong> <a href="${
                        project.url.startsWith("http")
                          ? project.url
                          : "https://" + project.url
                      }" class="contact-link" target="_blank">${project.url}</a>
                    </div>
                  `
                      : ""
                  }
                  ${
                    project.github
                      ? `
                    <div class="description" style="margin-top: 4px;">
                      <strong>GitHub:</strong> <a href="${
                        project.github.startsWith("http")
                          ? project.github
                          : "https://github.com/" + project.github
                      }" class="contact-link" target="_blank">${
                          project.github
                        }</a>
                    </div>
                  `
                      : ""
                  }
                </div>
              `
                )
                .join("")}
            </section>
          `
              : ""
          }
        </div>
      </div>
    </body>
    </html>
  `;
}
module.exports = router;
