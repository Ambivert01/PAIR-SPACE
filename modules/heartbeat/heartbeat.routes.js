/**
 * Heartbeat Module — "Thinking of You" taps
 *
 * The simplest, most intimate feature in PairSpace: one partner taps a button
 * and the other feels a gentle pulse through a real-time socket event.
 * No words required. Pure "I'm thinking of you right now."
 *
 * Rate-limited to once every 30 seconds per user so it stays meaningful
 * and doesn't become spam.
 */

import express from "express";
import authMiddleware from "../../services/api/src/middleware/authMiddleware.js";
import { verifyRelationshipMember } from "../../shared/utils/relationshipValidator.js";
import { createNotification } from "../notification/notification.service.js";

const router = express.Router();
router.use(authMiddleware);

// In-memory rate limiter (per user) — could move to Redis in prod
const lastTapTime = new Map();
const RATE_LIMIT_MS = 30_000; // 30 seconds between taps

// POST /api/heartbeat/tap
// Sends a "thinking of you" tap to the partner via notification socket
router.post("/tap", async (req, res) => {
  const { relationshipId } = req.body;
  const userId = req.user.userId;

  if (!relationshipId) {
    return res.status(400).json({ error: true, message: "relationshipId required" });
  }

  // Rate limit
  const lastTap = lastTapTime.get(userId) || 0;
  const cooldownRemaining = RATE_LIMIT_MS - (Date.now() - lastTap);
  if (cooldownRemaining > 0) {
    return res.status(429).json({
      error: true,
      message: "Too soon! Wait a moment before tapping again.",
      cooldownMs: cooldownRemaining,
    });
  }

  const rel = await verifyRelationshipMember(relationshipId, userId).catch(() => null);
  if (!rel) {
    return res.status(403).json({ error: true, message: "Access denied" });
  }

  lastTapTime.set(userId, Date.now());

  // Find partner
  const partnerId = rel.user1Id.toString() === userId
    ? rel.user2Id.toString()
    : rel.user1Id.toString();

  // Create a high-priority notification for real-time delivery
  await createNotification({
    userId: partnerId,
    relationshipId,
    type: "heartbeat_tap",
    title: "💗 Thinking of you",
    message: "Your partner is thinking of you right now",
    entityType: "heartbeat",
    priority: "high",
    tappedBy: userId,
  }).catch(() => {});
  res.json({ success: true, message: "💗 Sent!" });
});

export default router;
