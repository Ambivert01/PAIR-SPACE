import api from "../../services/api.js";

export const createPlan = (data) =>
  api.post("/api/planner/create", data).then((r) => r.data);

export const listPlans = (relationshipId, params = {}) =>
  api.get("/api/planner/list", { params: { relationshipId, ...params } }).then((r) => r.data);

export const updatePlan = (planId, data) =>
  api.patch(`/api/planner/${planId}`, data).then((r) => r.data);

export const deletePlan = (planId) =>
  api.delete(`/api/planner/${planId}`).then((r) => r.data);

export const completeHabit = (planId) =>
  api.post(`/api/planner/${planId}/habit-complete`).then((r) => r.data);

export const toggleChecklistItem = (planId, itemIndex) =>
  api.post(`/api/planner/${planId}/checklist-toggle`, { itemIndex }).then((r) => r.data);
