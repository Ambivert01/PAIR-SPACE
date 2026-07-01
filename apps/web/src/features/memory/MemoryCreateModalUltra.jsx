/**
 * MemoryCreateModalUltra Component
 *
 * Premium memory creation modal with glassmorphism and smooth animations
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MEMORY_TYPES,
  MEMORY_TYPE_META,
} from "@shared/constants/memoryTypes.js";
import EmotionTagSelectorUltra from "./EmotionTagSelectorUltra.jsx";
import { createMemory } from "./memoryService.js";
import { useFileUpload } from "../media/useFileUpload.js";
import { useSyncContext } from "../../features/offline/SyncProvider.jsx";
import {
  modalBackdrop,
  modalContent,
  fadeUp,
  scaleIn,
} from "../../utils/motionPresets.js";

const SELECTABLE_TYPES = MEMORY_TYPES.filter((t) => t !== "system_generated");

export default function MemoryCreateModalUltra({
  relationshipId,
  onCreated,
  onClose,
}) {
  const [step, setStep] = useState(1); // 1=type, 2=details
  const [form, setForm] = useState({
    type: "",
    title: "",
    description: "",
    emotionTag: "happy",
    tags: "",
    memoryDate: new Date().toISOString().slice(0, 10),
    locationName: "",
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { upload, uploading, progress } = useFileUpload();
  const { isOnline, enqueue } = useSyncContext() || {};

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleMediaChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    try {
      const result = await upload({ file, relationshipId, context: "memory" });
      setUploadedMedia(result);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.type) return setError("Choose a memory type");
    setLoading(true);
    setError("");
    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const memPayload = {
        relationshipId,
        type: form.type,
        title: form.title,
        description: form.description,
        emotionTag: form.emotionTag,
        mediaIds: uploadedMedia ? [uploadedMedia.mediaId] : [],
        tags,
        memoryDate: form.memoryDate,
        location: form.locationName ? { name: form.locationName } : undefined,
      };

      // If offline — enqueue for later sync
      if (!isOnline) {
        enqueue?.({
          actionType: "memory_create",
          entityType: "memory",
          payload: memPayload,
          relationshipId,
        });
        onCreated({
          ...memPayload,
          _id: `temp_${Date.now()}`,
          createdAt: new Date().toISOString(),
        });
        onClose();
        return;
      }

      const memory = await createMemory(memPayload);
      onCreated(memory);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create memory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
        {...modalBackdrop}
        onClick={onClose}
      >
        <motion.div
          className="glass-strong rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto glass-border-strong shadow-2xl"
          {...modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="hstack-md justify-between px-5 py-4 glass-border border-b sticky top-0 glass-strong z-10">
            <div className="hstack-md">
              {step === 2 && (
                <motion.button
                  onClick={() => setStep(1)}
                  className="text-[var(--text-secondary)] hover:text-white transition-colors"
                  whileHover={{ scale: 1.1, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ←
                </motion.button>
              )}
              <p className="text-sm font-medium text-white">
                {step === 1 ? "What kind of memory?" : "Add details"}
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

          <AnimatePresence mode="wait">
            {step === 1 ? (
              /* Type selector */
              <motion.div
                key="step1"
                className="p-5 grid grid-cols-3 gap-3"
                {...fadeUp}
                exit={{ opacity: 0, x: -20 }}
              >
                {SELECTABLE_TYPES.map((type, index) => {
                  const { emoji, label } = MEMORY_TYPE_META[type];
                  return (
                    <motion.button
                      key={type}
                      onClick={() => {
                        set("type", type);
                        setStep(2);
                      }}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl glass glass-border hover:border-[var(--accent-dream)] hover:glass-dream transition-all duration-200"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <span className="text-xs text-[var(--text-secondary)]">
                        {label}
                      </span>
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              /* Details form */
              <motion.form
                key="step2"
                onSubmit={handleSubmit}
                className="p-5 stack-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Selected type badge */}
                <motion.div className="hstack-sm" {...scaleIn}>
                  <span className="text-xl">
                    {MEMORY_TYPE_META[form.type]?.emoji}
                  </span>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {MEMORY_TYPE_META[form.type]?.label}
                  </span>
                </motion.div>

                {/* Title */}
                <input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Title (optional)"
                  maxLength={120}
                  className="w-full glass glass-border focus-ring rounded-xl px-4 py-2.5 text-sm text-white placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent-dream)] focus:shadow-glow-dream transition-all"
                />

                {/* Description */}
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="What happened? How did it feel?"
                  maxLength={2000}
                  rows={3}
                  className="w-full glass glass-border focus-ring rounded-xl px-4 py-2.5 text-sm text-white placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent-dream)] focus:shadow-glow-dream transition-all resize-none"
                />

                {/* Emotion */}
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-2 uppercase tracking-wider">
                    How did it feel?
                  </p>
                  <EmotionTagSelectorUltra
                    value={form.emotionTag}
                    onChange={(v) => set("emotionTag", v)}
                  />
                </div>

                {/* Media upload */}
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-2 uppercase tracking-wider">
                    Add media
                  </p>
                  {uploadedMedia ? (
                    <motion.div
                      className="hstack-md glass rounded-xl p-3 glass-border"
                      {...scaleIn}
                    >
                      <span className="text-[var(--status-success)] text-sm">✓</span>
                      <span className="text-xs text-[var(--text-secondary)] truncate">
                        {mediaFile?.name}
                      </span>
                      <motion.button
                        type="button"
                        onClick={() => {
                          setUploadedMedia(null);
                          setMediaFile(null);
                        }}
                        className="ml-auto text-[var(--text-tertiary)] hover:text-white text-sm transition-colors"
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ×
                      </motion.button>
                    </motion.div>
                  ) : (
                    <label className="hstack-md glass border border-dashed glass-border rounded-xl p-3 cursor-pointer hover:border-[var(--accent-dream)] transition-all">
                      <span className="text-xl">📎</span>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        {uploading
                          ? `Uploading ${progress}%`
                          : "Attach photo, video, or audio"}
                      </span>
                      <input
                        type="file"
                        accept="image/*,video/*,audio/*"
                        className="hidden"
                        onChange={handleMediaChange}
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>

                {/* Date */}
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-2 uppercase tracking-wider">
                    When did this happen?
                  </p>
                  <input
                    type="date"
                    value={form.memoryDate}
                    onChange={(e) => set("memoryDate", e.target.value)}
                    className="w-full glass glass-border focus-ring rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--accent-dream)] focus:shadow-glow-dream transition-all"
                  />
                </div>

                {/* Location */}
                <input
                  value={form.locationName}
                  onChange={(e) => set("locationName", e.target.value)}
                  placeholder="📍 Location name (optional)"
                  className="w-full glass glass-border focus-ring rounded-xl px-4 py-2.5 text-sm text-white placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent-dream)] focus:shadow-glow-dream transition-all"
                />

                {/* Tags */}
                <input
                  value={form.tags}
                  onChange={(e) => set("tags", e.target.value)}
                  placeholder="Tags: vacation, birthday, trip (comma separated)"
                  className="w-full glass glass-border focus-ring rounded-xl px-4 py-2.5 text-sm text-white placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent-dream)] focus:shadow-glow-dream transition-all"
                />

                {error && (
                  <motion.p
                    className="text-[var(--status-error)] text-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.p>
                )}

                <motion.button
                  type="submit"
                  disabled={loading || uploading}
                  className="w-full btn-primary btn-base disabled"
                  whileHover={{ scale: loading || uploading ? 1 : 1.02 }}
                  whileTap={{ scale: loading || uploading ? 1 : 0.98 }}
                >
                  {loading ? "Saving..." : "Save memory ✨"}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
