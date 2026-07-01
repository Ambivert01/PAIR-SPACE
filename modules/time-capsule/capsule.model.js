import mongoose from "mongoose";
import { CAPSULE_TYPES, OPEN_CONDITIONS } from "../../shared/constants/capsuleTypes.js";

const capsuleSchema = new mongoose.Schema(
  {
    relationshipId: { type: mongoose.Schema.Types.ObjectId, ref: "Relationship", required: true },
    creatorId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    capsuleType:    { type: String, enum: CAPSULE_TYPES.map((t) => t.value), required: true },
    title:          { type: String, maxlength: 120, default: "" },
    message:        { type: String, maxlength: 10000, default: "" },
    mediaId:        { type: mongoose.Schema.Types.ObjectId, ref: "Media", default: null },
    openCondition:  { type: String, enum: OPEN_CONDITIONS.map((c) => c.value), default: "specific_date" },
    lockedUntil:    { type: Date, required: true },
    opened:         { type: Boolean, default: false },
    openedAt:       { type: Date, default: null },
    reaction:       { type: String, default: "" },
    convertedToMemoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Memory", default: null },
    deleted:        { type: Boolean, default: false },
  },
  { timestamps: true }
);

capsuleSchema.index({ relationshipId: 1, createdAt: -1 });
capsuleSchema.index({ lockedUntil: 1, opened: 1 });

const TimeCapsule = mongoose.model("TimeCapsule", capsuleSchema);
export default TimeCapsule;
