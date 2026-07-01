import mongoose from "mongoose";

const relationshipSchema = new mongoose.Schema(
  {
    user1Id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    user2Id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "active", "rejected", "cancelled", "ended", "blocked", "archived"],
      default: "pending",
    },
    relationshipType: {
      type: String,
      enum: ["romantic", "couple", "best_friend", "partner", "friend", "family", "study_partner", "mentor", "custom"],
      default: "couple",
    },
    nickname:             { type: String, default: "", maxlength: 60 },
    anniversaryDate:      { type: Date, default: null },
    pinned:               { type: Boolean, default: false },
    mutedNotifications:   { type: Boolean, default: false },
    settings: {
      allowMemories:        { type: Boolean, default: true },
      allowLocationSharing: { type: Boolean, default: false },
      allowActivityTracking:{ type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Index for fast user relationship lookups
relationshipSchema.index({ user1Id: 1, status: 1 });
relationshipSchema.index({ user2Id: 1, status: 1 });

const Relationship = mongoose.model("Relationship", relationshipSchema);
export default Relationship;
