/**
 * restoreBackup.js
 * Run: node scripts/restoreBackup.js <backup-path>
 *
 * Restores a MongoDB backup created by backupMongo.js.
 * Used for disaster recovery or testing backup integrity.
 *
 * Example:
 *   node scripts/restoreBackup.js ./backups/daily/backup_2024-01-15_02-00
 *
 * WARNING: This will OVERWRITE the current database.
 * Only run this on a test/staging environment or after confirming
 * you want to restore production data.
 *
 * Requires: mongorestore installed (part of mongodb-database-tools).
 */

import "dotenv/config";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "pairspace";

if (!MONGO_URI) {
  console.error("❌  MONGO_URI not set");
  process.exit(1);
}

const backupPath = process.argv[2];

if (!backupPath) {
  console.error("\n❌  Usage: node scripts/restoreBackup.js <backup-path>\n");
  console.error("Example:");
  console.error(
    "  node scripts/restoreBackup.js ./backups/daily/backup_2024-01-15_02-00\n",
  );
  process.exit(1);
}

if (!fs.existsSync(backupPath)) {
  console.error(`❌  Backup path not found: ${backupPath}`);
  process.exit(1);
}

// Safety check — require explicit confirmation in production
if (process.env.NODE_ENV === "production") {
  console.error(
    "\n⚠️  WARNING: You are about to restore a backup in PRODUCTION.",
  );
  console.error("⚠️  This will OVERWRITE all current data in the database.");
  console.error("\nTo proceed, set CONFIRM_RESTORE=yes in your environment.\n");

  if (process.env.CONFIRM_RESTORE !== "yes") {
    console.error("❌  Restore cancelled (CONFIRM_RESTORE not set).\n");
    process.exit(1);
  }
}

console.log(`\n── PairSpace MongoDB Restore ────────────────────────────────`);
console.log(`  Source: ${backupPath}`);
console.log(`  Target: ${DB_NAME}`);
console.log(`  URI:    ${MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")}`);
console.log(`────────────────────────────────────────────────────────────\n`);

try {
  // mongorestore expects the dump directory structure: <path>/<dbname>/...
  const dumpDir = path.join(backupPath, DB_NAME);

  if (!fs.existsSync(dumpDir)) {
    console.error(`❌  Expected database dump at: ${dumpDir}`);
    console.error(
      `    Make sure the backup path contains a '${DB_NAME}' subdirectory.`,
    );
    process.exit(1);
  }

  execSync(
    `mongorestore --uri="${MONGO_URI}" --db="${DB_NAME}" --gzip --drop "${dumpDir}"`,
    { stdio: "inherit" },
  );

  console.log(`\n✅  Restore complete from: ${backupPath}`);
  console.log(
    `\n⚠️  Remember to restart the API server to clear any in-memory caches.\n`,
  );
} catch (err) {
  console.error(`\n❌  Restore failed: ${err.message}\n`);
  process.exit(1);
}
