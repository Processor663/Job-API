const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
    location: {
      type: String,
      required: [true, "Job location is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Remote"],
      default: "Full-time",
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    salary: {
      type: Number,
      min: [0, "Salary cannot be negative"],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // optional if you track which user posted it
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "Closed", "Paused"],
      default: "Open",
    },
    applyLink: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt and updatedAt automatically
  },
);

// Optional: add indexes for common queries
jobSchema.index({ title: "text", company: "text", location: "text" });

module.exports = mongoose.model("Job", jobSchema);