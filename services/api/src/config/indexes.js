/**
 * Ensures all performance-critical MongoDB indexes exist.
 * Called once on server startup after DB connects.
 * Uses createIndex with background:true so it doesn't block queries.
 */

import mongoose from "mongoose";

export const ensureIndexes = async () => {
  try {
    const db = mongoose.connection.db;

    const idx = (col, spec, opts = {}) =>
      db.collection(col).createIndex(spec, { background: true, ...opts }).catch(() => {});

    await Promise.all([
      // messages — most queried collection
      idx("messages", { relationshipId: 1, createdAt: -1 }),
      idx("messages", { relationshipId: 1, deleted: 1, createdAt: -1 }),
      idx("messages", { relationshipId: 1, type: 1, content: "text" }),
      idx("messages", { senderId: 1 }),

      // memories
      idx("memories", { relationshipId: 1, memoryDate: -1 }),
      idx("memories", { relationshipId: 1, deleted: 1, emotionTag: 1 }),
      idx("memories", { relationshipId: 1, pinned: -1, memoryDate: -1 }),
      idx("memories", { title: "text", description: "text", tags: "text" }),

      // plans
      idx("plans", { relationshipId: 1, status: 1, dueDate: 1 }),
      idx("plans", { relationshipId: 1, type: 1, deleted: 1 }),
      idx("plans", { title: "text", description: "text" }),

      // notifications — read by userId constantly
      idx("notifications", { userId: 1, read: 1, createdAt: -1 }),
      idx("notifications", { scheduledFor: 1, delivered: 1 }),
      idx("notifications", { relationshipId: 1, createdAt: -1 }),

      // relationships
      idx("relationships", { user1Id: 1, status: 1 }),
      idx("relationships", { user2Id: 1, status: 1 }),

      // activities
      idx("activities", { relationshipId: 1, status: 1, createdAt: -1 }),

      // calls
      idx("calls", { relationshipId: 1, startedAt: -1 }),

      // insights
      idx("relationshipinsights", { relationshipId: 1, createdAt: -1 }),
      idx("relationshipinsights", { relationshipId: 1, insightType: 1, periodStart: -1 }),

      // ai insights
      idx("aiinsights", { relationshipId: 1, dismissed: 1, createdAt: -1 }),

      // journal
      idx("journalentries", { relationshipId: 1, createdAt: -1 }),
      idx("journalentries", { content: "text", title: "text" }),

      // gifts
      idx("digitalgifts", { relationshipId: 1, createdAt: -1 }),
      idx("digitalgifts", { scheduledRevealTime: 1, opened: 1 }),

      // capsules
      idx("timecapsules", { relationshipId: 1, createdAt: -1 }),
      idx("timecapsules", { lockedUntil: 1, opened: 1 }),

      // sessions
      idx("sessions", { userId: 1, revoked: 1, expiresAt: 1 }),

      // media
      idx("media", { relationshipId: 1, type: 1, createdAt: -1 }),
      idx("media", { uploaderId: 1 }),

      // game sessions
      idx("gamesessions", { relationshipId: 1, status: 1, createdAt: -1 }),

      // stories
      idx("stories", { relationshipId: 1, generatedAt: -1 }),
    ]);
  } catch (err) {
  }
};
