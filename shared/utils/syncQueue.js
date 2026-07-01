// ── Action type priorities (lower = process first) ─────────────────────────
const PRIORITY = {
  message_send:    1,
  reaction_add:    2,
  reaction_remove: 2,
  message_edit:    3,
  message_delete:  3,
  memory_create:   4,
  memory_update:   5,
  planner_create:  6,
  planner_update:  6,
  activity_create: 7,
  game_move:       8,
  settings_update: 9,
};

export const getPriority = (actionType) => PRIORITY[actionType] || 10;

// ── Deduplication — keep only latest for same entity+action ───────────────
export const deduplicateQueue = (items) => {
  const seen = new Map();
  // process in reverse so latest wins
  for (const item of [...items].reverse()) {
    const key = `${item.actionType}:${item.entityType}:${item.entityId || ""}`;
    if (!seen.has(key)) seen.set(key, item);
  }
  return [...seen.values()].sort((a, b) => getPriority(a.actionType) - getPriority(b.actionType));
};

// ── Generate a local queue item ID ────────────────────────────────────────
export const generateQueueId = () =>
  `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// ── Check if action is retryable ──────────────────────────────────────────
export const isRetryable = (item) => item.retryCount < 5;

// ── Build batch payload for server ────────────────────────────────────────
export const buildBatchPayload = (items) =>
  items.map(({ id, actionType, entityType, entityId, payload, relationshipId, createdAt }) => ({
    id, actionType, entityType, entityId, payload, relationshipId, createdAt,
  }));
