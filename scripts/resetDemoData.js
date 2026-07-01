import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";

// Load environment variables from services/api/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../services/api/.env") });
import User from "../modules/auth/user.model.js";
import Relationship from "../modules/relationship/relationship.model.js";
import Message from "../modules/chat/message.model.js";
import Memory from "../modules/memory/memory.model.js";
import Plan from "../modules/planner/plan.model.js";
import Activity from "../modules/sync/activity.model.js";
import JournalEntry from "../modules/journal/journal.model.js";
import Gift from "../modules/gifts/gift.model.js";
import TimeCapsule from "../modules/time-capsule/capsule.model.js";
import Call from "../modules/call/call.model.js";
import { Notification } from "../modules/notification/notification.model.js";
import {
  UserSettings,
  RelationshipSettings,
} from "../modules/settings/settings.model.js";
import Personalization from "../modules/personalization/personalization.model.js";
import RelationshipInsight from "../modules/insights/insight.model.js";
import AIInsight from "../modules/ai/ai.insight.model.js";

const DEMO_EMAILS = ["parth.demo@example.com", "alex.demo@example.com"];

async function reset() {
  if (process.env.NODE_ENV === "production") {
    console.error("❌  Reset blocked in production.");
    process.exit(1);
  }

  // Dry-run mode check
  const DRY_RUN = process.argv.includes("--dry");
  if (DRY_RUN) {
    console.log("⚠️  DRY RUN MODE — no deletion will be executed");
    console.log("    Remove --dry flag to perform actual reset\n");
  }

  // Safe confirmation check
  if (!process.argv.includes("--force") && !DRY_RUN) {
    console.log("❌  Use --force to confirm reset");
    console.log("    Example: npm run seed:reset -- --force");
    console.log("    Or use --dry to preview what would be deleted");
    process.exit(0);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅  DB connected");

  const users = await User.find({ email: { $in: DEMO_EMAILS } });
  const userIds = users.map((u) => u._id);

  if (!userIds.length) {
    console.log("ℹ️   No demo data found.");
    await mongoose.disconnect();
    return;
  }

  const rels = await Relationship.find({
    $or: [{ user1Id: { $in: userIds } }, { user2Id: { $in: userIds } }],
  });
  const relIds = rels.map((r) => r._id);

  // Partial clean protection
  if (!relIds.length) {
    console.log("⚠️  No relationships found, skipping deep cleanup");
    if (!DRY_RUN) {
      await User.deleteMany({ _id: { $in: userIds } });
      console.log(
        `🧹  Deleted ${userIds.length} demo users (no relationships)`,
      );
    }
    await mongoose.disconnect();
    return;
  }

  if (DRY_RUN) {
    console.log("📋  Would delete:");
    console.log(`   Users: ${userIds.length}`);
    console.log(`   Relationships: ${relIds.length}`);
    console.log(`   All associated data (messages, memories, plans, etc.)`);
    await mongoose.disconnect();
    return;
  }

  // Perform deletion
  const results = await Promise.all([
    Message.deleteMany({ relationshipId: { $in: relIds } }),
    Memory.deleteMany({ relationshipId: { $in: relIds } }),
    Plan.deleteMany({ relationshipId: { $in: relIds } }),
    Activity.deleteMany({ relationshipId: { $in: relIds } }),
    JournalEntry.deleteMany({ relationshipId: { $in: relIds } }),
    Gift.deleteMany({ relationshipId: { $in: relIds } }),
    TimeCapsule.deleteMany({ relationshipId: { $in: relIds } }),
    Call.deleteMany({ relationshipId: { $in: relIds } }),
    Notification.deleteMany({ relationshipId: { $in: relIds } }),
    RelationshipSettings.deleteMany({ relationshipId: { $in: relIds } }),
    Personalization.deleteMany({ relationshipId: { $in: relIds } }),
    RelationshipInsight.deleteMany({ relationshipId: { $in: relIds } }),
    AIInsight.deleteMany({ relationshipId: { $in: relIds } }),
    UserSettings.deleteMany({ userId: { $in: userIds } }),
    Relationship.deleteMany({ _id: { $in: relIds } }),
    User.deleteMany({ _id: { $in: userIds } }),
  ]);

  // Delete summary
  console.log("🧹  Demo data removed.");
  console.log(`
📊 Deletion Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Users:                  ${userIds.length}
Relationships:          ${relIds.length}
Messages:               ${results[0].deletedCount}
Memories:               ${results[1].deletedCount}
Plans:                  ${results[2].deletedCount}
Activities:             ${results[3].deletedCount}
Journal Entries:        ${results[4].deletedCount}
Gifts:                  ${results[5].deletedCount}
Time Capsules:          ${results[6].deletedCount}
Calls:                  ${results[7].deletedCount}
Notifications:          ${results[8].deletedCount}
Relationship Settings:  ${results[9].deletedCount}
Personalization:        ${results[10].deletedCount}
Relationship Insights:  ${results[11].deletedCount}
AI Insights:            ${results[12].deletedCount}
User Settings:          ${results[13].deletedCount}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  await mongoose.disconnect();
}

reset().catch((err) => {
  console.error("❌  Reset failed:", err.message);
  process.exit(1);
});
