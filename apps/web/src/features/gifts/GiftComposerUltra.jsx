/**
 * GiftComposerUltra Component
 *
 * Premium gift composer with glassmorphism and smooth animations
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GIFT_TYPES,
  GIFT_ANIMATIONS,
  GIFT_REVEAL_MODES,
} from "@shared/constants/giftTypes.js";
import { sendGift } from "./giftService.js";
import {
  modalBackdrop,
  modalContent,
  fadeUp,
  staggerContainer,
  staggerItem,
} from "../../utils/motionPresets.js";

export default function GiftComposerUltra({ relationshipId, onSent, onClose }) {
  const [step, setStep] = useState(1); // 1=type, 2=compose
  const [form, setForm] = useState({
    giftType: "",
    title: "",
    message: "",
    revealMode: "instant",
    scheduledRevealTime: "",
    countdownDays: 1,
    revealAnimation: "confetti",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const gift = await sendGift({ relationshipId, ...form });
      onSent(gift);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send");
    } finally {
      setLoading(false);
    }
  };

  const selectedType = GIFT_TYPES.find((t) => t.value === form.giftType);

  if (step === 1)
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
          {...modalBackdrop}
          onClick={onClose}
        >
          <motion.div
            className="glass-strong rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-[var(--glass-border)] shadow-2xl"
            {...modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--glass-border)] sticky top-0 glass-strong z-10">
              <motion.p
                className="text-sm font-medium text-white"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                Choose a gift
              </motion.p>
              <motion.button
                onClick={onClose}
                className="text-[var(--text-secondary)] hover:text-white text-xl transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                ×
              </motion.button>
            </div>

            {/* Type selector grid */}
            <motion.div
              className="p-5 grid grid-cols-3 gap-3"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {GIFT_TYPES.map((t, index) => (
                <motion.button
                  key={t.value}
                  onClick={() => {
                    set("giftType", t.value);
                    setStep(2);
                  }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl glass border border-[var(--glass-border)] hover:border-[var(--accent-love)] hover:glass-love transition-all"
                  variants={staggerItem}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <span className="text-xs text-[var(--text-secondary)] text-center">
                    {t.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
        {...modalBackdrop}
        onClick={onClose}
      >
        <motion.div
          className="glass-strong rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-[var(--glass-border)] shadow-2xl"
          {...modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="hstack-md justify-between px-5 py-4 border-b border-[var(--glass-border)] sticky top-0 glass-strong z-10">
            <div className="hstack-sm">
              <motion.button
                onClick={() => setStep(1)}
                className="text-[var(--text-secondary)] hover:text-white transition-colors"
                whileHover={{ scale: 1.1, x: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                ←
              </motion.button>
              <span className="text-lg">{selectedType?.emoji}</span>
              <p className="text-sm font-medium text-white">
                {selectedType?.label}
              </p>
            </div>
            <motion.button
              onClick={onClose}
              className="text-[var(--text-secondary)] hover:text-white text-xl transition-colors"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
            >
              ×
            </motion.button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 stack-md">
            {/* Title */}
            <motion.input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Title (optional)"
              maxLength={120}
              className="w-full glass glass-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-[var(--text-tertiary)] outline-none focus-ring transition-all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            />

            {/* Message */}
            <motion.textarea
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              placeholder="Your message..."
              rows={3}
              maxLength={1000}
              className="w-full glass glass-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-[var(--text-tertiary)] outline-none focus-ring transition-all resize-none"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            />

            {/* Reveal mode */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xs text-[var(--text-tertiary)] mb-2 uppercase tracking-wider">
                When to reveal?
              </p>
              <div className="stack-xs">
                {GIFT_REVEAL_MODES.map((m, index) => (
                  <motion.button
                    key={m.value}
                    type="button"
                    onClick={() => set("revealMode", m.value)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      form.revealMode === m.value
                        ? "border-[var(--accent-love)] glass-love text-white"
                        : "border-[var(--glass-border)] glass text-[var(--text-secondary)]"
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + index * 0.05 }}
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <p className="font-medium">{m.label}</p>
                    <p className="text-[var(--text-tertiary)] mt-0.5">
                      {m.desc}
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Scheduled date */}
            <AnimatePresence>
              {form.revealMode === "scheduled" && (
                <motion.input
                  type="datetime-local"
                  value={form.scheduledRevealTime}
                  onChange={(e) => set("scheduledRevealTime", e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full glass border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--accent-love)] transition-all"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                />
              )}
            </AnimatePresence>

            {/* Countdown days */}
            <AnimatePresence>
              {form.revealMode === "countdown" && (
                <motion.div
                  className="hstack-sm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <input
                    type="number"
                    value={form.countdownDays}
                    onChange={(e) =>
                      set("countdownDays", Number(e.target.value))
                    }
                    min={1}
                    max={365}
                    className="w-20 glass border border-[var(--glass-border)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent-love)] transition-all"
                  />
                  <span className="text-sm text-[var(--text-secondary)]">
                    days from now
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Animation selector */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-xs text-[var(--text-tertiary)] mb-2 uppercase tracking-wider">
                Animation
              </p>
              <select
                value={form.revealAnimation}
                onChange={(e) => set("revealAnimation", e.target.value)}
                className="w-full glass border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--accent-love)] transition-all cursor-pointer"
              >
                {GIFT_ANIMATIONS.map((a) => (
                  <option
                    key={a.value}
                    value={a.value}
                    className="bg-[var(--bg-primary)]"
                  >
                    {a.label}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  className="text-[var(--status-error)] text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full btn-primary btn-base disabled"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              {loading ? "Sending..." : "Send gift 🎁"}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
