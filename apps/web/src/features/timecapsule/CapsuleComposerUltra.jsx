/**
 * CapsuleComposerUltra Component
 *
 * Premium capsule composer with glassmorphism and smooth animations
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CAPSULE_TYPES,
  OPEN_CONDITIONS,
} from "@shared/constants/capsuleTypes.js";
import { createCapsule } from "./capsuleService.js";
import VoiceRecorderUltra from "./VoiceRecorderUltra.jsx";
import {
  modalBackdrop,
  modalContent,
  fadeUp,
  staggerContainer,
  staggerItem,
} from "../../utils/motionPresets.js";

export default function CapsuleComposerUltra({
  relationshipId,
  onCreated,
  onClose,
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    capsuleType: "",
    title: "",
    message: "",
    openCondition: "specific_date",
    lockedUntil: "",
    afterDays: 7,
    afterMonths: 1,
    mediaId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const selectedType = CAPSULE_TYPES.find((t) => t.value === form.capsuleType);
  const isVoice = form.capsuleType === "voice_letter";
  const isVideo = form.capsuleType === "video_letter";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const capsule = await createCapsule({ relationshipId, ...form });
      onCreated(capsule);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create");
    } finally {
      setLoading(false);
    }
  };

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
                Create a time capsule
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
              className="p-5 grid grid-cols-2 gap-3"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {CAPSULE_TYPES.map((t, index) => (
                <motion.button
                  key={t.value}
                  onClick={() => {
                    set("capsuleType", t.value);
                    setStep(2);
                  }}
                  className="hstack-sm p-3 glass rounded-xl border border-[var(--glass-border)] hover:border-[var(--accent-dream)] hover:glass-dream transition-all text-left"
                  variants={staggerItem}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-2xl flex-shrink-0">{t.emoji}</span>
                  <div>
                    <p className="text-xs font-medium text-white">{t.label}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">
                      {t.desc}
                    </p>
                  </div>
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

            {/* Voice recording or message */}
            {isVoice || isVideo ? (
              <motion.div
                className="glass rounded-xl p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {form.mediaId ? (
                  <div className="hstack-sm">
                    <span className="text-[var(--status-success)] text-sm">✓</span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      Recording saved
                    </span>
                    <motion.button
                      type="button"
                      onClick={() => set("mediaId", "")}
                      className="ml-auto text-[var(--text-tertiary)] hover:text-white text-sm transition-colors"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ×
                    </motion.button>
                  </div>
                ) : (
                  <VoiceRecorderUltra
                    relationshipId={relationshipId}
                    onRecorded={(r) => set("mediaId", r.mediaId)}
                    onClose={() => {}}
                  />
                )}
              </motion.div>
            ) : (
              <motion.textarea
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                placeholder="Your message to the future..."
                rows={4}
                maxLength={10000}
                className="w-full glass glass-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-[var(--text-tertiary)] outline-none focus-ring transition-all resize-none"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              />
            )}

            {/* Open condition */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xs text-[var(--text-tertiary)] mb-2 uppercase tracking-wider">
                When to unlock?
              </p>
              <div className="stack-xs">
                {OPEN_CONDITIONS.map((c, index) => (
                  <motion.button
                    key={c.value}
                    type="button"
                    onClick={() => set("openCondition", c.value)}
                    className={`w-full hstack-sm p-3 rounded-xl border text-xs transition-all ${
                      form.openCondition === c.value
                        ? "border-[var(--accent-dream)] glass-dream text-white"
                        : "border-[var(--glass-border)] glass text-[var(--text-secondary)]"
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + index * 0.05 }}
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span>{c.emoji}</span>
                    <span>{c.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Specific date */}
            <AnimatePresence>
              {form.openCondition === "specific_date" && (
                <motion.input
                  type="datetime-local"
                  value={form.lockedUntil}
                  onChange={(e) => set("lockedUntil", e.target.value)}
                  min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                  className="w-full glass border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--accent-dream)] transition-all"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                />
              )}
            </AnimatePresence>

            {/* After days */}
            <AnimatePresence>
              {form.openCondition === "after_days" && (
                <motion.div
                  className="hstack-sm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <input
                    type="number"
                    value={form.afterDays}
                    onChange={(e) => set("afterDays", Number(e.target.value))}
                    min={1}
                    max={3650}
                    className="w-20 glass border border-[var(--glass-border)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent-dream)] transition-all"
                  />
                  <span className="text-sm text-[var(--text-secondary)]">
                    days from now
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* After months */}
            <AnimatePresence>
              {form.openCondition === "after_months" && (
                <motion.div
                  className="hstack-sm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <input
                    type="number"
                    value={form.afterMonths}
                    onChange={(e) => set("afterMonths", Number(e.target.value))}
                    min={1}
                    max={120}
                    className="w-20 glass border border-[var(--glass-border)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent-dream)] transition-all"
                  />
                  <span className="text-sm text-[var(--text-secondary)]">
                    months from now
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

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
              transition={{ delay: 0.3 }}
            >
              {loading ? "Sealing capsule..." : "🔒 Seal time capsule"}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
