/**
 * backupMongo.js
 * Run manually:  node scripts/backupMongo.js
 * Run via cron:  0 2 * * * node /app/scripts/backupMongo.js   (daily at 2am)
 *
 * Creates a mongodump of the pairspace database and stores it in
 * the BACKUP_DIR directory (default: ./backups).
 *
 * Retention policy:
 *   - Daily backups kept for 30 days
 *   - Weekly backups (Sunday) kept for 90 days
 *   - Monthly backups (1st of month) kept for 365 days
 *
 * Requires: mongodump installed on the host (part of mongodb-database-tools).
 * On Atlas: use Atlas continuous backup instead — see docs/atlas-backup-setup.md
 */

import "dotenv/config";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Config ─────────────────────────────────────────────────────────────────
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, "../backups");
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "pairspace";

const DAILY_RETAIN_DAYS = 30;
const WEEKLY_RETAIN_DAYS = 90;
const MONTHLY_RETAIN_DAYS = 365;

if (!MONGO_URI) {
  console.error("❌  MONGO_URI not set");
  process.exit(1);
}

// ── Helpers ────────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");

const timestamp = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;
};

const isWeekly = () => new Date().getDay() === 0; // Sunday
const isMonthly = () => new Date().getDate() === 1; // 1st of month

const backupType = () => {
  if (isMonthly()) return "monthly";
  if (isWeekly()) return "weekly";
  return "daily";
};

const retainDays = (type) => {
  if (type === "monthly") return MONTHLY_RETAIN_DAYS;
  if (type === "weekly") return WEEKLY_RETAIN_DAYS;
  return DAILY_RETAIN_DAYS;
};

// ── Create backup ──────────────────────────────────────────────────────────
const runBackup = () => {
  const type = backupType();
  const ts = timestamp();
  const outDir = path.join(BACKUP_DIR, type, `backup_${ts}`);

  fs.mkdirSync(outDir, { recursive: true });

  console.log(
    `\n── PairSpace MongoDB Backup ─────────────────────────────────`,
  );
  console.log(`  Type:   ${type}`);
  console.log(`  Target: ${outDir}`);
  console.log(`  DB:     ${DB_NAME}`);
  console.log(`────────────────────────────────────────────────────────────\n`);

  try {
    execSync(
      `mongodump --uri="${MONGO_URI}" --db="${DB_NAME}" --out="${outDir}" --gzip`,
      { stdio: "inherit" },
    );
    console.log(`\n✅  Backup complete: ${outDir}`);
  } catch (err) {
    console.error(`\n❌  Backup failed: ${err.message}`);
    process.exit(1);
  }

  return { type, outDir };
};

// ── Prune old backups ──────────────────────────────────────────────────────
const pruneOldBackups = () => {
  const types = ["daily", "weekly", "monthly"];

  for (const type of types) {
    const dir = path.join(BACKUP_DIR, type);
    if (!fs.existsSync(dir)) continue;

    const maxAge = retainDays(type) * 24 * 3600 * 1000;
    const now = Date.now();
    let pruned = 0;

    for (const entry of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      if (now - stat.mtimeMs > maxAge) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        pruned++;
        console.log(`  🗑️   Pruned old ${type} backup: ${entry}`);
      }
    }

    if (pruned === 0)
      console.log(`  ✅  ${type} backups within retention window`);
  }
};

// ── Run ────────────────────────────────────────────────────────────────────
runBackup();
pruneOldBackups();

console.log("\n── Backup Summary ───────────────────────────────────────────");
const types = ["daily", "weekly", "monthly"];
for (const type of types) {
  const dir = path.join(BACKUP_DIR, type);
  if (!fs.existsSync(dir)) continue;
  const count = fs.readdirSync(dir).length;
  console.log(`  ${type.padEnd(8)} backups retained: ${count}`);
}
console.log("────────────────────────────────────────────────────────────\n");
