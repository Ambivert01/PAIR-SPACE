import api from "../../services/api.js";

export const getPersonalization    = (relationshipId) =>
  api.get("/api/personalization", { params: { relationshipId } }).then((r) => r.data);

export const updatePersonalization = (relationshipId, data) =>
  api.patch("/api/personalization", { relationshipId, ...data }).then((r) => r.data);

export const resetPersonalization  = (relationshipId) =>
  api.post("/api/personalization/reset", { relationshipId }).then((r) => r.data);
