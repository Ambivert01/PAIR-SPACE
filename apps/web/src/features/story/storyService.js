import api from "../../services/api.js";

export const listStories    = (relationshipId) =>
  api.get("/api/stories", { params: { relationshipId } }).then((r) => r.data);

export const getStory       = (storyId) =>
  api.get(`/api/stories/${storyId}`).then((r) => r.data);

export const generateStory  = (relationshipId, storyType) =>
  api.post("/api/stories/generate", { relationshipId, storyType }).then((r) => r.data);

export const updateStory    = (storyId, data) =>
  api.patch(`/api/stories/${storyId}`, data).then((r) => r.data);
