import api from "../services/api.js";

// ── Client-side plugin registry ────────────────────────────────────────────
const clientRegistry = new Map();

export const registerClientPlugin = (plugin) => {
  clientRegistry.set(plugin.name, plugin);
};

export const getClientPlugin = (name) => clientRegistry.get(name);

export const getClientPluginsByType = (type) =>
  [...clientRegistry.values()].filter((p) => p.type === type);

// ── Load enabled plugins from server ──────────────────────────────────────
export const loadPluginsFromServer = async () => {
  try {
    const { data } = await api.get("/api/plugins");
    return data.plugins.filter((p) => p.enabled && p.loaded);
  } catch {
    return [];
  }
};

// ── Get plugins of a specific type from server ────────────────────────────
export const getServerPluginsByType = async (type) => {
  try {
    const { data } = await api.get(`/api/plugins/type/${type}`);
    return data.plugins;
  } catch {
    return [];
  }
};
