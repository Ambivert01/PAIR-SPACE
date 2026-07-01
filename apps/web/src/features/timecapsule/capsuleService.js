import api from "../../services/api.js";

export const createCapsule    = (data) =>
  api.post("/api/capsules", data).then((r) => r.data);

export const listCapsules     = (relationshipId) =>
  api.get("/api/capsules", { params: { relationshipId } }).then((r) => r.data);

export const openCapsule      = (capsuleId) =>
  api.post(`/api/capsules/${capsuleId}/open`).then((r) => r.data);

export const manualUnlock     = (capsuleId) =>
  api.post(`/api/capsules/${capsuleId}/unlock`).then((r) => r.data);

export const reactToCapsule   = (capsuleId, emoji) =>
  api.post(`/api/capsules/${capsuleId}/react`, { emoji }).then((r) => r.data);

export const convertToMemory  = (capsuleId) =>
  api.post(`/api/capsules/${capsuleId}/convert-to-memory`).then((r) => r.data);

export const deleteCapsule    = (capsuleId) =>
  api.delete(`/api/capsules/${capsuleId}`).then((r) => r.data);
