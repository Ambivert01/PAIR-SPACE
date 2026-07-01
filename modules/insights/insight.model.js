import mongoose from "mongoose";

const insightSchema = new mongoose.Schema(
  {
    relationshipId: { type: mongoose.Schema.Types.ObjectId, ref: "Relationship", required: true },
    insightType: {
      type: String,
      enum: [
        "communication_frequency","conversation_balance","response_time_pattern",
        "shared_activity_frequency","memory_creation_frequency","habit_consistency",
        "planner_alignment","call_frequency","positivity_trend","engagement_trend",
        "milestone_progress","shared_time_estimation",
      ],
      required: true,
    },
    title:       { type: String, required: true },
    description: { type: String, default: "" },
    score:       { type: Number, min: 0, max: 100, default: 50 },
    trend:       { type: String, enum: ["up","down","neutral"], default: "neutral" },
    metadata:    { type: mongoose.Schema.Types.Mixed, default: {} },
    period:      { type: String, enum: ["daily","weekly","monthly"], default: "weekly" },
    periodStart: { type: Date, required: true },
    periodEnd:   { type: Date, required: true },
  },
  { timestamps: true }
);

insightSchema.index({ relationshipId: 1, createdAt: -1 });
insightSchema.index({ relationshipId: 1, insightType: 1, periodStart: -1 });

const RelationshipInsight = mongoose.model("RelationshipInsight", insightSchema);
export default RelationshipInsight;
