const mongoose = require("mongoose");

const resumeVersionSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    label: {
      type: String,
      default: "Snapshot",
      trim: true,
    },
    snapshotData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    atsScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    dimensionScores: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        keywordMatch: 0,
        requiredSkills: 0,
        experience: 0,
        projects: 0,
        quantification: 0,
        structure: 0,
        education: 0,
        summary: 0,
      }),
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

resumeVersionSchema.index({ resumeId: 1, versionNumber: 1 }, { unique: true });

module.exports = mongoose.model("ResumeVersion", resumeVersionSchema);
