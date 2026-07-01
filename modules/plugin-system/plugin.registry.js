// In-memory registry of initialized plugin instances
const registry = new Map();

export const registerPlugin = (name, instance) => {
  registry.set(name, instance);
};

export const getPlugin = (name) => registry.get(name);

export const getAllPlugins = () => [...registry.values()];

export const getPluginsByType = (type) =>
  [...registry.values()].filter((p) => p.type === type);

export const unregisterPlugin = (name) => {
  const plugin = registry.get(name);
  if (plugin?.cleanup) {
    try { plugin.cleanup(); } catch { /* silent */ }
  }
  registry.delete(name);
};

export const isRegistered = (name) => registry.has(name);
