/**
 * Mood Check-In Module
 *
 * Each partner shares a daily emoji mood so they can see how
 * the other is feeling even before a conversation starts.
 * Long-distance couples often feel disconnected not from lack of
 * talking, but from not knowing each other's emotional state.
 *
 * Simple: pick an emoji + optional short note. Both see each other's.
 * Resets at midnight in the user's timezone.
 */

import express from "express";
import mongoose from "mongoose";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import { verifyRelationshipMember, getPartnerId } from "../../shared/utils/relationshipValidator.js";
import { createNotification } from "../notification/notification.service.js";

const router = express.Router();
router.use(authMiddleware);

// ── Mongoose Model ────────────────────────────────────────────────────────────
const moodSchema = new mongoose.Schema({
  relationshipId: { type: mongoose.Schema.Types.ObjectId, ref: "Relationship", required: true },
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  emoji:          { type: String, required: true },
  note:           { type: String, maxlength: 120, default: "" },
  checkedInAt:    { type: Date, default: Date.now },
}, { timestamps: true });

// Compound index to get latest mood per user per day without scanning everything
moodSchema.index({ relationshipId: 1, userId: 1, checkedInAt: -1 });
const MoodEntry = mongoose.model("MoodEntry", moodSchema);

// ── Helpers ───────────────────────────────────────────────────────────────────
const todayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// ── POST /api/mood/checkin ─────────────────────────────────────────────────────
// Save or update today's mood for the user
router.post("/checkin", async (req, res) => {
  const { relationshipId, emoji, note } = req.body;
  const userId = req.user.userId;

  if (!relationshipId || !emoji) {
    return res.status(400).json({ error: true, message: "relationshipId and emoji required" });
  }

  const VALID_MOODS = ["😊","😄","🥰","😌","😔","😢","😤","😴","🤗","🤔","😰","🥳","😐","🤩","💪","🌟","🌿","☁️","🔥","❤️"];
  if (!VALID_MOODS.includes(emoji)) {
    return res.status(400).json({ error: true, message: "Invalid mood emoji" });
  }

  const rel = await verifyRelationshipMember(relationshipId, userId).catch(() => null);
  if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

  const { start, end } = todayRange();

  // Upsert today's mood entry
  const mood = await MoodEntry.findOneAndUpdate(
    { relationshipId, userId, checkedInAt: { $gte: start, $lte: end } },
    { emoji, note: note?.trim()?.slice(0, 120) || "", checkedInAt: new Date() },
    { upsert: true, new: true },
  );

  // Notify partner
  const partnerId = getPartnerId(rel, userId);
  createNotification({
    userId: partnerId,
    relationshipId,
    type: "mood_checkin",
    title: `${emoji} Partner checked in`,
    message: note?.trim() ? note.trim().slice(0, 60) : "See how they're feeling today",
    priority: "normal",
  }).catch(() => {});

  res.json({ mood });
});

// ── GET /api/mood/today/:relationshipId ────────────────────────────────────────
// Returns today's mood for both partners
router.get("/today/:relationshipId", async (req, res) => {
  const { relationshipId } = req.params;
  const userId = req.user.userId;

  const rel = await verifyRelationshipMember(relationshipId, userId).catch(() => null);
  if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

  const { start, end } = todayRange();
  const moods = await MoodEntry.find({
    relationshipId,
    checkedInAt: { $gte: start, $lte: end },
  }).populate("userId", "displayName avatarUrl");

  const myMood     = moods.find((m) => m.userId._id.toString() === userId) || null;
  const partnerMood = moods.find((m) => m.userId._id.toString() !== userId) || null;

  res.json({ myMood, partnerMood });
});

// ── GET /api/mood/history/:relationshipId ────────────────────────────────────
// Last 14 days of moods for both partners (for the weekly view)
router.get("/history/:relationshipId", async (req, res) => {
  const { relationshipId } = req.params;
  const userId = req.user.userId;

  const rel = await verifyRelationshipMember(relationshipId, userId).catch(() => null);
  if (!rel) return res.status(403).json({ error: true, message: "Access denied" });

  const since = new Date();
  since.setDate(since.getDate() - 14);

  const entries = await MoodEntry.find({
    relationshipId,
    checkedInAt: { $gte: since },
  })
    .sort({ checkedInAt: -1 })
    .populate("userId", "displayName avatarUrl");

  res.json({ entries });
});

export default router;
