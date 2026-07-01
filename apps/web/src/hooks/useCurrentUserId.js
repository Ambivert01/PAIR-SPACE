import { jwtDecode } from "jwt-decode";
import { getToken } from "../services/auth/authService.js";

export const useCurrentUserId = () => {
  const token = getToken();
  if (!token) return null;
  try {
    return jwtDecode(token).userId;
  } catch {
    return null;
  }
};
