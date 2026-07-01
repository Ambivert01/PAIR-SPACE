import api from "../api.js";
import { getActiveRelationshipId } from "./relationshipContext.js";

export const sendInvite = async ({ email, relationshipType }) =>
  api.post("/api/relationship/invite", { email, relationshipType }).then((r) => r.data);

export const acceptInvite = async (relationshipId) =>
  api.post("/api/relationship/accept", { relationshipId }).then((r) => r.data);

export const rejectInvite = async (relationshipId) =>
  api.post("/api/relationship/reject", { relationshipId }).then((r) => r.data);

export const cancelInvite = async (relationshipId) =>
  api.post("/api/relationship/cancel", { relationshipId }).then((r) => r.data);

export const endRelationship = async (relationshipId) =>
  api.post("/api/relationship/end", { relationshipId }).then((r) => r.data);

// Get specific relationship — uses active context if no ID provided
export const getMyRelationship = async (relationshipId) => {
  const id = relationshipId || getActiveRelationshipId();
  const params = id ? { relationshipId: id } : {};
  return api.get("/api/relationship/my", { params }).then((r) => r.data);
};

// List all relationships for current user
export const listMyRelationships = async (includeArchived = false) =>
  api.get("/api/relationship/list", { params: { includeArchived } }).then((r) => r.data);

export const getRelationshipById = async (relationshipId) =>
  api.get(`/api/relationship/${relationshipId}`).then((r) => r.data);

export const renameRelationship = async (relationshipId, nickname) =>
  api.patch("/api/relationship/rename", { relationshipId, nickname }).then((r) => r.data);

export const archiveRelationship = async (relationshipId, archive = true) =>
  api.post("/api/relationship/archive", { relationshipId, archive }).then((r) => r.data);

export const pinRelationship = async (relationshipId) =>
  api.post("/api/relationship/pin", { relationshipId }).then((r) => r.data);

export const muteRelationship = async (relationshipId, mute) =>
  api.post("/api/relationship/mute", { relationshipId, mute }).then((r) => r.data);

export const getRelationshipStats = async (relationshipId) =>
  api.get(`/api/relationship/${relationshipId}/stats`).then((r) => r.data);
