/**
 * ActivityPlayerUltra Component
 *
 * Premium media player with blurred background, sync indicators, and auto-hiding controls
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, scaleIn } from "../../utils/motionPresets.js";
import ActivityControlBarUltra from "./ActivityControlBarUltra.jsx";
import PartnerAvatar from "../../components/PartnerAvatar.jsx";

function WaitingForPartnerBanner() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const hint = elapsed < 10
    ? "Sending invite..."
    : elapsed < 30
    ? "Waiting for partner to join..."
    : elapsed < 90
    ? "Still waiting... they may be on their way"
    : "They might be offline — try sending a message";

  return (
    <motion.div
      className="absolute top-4 left-1/2 -translate-x-1/2 glass-strong px-4 py-2.5 rounded-full z-20 max-w-xs text-center"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="hstack-sm justify-center">
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ background: "var(--status-warning)" }}
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        <span className="text-xs text-[var(--status-warning)]">{hint}</span>
        {elapsed >= 10 && (
          <span className="text-[10px] text-[var(--text-disabled)]">({elapsed}s)</span>
        )}
      </div>
    </motion.div>
  );
}

export default function ActivityPlayerUltra({
  state,
  playerRef,
  onPause,
  onResume,
  onSeek,
  onSpeedChange,
  onEnd,
  metadata,
  partnerJoined,
  partner,
}) {
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState(null);
  const [isDrifting, setIsDrifting] = useState(false);

  const isYouTube =
    metadata?.externalUrl?.includes("youtube.com") ||
    metadata?.externalUrl?.includes("youtu.be");

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (showControls && !state.paused) {
      if (controlsTimeout) clearTimeout(controlsTimeout);
      const timeout = setTimeout(() => setShowControls(false), 3000);
      setControlsTimeout(timeout);
      return () => clearTimeout(timeout);
    }
  }, [showControls, state.paused]);

  // Show controls on interaction
  const handleInteraction = () => {
    setShowControls(true);
  };

  // Simulate drift detection (in real app, this would come from sync logic)
  useEffect(() => {
    // This is a placeholder - real drift detection would be in useActivity hook
    if (state.currentTime && Math.random() < 0.01) {
      setIsDrifting(true);
      setTimeout(() => setIsDrifting(false), 2000);
    }
  }, [state.currentTime]);

  const getYouTubeEmbedUrl = (url) => {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    if (!match) return null;
    return `https://www.youtube.com/embed/${match[1]}?autoplay=0&controls=1&enablejsapi=1`;
  };

  const handleLoadedMetadata = (e) => {
    if (e.target.duration && !state.duration) {
      onSpeedChange(state.playbackRate || 1);
    }
  };

  return (
    <div
      className="flex flex-col flex-1 relative overflow-hidden bg-black"
      onMouseMove={handleInteraction}
      onClick={handleInteraction}
    >
      {/* Blurred background for non-YouTube videos */}
      {!isYouTube && metadata?.externalUrl && (
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 scale-110 blur-3xl opacity-30"
            style={{
              backgroundImage: `url(${metadata.externalUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/90" />
        </div>
      )}

      {/* Player area */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        {isYouTube ? (
          <div className="w-full aspect-video max-w-5xl">
            <iframe
              src={getYouTubeEmbedUrl(metadata.externalUrl)}
              className="w-full h-full rounded-2xl"
              allowFullScreen
              allow="autoplay; encrypted-media"
            />
            <p className="text-xs text-[var(--text-tertiary)] text-center mt-2">
              YouTube sync is manual — both press play together
            </p>
          </div>
        ) : metadata?.externalUrl ? (
          <motion.video
            ref={playerRef}
            src={metadata.externalUrl}
            className="w-full max-h-[70vh] object-contain rounded-2xl shadow-strong"
            onLoadedMetadata={handleLoadedMetadata}
            playsInline
            animate={state.paused ? {} : { scale: [1, 1.02, 1] }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <div className="text-center space-y-2 p-8">
            <p className="text-6xl">🎬</p>
            <p className="text-[var(--text-secondary)] text-sm">
              No media URL provided
            </p>
          </div>
        )}
      </div>

      {/* Top overlay - sync indicator and partner presence */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center justify-between">
              {/* Sync indicator */}
              {partnerJoined && !state.paused && (
                <motion.div
                  className="glass-strong px-3 py-1.5 rounded-full hstack-sm"
                  {...scaleIn}
                >
                  <motion.div
                    className="w-2 h-2 bg-[var(--accent-love)] rounded-full"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-xs text-white">
                    Watching together ❤️
                  </span>
                </motion.div>
              )}

              {/* Partner presence */}
              {partnerJoined && partner && (
                <motion.div
                  className="glass-strong px-3 py-1.5 rounded-full hstack-sm"
                  {...scaleIn}
                >
                  <PartnerAvatar
                    displayName={partner.displayName}
                    avatarUrl={partner.avatarUrl}
                    size="xs"
                  />
                  <motion.div
                    className="w-2 h-2 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-xs text-white">
                    {partner.displayName}
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drift correction toast */}
      <AnimatePresence>
        {isDrifting && (
          <motion.div
            className="absolute top-20 left-1/2 -translate-x-1/2 glass-strong px-4 py-2 rounded-full z-30"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span className="text-xs text-white flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                ⟳
              </motion.span>
              Syncing...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waiting for partner — shows elapsed seconds so user knows the app isn't frozen */}
      {!partnerJoined && (
        <WaitingForPartnerBanner />
      )}

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="relative z-20 bg-gradient-to-t from-black/80 to-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <ActivityControlBarUltra
              state={state}
              onPause={onPause}
              onResume={onResume}
              onSeek={onSeek}
              onSpeedChange={onSpeedChange}
              onEnd={onEnd}
              partnerJoined={partnerJoined}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
