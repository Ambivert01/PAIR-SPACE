import jwt from "jsonwebtoken";
import { Notification } from "./notification.model.js";
import { setIO } from "./notification.service.js";

const verifyToken = (t) => { try { return jwt.verify(t, process.env.JWT_SECRET); } catch { return null; } };

const initNotificationSocket = (io) => {
  setIO(io);
  const ns = io.of("/notification");

  ns.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Missing token"));
    const decoded = verifyToken(token);
    if (!decoded) return next(new Error("Invalid token"));
    socket.userId = decoded.userId;
    next();
  });

  ns.on("connection", (socket) => {
    // each user joins their own room
    socket.join(`user_${socket.userId}`);
    // mark single notification read
    socket.on("notification_read", async ({ notificationId }) => {
      try {
        await Notification.findOneAndUpdate(
          { _id: notificationId, userId: socket.userId },
          { read: true }
        );
        socket.emit("notification_read_ack", { notificationId });
      } catch { /* non-critical */ }
    });

    // mark all read
    socket.on("notification_read_all", async () => {
      try {
        await Notification.updateMany({ userId: socket.userId, read: false }, { read: true });
        socket.emit("notification_read_all_ack");
      } catch { /* non-critical */ }
    });

    // clear all read
    socket.on("notification_clear_read", async () => {
      try {
        await Notification.deleteMany({ userId: socket.userId, read: true });
        socket.emit("notification_clear_ack");
      } catch { /* non-critical */ }
    });

    socket.on("disconnect", () => {
    });
  });
};

export default initNotificationSocket;
