import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GIFT_TYPES } from "@shared/constants/giftTypes.js";
import { openGift, reactToGift, convertGiftToMemory } from "./giftService.js";
import GiftAnimationPlayer from "./GiftAnimationPlayer.jsx";
import CountdownRevealTimer from "./CountdownRevealTimer.jsx";

const QUICK_REACTIONS = ["❤️", "🥺", "😍", "🙏", "😊", "💕"];

// Confetti component
const Confetti = ({ onComplete }) => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    rotation: Math.random() * 360,
    delay: Math.random() * 0.3,
  }));

  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${p.x}%`,
            top: "-10%",
            background: `hsl(${Math.random() * 360}, 70%, 60%)`,
          }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: window.innerHeight + 100,
            opacity: [1, 1, 0],
            rotate: p.rotation,
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: p.delay,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
};

// Typewriter text component
const TypewriterText = ({ text, onComplete }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 30);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return <span>{displayText}</span>;
};

export default function GiftRevealModalUltra({
  gift: initial,
  currentUserId,
  onClose,
  onOpened,
}) {
  const [gift, setGift] = useState(initial);
  const [opening, setOpening] = useState(false);
  const [opened, setOpened] = useState(initial.opened);
  const [showAnim, setShowAnim] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showContent, setShowContent] = useState(initial.opened);
  const [converted, setConverted] = useState(!!initial.convertedToMemoryId);
  const [shaking, setShaking] = useState(false);

  const typeMeta = GIFT_TYPES.find((t) => t.value === gift.giftType) || {
    emoji: "🎁",
    label: "Gift",
    color: "from-indigo-900/60 to-purple-900/60",
  };
  const isSender =
    gift.senderId?._id?.toString() === currentUserId ||
    gift.senderId?.toString() === currentUserId;
  const isRevealed = !gift._hidden;
  const isCountdown =
    gift.revealMode !== "instant" &&
    gift.scheduledRevealTime &&
    new Date(gift.scheduledRevealTime) > new Date();

  const handleOpen = async () => {
    if (isSender || opened) return;

    // Shake animation
    setShaking(true);
    setTimeout(() => setShaking(false), 500);

    setTimeout(async () => {
      setOpening(true);
      try {
        const opened_ = await openGift(gift._id);
        setGift(opened_);
        setOpened(true);
        setShowAnim(true);
        setShowConfetti(true);
        setTimeout(() => setShowContent(true), 1500);
        onOpened?.(opened_);
      } catch {
        /* silent */
      } finally {
        setOpening(false);
      }
    }, 600);
  };

  const handleReact = async (emoji) => {
    await reactToGift(gift._id, emoji).catch(() => {});
    setGift((g) => ({ ...g, reaction: emoji }));
  };

  const handleConvert = async () => {
    await convertGiftToMemory(gift._id).catch(() => {});
    setConverted(true);
  };

  return (
    <>
      {showAnim && (
        <GiftAnimationPlayer
          animation={gift.revealAnimation}
          onComplete={() => setShowAnim(false)}
        />
      )}

      <AnimatePresence>
        {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
      </AnimatePresence>

      <motion.div
        className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={`glass-strong rounded-3xl w-full max-w-md overflow-hidden shadow-strong border border-[var(--glass-border)]`}
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {/* Header */}
          <div className="hstack-md justify-between px-6 py-5 border-b border-[var(--glass-border)]">
            <div className="hstack-sm">
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

          {/* Content */}
          <div className="px-6 py-8 stack-lg text-center">
            {isCountdown ? (
              <CountdownRevealTimer
                scheduledRevealTime={gift.scheduledRevealTime}
              />
            ) : !isRevealed ? (
              <motion.div
                className="py-8 stack-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.p
                  className="text-6xl"
                  animate={
                    shaking
                      ? {
                          rotate: [0, -10, 10, -10, 10, 0],
                          scale: [1, 1.1, 1.1, 1.1, 1.1, 1],
                        }
                      : {}
                  }
                  transition={{ duration: 0.5 }}
                >
                  🎁
                </motion.p>
                <p className="text-[var(--text-secondary)] text-base font-light">
                  A surprise is waiting for you...
                </p>
              </motion.div>
            ) : (
              <>
                {/* Sender */}
                <motion.p
                  className="text-xs text-[var(--text-tertiary)] font-light"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  From {isSender ? "You" : gift.senderId?.displayName}
                </motion.p>

                {/* Gift content */}
                <AnimatePresence>
                  {showContent && (
                    <motion.div
                      className="stack-md"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {gift.title && (
                        <motion.h2
                          className="text-2xl font-light text-[var(--text-primary)]"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          {gift.title}
                        </motion.h2>
                      )}
                      {gift.message && (
                        <motion.p
                          className="text-[var(--text-primary)] text-base leading-relaxed whitespace-pre-wrap font-light"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <TypewriterText text={gift.message} />
                        </motion.p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Open button */}
                {!isSender && !opened && (
                  <motion.button
                    onClick={handleOpen}
                    disabled={opening}
                    className="w-full btn-primary btn-base disabled text-base"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {opening ? "Opening..." : "🎁 Open gift"}
                  </motion.button>
                )}

                {/* Reactions */}
                {opened && !isSender && showContent && (
                  <motion.div
                    className="stack-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <p className="text-xs text-[var(--text-tertiary)] font-light">
                      React
                    </p>
                    <div className="flex justify-center gap-3">
                      {QUICK_REACTIONS.map((e, i) => (
                        <motion.button
                          key={e}
                          onClick={() => handleReact(e)}
                          className={`text-2xl transition-all ${
                            gift.reaction === e
                              ? "opacity-100"
                              : "opacity-40 hover:opacity-100"
                          }`}
                          whileHover={{ scale: 1.3, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{
                            opacity: gift.reaction === e ? 1 : 0.4,
                            scale: 1,
                          }}
                          transition={{ delay: 0.9 + i * 0.05 }}
                        >
                          {e}
                        </motion.button>
                      ))}
                    </div>
                    {gift.reaction && (
                      <motion.p
                        className="text-sm text-[var(--text-secondary)]"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {gift.reaction} Reacted!
                      </motion.p>
                    )}
                  </motion.div>
                )}

                {/* Convert to memory */}
                {(isSender || opened) && !converted && showContent && (
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
    </>
  );
}
