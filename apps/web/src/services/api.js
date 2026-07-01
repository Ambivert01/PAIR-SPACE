import axios from "axios";
import { API_BASE_URL } from "@shared/constants/urls.js";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

export default api;
