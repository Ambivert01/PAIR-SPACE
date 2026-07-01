import "dotenv/config";
import mongoose from "mongoose";

async function checkIntegrity() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  let issues = 0;

  const check = async (label, count) => {
    if (count > 0) {
      console.error(`  ❌  ${label}: ${count} issue(s)`);
      issues += count;
    } else {
      console.log(`  ✅  ${label}`);
    }
  };

  // get valid IDs
  const relIds  = await db.collection("relationships").distinct("_id");
  const userIds = await db.collection("users").distinct("_id");

  const relIdStrings  = relIds.map(String);
  const userIdStrings = userIds.map(String);

  // helper — count docs with invalid reference
  const countOrphans = async (collection, field, validIds) => {
    const all = await db.collection(collection).find({}, { projection: { [field]: 1 } }).toArray();
    return all.filter((d) => d[field] && !validIds.includes(String(d[field]))).length;
  };

  console.log("\nChecking data integrity...\n");

  await check(
    "Messages with invalid relationshipId",
    await countOrphans("messages", "relationshipId", relIdStrings)
  );

  await check(
    "Messages with invalid senderId",
    await countOrphans("messages", "senderId", userIdStrings)
  );

  await check(
    "Memories with invalid relationshipId",
    await countOrphans("memories", "relationshipId", relIdStrings)
  );

  await check(
    "Plans with invalid relationshipId",
    await countOrphans("plans", "relationshipId", relIdStrings)
  );

  await check(
    "Journal entries with invalid relationshipId",
    await countOrphans("journalentries", "relationshipId", relIdStrings)
  );

  await check(
    "Notifications with invalid userId",
    await countOrphans("notifications", "userId", userIdStrings)
  );

  await check(
    "Activities with invalid relationshipId",
    await countOrphans("activities", "relationshipId", relIdStrings)
  );

  await check(
    "Gifts with invalid relationshipId",
    await countOrphans("digitalgifts", "relationshipId", relIdStrings)
  );

  await check(
    "Time capsules with invalid relationshipId",
    await countOrphans("timecapsules", "relationshipId", relIdStrings)
  );

  // soft-deleted data retention check
  const deletedMsgs = await db.collection("messages").countDocuments({ deleted: true });
  console.log(`\n  ℹ️   Soft-deleted messages retained: ${deletedMsgs}`);

  const deletedMems = await db.collection("memories").countDocuments({ deleted: true });
  console.log(`  ℹ️   Soft-deleted memories retained: ${deletedMems}`);

  console.log(`\nIntegrity check complete — ${issues} issue(s) found`);
  await mongoose.disconnect();
  process.exit(issues > 0 ? 1 : 0);
}

checkIntegrity().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
