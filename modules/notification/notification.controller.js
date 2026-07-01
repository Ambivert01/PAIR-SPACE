import { Notification, NotificationPreferences } from "./notification.model.js";

export const listNotifications = async (req, res) => {
  const userId = req.user.userId;
  const { limit = 30, cursor, unreadOnly } = req.query;
  try {
    const query = { userId };
    if (unreadOnly === "true") query.read = false;
    if (cursor) query.createdAt = { $lt: new Date(cursor) };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({ userId, read: false });
    const nextCursor = notifications.length === Number(limit)
      ? notifications[notifications.length - 1].createdAt.toISOString()
      : null;

    res.json({ notifications, unreadCount, nextCursor });
  } catch {
    res.status(500).json({ error: true, message: "Failed to fetch notifications" });
  }
};

export const markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { read: true }
    );
    res.json({ message: "Marked read" });
  } catch {
    res.status(500).json({ error: true, message: "Failed" });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.userId, read: false }, { read: true });
    res.json({ message: "All marked read" });
  } catch {
    res.status(500).json({ error: true, message: "Failed" });
  }
};

export const clearRead = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user.userId, read: true });
    res.json({ message: "Cleared" });
  } catch {
    res.status(500).json({ error: true, message: "Failed" });
  }
};

export const getPreferences = async (req, res) => {
  try {
    let prefs = await NotificationPreferences.findOne({ userId: req.user.userId });
    if (!prefs) prefs = await NotificationPreferences.create({ userId: req.user.userId });
    res.json(prefs);
  } catch {
    res.status(500).json({ error: true, message: "Failed" });
  }
};

export const updatePreferences = async (req, res) => {
  const allowed = [
    "messageNotifications","callNotifications","activityNotifications",
    "plannerNotifications","memoryNotifications","presenceNotifications",
    "muteAll","quietHoursEnabled","quietStart","quietEnd",
  ];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  try {
    const prefs = await NotificationPreferences.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: updates },
      { new: true, upsert: true }
    );
    res.json(prefs);
  } catch {
    res.status(500).json({ error: true, message: "Failed to update preferences" });
  }
};
