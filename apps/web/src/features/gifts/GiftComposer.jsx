import { useState } from "react";
import { GIFT_TYPES, GIFT_ANIMATIONS, GIFT_REVEAL_MODES } from "@shared/constants/giftTypes.js";
import { sendGift } from "./giftService.js";

export default function GiftComposer({ relationshipId, onSent, onClose }) {
  const [step, setStep] = useState(1); // 1=type, 2=compose
  const [form, setForm] = useState({
    giftType: "", title: "", message: "", revealMode: "instant",
    scheduledRevealTime: "", countdownDays: 1, revealAnimation: "confetti",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const gift = await sendGift({ relationshipId, ...form });
      onSent(gift);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send");
    } finally { setLoading(false); }
  };

  const selectedType = GIFT_TYPES.find((t) => t.value === form.giftType);

  if (step === 1) return (
    <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-[var(--glass-bg)] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--glass-border)]">
          <p className="text-sm font-medium text-white">Choose a gift</p>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-white text-xl">×</button>
        </div>
        <div className="p-5 grid grid-cols-3 gap-3">
          {GIFT_TYPES.map((t) => (
            <button key={t.value} onClick={() => { set("giftType", t.value); setStep(2); }}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[var(--glass-border)] hover:border-[var(--accent-dream-soft)] hover:bg-indigo-900/20 transition-all">
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-xs text-[var(--text-secondary)] text-center">{t.label}</span>
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

          <textarea value={form.message} onChange={(e) => set("message", e.target.value)}
            placeholder="Your message..." rows={3} maxLength={1000}
            className="w-full bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[var(--accent-dream-soft)] resize-none" />

          <div>
            <p className="text-xs text-[var(--text-disabled)] mb-2">When to reveal?</p>
            <div className="space-y-2">
              {GIFT_REVEAL_MODES.map((m) => (
                <button key={m.value} type="button" onClick={() => set("revealMode", m.value)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    form.revealMode === m.value ? "border-[var(--accent-dream-soft)] bg-indigo-900/20 text-white" : "border-[var(--glass-border)] text-[var(--text-tertiary)]"
                  }`}>
                  <p className="font-medium">{m.label}</p>
                  <p className="text-[var(--text-disabled)] mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {form.revealMode === "scheduled" && (
            <input type="datetime-local" value={form.scheduledRevealTime}
              onChange={(e) => set("scheduledRevealTime", e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--accent-dream-soft)]" />
          )}

          {form.revealMode === "countdown" && (
            <div className="flex items-center gap-2">
              <input type="number" value={form.countdownDays} onChange={(e) => set("countdownDays", Number(e.target.value))}
                min={1} max={365}
                className="w-20 bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent-dream-soft)]" />
              <span className="text-sm text-[var(--text-secondary)]">days from now</span>
            </div>
          )}

          <div>
            <p className="text-xs text-[var(--text-disabled)] mb-2">Animation</p>
            <select value={form.revealAnimation} onChange={(e) => set("revealAnimation", e.target.value)}
              className="w-full bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--accent-dream-soft)]">
              {GIFT_ANIMATIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>

          {error && <p className="text-[var(--status-error)] text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full gradient-mixed hover:bg-[var(--accent-dream)] disabled:opacity-50 rounded-xl py-3 text-sm font-medium transition-colors">
            {loading ? "Sending..." : "Send gift 🎁"}
          </button>
        </form>
      </div>
    </div>
  );
}
