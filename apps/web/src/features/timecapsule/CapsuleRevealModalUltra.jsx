import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CAPSULE_TYPES } from "@shared/constants/capsuleTypes.js";
import {
  openCapsule,
  reactToCapsule,
  convertToMemory,
  manualUnlock,
} from "./capsuleService.js";
import CountdownTimer from "./CountdownTimer.jsx";

const QUICK_REACTIONS = ["❤️", "🥺", "😍", "🙏", "😊", "💕"];
import { MEDIA_BASE } from "@shared/constants/urls.js";
const BASE = MEDIA_BASE;

// Typewriter text component
const TypewriterText = ({ text }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text]);

  return <span>{displayText}</span>;
};

// Sparkle particles
const Sparkles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 bg-[var(--accent-dream)] rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        />
      ))}
    </div>
  );
};

export default function CapsuleRevealModalUltra({
  capsule: initial,
  currentUserId,
  onClose,
  onOpened,
}) {
  const [capsule, setCapsule] = useState(initial);
  const [opening, setOpening] = useState(false);
  const [converted, setConverted] = useState(!!initial.convertedToMemoryId);
  const [unlocking, setUnlocking] = useState(false);
  const [showContent, setShowContent] = useState(
    initial.opened || initial.visibilityState === "opened",
  );

  const typeMeta = CAPSULE_TYPES.find(
    (t) => t.value === capsule.capsuleType,
  ) || {
    emoji: "⏳",
    label: "Capsule",
  };
  const isCreator =
    capsule.creatorId?._id?.toString() === currentUserId ||
    capsule.creatorId?.toString() === currentUserId;
  const state = capsule.visibilityState || "locked";
  const isReady = state === "ready_to_open" || state === "opened";

  const handleOpen = async () => {
    if (isCreator || capsule.opened) return;
    setOpening(true);
    try {
      const opened = await openCapsule(capsule._id);
      setCapsule({ ...opened, visibilityState: "opened" });
      setTimeout(() => setShowContent(true), 800);
      onOpened?.(opened);
    } catch {
      /* silent */
    } finally {
      setOpening(false);
    }
  };

  const handleReact = async (emoji) => {
    await reactToCapsule(capsule._id, emoji).catch(() => {});
    setCapsule((c) => ({ ...c, reaction: emoji }));
  };

  const handleConvert = async () => {
    await convertToMemory(capsule._id).catch(() => {});
    setConverted(true);
  };

  const handleUnlock = async () => {
    setUnlocking(true);
    await manualUnlock(capsule._id).catch(() => {});
    setCapsule((c) => ({
      ...c,
      lockedUntil: new Date().toISOString(),
      visibilityState: "ready_to_open",
    }));
    setUnlocking(false);
  };

  const media = capsule.mediaId;

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-black/95 to-[#1a0a2e]/95 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {isReady && <Sparkles />}

      <motion.div
        className="glass-strong rounded-3xl w-full max-w-md overflow-hidden shadow-strong border border-[var(--glass-border)] relative"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <motion.span
              className="text-2xl"
              whileHover={{ scale: 1.2, rotate: 10 }}
            >
              {typeMeta.emoji}
            </motion.span>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {typeMeta.label}
            </p>
          </div>
          <motion.button
            onClick={onClose}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-2xl"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            ×
          </motion.button>
        </div>

        <div className="px-6 py-8 stack-lg text-center">
          {/* Locked state */}
          {state === "locked" && (
            <motion.div
              className="stack-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.p
                className="text-5xl"
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                🔒
              </motion.p>
              <p className="text-[var(--text-secondary)] text-base font-light">
                This capsule is still locked
              </p>
              <CountdownTimer
                lockedUntil={capsule.lockedUntil}
                onUnlocked={() =>
                  setCapsule((c) => ({
                    ...c,
                    visibilityState: "ready_to_open",
                  }))
                }
              />
              {isCreator && capsule.openCondition === "manual_unlock" && (
                <motion.button
                  onClick={handleUnlock}
                  disabled={unlocking}
                  className="text-sm text-[var(--accent-dream)] hover:text-[var(--accent-love)] transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {unlocking ? "Unlocking..." : "🔑 Unlock now"}
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Countdown active */}
          {state === "countdown_active" && (
            <motion.div
              className="stack-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.p
                className="text-5xl"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ⏳
              </motion.p>
              <p className="text-[var(--text-secondary)] text-base font-light">
                Almost time...
              </p>
              <CountdownTimer
                lockedUntil={capsule.lockedUntil}
                onUnlocked={() =>
                  setCapsule((c) => ({
                    ...c,
                    visibilityState: "ready_to_open",
                  }))
                }
              />
            </motion.div>
          )}

          {/* Ready or opened */}
          {isReady && (
            <>
              <motion.p
                className="text-xs text-[var(--text-tertiary)] font-light"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                From {isCreator ? "You" : capsule.creatorId?.displayName}
              </motion.p>

              {capsule.title && (
                <motion.h2
                  className="text-2xl font-light text-[var(--text-primary)]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {capsule.title}
                </motion.h2>
              )}

              {/* Media */}
              {media && showContent && (
                <motion.div
                  className="rounded-2xl overflow-hidden"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {media.type === "audio" ||
                  capsule.capsuleType === "voice_letter" ? (
                    <audio
                      src={`${BASE}${media.url}`}
                      controls
                      autoPlay={capsule.opened}
                      className="w-full"
                    />
                  ) : media.type === "video" ? (
                    <video
                      src={`${BASE}${media.url}`}
                      controls
                      className="w-full max-h-64 rounded-xl"
                    />
                  ) : (
                    <img
                      src={`${BASE}${media.thumbnailUrl || media.url}`}
                      alt=""
                      className="w-full max-h-64 object-cover"
                    />
                  )}
                </motion.div>
              )}

              {/* Message with typewriter */}
              {capsule.message && showContent && (
                <motion.p
                  className="text-[var(--text-primary)] text-base leading-relaxed whitespace-pre-wrap text-left font-light"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  style={{ lineHeight: "1.7" }}
                >
                  <TypewriterText text={capsule.message} />
                </motion.p>
              )}

              {/* Open button */}
              {!isCreator && !capsule.opened && (
                <motion.button
                  onClick={handleOpen}
                  disabled={opening}
                  className="w-full gradient-mixed rounded-2xl py-4 text-sm font-medium transition-all disabled:opacity-50 shadow-glow-dream"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {opening ? "Opening..." : "💌 Open capsule"}
                </motion.button>
              )}

              {/* Reactions */}
              {capsule.opened && !isCreator && showContent && (
                <motion.div
                  className="stack-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex justify-center gap-3">
                    {QUICK_REACTIONS.map((e, i) => (
                      <motion.button
                        key={e}
                        onClick={() => handleReact(e)}
                        className={`text-2xl transition-all ${
                          capsule.reaction === e
                            ? "opacity-100"
                            : "opacity-40 hover:opacity-100"
                        }`}
                        whileHover={{ scale: 1.3, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: capsule.reaction === e ? 1 : 0.4,
                          scale: 1,
                        }}
                        transition={{ delay: 0.9 + i * 0.05 }}
                      >
                        {e}
                      </motion.button>
                    ))}
                  </div>
                  {capsule.reaction && (
                    <motion.p
                      className="text-sm text-[var(--text-secondary)]"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {capsule.reaction}
                    </motion.p>
                  )}
                </motion.div>
              )}

              {/* Convert to memory */}
              {capsule.opened && !converted && showContent && (
                <motion.button
                  onClick={handleConvert}
                  className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  📸 Save as memory
                </motion.button>
              )}
              {converted && (
                <p className="text-xs text-[var(--text-tertiary)]">
                  📸 Saved as memory
                </p>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
