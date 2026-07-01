import api from "../../services/api.js";

export const createMemory = (data) =>
  api.post("/api/memory/create", data).then((r) => r.data);

export const getTimeline = (relationshipId, params = {}) =>
  api.get("/api/memory/timeline", { params: { relationshipId, ...params } }).then((r) => r.data);

export const getMemory = (memoryId) =>
  api.get(`/api/memory/${memoryId}`).then((r) => r.data);

export const editMemory = (memoryId, data) =>
  api.patch(`/api/memory/${memoryId}`, data).then((r) => r.data);

export const deleteMemory = (memoryId) =>
  api.delete(`/api/memory/${memoryId}`).then((r) => r.data);

export const togglePin = (memoryId) =>
  api.post(`/api/memory/${memoryId}/pin`).then((r) => r.data);

export const toggleFavorite = (memoryId) =>
  api.post(`/api/memory/${memoryId}/favorite`).then((r) => r.data);

export const reactToMemory = (memoryId, emoji) =>
  api.post(`/api/memory/${memoryId}/react`, { emoji }).then((r) => r.data);

export const addComment = (memoryId, text) =>
  api.post(`/api/memory/${memoryId}/comment`, { text }).then((r) => r.data);

export const searchMemories = (relationshipId, q) =>
  api.get("/api/memory/search", { params: { relationshipId, q } }).then((r) => r.data);
