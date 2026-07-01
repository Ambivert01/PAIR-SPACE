import cron from "node-cron";
import Relationship from "../relationship/relationship.model.js";
import { calculateInsights } from "./insight.calculator.js";

// throttle map — prevent recalculating same relationship within 1 hour
const lastRun = new Map();
const THROTTLE_MS = 60 * 60 * 1000;

const shouldRun = (relId) => {
  const last = lastRun.get(relId.toString());
  if (!last || Date.now() - last > THROTTLE_MS) {
    lastRun.set(relId.toString(), Date.now());
    return true;
  }
  return false;
};

export const initInsightScheduler = () => {
  // run every Sunday at 8am
  cron.schedule("0 8 * * 0", async () => {
    try {
      const relationships = await Relationship.find({ status: "active" }).select("_id user1Id user2Id");
      let count = 0;
      // process in batches of 10 to avoid memory spike
      for (let i = 0; i < relationships.length; i += 10) {
        const batch = relationships.slice(i, i + 10);
        await Promise.allSettled(
          batch.map((rel) => {
            if (!shouldRun(rel._id)) return Promise.resolve();
            return calculateInsights(rel._id, rel.user1Id, rel.user2Id, "weekly");
          })
        );
        count += batch.length;
      }
    } catch (err) {
    }
  });
};

// export for on-demand use with throttle protection
export const runInsightsForRelationship = async (relId, user1Id, user2Id) => {
  if (!shouldRun(relId)) return null;
  return calculateInsights(relId, user1Id, user2Id, "weekly").catch(() => null);
};
