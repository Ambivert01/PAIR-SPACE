import api from "../../services/api.js";

export const setIncognito        = (enabled) =>
  api.post("/api/privacy/incognito", { enabled }).then((r) => r.data);

export const lockMemory          = (memoryId, pin) =>
  api.post(`/api/privacy/memories/${memoryId}/lock`, { pin }).then((r) => r.data);

export const unlockMemory        = (memoryId, pin) =>
  api.post(`/api/privacy/memories/${memoryId}/unlock`, { pin }).then((r) => r.data);

export const blockPartner        = (relationshipId) =>
  api.post("/api/privacy/block", { relationshipId }).then((r) => r.data);

export const unblockPartner      = (relationshipId) =>
  api.post("/api/privacy/unblock", { relationshipId }).then((r) => r.data);

export const exportData          = (relationshipId) =>
  api.get("/api/privacy/export", { params: { relationshipId }, responseType: "blob" }).then((r) => r.data);

export const getSessions         = () =>
  api.get("/api/privacy/sessions").then((r) => r.data);

export const revokeSession       = (sessionId) =>
  api.delete(`/api/privacy/sessions/${sessionId}`).then((r) => r.data);

export const revokeAllSessions   = () =>
  api.delete("/api/privacy/sessions").then((r) => r.data);

export const clearChatHistory    = (relationshipId) =>
  api.post("/api/privacy/clear-chat", { relationshipId }).then((r) => r.data);
