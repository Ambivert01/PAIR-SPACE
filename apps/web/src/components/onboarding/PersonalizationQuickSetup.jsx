/**
 * Personalization Quick Setup - Phase 6 of Onboarding
 *
 * Quick customization of space (theme, relationship name)
 * All steps are optional
 */

import { useState } from "react";

export default function PersonalizationQuickSetup({ onSave, onSkip }) {
  const [form, setForm] = useState({
    theme: "purple",
    relationshipName: "",
  });
  const [loading, setLoading] = useState(false);

  const themes = [
    {
      value: "purple",
      name: "Purple Dream",
      gradient: "from-purple-600 to-indigo-600",
    },
    { value: "pink", name: "Pink Love", gradient: "from-pink-500 to-rose-600" },
    {
      value: "blue",
      name: "Ocean Blue",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      value: "green",
      name: "Forest Green",
      gradient: "from-emerald-500 to-teal-600",
    },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
      <div className="max-w-md w-full stack-md">
        {/* Header */}
        <div className="text-center stack-sm">
          <div className="text-5xl mb-4">🎨</div>
          <h2 className="text-3xl font-bold text-white">Make it yours</h2>
          <p className="text-[var(--text-secondary)]">
            Customize your space (you can change this anytime)
          </p>
        </div>

        {/* Theme Selection */}
        <div className="stack-sm">
          <label className="text-sm font-medium text-[var(--text-secondary)]">
            Choose a theme
          </label>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.value}
                type="button"
                onClick={() => setForm({ ...form, theme: theme.value })}
                className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                  form.theme === theme.value
                    ? "border-white scale-105"
                    : "border-white/20 hover:border-white/40"
                }`}
              >
                <div
                  className={`h-24 bg-gradient-to-br ${theme.gradient}`}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                    {theme.name}
                  </span>
                </div>
                {form.theme === theme.value && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[var(--accent-dream)]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Relationship Name */}
        <div className="stack-sm">
          <label className="text-sm font-medium text-[var(--text-secondary)]">
            Name your space (optional)
          </label>
          <input
            type="text"
            value={form.relationshipName}
            onChange={(e) =>
              setForm({ ...form, relationshipName: e.target.value })
            }
            placeholder="e.g., Our Little World, Forever Together"
            maxLength={50}
            className="w-full glass-subtle rounded-xl px-4 py-3 text-white placeholder-[var(--text-disabled)] outline-none focus-ring transition-colors"
          />
          <p className="text-xs text-[var(--text-tertiary)]">
            Give your space a special name that means something to both of you
          </p>
        </div>

        {/* Actions */}
        <div className="stack-sm">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full btn-primary btn-base disabled"
          >
            {loading ? "Saving..." : "Save & Continue"}
          </button>

          <button
            onClick={onSkip}
            className="w-full text-[var(--text-tertiary)] hover:text-white text-sm transition-colors"
          >
            Skip for now
          </button>
        </div>

        {/* Preview */}
        <div className="glass-subtle rounded-xl p-4">
          <div className="hstack-sm">
            <div className="text-2xl">✨</div>
            <div className="text-sm text-[var(--text-secondary)]">
              <strong className="text-white">Preview:</strong> Your space will
              have a{" "}
              {themes.find((t) => t.value === form.theme)?.name.toLowerCase()}{" "}
              theme
              {form.relationshipName && ` called "${form.relationshipName}"`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
