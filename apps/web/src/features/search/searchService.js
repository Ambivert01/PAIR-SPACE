import api from "../../services/api.js";

export const globalSearch = (params) =>
  api.get("/api/search/global", { params }).then((r) => r.data);
