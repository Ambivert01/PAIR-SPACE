const PROD_API = "https://pairspace-api.onrender.com";

// In development, use empty string to leverage Vite proxy
// In production, use full URL from env or fallback to PROD_API
export const API_BASE_URL =
  import.meta?.env?.VITE_API_URL || (import.meta.env?.DEV ? "" : PROD_API);

export const SOCKET_URL =
  import.meta?.env?.VITE_SOCKET_URL || (import.meta.env?.DEV ? "" : PROD_API);

// Media files base URL — used for constructing image/video/file URLs.
// Dev: empty string (Vite proxy handles /uploads → localhost:5000)
// Prod: full API domain so media URLs are absolute
export const MEDIA_BASE =
  import.meta?.env?.VITE_MEDIA_URL ||
  import.meta?.env?.VITE_API_URL ||
  (import.meta.env?.DEV ? "" : PROD_API);
