/**
 * Build a MongoDB query with cursor-based pagination.
 * @param {Object} baseQuery - existing query filters
 * @param {string} cursor    - ISO date string from previous page's last item
 * @param {string} field     - field to paginate on (default: createdAt)
 * @param {string} direction - 'desc' (newest first) or 'asc'
 */
export const buildPaginationQuery = (baseQuery = {}, cursor, field = "createdAt", direction = "desc") => {
  if (!cursor) return baseQuery;
  return {
    ...baseQuery,
    [field]: direction === "desc"
      ? { $lt: new Date(cursor) }
      : { $gt: new Date(cursor) },
  };
};

/**
 * Build sort object.
 */
export const buildSort = (field = "createdAt", direction = "desc") => ({
  [field]: direction === "desc" ? -1 : 1,
});

/**
 * Extract next cursor from result array.
 * Returns null if fewer results than limit (last page).
 */
export const getNextCursor = (items, limit, field = "createdAt") => {
  if (items.length < limit) return null;
  const last = items[items.length - 1];
  return last?.[field]?.toISOString?.() || null;
};

/**
 * Parse and clamp limit from query string.
 */
export const parseLimit = (limitStr, max = 50, defaultVal = 20) => {
  const n = parseInt(limitStr, 10);
  if (isNaN(n) || n < 1) return defaultVal;
  return Math.min(n, max);
};

/**
 * Full pagination helper — returns { query, sort, limit }.
 */
export const paginate = (queryParams = {}) => {
  const { limit: limitStr, cursor, sortField = "createdAt", sortDir = "desc" } = queryParams;
  const limit = parseLimit(limitStr);
  const sort  = buildSort(sortField, sortDir);
  const cursorFilter = cursor ? buildPaginationQuery({}, cursor, sortField, sortDir) : {};
  return { limit, sort, cursorFilter };
};
