const DB_NAME    = "pairspace_offline";
const STORE_NAME = "sync_queue";
const DB_VERSION = 1;

let db = null;

const openDB = () => new Promise((resolve, reject) => {
  if (db) return resolve(db);
  const req = indexedDB.open(DB_NAME, DB_VERSION);
  req.onupgradeneeded = (e) => {
    const d = e.target.result;
    if (!d.objectStoreNames.contains(STORE_NAME)) {
      d.createObjectStore(STORE_NAME, { keyPath: "id" });
    }
  };
  req.onsuccess  = (e) => { db = e.target.result; resolve(db); };
  req.onerror    = () => reject(req.error);
});

const withStore = async (mode, fn) => {
  try {
    const d   = await openDB();
    const tx  = d.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    return await new Promise((resolve, reject) => {
      const req = fn(store);
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });
  } catch {
    // localStorage fallback
    return null;
  }
};

// ── localStorage fallback helpers ──────────────────────────────────────────
const LS_KEY = "pairspace_sync_queue";
const lsGet  = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } };
const lsSet  = (items) => { try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch {} };

// ── Public API ─────────────────────────────────────────────────────────────
export const queueAdd = async (item) => {
  const result = await withStore("readwrite", (s) => s.put(item));
  if (result === null) {
    const items = lsGet();
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx >= 0) items[idx] = item; else items.push(item);
    lsSet(items);
  }
};

export const queueGetAll = async () => {
  const result = await withStore("readonly", (s) => s.getAll());
  if (result !== null) return result;
  return lsGet();
};

export const queueRemove = async (id) => {
  const result = await withStore("readwrite", (s) => s.delete(id));
  if (result === null) lsSet(lsGet().filter((i) => i.id !== id));
};

export const queueUpdate = async (item) => queueAdd(item);

export const queueClear = async () => {
  const result = await withStore("readwrite", (s) => s.clear());
  if (result === null) lsSet([]);
};
