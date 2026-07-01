/**
 * Celebration Notifier Plugin
 * Adds smart celebration reminders for special moments.
 * Demonstrates: notification_plugin interface
 */

import { createNotification } from "../../modules/notification/notification.service.js";

let config = {};

const plugin = {
  name:        "celebration-notifier",
  version:     "1.0.0",
  type:        "notification_plugin",
  description: "Sends celebration reminders for milestones and special dates",
  author:      "PairSpace",

  // notification_plugin required fields
  triggerOn: ["milestone_reached", "anniversary_reminder", "habit_streak_milestone"],

  configSchema: {
    streakMilestones: { type: "array", default: [7, 30, 100], label: "Streak milestones to celebrate" },
    enableConfetti:   { type: "boolean", default: true, label: "Show confetti animation" },
  },

  initialize: async (cfg = {}) => {
    config = { streakMilestones: [7, 30, 100], enableConfetti: true, ...cfg };
    console.log("[celebration-notifier] initialized");
  },

  buildNotification: async ({ triggerType, userId, relationshipId, data = {} }) => {
    const templates = {
      milestone_reached: {
        title:   `🎉 Milestone reached!`,
        message: data.description || "You've reached a new milestone together.",
        priority: "high",
      },
      anniversary_reminder: {
        title:   `💑 Anniversary coming up!`,
        message: `Your anniversary is in ${data.daysUntil || "a few"} days.`,
        priority: "high",
      },
      habit_streak_milestone: {
        title:   `🔥 ${data.streak}-day streak!`,
        message: `You've kept up "${data.habitName}" for ${data.streak} days straight!`,
        priority: "normal",
      },
    };

    const notif = templates[triggerType];
    if (!notif) return null;

    return createNotification({
      userId, relationshipId,
      type: "celebration_reminder",
      ...notif,
    });
  },

  cleanup: () => {
    config = {};
    console.log("[celebration-notifier] cleaned up");
  },
};

export default plugin;
