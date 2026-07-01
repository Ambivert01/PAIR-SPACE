// Escape special regex characters to prevent injection
export const sanitizeQuery = (q) =>
  q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Build case-insensitive regex from sanitized query
export const buildRegex = (q) =>
  new RegExp(sanitizeQuery(q), "i");

// Highlight matched text — returns segments [{text, highlight}]
export const highlightMatch = (text = "", query = "") => {
  if (!query || !text) return [{ text, highlight: false }];
  const escaped = sanitizeQuery(query);
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part) => ({
    text: part,
    highlight: new RegExp(`^${escaped}$`, "i").test(part),
  }));
};

// Detect tag search (#tag)
export const isTagSearch = (q) => q.startsWith("#");
export const extractTag  = (q) => q.slice(1).trim();
