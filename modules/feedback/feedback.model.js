/**
 * Feedback Model
 *
 * Stores user feedback and bug reports during beta testing
 */

import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    relationshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Relationship",
      index: true,
    },
    type: {
      type: String,
      enum: ["feedback", "bug", "feature_request", "improvement"],
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        "general",
        "chat",
        "memories",
        "activities",
        "games",
        "planner",
        "ai",
        "onboarding",
        "ui_ux",
        "performance",
        "other",
      ],
      default: "general",
    },
    // Feedback content
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    // Structured feedback (from form)
    likedMost: String,
    confusedBy: String,
    feltUnnecessary: String,
    mostUsedFeature: String,
    wouldImprove: String,
    // Rating (1-5)
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    // Context
    page: String, // Which page user was on
    userAgent: String,
    deviceInfo: {
      browser: String,
      os: String,
      device: String,
      viewport: String,
    },
    // Status tracking
    status: {
      type: String,
      enum: [
        "new",
        "reviewing",
        "in_progress",
        "resolved",
        "wont_fix",
        "duplicate",
      ],
      default: "new",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true,
    },
    // Admin notes
    adminNotes: String,
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Attachments (screenshots, etc.)
    attachments: [
      {
        url: String,
        type: String,
        filename: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient queries
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ status: 1, priority: -1 });
feedbackSchema.index({ type: 1, status: 1 });

// Virtual for age
feedbackSchema.virtual("age").get(function () {
  return Date.now() - this.createdAt;
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
