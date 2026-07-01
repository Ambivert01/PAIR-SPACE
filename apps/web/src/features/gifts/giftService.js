import api from "../../services/api.js";

export const sendGift          = (data) =>
  api.post("/api/gifts", data).then((r) => r.data);

export const listGifts         = (relationshipId) =>
  api.get("/api/gifts", { params: { relationshipId } }).then((r) => r.data);

export const openGift          = (giftId) =>
  api.post(`/api/gifts/${giftId}/open`).then((r) => r.data);

export const reactToGift       = (giftId, emoji) =>
  api.post(`/api/gifts/${giftId}/react`, { emoji }).then((r) => r.data);

export const convertGiftToMemory = (giftId) =>
  api.post(`/api/gifts/${giftId}/convert-to-memory`).then((r) => r.data);
