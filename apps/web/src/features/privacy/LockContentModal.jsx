import { useState } from "react";

export default function LockContentModal({ mode = "lock", onSubmit, onClose }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pin.length < 4) { setError("PIN must be at least 4 digits"); return; }
    setLoading(true); setError("");
    try {
      await onSubmit(pin);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--glass-bg)] rounded-2xl w-full max-w-xs p-6 space-y-5">
        <div className="text-center space-y-2">
          <span className="text-3xl">{mode === "lock" ? "🔒" : "🔓"}</span>
          <p className="text-white font-medium">
            {mode === "lock" ? "Lock this memory" : "Unlock this memory"}
          </p>
          <p className="text-[var(--text-tertiary)] text-xs">
            {mode === "lock" ? "Set a PIN to protect this memory" : "Enter your PIN to unlock"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="Enter PIN (4-8 digits)"
            className="w-full bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-center text-lg text-white tracking-widest outline-none focus:border-[var(--accent-dream-soft)]"
            autoFocus
          />
          {error && <p className="text-[var(--status-error)] text-xs text-center">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 bg-[var(--glass-bg-strong)] hover:bg-[var(--glass-bg-strong)] rounded-xl py-2.5 text-sm text-[var(--text-secondary)] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || pin.length < 4}
              className="flex-1 gradient-mixed hover:bg-[var(--accent-dream)] disabled:opacity-30 rounded-xl py-2.5 text-sm font-medium transition-colors">
              {loading ? "..." : mode === "lock" ? "Lock" : "Unlock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
