import mongoose from "mongoose";
import { MEMORY_TYPES, EMOTION_TAGS, MEMORY_VISIBILITY } from "../../shared/constants/memoryTypes.js";

const commentSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text:      { type: String, maxlength: 500, required: true },
  createdAt: { type: Date, default: Date.now },
});

const reactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  emoji:  { type: String },
});

const memorySchema = new mongoose.Schema(
  {
    relationshipId: { type: mongoose.Schema.Types.ObjectId, ref: "Relationship", required: true },
    creatorId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type:           { type: String, enum: MEMORY_TYPES, required: true },
    title:          { type: String, maxlength: 120, default: "" },
    description:    { type: String, maxlength: 2000, default: "" },
    emotionTag:     { type: String, enum: EMOTION_TAGS, default: "happy" },
    mediaIds:       [{ type: mongoose.Schema.Types.ObjectId, ref: "Media" }],
    location: {
      lat:  { type: Number, default: null },
      lng:  { type: Number, default: null },
      name: { type: String, default: "" },
    },
    tags:        [{ type: String, maxlength: 40 }],
    visibility:  { type: String, enum: MEMORY_VISIBILITY, default: "visible" },
    pinned:      { type: Boolean, default: false },
    favoritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reactions:   [reactionSchema],
    comments:    [commentSchema],
    deleted:     { type: Boolean, default: false },
    memoryDate:  { type: Date, default: Date.now },
    lockPin:     { type: String, default: null, select: false },
    lockedAt:    { type: Date, default: null },
  },
  { timestamps: true }
);

memorySchema.index({ relationshipId: 1, memoryDate: -1 });
memorySchema.index({ relationshipId: 1, emotionTag: 1 });
memorySchema.index({ relationshipId: 1, pinned: -1, memoryDate: -1 });

const Memory = mongoose.model("Memory", memorySchema);

export default Memory;
