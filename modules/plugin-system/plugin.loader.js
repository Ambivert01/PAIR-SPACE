import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import Plugin from "./plugin.model.js";
import { registerPlugin, unregisterPlugin } from "./plugin.registry.js";
import { validatePlugin, isCompatible } from "../../shared/plugin-types/pluginInterfaces.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLUGINS_DIR = path.join(__dirname, "../../plugins");

// ── Load a single plugin from filesystem ──────────────────────────────────
const loadPluginModule = async (pluginDir) => {
  const indexPath = path.join(PLUGINS_DIR, pluginDir, "index.js");
  try {
    await fs.access(indexPath);
    const mod = await import(indexPath);
    return mod.default || mod;
  } catch {
    return null;
  }
};

// ── Initialize all enabled plugins ────────────────────────────────────────
export const initPlugins = async () => {
  try {
    const dirs = await fs.readdir(PLUGINS_DIR).catch(() => []);
    const dbPlugins = await Plugin.find({ enabled: true });

    for (const dir of dirs) {
      const mod = await loadPluginModule(dir);
      if (!mod) continue;

      const { valid, errors } = validatePlugin(mod);
      if (!valid) {
        continue;
      }

      if (!isCompatible(mod)) {
        continue;
      }

      // upsert in DB
      await Plugin.findOneAndUpdate(
        { pluginName: mod.name },
        {
          pluginName:   mod.name,
          pluginType:   mod.type,
          version:      mod.version,
          description:  mod.description || "",
          author:       mod.author || "",
          configSchema: mod.configSchema || {},
        },
        { upsert: true }
      );

      // initialize if enabled
      const dbRecord = dbPlugins.find((p) => p.pluginName === mod.name);
      if (dbRecord?.enabled) {
        try {
          if (mod.initialize) await mod.initialize(dbRecord.config || {});
          registerPlugin(mod.name, mod);
        } catch (err) {
          await Plugin.findOneAndUpdate({ pluginName: mod.name }, { lastError: err.message });
        }
      }
    }
  } catch (err) {
  }
};

// ── Enable a plugin at runtime ─────────────────────────────────────────────
export const enablePlugin = async (pluginName, config = {}) => {
  const dirs = await fs.readdir(PLUGINS_DIR).catch(() => []);
  for (const dir of dirs) {
    const mod = await loadPluginModule(dir);
    if (!mod || mod.name !== pluginName) continue;

    const { valid, errors } = validatePlugin(mod);
    if (!valid) throw new Error(`Invalid plugin: ${errors.join(", ")}`);

    if (mod.initialize) await mod.initialize(config);
    registerPlugin(mod.name, mod);
    await Plugin.findOneAndUpdate({ pluginName }, { enabled: true, config, lastError: "" });
    return mod;
  }
  throw new Error(`Plugin "${pluginName}" not found`);
};

// ── Disable a plugin at runtime ────────────────────────────────────────────
export const disablePlugin = async (pluginName) => {
  unregisterPlugin(pluginName);
  await Plugin.findOneAndUpdate({ pluginName }, { enabled: false });
};
