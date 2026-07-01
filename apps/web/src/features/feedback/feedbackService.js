/**
 * Feedback Service
 *
 * API client for feedback submission
 */

import api from "../../services/api.js";

export const submitFeedback = async (feedbackData) => {
  return api.post("/api/feedback/submit", feedbackData).then((r) => r.data);
};

export const getMyFeedback = async () => {
  return api.get("/api/feedback/my").then((r) => r.data);
};

// Admin functions
export const getAllFeedback = async (filters = {}) => {
  return api
    .get("/api/feedback/admin/all", { params: filters })
    .then((r) => r.data);
};

export const updateFeedbackStatus = async (feedbackId, updates) => {
  return api
    .patch(`/api/feedback/admin/${feedbackId}/status`, updates)
    .then((r) => r.data);
};

export const getFeedbackStats = async () => {
  return api.get("/api/feedback/admin/stats").then((r) => r.data);
};
