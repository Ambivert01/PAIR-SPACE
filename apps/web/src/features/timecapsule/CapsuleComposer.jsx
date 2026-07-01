import { useState } from "react";
import { CAPSULE_TYPES, OPEN_CONDITIONS } from "@shared/constants/capsuleTypes.js";
import { createCapsule } from "./capsuleService.js";
import VoiceRecorder from "./VoiceRecorder.jsx";

export default function CapsuleComposer({ relationshipId, onCreated, onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    capsuleType: "", title: "", message: "",
    openCondition: "specific_date", lockedUntil: "",
    afterDays: 7, afterMonths: 1, mediaId: "",
  });
  const [showVoice, setShowVoice] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const selectedType = CAPSULE_TYPES.find((t) => t.value === form.capsuleType);
  const isVoice = form.capsuleType === "voice_letter";
  const isVideo = form.capsuleType === "video_letter";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const capsule = await createCapsule({ relationshipId, ...form });
      onCreated(capsule);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create");
    } finally { setLoading(false); }
  };

  if (step === 1) return (
    <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-[var(--glass-bg)] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--glass-border)]">
          <p className="text-sm font-medium text-white">Create a time capsule</p>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-white text-xl">×</button>
        </div>
        <div className="p-5 grid grid-cols-2 gap-3">
          {CAPSULE_TYPES.map((t) => (
            <button key={t.value} onClick={() => { set("capsuleType", t.value); setStep(2); }}
              className="flex items-center gap-3 p-3 bg-[var(--glass-bg-strong)] rounded-xl border border-[var(--glass-border)] hover:border-[var(--accent-dream-soft)] hover:bg-indigo-900/20 transition-all text-left">
              <span className="text-2xl flex-shrink-0">{t.emoji}</span>
              <div>
                <p className="text-xs font-medium text-white">{t.label}</p>
                <p className="text-[10px] text-[var(--text-disabled)]">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-[var(--glass-bg)] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--glass-border)]">
          <div className="flex items-center gap-2">
            <button onClick={() => setStep(1)} className="text-[var(--text-tertiary)] hover:text-white">←</button>
            <span className="text-lg">{selectedType?.emoji}</span>
            <p className="text-sm font-medium text-white">{selectedType?.label}</p>
          </div>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-white text-xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <input value={form.title} onChange={(e) => set("title", e.target.value)}
            placeholder="Title (optional)" maxLength={120}
            className="w-full bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[var(--accent-dream-soft)]" />

          {/* voice recording */}
          {(isVoice || isVideo) ? (
            <div className="bg-[var(--glass-bg-strong)] rounded-xl p-4">
              {form.mediaId ? (
                <div className="flex items-center gap-3">
                  <span className="text-[var(--status-success)] text-sm">✓</span>
                  <span className="text-xs text-[var(--text-secondary)]">Recording saved</span>
                  <button type="button" onClick={() => set("mediaId", "")} className="ml-auto text-[var(--text-disabled)] hover:text-[var(--text-secondary)] text-sm">×</button>
                </div>
              ) : (
                <VoiceRecorder
                  relationshipId={relationshipId}
                  onRecorded={(r) => set("mediaId", r.mediaId)}
                  onClose={() => {}}
                />
              )}
            </div>
          ) : (
            <textarea value={form.message} onChange={(e) => set("message", e.target.value)}
              placeholder="Your message to the future..." rows={4} maxLength={10000}
              className="w-full bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[var(--accent-dream-soft)] resize-none" />
          )}

          {/* unlock condition */}
          <div>
            <p className="text-xs text-[var(--text-disabled)] mb-2">When to unlock?</p>
            <div className="space-y-2">
              {OPEN_CONDITIONS.map((c) => (
                <button key={c.value} type="button" onClick={() => set("openCondition", c.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-xs transition-all ${
                    form.openCondition === c.value ? "border-[var(--accent-dream-soft)] bg-indigo-900/20 text-white" : "border-[var(--glass-border)] text-[var(--text-tertiary)]"
                  }`}>
                  <span>{c.emoji}</span><span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {form.openCondition === "specific_date" && (
            <input type="datetime-local" value={form.lockedUntil}
              onChange={(e) => set("lockedUntil", e.target.value)}
              min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
              className="w-full bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--accent-dream-soft)]" />
          )}

          {form.openCondition === "after_days" && (
            <div className="flex items-center gap-2">
              <input type="number" value={form.afterDays} onChange={(e) => set("afterDays", Number(e.target.value))}
                min={1} max={3650}
                className="w-20 bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent-dream-soft)]" />
              <span className="text-sm text-[var(--text-secondary)]">days from now</span>
            </div>
          )}

          {form.openCondition === "after_months" && (
            <div className="flex items-center gap-2">
              <input type="number" value={form.afterMonths} onChange={(e) => set("afterMonths", Number(e.target.value))}
                min={1} max={120}
                className="w-20 bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent-dream-soft)]" />
              <span className="text-sm text-[var(--text-secondary)]">months from now</span>
            </div>
          )}

          {error && <p className="text-[var(--status-error)] text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full gradient-mixed hover:bg-[var(--accent-dream)] disabled:opacity-50 rounded-xl py-3 text-sm font-medium transition-colors">
            {loading ? "Sealing capsule..." : "🔒 Seal time capsule"}
          </button>
        </form>
      </div>
    </div>
  );
}
