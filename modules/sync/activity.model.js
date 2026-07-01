import mongoose from "mongoose";

const ACTIVITY_TYPES = [
  "watch_together", "listen_together", "focus_session", "study_session",
  "game_session", "planning_session", "memory_creation_session",
  "reading_session", "custom_session",
];

const activitySchema = new mongoose.Schema(
  {
    relationshipId: { type: mongoose.Schema.Types.ObjectId, ref: "Relationship", required: true },
    activityType:   { type: String, enum: ACTIVITY_TYPES, required: true },
    createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["created", "active", "paused", "ended", "cancelled"],
      default: "created",
    },
    startedAt: { type: Date, default: null },
    endedAt:   { type: Date, default: null },
    state: {
      currentTime:  { type: Number, default: 0 },
      duration:     { type: Number, default: 0 },
      paused:       { type: Boolean, default: true },
      playbackRate: { type: Number, default: 1 },
      volume:       { type: Number, default: 1 },
    },
    metadata: {
      title:       { type: String, default: "" },
      description: { type: String, default: "" },
      externalUrl: { type: String, default: "" },
      mediaId:     { type: mongoose.Schema.Types.ObjectId, ref: "Media", default: null },
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

activitySchema.index({ relationshipId: 1, status: 1 });
activitySchema.index({ relationshipId: 1, createdAt: -1 });

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
