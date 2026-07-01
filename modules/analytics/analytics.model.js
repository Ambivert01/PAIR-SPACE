/**
 * Analytics Model
 *
 * Tracks user behavior and feature usage during beta
 */

import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema(
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
    // Event details
    eventType: {
      type: String,
      required: true,
      index: true,
      enum: [
        // User lifecycle
        "signup",
        "login",
        "logout",
        "onboarding_started",
        "onboarding_completed",
        "onboarding_skipped",
        // Relationship
        "relationship_created",
        "invite_sent",
        "invite_accepted",
        "invite_rejected",
        // Feature usage
        "message_sent",
        "memory_created",
        "activity_started",
        "game_played",
        "planner_event_created",
        "gift_sent",
        "capsule_created",
        "journal_entry_created",
        "ai_insight_viewed",
        // Engagement
        "page_view",
        "session_start",
        "session_end",
        "feature_clicked",
        "search_performed",
        // Other
        "error_occurred",
        "feedback_submitted",
      ],
    },
    eventCategory: {
      type: String,
      enum: [
        "auth",
        "onboarding",
        "relationship",
        "messaging",
        "memories",
        "activities",
        "games",
        "planner",
        "gifts",
        "journal",
        "ai",
        "navigation",
        "engagement",
        "error",
      ],
      required: true,
      index: true,
    },
    // Event metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Session info
    sessionId: {
      type: String,
      index: true,
    },
    // Device/browser info
    userAgent: String,
    deviceInfo: {
      browser: String,
      os: String,
      device: String,
      viewport: String,
    },
    // Location (optional)
    page: String,
    referrer: String,
    // Performance metrics
    duration: Number, // milliseconds
    loadTime: Number, // milliseconds
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient queries
analyticsEventSchema.index({ createdAt: -1 });
analyticsEventSchema.index({ eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ userId: 1, createdAt: -1 });
analyticsEventSchema.index({ sessionId: 1, createdAt: -1 });

// TTL index - auto-delete events older than 90 days
analyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

const AnalyticsEvent = mongoose.model("AnalyticsEvent", analyticsEventSchema);

export default AnalyticsEvent;
