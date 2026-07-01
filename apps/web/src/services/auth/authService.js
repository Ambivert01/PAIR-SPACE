import api from "../api.js";
import { clearActiveRelationshipId } from "../relationship/relationshipContext.js";

const TOKEN_KEY = "pairspace_token";
const ONBOARDING_CACHE_KEY = "pairspace_onboarding_complete";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 (expired/invalid token), clear session and send the user to login
// with a flag so the UI can show a friendly "session expired" message,
// instead of leaving them on a silently broken page.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      removeToken();
      sessionStorage.removeItem(ONBOARDING_CACHE_KEY);
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login?expired=1";
      }
    }
    return Promise.reject(error);
  },
);

export const signup = async ({ email, password, displayName }) => {
  const { data } = await api.post("/api/auth/signup", { email, password, displayName });
  sessionStorage.removeItem(ONBOARDING_CACHE_KEY); // fresh user — re-check onboarding state
  setToken(data.token);
  return data.user;
};

export const login = async ({ email, password }) => {
  const { data } = await api.post("/api/auth/login", { email, password });
  sessionStorage.removeItem(ONBOARDING_CACHE_KEY); // avoid stale cache from a previous session
  setToken(data.token);
  return data.user;
};

export const getProfile = async () => {
  const { data } = await api.get("/api/auth/me");
  return data.user;
};

export const logout = () => {
  removeToken();
  sessionStorage.removeItem(ONBOARDING_CACHE_KEY);
  clearActiveRelationshipId();
};
