import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    relationshipId: { type: mongoose.Schema.Types.ObjectId, ref: "Relationship", required: true },
    startedBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    callType:       { type: String, enum: ["voice", "video", "screen_share", "mixed"], default: "voice" },
    status: {
      type: String,
      enum: ["initiated", "ringing", "accepted", "rejected", "missed", "ended", "failed", "reconnecting"],
      default: "initiated",
    },
    startedAt:  { type: Date, default: Date.now },
    endedAt:    { type: Date, default: null },
    duration:   { type: Number, default: 0 }, // seconds
    metadata: {
      reconnectCount:    { type: Number, default: 0 },
      networkQualityLogs: [{ type: String }],
    },
  },
  { timestamps: true }
);

callSchema.index({ relationshipId: 1, startedAt: -1 });

const Call = mongoose.model("Call", callSchema);
export default Call;
