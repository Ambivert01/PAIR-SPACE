import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { sendInvite } from "../services/relationship/relationshipService.js";
import { logout } from "../services/auth/authService.js";

const TYPES = [
  { value: "couple",      label: "Couple",      emoji: "❤️" },
  { value: "best_friend", label: "Best Friend", emoji: "🌟" },
  { value: "partner",     label: "Partner",     emoji: "🤝" },
  { value: "custom",      label: "Custom",      emoji: "💫" },
];

export default function InvitePartner() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", relationshipType: "couple" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) { setError("Email is required"); return; }
    setError(""); setLoading(true);
    try { await sendInvite(form); navigate("/relationship/pending-sent"); }
    catch (err) { setError(err.response?.data?.message || "Failed to send invite. Check the email and try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-white relative overflow-hidden px-4 py-10">
      {/* Ambient */}
      <div className="floating-orb floating-orb-love w-80 h-80 -top-20 -left-20 opacity-30" />
      <div className="floating-orb floating-orb-dream w-72 h-72 bottom-0 -right-16 opacity-25" style={{ animationDelay: "4s" }} />
      <div className="floating-orb floating-orb-glow w-48 h-48 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" style={{ animationDelay: "8s" }} />

      <motion.div className="w-full max-w-sm relative z-10" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, type: "spring", stiffness: 120 }}>
        <div className="card-glass glass-strong relative overflow-hidden">
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-love)]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-love)]/8 via-transparent to-[var(--accent-dream)]/8 pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Icon + title */}
            <div className="text-center space-y-3">
              <motion.div
                className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: "linear-gradient(135deg, rgba(255,93,126,0.2), rgba(168,85,247,0.2))", border: "1px solid rgba(255,93,126,0.3)" }}
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
              >
                🔒
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-white">Create your private space</h1>
                <p className="text-[var(--text-tertiary)] text-sm mt-1">Invite one person. Everything stays between you two.</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Their email</label>
                <input name="email" type="email" placeholder="partner@example.com" value={form.email} onChange={handleChange} required className="input-field" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Relationship type</label>
                <div className="grid grid-cols-2 gap-2">
                  {TYPES.map(t => (
                    <motion.button key={t.value} type="button" onClick={() => setForm(p => ({ ...p, relationshipType: t.value }))}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${form.relationshipType === t.value ? "border-[var(--accent-love)] bg-[var(--accent-love)]/15 text-white" : "border-[var(--glass-border)] text-[var(--text-secondary)] hover:border-[var(--glass-border-strong)]"}`}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <span>{t.emoji}</span><span>{t.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {error && (
                <motion.p className="text-[var(--status-error)] text-sm bg-[var(--status-error)]/10 rounded-xl px-3 py-2" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert">
                  {error}
                </motion.p>
              )}

              <motion.button type="submit" disabled={loading} className="w-full btn-primary btn-base"
                whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.97 }}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <motion.span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full inline-block" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                    Sending invite...
                  </span>
                ) : "Send invite 💌"}
              </motion.button>
            </form>

            <p className="text-center text-[var(--text-disabled)] text-xs">They need a PairSpace account to accept.</p>

            <button onClick={handleLogout} className="w-full text-[var(--text-disabled)] hover:text-[var(--text-tertiary)] text-xs py-1 transition-colors">Sign out</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
