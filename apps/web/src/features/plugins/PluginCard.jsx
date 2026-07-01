const TYPE_BADGE = {
  activity_plugin:     { label: "Activity",     color: "bg-teal-900/40 text-teal-300"    },
  game_plugin:         { label: "Game",         color: "bg-purple-900/40 text-purple-300" },
  ai_plugin:           { label: "AI",           color: "bg-indigo-900/40 text-[var(--accent-dream-soft)]" },
  memory_plugin:       { label: "Memory",       color: "bg-pink-900/40 text-pink-300"    },
  insight_plugin:      { label: "Insight",      color: "bg-amber-900/40 text-amber-300"  },
  notification_plugin: { label: "Notification", color: "bg-blue-900/40 text-blue-300"    },
  ui_panel_plugin:     { label: "UI Panel",     color: "bg-green-900/40 text-green-300"  },
  theme_plugin:        { label: "Theme",        color: "bg-rose-900/40 text-rose-300"    },
  integration_plugin:  { label: "Integration",  color: "bg-cyan-900/40 text-cyan-300"    },
};

export default function PluginCard({ plugin, onToggle, onConfigure }) {
  const badge = TYPE_BADGE[plugin.pluginType] || { label: plugin.pluginType, color: "bg-[var(--glass-bg-strong)] text-[var(--text-secondary)]" };

  return (
    <div className={`bg-[var(--glass-bg)] rounded-2xl p-4 space-y-3 border transition-colors ${
      plugin.enabled ? "border-indigo-800/50" : "border-[var(--glass-border)]"
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-white">{plugin.pluginName}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
            <span className="text-[10px] text-gray-700">v{plugin.version}</span>
          </div>
          {plugin.description && (
            <p className="text-xs text-[var(--text-tertiary)] mt-1">{plugin.description}</p>
          )}
          {plugin.lastError && (
            <p className="text-xs text-[var(--status-error)] mt-1">⚠️ {plugin.lastError}</p>
          )}
        </div>

        {/* toggle */}
        <button
          onClick={() => onToggle(plugin)}
          className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
            plugin.enabled ? "gradient-mixed" : "bg-[var(--glass-bg-strong)]"
          }`}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
            plugin.enabled ? "left-5" : "left-0.5"
          }`} />
        </button>
      </div>

      {plugin.enabled && Object.keys(plugin.configSchema || {}).length > 0 && (
        <button
          onClick={() => onConfigure(plugin)}
          className="text-xs text-[var(--accent-dream-soft)] hover:text-[var(--accent-dream-soft)] transition-colors"
        >
          Configure →
        </button>
      )}
    </div>
  );
}
