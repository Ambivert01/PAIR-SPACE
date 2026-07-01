import { useEffect, useRef, useState } from "react";
import { getNotificationSocket, resetNotificationSocket } from "../../socket/notificationSocket.js";
import { fetchNotifications } from "./notificationService.js";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [toasts, setToasts]               = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    fetchNotifications({ limit: 30 })
      .then(({ notifications: n, unreadCount: c }) => { setNotifications(n); setUnreadCount(c); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const socket = getNotificationSocket();
    socketRef.current = socket;
    socket.auth = { token: localStorage.getItem("pairspace_token") };
    socket.connect();

    socket.on("notification_new", (notif) => {
      setNotifications((prev) => [notif, ...prev].slice(0, 100));
      setUnreadCount((c) => c + 1);
      addToast(notif);
      if (Notification.permission === "granted" && document.hidden) {
        new Notification(notif.title, { body: notif.message, icon: "/favicon.ico" });
      }
      // Dispatch a DOM event for heartbeat taps so the dashboard can pulse
      if (notif.type === "heartbeat_tap") {
        document.dispatchEvent(new CustomEvent("heartbeat_received"));
      }
    });

    socket.on("notification_read_ack",     ({ notificationId }) => {
      setNotifications((prev) => prev.map((n) => n._id === notificationId ? { ...n, read: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    });
    socket.on("notification_read_all_ack", () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    });
    socket.on("notification_clear_ack",    () => {
      setNotifications((prev) => prev.filter((n) => !n.read));
    });

    return () => resetNotificationSocket();
  }, []);

  const addToast = (notif) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { ...notif, toastId: id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.toastId !== id)), 5000);
  };

  const dismissToast  = (toastId) => setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  const markRead      = (id) => socketRef.current?.emit("notification_read",     { notificationId: id });
  const markAllRead   = ()   => socketRef.current?.emit("notification_read_all");
  const clearRead     = ()   => socketRef.current?.emit("notification_clear_read");

  return { notifications, unreadCount, toasts, markRead, markAllRead, clearRead, dismissToast, addToast };
};
