import api from "../../services/api.js";

export const fetchNotifications = (params = {}) =>
  api.get("/api/notifications", { params }).then((r) => r.data);

export const markRead = (id) =>
  api.patch(`/api/notifications/${id}/read`).then((r) => r.data);

export const markAllRead = () =>
  api.post("/api/notifications/read-all").then((r) => r.data);

export const clearRead = () =>
  api.delete("/api/notifications/clear-read").then((r) => r.data);

export const getPreferences = () =>
  api.get("/api/notifications/preferences").then((r) => r.data);

export const updatePreferences = (data) =>
  api.patch("/api/notifications/preferences", data).then((r) => r.data);
