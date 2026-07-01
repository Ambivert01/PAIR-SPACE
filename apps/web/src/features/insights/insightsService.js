import api from "../../services/api.js";

export const getLatestInsights  = (relationshipId) =>
  api.get("/api/insights/latest", { params: { relationshipId } }).then((r) => r.data);

export const getInsights        = (relationshipId, params = {}) =>
  api.get("/api/insights", { params: { relationshipId, ...params } }).then((r) => r.data);

export const triggerCalculation = (relationshipId) =>
  api.post("/api/insights/calculate", { relationshipId }).then((r) => r.data);
