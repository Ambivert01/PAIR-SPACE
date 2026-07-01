import api from "../../services/api.js";

export const createEntry       = (data) =>
  api.post("/api/journal", data).then((r) => r.data);

export const listEntries       = (relationshipId, params = {}) =>
  api.get("/api/journal", { params: { relationshipId, ...params } }).then((r) => r.data);

export const getEntry          = (entryId) =>
  api.get(`/api/journal/${entryId}`).then((r) => r.data);

export const editEntry         = (entryId, data) =>
  api.patch(`/api/journal/${entryId}`, data).then((r) => r.data);

export const deleteEntry       = (entryId) =>
  api.delete(`/api/journal/${entryId}`).then((r) => r.data);

export const addResponse       = (entryId, content) =>
  api.post(`/api/journal/${entryId}/respond`, { content }).then((r) => r.data);

export const reactToEntry      = (entryId, emoji) =>
  api.post(`/api/journal/${entryId}/react`, { emoji }).then((r) => r.data);

export const toggleBookmark    = (entryId) =>
  api.post(`/api/journal/${entryId}/bookmark`).then((r) => r.data);

export const convertToMemory   = (entryId) =>
  api.post(`/api/journal/${entryId}/convert-to-memory`).then((r) => r.data);
