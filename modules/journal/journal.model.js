import mongoose from "mongoose";
import { JOURNAL_ENTRY_TYPES } from "../../shared/constants/journalPrompts.js";

const responseSchema = new mongoose.Schema({
  authorId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content:   { type: String, required: true, maxlength: 3000 },
  createdAt: { type: Date, default: Date.now },
});

const reactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  emoji:  { type: String },
});

const journalSchema = new mongoose.Schema(
  {
    relationshipId: { type: mongoose.Schema.Types.ObjectId, ref: "Relationship", required: true },
    authorId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type:           { type: String, enum: JOURNAL_ENTRY_TYPES.map((t) => t.value), required: true },
    title:          { type: String, maxlength: 120, default: "" },
    content:        { type: String, maxlength: 10000, required: true },
    emotionTag:     { type: String, default: "calm" },
    visibility: {
      type: String,
      enum: ["shared", "private_to_author", "visible_after_response", "visible_after_date"],
      default: "shared",
    },
    scheduledOpenDate: { type: Date, default: null },
    attachments:    [{ type: mongoose.Schema.Types.ObjectId, ref: "Media" }],
    responses:      [responseSchema],
    reactions:      [reactionSchema],
    bookmarkedBy:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    deleted:        { type: Boolean, default: false },
    convertedToMemoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Memory", default: null },
  },
  { timestamps: true }
);

journalSchema.index({ relationshipId: 1, createdAt: -1 });
journalSchema.index({ authorId: 1 });

const JournalEntry = mongoose.model("JournalEntry", journalSchema);
export default JournalEntry;
