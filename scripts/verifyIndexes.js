/**
 * verifyIndexes.js
 * Run: node scripts/verifyIndexes.js
 *
 * Checks that every performance-critical index exists in MongoDB.
 * Exits with code 1 if any index is missing so CI/CD can catch it.
 * Collections that don't exist yet are skipped (not treated as failures).
 */

import "dotenv/config";
import mongoose from "mongoose";

// Must match exactly what services/api/src/config/indexes.js creates.
const REQUIRED_INDEXES = {
  messages: [
    { relationshipId: 1, createdAt: -1 },
    { relationshipId: 1, deleted: 1, createdAt: -1 },
    { senderId: 1 },
  ],
  memories: [
    { relationshipId: 1, memoryDate: -1 },
    { relationshipId: 1, deleted: 1, emotionTag: 1 },
    { relationshipId: 1, pinned: -1, memoryDate: -1 },
  ],
  plans: [
    { relationshipId: 1, status: 1, dueDate: 1 },
    { relationshipId: 1, type: 1, deleted: 1 },
  ],
  journalentries: [{ relationshipId: 1, createdAt: -1 }, { authorId: 1 }],
  notifications: [
    { userId: 1, read: 1, createdAt: -1 },
    { scheduledFor: 1, delivered: 1 },
    { relationshipId: 1, createdAt: -1 },
  ],
  relationshipinsights: [
    { relationshipId: 1, createdAt: -1 },
    { relationshipId: 1, insightType: 1, periodStart: -1 },
  ],
  aiinsights: [{ relationshipId: 1, dismissed: 1, createdAt: -1 }],
  relationships: [
    { user1Id: 1, status: 1 },
    { user2Id: 1, status: 1 },
  ],
  activities: [{ relationshipId: 1, status: 1, createdAt: -1 }],
  calls: [{ relationshipId: 1, startedAt: -1 }],
  digitalgifts: [
    { relationshipId: 1, createdAt: -1 },
    { scheduledRevealTime: 1, opened: 1 },
  ],
  timecapsules: [
    { relationshipId: 1, createdAt: -1 },
    { lockedUntil: 1, opened: 1 },
  ],
  sessions: [{ userId: 1, revoked: 1, expiresAt: 1 }],
  media: [{ relationshipId: 1, type: 1, createdAt: -1 }, { uploaderId: 1 }],
  gamesessions: [{ relationshipId: 1, status: 1, createdAt: -1 }],
  stories: [{ relationshipId: 1, generatedAt: -1 }],
};

const keyOf = (spec) => JSON.stringify(spec);

async function verifyIndexes() {
  if (!process.env.MONGO_URI) {
    console.error("❌  MONGO_URI not set in environment");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  console.log(
    "\n── Index Verification ──────────────────────────────────────\n",
  );

  for (const [collection, required] of Object.entries(REQUIRED_INDEXES)) {
    let existing;
    try {
      existing = await db.collection(collection).indexes();
    } catch {
      console.warn(`  SKIP  ${collection} — collection not yet created`);
      skipped++;
      continue;
    }

    const existingKeys = existing.map((i) => keyOf(i.key));

    for (const spec of required) {
      if (existingKeys.includes(keyOf(spec))) {
        console.log(`  ✅  ${collection}  ${keyOf(spec)}`);
        passed++;
      } else {
        console.error(`  ❌  ${collection}  MISSING ${keyOf(spec)}`);
        failed++;
      }
    }
  }

  console.log(`\n────────────────────────────────────────────────────────────`);
  console.log(
    `  Passed: ${passed}  |  Failed: ${failed}  |  Skipped: ${skipped}`,
  );
  console.log(`────────────────────────────────────────────────────────────\n`);

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

verifyIndexes().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
