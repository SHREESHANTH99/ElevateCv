const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    company: String,
    description: {
      type: String,
      required: true,
    },
    embedding: [Number], // Storing the vector from Python service
    parsedInfo: {
      skills: [String],
      responsibilities: [String],
      experienceLevel: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", jobSchema);
