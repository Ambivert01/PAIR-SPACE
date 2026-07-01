import { useState } from "react";
import api from "../../services/api.js";

export default function PluginConfigPanel({ plugin, onSaved, onClose }) {
  const [config, setConfig] = useState(plugin.config || {});
  const [saving, setSaving] = useState(false);

  const schema = plugin.configSchema || {};

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/api/plugins/config", { pluginName: plugin.pluginName, config });
      onSaved?.();
      onClose();
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  const renderField = (key, def) => {
    const value = config[key] ?? def.default;
    if (def.type === "boolean") return (
      <div key={key} className="flex items-center justify-between py-2">
        <p className="text-sm text-[var(--text-secondary)]">{def.label || key}</p>
        <button onClick={() => setConfig((p) => ({ ...p, [key]: !value }))}
          className={`w-10 h-5 rounded-full transition-colors relative ${value ? "gradient-mixed" : "bg-[var(--glass-bg-strong)]"}`}>
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${value ? "left-5" : "left-0.5"}`} />
        </button>
      </div>
    );
    if (def.type === "number") return (
      <div key={key} className="space-y-1 py-2">
        <p className="text-sm text-[var(--text-secondary)]">{def.label || key}</p>
        <input type="number" value={value}
          onChange={(e) => setConfig((p) => ({ ...p, [key]: Number(e.target.value) }))}
          className="w-full bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent-dream-soft)]" />
      </div>
    );
    return (
      <div key={key} className="space-y-1 py-2">
        <p className="text-sm text-[var(--text-secondary)]">{def.label || key}</p>
        <input type="text" value={value}
          onChange={(e) => setConfig((p) => ({ ...p, [key]: e.target.value }))}
          className="w-full bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent-dream-soft)]" />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--glass-bg)] rounded-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--glass-border)]">
          <p className="text-sm font-medium text-white">Configure: {plugin.pluginName}</p>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-white text-xl">×</button>
        </div>
        <div className="px-5 py-4 divide-y divide-gray-800">
          {Object.entries(schema).map(([key, def]) => renderField(key, def))}
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 bg-[var(--glass-bg-strong)] hover:bg-[var(--glass-bg-strong)] rounded-xl py-2.5 text-sm text-[var(--text-secondary)] transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 gradient-mixed hover:bg-[var(--accent-dream)] disabled:opacity-50 rounded-xl py-2.5 text-sm font-medium transition-colors">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
