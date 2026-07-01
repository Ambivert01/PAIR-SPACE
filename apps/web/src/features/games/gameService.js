import api from "../../services/api.js";

export const getGameHistory    = (relId) => api.get(`/api/games/history/${relId}`).then((r) => r.data);
export const getDailyQuestion  = ()      => api.get("/api/games/daily-question").then((r) => r.data);
export const getActiveGame     = (relId) => api.get(`/api/games/active/${relId}`).then((r) => r.data);
