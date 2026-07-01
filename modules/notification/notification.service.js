import { Notification, NotificationPreferences } from "./notification.model.js";

// global io reference set during socket init
let _io = null;
export const setIO = (io) => { _io = io; };

const isInQuietHours = (prefs) => {
  if (!prefs.quietHoursEnabled) return false;
  const now = new Date();
  const [sh, sm] = prefs.quietStart.split(":").map(Number);
  const [eh, em] = prefs.quietEnd.split(":").map(Number);
  const nowMins  = now.getHours() * 60 + now.getMinutes();
  const startMins = sh * 60 + sm;
  const endMins   = eh * 60 + em;

  if (startMins <= endMins) return nowMins >= startMins && nowMins < endMins;
  return nowMins >= startMins || nowMins < endMins; // overnight
};

const PREF_KEY = {
  message_received: "messageNotifications",
  message_reaction: "messageNotifications",
  message_reply:    "messageNotifications",
  missed_call:      "callNotifications",
  incoming_call:    "callNotifications",
  call_reminder:    "callNotifications",
  memory_created:   "memoryNotifications",
  memory_reaction:  "memoryNotifications",
  memory_comment:   "memoryNotifications",
  activity_invite:  "activityNotifications",
  activity_started: "activityNotifications",
  activity_reminder:"activityNotifications",
  planner_reminder: "plannerNotifications",
  habit_reminder:   "plannerNotifications",
  goal_progress:    "plannerNotifications",
};

export const createNotification = async ({
  userId, relationshipId, type, title, message = "",
  entityType = "", entityId = null,
  priority = "normal", scheduledFor = null,
}) => {
  try {
    // check preferences
    const prefs = await NotificationPreferences.findOne({ userId });
    if (prefs) {
      if (prefs.muteAll && priority !== "critical") return null;
      const prefKey = PREF_KEY[type];
      if (prefKey && prefs[prefKey] === false) return null;
      if (isInQuietHours(prefs) && priority !== "critical") return null;
    }

    const notif = await Notification.create({
      userId, relationshipId, type, title, message,
      entityType, entityId, priority, scheduledFor,
    });

    // deliver immediately if not scheduled
    if (!scheduledFor && _io) {
      _io.of("/notification").to(`user_${userId}`).emit("notification_new", notif);
      await Notification.findByIdAndUpdate(notif._id, { delivered: true });
    }

    return notif;
  } catch (err) {
    return null;
  }
};

// bulk create for both partners
export const notifyBoth = async ({ user1Id, user2Id, relationshipId, ...rest }) => {
  await Promise.all([
    createNotification({ userId: user1Id, relationshipId, ...rest }),
    createNotification({ userId: user2Id, relationshipId, ...rest }),
  ]);
};
