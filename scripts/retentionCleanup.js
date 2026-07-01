#!/usr/bin/env node

/**
 * Data Retention Cleanup Script
 *
 * Purges soft-deleted data older than retention period.
 * Should be run as a nightly cron job.
 *
 * Usage:
 *   node scripts/retentionCleanup.js
 *
 * Cron example (daily at 2 AM):
 *   0 2 * * * cd /path/to/pairspace && node scripts/retentionCleanup.js >> logs/retention.log 2>&1
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "../services/api/.env") });

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/pairspace";

// Retention periods (in days)
const RETENTION_PERIODS = {
  messages: 30, // Soft-deleted messages retained for 30 days
  memories: 90, // Soft-deleted memories retained for 90 days
  journal_entries: 90, // Soft-deleted journal entries retained for 90 days
  notifications: 30, // Read notifications retained for 30 days
  sessions: 7, // Expired sessions retained for 7 days
};

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✓ Connected to MongoDB");
  } catch (error) {
    console.error("✗ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

async function cleanupCollection(collectionName, retentionDays, query) {
  const db = mongoose.connection.db;
  const collection = db.collection(collectionName);

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  try {
    const result = await collection.deleteMany({
      ...query,
      deletedAt: { $lt: cutoffDate },
    });

    console.log(
      `✓ ${collectionName}: Purged ${result.deletedCount} records older than ${retentionDays} days`,
    );
    return result.deletedCount;
  } catch (error) {
    console.error(`✗ ${collectionName}: Cleanup failed -`, error.message);
    return 0;
  }
}

async function cleanupExpiredSessions(retentionDays) {
  const db = mongoose.connection.db;
  const collection = db.collection("sessions");

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  try {
    const result = await collection.deleteMany({
      expiresAt: { $lt: cutoffDate },
    });

    console.log(
      `✓ sessions: Purged ${result.deletedCount} expired sessions older than ${retentionDays} days`,
    );
    return result.deletedCount;
  } catch (error) {
    console.error(`✗ sessions: Cleanup failed -`, error.message);
    return 0;
  }
}

async function cleanupReadNotifications(retentionDays) {
  const db = mongoose.connection.db;
  const collection = db.collection("notifications");

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  try {
    const result = await collection.deleteMany({
      read: true,
      readAt: { $lt: cutoffDate },
    });

    console.log(
      `✓ notifications: Purged ${result.deletedCount} read notifications older than ${retentionDays} days`,
    );
    return result.deletedCount;
  } catch (error) {
    console.error(`✗ notifications: Cleanup failed -`, error.message);
    return 0;
  }
}

async function runCleanup() {
  console.log("=== Data Retention Cleanup ===");
  console.log(`Started at: ${new Date().toISOString()}\n`);

  await connectDB();

  let totalPurged = 0;

  // Cleanup soft-deleted messages
  totalPurged += await cleanupCollection(
    "messages",
    RETENTION_PERIODS.messages,
    { deleted: true },
  );

  // Cleanup soft-deleted memories
  totalPurged += await cleanupCollection(
    "memories",
    RETENTION_PERIODS.memories,
    { deleted: true },
  );

  // Cleanup soft-deleted journal entries
  totalPurged += await cleanupCollection(
    "journal_entries",
    RETENTION_PERIODS.journal_entries,
    { deleted: true },
  );

  // Cleanup read notifications
  totalPurged += await cleanupReadNotifications(
    RETENTION_PERIODS.notifications,
  );

  // Cleanup expired sessions
  totalPurged += await cleanupExpiredSessions(RETENTION_PERIODS.sessions);

  console.log(`\n=== Cleanup Complete ===`);
  console.log(`Total records purged: ${totalPurged}`);
  console.log(`Finished at: ${new Date().toISOString()}`);

  await mongoose.connection.close();
  console.log("✓ Database connection closed");
}

// Run cleanup
runCleanup().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
