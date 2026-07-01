import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { isSoundEnabled, toggleSound } from "../../utils/soundEffects.js";

export default function MotionSettings() {
  const [soundEnabled, setSoundEnabled] = useState(isSoundEnabled());
  const [animationLevel, setAnimationLevel] = useState(() => {
    if (typeof window === "undefined") return "full";
    return localStorage.getItem("animationLevel") || "full";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("animationLevel", animationLevel);

    // Apply animation level to document
    document.documentElement.setAttribute(
      "data-animation-level",
      animationLevel,
    );
  }, [animationLevel]);

  const handleToggleSound = () => {
    const newState = toggleSound();
    setSoundEnabled(newState);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">
          Motion & Effects
        </h3>

        {/* Animation Level */}
        <div className="space-y-3">
          <label className="text-xs text-[var(--text-secondary)]">
            Animation Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {["full", "reduced", "off"].map((level) => (
              <motion.button
                key={level}
                onClick={() => setAnimationLevel(level)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  animationLevel === level
                    ? "bg-[var(--accent-dream)] text-white"
                    : "glass border border-[var(--glass-border)] text-[var(--text-secondary)]"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </motion.button>
            ))}
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">
            {animationLevel === "full" && "All animations and effects enabled"}
            {animationLevel === "reduced" &&
              "Simplified animations for better performance"}
            {animationLevel === "off" &&
              "Animations disabled (respects system preference)"}
          </p>
        </div>

        {/* Sound Toggle */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            <label className="text-xs text-[var(--text-secondary)]">
              Sound Effects
            </label>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Subtle audio feedback for actions
            </p>
          </div>
          <motion.button
            onClick={handleToggleSound}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              soundEnabled ? "bg-[var(--accent-dream)]" : "bg-[var(--glass-bg-strong)]"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute top-1 w-4 h-4 bg-white rounded-full"
              animate={{
                left: soundEnabled ? "calc(100% - 20px)" : "4px",
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
