import cron from "node-cron";
import { Notification } from "./notification.model.js";
import { setIO } from "./notification.service.js";
import { deliverScheduledGifts } from "../gifts/gift.controller.js";
import { checkScheduledUnlocks } from "../time-capsule/capsule.controller.js";
import logger from "../../shared/utils/logger.js";

let _io = null;

export const initScheduler = (io) => {
  _io = io;
  setIO(io);

  // ── Deliver scheduled notifications (every minute) ─────────────────────
  cron.schedule("* * * * *", async () => {
    try {
      const due = await Notification.find({
        scheduledFor: { $lte: new Date() },
        delivered: false,
      }).limit(100);

      for (const notif of due) {
        if (_io) {
          _io.of("/notification")
            .to(`user_${notif.userId}`)
            .emit("notification_new", notif);
        }
        notif.delivered = true;
        await notif.save();
      }

      if (due.length > 0) {
        logger.info(`Delivered ${due.length} scheduled notifications`);
      }
    } catch (err) {
      logger.error("Notification scheduler error", { error: err.message });
    }
  });

  // ── Deliver scheduled gifts & check capsule unlocks (every 5 minutes) ──
  cron.schedule("*/5 * * * *", async () => {
    try {
      await deliverScheduledGifts();
    } catch (err) {
      logger.error("Gift delivery scheduler error", { error: err.message });
    }
    try {
      await checkScheduledUnlocks();
    } catch (err) {
      logger.error("Capsule unlock scheduler error", { error: err.message });
    }
  });

  logger.info("Notification scheduler started (notifications: 1min, gifts/capsules: 5min)");
};
