import Redis from "ioredis";

const TTL = 300; // 5 minutes in seconds

// ── Redis client (optional) ────────────────────────────────────────────────
let redis = null;
let redisDisabled = false;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, { lazyConnect: true, enableOfflineQueue: false, maxRetriesPerRequest: 0 });
  redis.on("error", () => {
    redis = null;
    redisDisabled = true;
  });
}

// ── In-memory fallback ─────────────────────────────────────────────────────
const memStore = new Map(); // key → { value, expiresAt }

const memGet = (key) => {
  const entry = memStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { memStore.delete(key); return null; }
  return entry.value;
};

const memSet = (key, value, ttlSeconds) => {
  memStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
};

const memDel = (key) => memStore.delete(key);

// ── Public API ─────────────────────────────────────────────────────────────
const key = (userId) => `presence:${userId}`;

export const setPresence = async (userId, data) => {
  const payload = JSON.stringify({ ...data, updatedAt: new Date().toISOString() });
  if (redis && !redisDisabled) {
    try { await redis.setex(key(userId), TTL, payload); return; } catch { redis = null; }
  }
  memSet(key(userId), payload, TTL);
};

export const getPresence = async (userId) => {
  if (redis && !redisDisabled) {
    try {
      const raw = await redis.get(key(userId));
      return raw ? JSON.parse(raw) : null;
    } catch { redis = null; }
  }
  const raw = memGet(key(userId));
  return raw ? JSON.parse(raw) : null;
};

export const deletePresence = async (userId) => {
  if (redis && !redisDisabled) {
    try { await redis.del(key(userId)); return; } catch { redis = null; }
  }
  memDel(key(userId));
};

export const refreshTTL = async (userId) => {
  if (redis && !redisDisabled) {
    try { await redis.expire(key(userId), TTL); return; } catch { redis = null; }
  }
  const raw = memGet(key(userId));
  if (raw) memSet(key(userId), raw, TTL);
};
