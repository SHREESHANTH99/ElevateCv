const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    jobDescription: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Bookmarked", "Applied", "Interviewing", "Offered", "Rejected"],
      default: "Bookmarked",
      index: true,
    },
    resumeVersionId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    resumeVersionLabel: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    salary: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
    appliedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model("Application", applicationSchema);
