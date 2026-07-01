import api from "../../services/api.js";

export const getActiveActivity = (relationshipId) =>
  api.get(`/api/activity/active/${relationshipId}`).then((r) => r.data);

export const getActivityHistory = (relationshipId) =>
  api.get(`/api/activity/history/${relationshipId}`).then((r) => r.data);
