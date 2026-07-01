import mongoose from "mongoose";

const insightSchema = new mongoose.Schema(
  {
    relationshipId: { type: mongoose.Schema.Types.ObjectId, ref: "Relationship", required: true },
    type: {
      type: String,
      enum: [
        "communication_slowdown", "frequent_late_replies", "special_date_approaching",
        "partner_stressed", "conversation_intensity", "communication_imbalance",
        "milestone_reached", "activity_suggestion", "memory_highlight",
        "gratitude_reminder", "celebration_reminder", "habit_encouragement",
        "weekly_summary", "icebreaker_suggestion", "appreciation_reminder",
      ],
      required: true,
    },
    title:            { type: String, required: true, maxlength: 120 },
    description:      { type: String, default: "", maxlength: 500 },
    suggestion:       { type: String, default: "" },
    confidence:       { type: Number, min: 0, max: 1, default: 0.7 },
    read:             { type: Boolean, default: false },
    dismissed:        { type: Boolean, default: false },
    contextReference: { type: String, default: "" },
  },
  { timestamps: true }
);

insightSchema.index({ relationshipId: 1, dismissed: 1, createdAt: -1 });

const AIInsight = mongoose.model("AIInsight", insightSchema);
export default AIInsight;
