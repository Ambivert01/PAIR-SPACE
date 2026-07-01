/**
 * Relationship Setup - Phase 3 of Onboarding
 *
 * User invites their partner to create a shared space
 */

import { useState } from "react";

export default function RelationshipSetup({ onInvite, onSkip }) {
  const [form, setForm] = useState({
    partnerEmail: "",
    relationshipType: "romantic",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const relationshipTypes = [
    { value: "romantic", label: "Romantic Partner", emoji: "❤️" },
    { value: "best_friend", label: "Best Friend", emoji: "👯" },
    { value: "friend", label: "Friend", emoji: "🤝" },
    { value: "family", label: "Family", emoji: "👨‍👩‍👧‍👦" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    if (!form.partnerEmail || !form.partnerEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onInvite(form);
    } catch (err) {
      console.error("Invitation error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to send invite";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)] p-4">
      <div className="max-w-md w-full stack-md">
        {/* Header */}
        <div className="text-center stack-sm">
          <div className="text-5xl mb-4">💌</div>
          <h2 className="text-3xl font-bold text-white">
            Who do you want to connect with?
          </h2>
          <p className="text-purple-200">
            Invite someone special to share your private space
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="stack-md">
          {/* Partner Email */}
          <div className="stack-sm">
            <label className="text-sm font-medium text-purple-200">
              Their email address
            </label>
            <input
              type="email"
              value={form.partnerEmail}
              onChange={(e) =>
                setForm({ ...form, partnerEmail: e.target.value })
              }
              placeholder="partner@example.com"
              required
              className="w-full glass-subtle rounded-xl px-4 py-3 text-white placeholder-purple-300 outline-none focus-ring transition-colors"
            />
          </div>

          {/* Relationship Type */}
          <div className="stack-sm">
            <label className="text-sm font-medium text-purple-200">
              Relationship type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {relationshipTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setForm({ ...form, relationshipType: type.value })
                  }
                  className={`p-4 rounded-xl border-2 transition-all ${
                    form.relationshipType === type.value
                      ? "bg-gradient-to-r from-pink-500/20 to-purple-600/20 border-pink-500"
                      : "bg-white/5 border-white/20 hover:border-white/40"
                  }`}
                >
                  <div className="text-2xl mb-1">{type.emoji}</div>
                  <div className="text-sm font-medium text-white">
                    {type.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="stack-sm">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary btn-base disabled"
            >
              {loading ? "Sending invite..." : "Send Invite"}
            </button>

            <button
              type="button"
              onClick={onSkip}
              className="w-full text-[var(--text-secondary)] hover:text-white text-sm transition-colors"
            >
              I'll do this later
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="glass-subtle rounded-xl p-4">
          <div className="hstack-sm">
            <div className="text-2xl">💡</div>
            <div className="text-sm text-purple-200">
              <strong className="text-white">Tip:</strong> They'll receive an
              email invitation to join your space. Once they accept, you can
              start chatting and sharing memories!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
