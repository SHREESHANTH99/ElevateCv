const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const Application = require("../models/Application");
const inMemoryStorage = require("../utils/inMemoryStorage");

const router = express.Router();

/**
 * 📊 GET /api/applications/stats
 * Aggregates application metrics (counts by status, conversion rates).
 */
router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    let apps = [];

    if (process.env.USE_IN_MEMORY_STORAGE === "true") {
      apps = await inMemoryStorage.findApplicationsByUserId(userId);
    } else {
      apps = await Application.find({ userId }).lean();
    }

    const byStatus = {
      Bookmarked: 0,
      Applied: 0,
      Interviewing: 0,
      Offered: 0,
      Rejected: 0,
    };

    apps.forEach((app) => {
      if (byStatus[app.status] !== undefined) {
        byStatus[app.status]++;
      }
    });

    const total = apps.length;
    const active = byStatus.Applied + byStatus.Interviewing + byStatus.Offered;
    const postAppliedCount = byStatus.Applied + byStatus.Interviewing + byStatus.Offered + byStatus.Rejected;

    const interviewRate =
      postAppliedCount > 0
        ? Math.round(((byStatus.Interviewing + byStatus.Offered) / postAppliedCount) * 100)
        : 0;

    const offerRate = total > 0 ? Math.round((byStatus.Offered / total) * 100) : 0;
    const rejectionRate =
      postAppliedCount > 0 ? Math.round((byStatus.Rejected / postAppliedCount) * 100) : 0;

    res.json({
      total,
      active,
      byStatus,
      interviewRate,
      offerRate,
      rejectionRate,
    });
  } catch (error) {
    console.error("Get application stats error:", error);
    res.status(500).json({ message: "Failed to calculate application statistics" });
  }
});

/**
 * 📋 GET /api/applications
 * Lists all applications for current user with optional status filter.
 */
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    if (process.env.USE_IN_MEMORY_STORAGE === "true") {
      const applications = await inMemoryStorage.findApplicationsByUserId(userId, status);
      return res.json({ applications, total: applications.length });
    }

    const filter = { userId };
    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ applications, total: applications.length });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

/**
 * 🔍 GET /api/applications/:id
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (process.env.USE_IN_MEMORY_STORAGE === "true") {
      const application = await inMemoryStorage.findApplicationById(id, userId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      return res.json({ application });
    }

    const application = await Application.findOne({ _id: id, userId }).lean();
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ application });
  } catch (error) {
    console.error("Get application error:", error);
    res.status(500).json({ message: "Failed to fetch application" });
  }
});

/**
 * ➕ POST /api/applications
 * Creates a new job application.
 */
router.post(
  "/",
  auth,
  [
    body("company").trim().notEmpty().withMessage("Company name is required"),
    body("role").trim().notEmpty().withMessage("Role / Position title is required"),
    body("status")
      .optional()
      .isIn(["Bookmarked", "Applied", "Interviewing", "Offered", "Rejected"])
      .withMessage("Invalid application status"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.user._id;
      const {
        company,
        role,
        jobDescription,
        status = "Bookmarked",
        resumeVersionId,
        resumeVersionLabel,
        notes,
        salary,
        location,
        url,
        appliedDate,
      } = req.body;

      const appPayload = {
        userId,
        company,
        role,
        jobDescription: jobDescription || "",
        status,
        resumeVersionId: resumeVersionId || null,
        resumeVersionLabel: resumeVersionLabel || "",
        notes: notes || "",
        salary: salary || "",
        location: location || "",
        url: url || "",
        appliedDate: appliedDate ? new Date(appliedDate) : status === "Applied" ? new Date() : null,
      };

      if (process.env.USE_IN_MEMORY_STORAGE === "true") {
        const newApp = await inMemoryStorage.createApplication(appPayload);
        return res.status(201).json({
          message: "Application tracked successfully",
          application: newApp,
        });
      }

      const newApp = new Application(appPayload);
      await newApp.save();

      res.status(201).json({
        message: "Application tracked successfully",
        application: newApp,
      });
    } catch (error) {
      console.error("Create application error:", error);
      res.status(500).json({ message: "Failed to create application", error: error.message });
    }
  }
);

/**
 * ✏️ PUT /api/applications/:id
 * Updates an existing job application.
 */
router.put("/:id", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.status === "Applied" && !updates.appliedDate) {
      updates.appliedDate = new Date();
    }

    if (process.env.USE_IN_MEMORY_STORAGE === "true") {
      const updated = await inMemoryStorage.updateApplication(id, userId, updates);
      if (!updated) {
        return res.status(404).json({ message: "Application not found" });
      }
      return res.json({
        message: "Application updated successfully",
        application: updated,
      });
    }

    const updated = await Application.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({
      message: "Application updated successfully",
      application: updated,
    });
  } catch (error) {
    console.error("Update application error:", error);
    res.status(500).json({ message: "Failed to update application" });
  }
});

/**
 * 🗑️ DELETE /api/applications/:id
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (process.env.USE_IN_MEMORY_STORAGE === "true") {
      const deleted = await inMemoryStorage.deleteApplication(id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Application not found" });
      }
      return res.json({ message: "Application deleted successfully" });
    }

    const deleted = await Application.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("Delete application error:", error);
    res.status(500).json({ message: "Failed to delete application" });
  }
});

module.exports = router;
