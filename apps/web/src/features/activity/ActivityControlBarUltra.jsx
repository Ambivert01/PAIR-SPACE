/**
 * ActivityControlBarUltra Component
 *
 * Premium activity control bar with glassmorphism and smooth animations
 */

import { motion } from "framer-motion";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const fmt = (s) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export default function ActivityControlBarUltra({
  state,
  onPause,
  onResume,
  onSeek,
  onSpeedChange,
  onEnd,
  partnerJoined = false,
}) {
  const { currentTime = 0, duration = 0, paused, playbackRate = 1 } = state;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // All playback controls disabled until partner joins — prevents one user
  // playing while the other hasn't loaded yet (the user-reported issue of
  // "movie starts without partner").
  const controlsDisabled = !partnerJoined;

  return (
    <motion.div
      className="glass-strong border-t border-[var(--glass-border)] px-4 py-3 stack-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Progress bar */}
      {duration > 0 && (
        <motion.div
          className="space-y-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Custom styled range input */}
          <div className="relative">
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              disabled={controlsDisabled}
              onChange={(e) => !controlsDisabled && onSeek(Number(e.target.value))}
              className={`w-full h-1.5 appearance-none bg-[var(--glass-border)] rounded-full outline-none ${controlsDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              style={{
                background: `linear-gradient(to right, var(--accent-dream) 0%, var(--accent-love) ${progress}%, var(--glass-border) ${progress}%, var(--glass-border) 100%)`,
              }}
            />
          </div>

          {/* Time labels */}
          <div className="flex justify-between text-xs text-[var(--text-tertiary)]">
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {fmt(currentTime)}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {fmt(duration)}
            </motion.span>
          </div>
        </motion.div>
      )}

      {/* Controls row */}
      <div className="hstack-md justify-between">
        <div className="hstack-md">
          {/* Play/Pause button — disabled until partner joins */}
          <motion.button
            onClick={controlsDisabled ? undefined : (paused ? onResume : onPause)}
            disabled={controlsDisabled}
            className={`touch-target rounded-full text-lg shadow-soft transition-all ${
              controlsDisabled
                ? "bg-[var(--glass-bg)] opacity-40 cursor-not-allowed"
                : "gradient-mixed"
            }`}
            whileHover={controlsDisabled ? {} : { scale: 1.1 }}
            whileTap={controlsDisabled ? {} : { scale: 0.9 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            title={controlsDisabled ? "Waiting for partner to join..." : undefined}
          >
            {paused ? "▶" : "⏸"}
          </motion.button>

          {/* Speed selector */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <select
              value={playbackRate}
              disabled={controlsDisabled}
              onChange={(e) => !controlsDisabled && onSpeedChange(Number(e.target.value))}
              className={`glass glass-border rounded-lg px-3 py-1.5 text-xs text-white outline-none focus-ring transition-colors appearance-none pr-8 ${controlsDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {SPEEDS.map((s) => (
                <option key={s} value={s} className="bg-[var(--bg-primary)]">
                  {s}×
                </option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-tertiary)] text-xs">
              ▼
            </div>
          </motion.div>

          {/* Speed indicator badge */}
          {playbackRate !== 1 && (
            <motion.div
              className="glass-dream px-2 py-1 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <span className="text-xs text-white font-medium">
                {playbackRate}× speed
              </span>
            </motion.div>
          )}
        </div>

        {/* End session button */}
        <motion.button
          onClick={onEnd}
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--status-error)] transition-colors px-3 py-1.5 rounded-lg hover:glass"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          End session
        </motion.button>
      </div>
    </motion.div>
  );
}
