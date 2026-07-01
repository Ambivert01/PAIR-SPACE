import api from "../../services/api.js";

export const getUserSettings = () =>
  api.get("/api/settings/user").then((r) => r.data);

export const updateUserSettings = (data) =>
  api.patch("/api/settings/user", data).then((r) => r.data);

export const getRelationshipSettings = (relationshipId) =>
  api.get("/api/settings/relationship", { params: { relationshipId } }).then((r) => r.data);

export const updateRelationshipSettings = (relationshipId, data) =>
  api.patch("/api/settings/relationship", { relationshipId, ...data }).then((r) => r.data);
