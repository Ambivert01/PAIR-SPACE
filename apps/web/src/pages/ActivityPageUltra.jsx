import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRelationship } from "../context/RelationshipProvider.jsx";
import { useActivity } from "../features/activity/useActivity.js";
import ActivityHubUltra from "../features/activity/ActivityHubUltra.jsx";
import ActivityPlayerUltra from "../features/activity/ActivityPlayerUltra.jsx";
import SharedTimerUltra from "../features/activity/SharedTimerUltra.jsx";
import ActivityStatusCardUltra from "../features/activity/ActivityStatusCardUltra.jsx";
import ActivityInviteModalUltra from "../features/activity/ActivityInviteModalUltra.jsx";
import { fadeIn } from "../utils/motionPresets.js";

const TIMER_TYPES = [
  "focus_session",
  "study_session",
  "planning_session",
  "reading_session",
  "custom_session",
  "game_session",
];
const PLAYER_TYPES = ["watch_together", "listen_together"];

export default function ActivityPageUltra() {
  const navigate = useNavigate();
  const { rel, loading: relLoading } = useRelationship();
  const [showCelebration, setShowCelebration] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  const {
    activity,
    state,
    partnerJoined,
    incomingInvite,
    connected,
    playerRef,
    createActivity,
    joinActivity,
    declineInvite,
    pause,
    resume,
    seek,
    updateState,
    endActivity,
  } = useActivity({ relationshipId: rel?.id });

  const handleStart = (type, metadata) => {
    createActivity(type, metadata);
  };

  const handleEnd = () => {
    // Calculate session duration
    if (activity?.createdAt) {
      const duration = Math.floor(
        (Date.now() - new Date(activity.createdAt)) / 1000,
      );
      setSessionDuration(duration);
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        endActivity();
      }, 3000);
    } else {
      endActivity();
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} seconds`;
    if (secs === 0) return `${mins} minutes`;
    return `${mins}m ${secs}s`;
  };

  const isTimer = activity && TIMER_TYPES.includes(activity.activityType);
  const isPlayer = activity && PLAYER_TYPES.includes(activity.activityType);

  if (!rel) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <motion.div className="flex flex-col items-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div className="w-8 h-8 border-2 border-[var(--accent-dream)] border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
        <p className="text-[var(--text-secondary)] text-sm">Loading activities...</p>
      </motion.div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-white relative overflow-hidden">
      {/* Ambient */}
      <div className="floating-orb floating-orb-dream w-64 h-64 -top-16 -right-16 opacity-20 pointer-events-none" />
      <div className="floating-orb floating-orb-love w-48 h-48 bottom-0 -left-12 opacity-15 pointer-events-none" style={{ animationDelay: "6s" }} />

      {/* Header */}
      <motion.header
        className="glass-strong flex items-center gap-3 px-4 py-3.5 border-b border-[var(--glass-border)] sticky top-0 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.button onClick={() => navigate("/relationship")}
          className="w-9 h-9 glass rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-all flex-shrink-0"
          whileHover={{ scale: 1.08, x: -2 }} whileTap={{ scale: 0.93 }} aria-label="Go back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-white truncate">{activity ? (activity.metadata?.title || activity.activityType.replace(/_/g, " ")) : "Activities"}</h1>
          {activity && <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">In progress</p>}
        </div>
        {!connected && (
          <motion.div className="flex items-center gap-1.5" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
            <motion.div className="w-2 h-2 bg-yellow-400 rounded-full" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
            <span className="text-xs text-yellow-400 font-medium">Connecting...</span>
          </motion.div>
        )}
      </motion.header>

      {/* Incoming invite overlay */}
      <AnimatePresence>
        {incomingInvite && (
          <ActivityInviteModalUltra
            invite={incomingInvite}
            partner={rel?.partner}
            onJoin={joinActivity}
            onDecline={declineInvite}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      {!activity ? (
        <ActivityHubUltra onStart={handleStart} />
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Status card */}
          <ActivityStatusCardUltra
            partner={rel?.partner}
            partnerJoined={partnerJoined}
            activityType={activity.activityType}
          />

          {/* Player or timer */}
          {isPlayer && (
            <ActivityPlayerUltra
              state={state}
              playerRef={playerRef}
              metadata={activity.metadata}
              onPause={pause}
              onResume={resume}
              onSeek={seek}
              onSpeedChange={(rate) => updateState({ playbackRate: rate })}
              onEnd={handleEnd}
              partnerJoined={partnerJoined}
              partner={rel?.partner}
            />
          )}

          {isTimer && (
            <div className="flex-1 flex flex-col">
              <SharedTimerUltra
                state={state}
                onStateChange={updateState}
                partnerJoined={partnerJoined}
                partner={rel?.partner}
              />
              <div className="px-4 pb-6">
                <motion.button
                  onClick={handleEnd}
                  className="w-full text-[var(--text-tertiary)] hover:text-[var(--accent-love)] text-xs py-2 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  End session
                </motion.button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Session completion celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-strong rounded-3xl p-8 text-center max-w-md"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.p
                className="text-7xl mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                🎉
              </motion.p>
              <h3 className="text-2xl font-bold mb-2 gradient-text-mixed">
                Session Completed!
              </h3>
              <p className="text-[var(--text-secondary)] mb-4">
                Duration: {formatDuration(sessionDuration)}
              </p>
              <p className="text-sm text-[var(--text-tertiary)]">
                Great work together! ❤️
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
