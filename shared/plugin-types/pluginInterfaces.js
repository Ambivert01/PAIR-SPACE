// ── Plugin type constants ──────────────────────────────────────────────────
export const PLUGIN_TYPES = [
  "activity_plugin","game_plugin","ai_plugin","memory_plugin",
  "insight_plugin","notification_plugin","ui_panel_plugin",
  "theme_plugin","integration_plugin",
];

// ── Required interface fields per plugin type ──────────────────────────────
export const PLUGIN_INTERFACE = {
  base: ["name","version","type","description"],
  activity_plugin:     ["activityType","label","emoji","initialize","execute"],
  game_plugin:         ["gameType","label","emoji","initialize","execute"],
  ai_plugin:           ["processMessage","processMemory"],
  memory_plugin:       ["memoryType","label","renderCard"],
  insight_plugin:      ["insightType","calculate"],
  notification_plugin: ["triggerOn","buildNotification"],
  ui_panel_plugin:     ["panelId","label","emoji","renderPanel"],
  theme_plugin:        ["themeId","cssVars"],
  integration_plugin:  ["serviceId","connect","disconnect"],
};

// ── Validate a plugin definition ───────────────────────────────────────────
export const validatePlugin = (plugin) => {
  const errors = [];
  for (const field of PLUGIN_INTERFACE.base) {
    if (!plugin[field]) errors.push(`Missing required field: ${field}`);
  }
  const typeFields = PLUGIN_INTERFACE[plugin.type] || [];
  for (const field of typeFields) {
    if (plugin[field] === undefined) errors.push(`Missing ${plugin.type} field: ${field}`);
  }
  if (plugin.version && !/^\d+\.\d+\.\d+$/.test(plugin.version)) {
    errors.push("Version must be semver (e.g. 1.0.0)");
  }
  return { valid: errors.length === 0, errors };
};

export const PLATFORM_VERSION = "1.0.0";

export const isCompatible = (plugin) => {
  if (!plugin.minPlatformVersion) return true;
  const [pMaj] = PLATFORM_VERSION.split(".").map(Number);
  const [minMaj] = plugin.minPlatformVersion.split(".").map(Number);
  return pMaj >= minMaj;
};
