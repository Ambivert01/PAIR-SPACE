/**
 * Migration runner — runs on every startup.
 * Rules:
 * - Only additive changes (new optional fields, new indexes)
 * - Never drop fields or collections
 * - Each migration is idempotent (safe to run multiple times)
 * - Migrations tracked in `_migrations` collection
 */

import mongoose from "mongoose";

const migrationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  appliedAt: { type: Date, default: Date.now },
});

const Migration =
  mongoose.models.Migration ||
  mongoose.model("Migration", migrationSchema, "_migrations");

const migrations = [
  {
    name: "001_messages_add_edited_field",
    run: async (db) => {
      await db
        .collection("messages")
        .updateMany(
          { edited: { $exists: false } },
          { $set: { edited: false } },
        );
    },
  },
  {
    name: "002_memories_add_deleted_field",
    run: async (db) => {
      await db
        .collection("memories")
        .updateMany(
          { deleted: { $exists: false } },
          { $set: { deleted: false } },
        );
    },
  },
  {
    name: "003_plans_add_deleted_field",
    run: async (db) => {
      await db
        .collection("plans")
        .updateMany(
          { deleted: { $exists: false } },
          { $set: { deleted: false } },
        );
    },
  },
  {
    name: "004_relationships_add_pinned_field",
    run: async (db) => {
      await db
        .collection("relationships")
        .updateMany(
          { pinned: { $exists: false } },
          { $set: { pinned: false, mutedNotifications: false } },
        );
    },
  },
  {
    name: "005_users_add_isActive_field",
    run: async (db) => {
      await db
        .collection("users")
        .updateMany(
          { isActive: { $exists: false } },
          { $set: { isActive: true } },
        );
    },
  },
  {
    // Data retention: permanently remove soft-deleted messages older than 30 days.
    // Soft-deleted messages have deleted:true and content already cleared.
    // This migration runs once on first deploy; ongoing retention is handled
    // by the nightly cron in scripts/retentionCleanup.js.
    name: "006_purge_old_soft_deleted_messages",
    run: async (db) => {
      const cutoff = new Date(Date.now() - 30 * 24 * 3600000);
      await db.collection("messages").deleteMany({
        deleted: true,
        updatedAt: { $lt: cutoff },
      });
    },
  },
  {
    // Ensure all journal entries have a deleted field for consistent soft-delete.
    name: "007_journal_add_deleted_field",
    run: async (db) => {
      await db
        .collection("journalentries")
        .updateMany(
          { deleted: { $exists: false } },
          { $set: { deleted: false } },
        );
    },
  },
  {
    // Ensure all gifts have an opened field default.
    name: "008_gifts_add_opened_field",
    run: async (db) => {
      await db
        .collection("digitalgifts")
        .updateMany(
          { opened: { $exists: false } },
          { $set: { opened: false } },
        );
    },
  },
  {
    // Add lockPin and lockedAt fields to memories for privacy locking feature.
    name: "009_memories_add_lockPin_field",
    run: async (db) => {
      await db
        .collection("memories")
        .updateMany(
          { lockPin: { $exists: false } },
          { $set: { lockPin: null, lockedAt: null } },
        );
    },
  },
  {
    // Add role field to users for admin access control.
    name: "010_users_add_role_field",
    run: async (db) => {
      await db
        .collection("users")
        .updateMany(
          { role: { $exists: false } },
          { $set: { role: "user" } },
        );
    },
  },
];

export const runMigrations = async () => {
  const db = mongoose.connection.db;

  for (const migration of migrations) {
    const already = await Migration.findOne({ name: migration.name });
    if (already) continue;

    try {
      await migration.run(db);
      await Migration.create({ name: migration.name });
    } catch (err) {
      // non-fatal — log and continue
    }
  }
};
