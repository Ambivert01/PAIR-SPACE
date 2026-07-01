import { useEffect, useState } from "react";
import api from "../../services/api.js";
import PluginCard from "./PluginCard.jsx";
import PluginConfigPanel from "./PluginConfigPanel.jsx";

const TYPE_FILTERS = [
  { value: "",                  label: "All" },
  { value: "activity_plugin",   label: "Activities" },
  { value: "game_plugin",       label: "Games" },
  { value: "ai_plugin",         label: "AI" },
  { value: "notification_plugin",label: "Notifications" },
  { value: "ui_panel_plugin",   label: "UI Panels" },
  { value: "integration_plugin",label: "Integrations" },
];

export default function PluginManager() {
  const [plugins, setPlugins]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [configPlugin, setConfigPlugin] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/api/plugins")
      .then(({ data }) => setPlugins(data.plugins))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (plugin) => {
    try {
      if (plugin.enabled) {
        await api.post("/api/plugins/disable", { pluginName: plugin.pluginName });
      } else {
        await api.post("/api/plugins/enable", { pluginName: plugin.pluginName, config: plugin.config || {} });
      }
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to toggle plugin");
    }
  };

  const filtered = typeFilter ? plugins.filter((p) => p.pluginType === typeFilter) : plugins;

  return (
    <div className="space-y-4">
      {/* type filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TYPE_FILTERS.map((f) => (
          <button key={f.value} onClick={() => setTypeFilter(f.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors ${
              typeFilter === f.value ? "border-[var(--accent-dream-soft)] bg-indigo-900/40 text-white" : "border-[var(--glass-border)] text-[var(--text-tertiary)]"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 border-2 border-[var(--accent-dream-soft)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 space-y-2">
          <span className="text-3xl">🔌</span>
          <p className="text-[var(--text-tertiary)] text-sm">No plugins found</p>
          <p className="text-gray-700 text-xs">Add plugin folders to the /plugins directory</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <PluginCard key={p.pluginName} plugin={p}
              onToggle={handleToggle}
              onConfigure={setConfigPlugin}
            />
          ))}
        </div>
      )}

      {configPlugin && (
        <PluginConfigPanel
          plugin={configPlugin}
          onSaved={load}
          onClose={() => setConfigPlugin(null)}
        />
      )}
    </div>
  );
}
