import mongoose from "mongoose";
import { GIFT_TYPES } from "../../shared/constants/giftTypes.js";

const giftSchema = new mongoose.Schema(
  {
    relationshipId:      { type: mongoose.Schema.Types.ObjectId, ref: "Relationship", required: true },
    senderId:            { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    giftType:            { type: String, enum: GIFT_TYPES.map((t) => t.value), required: true },
    title:               { type: String, maxlength: 120, default: "" },
    message:             { type: String, maxlength: 1000, default: "" },
    mediaId:             { type: mongoose.Schema.Types.ObjectId, ref: "Media", default: null },
    revealMode:          { type: String, enum: ["instant","scheduled","countdown"], default: "instant" },
    scheduledRevealTime: { type: Date, default: null },
    countdownDays:       { type: Number, default: 0 },
    revealAnimation:     { type: String, default: "confetti" },
    opened:              { type: Boolean, default: false },
    openedAt:            { type: Date, default: null },
    reaction:            { type: String, default: "" },
  },
  { timestamps: true }
);

giftSchema.index({ relationshipId: 1, createdAt: -1 });
giftSchema.index({ scheduledRevealTime: 1, opened: 1 });

const Gift = mongoose.model("Gift", giftSchema);
export default Gift;
