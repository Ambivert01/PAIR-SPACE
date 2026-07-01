/**
 * Lightweight in-process cache with TTL.
 * Use for: settings, personalization, relationship membership checks.
 * NOT for presence (Redis handles that) or messages (always fresh).
 */

const store = new Map(); // key → { value, expiresAt }

/**
 * Get cached value. Returns undefined on miss/expiry.
 */
export const cacheGet = (key) => {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
};

/**
 * Set cache entry with TTL in seconds (default 60s).
 */
export const cacheSet = (key, value, ttlSeconds = 60) => {
  // evict oldest if store grows too large
  if (store.size > 2000) {
    const firstKey = store.keys().next().value;
    store.delete(firstKey);
  }
  store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
};

/**
 * Invalidate a cache key.
 */
export const cacheDel = (key) => store.delete(key);

/**
 * Invalidate all keys matching a prefix.
 */
export const cacheDelPrefix = (prefix) => {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
};

/**
 * Get or compute — returns cached value or calls fn() and caches result.
 */
export const cacheGetOrSet = async (key, fn, ttlSeconds = 60) => {
  const cached = cacheGet(key);
  if (cached !== undefined) return cached;
  const value = await fn();
  if (value !== null && value !== undefined) cacheSet(key, value, ttlSeconds);
  return value;
};
