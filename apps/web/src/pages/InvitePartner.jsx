import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { sendInvite } from "../services/relationship/relationshipService.js";
import { logout } from "../services/auth/authService.js";

const TYPES = [
  { value: "couple",      label: "❤️  Couple" },
  { value: "best_friend", label: "🌟  Best Friend" },
  { value: "partner",     label: "🤝  Partner" },
  { value: "custom",      label: "💫  Custom" },
];

export default function InvitePartner() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", relationshipType: "couple" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) { setError("Email is required"); return; }
    setError("");
    setLoading(true);
    try {
      await sendInvite(form);
      navigate("/relationship/pending-sent");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send invite. Check the email and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-white relative overflow-hidden px-4 py-10">
      <div className="floating-orb floating-orb-love w-64 h-64 -top-10 -left-10" />
      <div className="floating-orb floating-orb-dream w-64 h-64 bottom-0 -right-10" style={{ animationDelay: "3s" }} />

      <motion.div
        className="w-full max-w-sm relative z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="card-glass glass-strong space-y-6">
          <div className="text-center space-y-2">
            <motion.div
              className="text-5xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
            >
              🔒
            </motion.div>
            <h1 className="text-h2 text-white">Create your private space</h1>
            <p className="text-caption">
              Invite one person. Everything you share stays between you two.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="stack-md" noValidate>
            <input
              name="email"
              type="email"
              placeholder="Their email address"
              value={form.email}
              onChange={handleChange}
              required
              className="input-field"
            />

            <select
              name="relationshipType"
              value={form.relationshipType}
              onChange={handleChange}
              className="input-field"
              style={{ background: "var(--glass-bg)" }}
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value} style={{ background: "var(--bg-tertiary)" }}>
                  {t.label}
                </option>
              ))}
            </select>

            {error && (
              <motion.p
                className="text-[var(--status-error)] text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                role="alert"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full btn-primary btn-base"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
            >
              {loading ? (
                <span className="hstack-sm">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Sending invite...
                </span>
              ) : "Send invite"}
            </motion.button>
          </form>

          <p className="text-center text-small">
            They need a PairSpace account to accept.
          </p>

          <button
            onClick={handleLogout}
            className="w-full text-[var(--text-disabled)] hover:text-[var(--text-tertiary)] text-xs py-1 transition-colors"
          >
            Sign out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
