// ── Date range helpers ─────────────────────────────────────────────────────
export const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const endOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const daysAgo = (n) => new Date(Date.now() - n * 86400000);
export const weeksAgo = (n) => daysAgo(n * 7);
export const monthsAgo = (n) => new Date(Date.now() - n * 30 * 86400000);

// ── Duration formatting ────────────────────────────────────────────────────
export const formatDuration = (seconds) => {
  if (!seconds) return "0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

// ── Relative time ──────────────────────────────────────────────────────────
export const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800)return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
};

// ── Days between two dates ─────────────────────────────────────────────────
export const daysBetween = (a, b = new Date()) =>
  Math.floor(Math.abs(new Date(b) - new Date(a)) / 86400000);

// ── Is date in the past ────────────────────────────────────────────────────
export const isPast = (date) => new Date(date) < new Date();
export const isFuture = (date) => new Date(date) > new Date();
