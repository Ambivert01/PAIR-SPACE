/**
 * JournalResponseBoxUltra Component
 *
 * Premium journal response box with glassmorphism and smooth animations
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addResponse } from "./journalService.js";
import { fadeUp, scaleIn } from "../../utils/motionPresets.js";

export default function JournalResponseBoxUltra({ entryId, onAdded }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { responses } = await addResponse(entryId, text.trim());
      onAdded?.(responses);
      setText("");
      setFocused(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send response");
    } finally {
      setLoading(false);
    }
  };

  const charCount = text.length;
  const maxChars = 3000;
  const isNearLimit = charCount > maxChars * 0.9;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="stack-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Textarea */}
      <motion.div
        className="relative"
        animate={{
          scale: focused ? 1.01 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Write your response..."
          rows={focused ? 5 : 3}
          maxLength={maxChars}
          className={`w-full glass glass-border rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--text-tertiary)] outline-none resize-none transition-all ${
            focused ? "focus-ring shadow-glow-dream" : ""
          }`}
        />

        {/* Character count */}
        <AnimatePresence>
          {focused && (
            <motion.div
              className="absolute bottom-2 right-2 text-xs"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <span
                className={
                  isNearLimit
                    ? "text-yellow-500"
                    : "text-[var(--text-tertiary)]"
                }
              >
                {charCount}/{maxChars}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            className="text-[var(--status-error)] text-xs"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Submit button */}
      <div className="flex items-center justify-between">
        <motion.p
          className="text-xs text-[var(--text-tertiary)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: focused ? 1 : 0 }}
        >
          Share your thoughts with your partner
        </motion.p>

        <motion.button
          type="submit"
          disabled={!text.trim() || loading}
          className="btn-primary btn-base disabled"
          whileHover={{ scale: !text.trim() || loading ? 1 : 1.05 }}
          whileTap={{ scale: !text.trim() || loading ? 1 : 0.95 }}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {loading ? (
            <span className="hstack-sm">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                ⟳
              </motion.span>
              Sending...
            </span>
          ) : (
            "Respond"
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}
