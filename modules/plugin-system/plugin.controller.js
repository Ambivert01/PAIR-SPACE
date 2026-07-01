import Plugin from "./plugin.model.js";
import { enablePlugin, disablePlugin } from "./plugin.loader.js";
import { getAllPlugins, getPluginsByType } from "./plugin.registry.js";

export const listPlugins = async (req, res) => {
  try {
    const plugins = await Plugin.find().sort({ pluginType: 1, pluginName: 1 });
    // merge with runtime registry status
    const withStatus = plugins.map((p) => ({
      ...p.toObject(),
      loaded: getAllPlugins().some((r) => r.name === p.pluginName),
    }));
    res.json({ plugins: withStatus });
  } catch {
    res.status(500).json({ error: true, message: "Failed to list plugins" });
  }
};

export const enablePluginHandler = async (req, res) => {
  const { pluginName, config = {} } = req.body;
  try {
    const mod = await enablePlugin(pluginName, config);
    res.json({ enabled: true, plugin: { name: mod.name, type: mod.type, version: mod.version } });
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

export const disablePluginHandler = async (req, res) => {
  const { pluginName } = req.body;
  try {
    await disablePlugin(pluginName);
    res.json({ disabled: true });
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

export const updatePluginConfig = async (req, res) => {
  const { pluginName, config } = req.body;
  try {
    const plugin = await Plugin.findOneAndUpdate(
      { pluginName },
      { config },
      { new: true }
    );
    if (!plugin) return res.status(404).json({ error: true, message: "Plugin not found" });
    res.json(plugin);
  } catch {
    res.status(500).json({ error: true, message: "Failed to update config" });
  }
};

export const getPluginsByTypeHandler = async (req, res) => {
  const { type } = req.params;
  try {
    const plugins = getPluginsByType(type);
    res.json({ plugins: plugins.map((p) => ({ name: p.name, type: p.type, label: p.label, emoji: p.emoji, version: p.version })) });
  } catch {
    res.status(500).json({ error: true, message: "Failed" });
  }
};
