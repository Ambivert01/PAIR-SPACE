/**
 * Anniversary Reminder Scheduler
 *
 * Proactively reminds both partners of upcoming relationship milestones
 * so they never miss an anniversary.
 *
 * Checks every day at 8am. Notifies when:
 *   - 1-week anniversary      (day 7)
 *   - 1-month anniversary     (day 30)
 *   - 3-month anniversary     (day 90)
 *   - 6-month anniversary     (day 180)
 *   - 1-year anniversary      (day 365)
 *   - Every year after that
 *   - 1 day BEFORE each milestone (so partners can plan)
 */

import cron from "node-cron";
import Relationship from "../relationship/relationship.model.js";
import { createNotification } from "../notification/notification.service.js";
import logger from "../../shared/utils/logger.js";

const MILESTONES = [
  { days: 7,   label: "1 week",  emoji: "🌱" },
  { days: 30,  label: "1 month", emoji: "🌸" },
  { days: 90,  label: "3 months", emoji: "💫" },
  { days: 180, label: "6 months", emoji: "🌟" },
  { days: 365, label: "1 year",  emoji: "💞" },
  // yearly after year 1 — handled via modulo
];

const daysSinceStart = (startDate) =>
  Math.floor((Date.now() - new Date(startDate)) / 86_400_000);

const isAnniversaryYear = (days) => {
  if (days < 365) return false;
  const remainder = days % 365;
  return remainder === 0; // exact year boundary
};

const getMilestoneLabel = (days) => {
  // Check yearly milestones first
  if (days > 365 && days % 365 === 0) {
    const years = Math.floor(days / 365);
    return { label: `${years} year${years > 1 ? "s" : ""}`, emoji: "🎉" };
  }
  const match = MILESTONES.find((m) => m.days === days);
  return match || null;
};

const sendAnniversaryNotification = async (rel, milestone, daysBefore = 0) => {
  const isEve = daysBefore > 0;
  const title  = isEve
    ? `${milestone.emoji} ${milestone.label} tomorrow!`
    : `${milestone.emoji} ${milestone.label} together!`;
  const message = isEve
    ? `Tomorrow marks ${milestone.label} since you two connected. Plan something special! 💝`
    : `You've been together for ${milestone.label}. Every day counts. 💞`;

  const userIds = [rel.user1Id.toString(), rel.user2Id.toString()];
  await Promise.all(
    userIds.map((userId) =>
      createNotification({
        userId,
        relationshipId: rel._id.toString(),
        type: "anniversary_reminder",
        title,
        message,
        priority: "high",
      }).catch(() => {}),
    ),
  );
};

export const initAnniversaryScheduler = () => {
  // Run every day at 8am
  cron.schedule("0 8 * * *", async () => {
    try {
      const activeRels = await Relationship.find({ status: "active", startDate: { $exists: true } })
        .select("user1Id user2Id startDate")
        .lean();

      let sent = 0;

      for (const rel of activeRels) {
        const days = daysSinceStart(rel.startDate);

        // Check exact milestone hit today
        const todayMilestone = getMilestoneLabel(days);
        if (todayMilestone) {
          await sendAnniversaryNotification(rel, todayMilestone, 0);
          sent++;
        }

        // Check if a milestone falls tomorrow (1-day early heads-up)
        const tomorrowMilestone = getMilestoneLabel(days + 1);
        if (tomorrowMilestone) {
          await sendAnniversaryNotification(rel, tomorrowMilestone, 1);
          sent++;
        }
      }

      if (sent > 0) {
        logger.info(`Anniversary scheduler: sent ${sent} reminder(s) for ${activeRels.length} relationships`);
      }
    } catch (err) {
      logger.error("Anniversary scheduler error", { error: err.message });
    }
  });

  logger.info("Anniversary reminder scheduler started (daily at 8am)");
};
