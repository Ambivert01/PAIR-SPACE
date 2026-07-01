import api from "../../services/api.js";

export const getInsights = (relationshipId) =>
  api.get("/api/ai/insights", { params: { relationshipId } }).then((r) => r.data);

export const dismissInsight = (id) =>
  api.delete(`/api/ai/insights/${id}`).then((r) => r.data);

export const markInsightRead = (id) =>
  api.patch(`/api/ai/insights/${id}/dismiss`).then((r) => r.data);

export const analyzeText = (text) =>
  api.post("/api/ai/analyze-text", { text }).then((r) => r.data);

export const getConversationSuggestions = (relationshipId) =>
  api.get("/api/ai/suggestions", { params: { relationshipId } }).then((r) => r.data);

export const triggerWeeklySummary = (relationshipId) =>
  api.post("/api/ai/weekly-summary", { relationshipId }).then((r) => r.data);
