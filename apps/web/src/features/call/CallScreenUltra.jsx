/**
 * CallScreenUltra Component
 *
 * Premium call experience with smooth animations and minimal UI
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, scaleIn } from "../../utils/motionPresets.js";
import { CALL_STATE } from "./useCall.js";
import VideoTileUltra from "./VideoTileUltra.jsx";
import CallControlsUltra from "./CallControlsUltra.jsx";
import PartnerAvatar from "../../components/PartnerAvatar.jsx";

export default function CallScreenUltra({
  callState,
  callType,
  partner,
  localVideoRef,
  remoteVideoRef,
  isMuted,
  isCameraOff,
  isScreenSharing,
  partnerMuted,
  partnerCameraOff,
  onMute,
  onCamera,
  onScreenShare,
  onEnd,
  callDuration = 0,
}) {
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState(null);
  const [networkQuality, setNetworkQuality] = useState("good"); // good, medium, poor

  const isVoiceOnly = callType === "voice";
  const isConnected = callState === CALL_STATE.CONNECTED;
  const isReconnecting = callState === CALL_STATE.RECONNECTING;

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (showControls) {
      if (controlsTimeout) clearTimeout(controlsTimeout);
      const timeout = setTimeout(() => setShowControls(false), 3000);
      setControlsTimeout(timeout);
      return () => clearTimeout(timeout);
    }
  }, [showControls]);

  // Show controls on mouse move or tap
  const handleInteraction = () => {
    setShowControls(true);
  };

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      className="fixed inset-0 bg-[var(--bg-primary)] flex flex-col z-50"
      onMouseMove={handleInteraction}
      onClick={handleInteraction}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      {/* Remote video/avatar - fullscreen */}
      <div className="flex-1 relative overflow-hidden">
        {isVoiceOnly || partnerCameraOff ? (
          <VoiceCallView
            partner={partner}
            partnerMuted={partnerMuted}
            callDuration={callDuration}
            isReconnecting={isReconnecting}
          />
        ) : (
          <VideoTileUltra
            videoRef={remoteVideoRef}
            label={partner?.displayName}
            cameraOff={partnerCameraOff}
            muted={false}
            fullscreen={true}
          />
        )}

        {/* Top overlay - status indicators */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between">
                {/* Call duration */}
                <motion.div
                  className="glass-strong px-3 py-1.5 rounded-full"
                  {...scaleIn}
                >
                  <span className="text-xs text-white font-medium">
                    {formatDuration(callDuration)}
                  </span>
                </motion.div>

                {/* Network quality */}
                <motion.div
                  className="glass-strong px-3 py-1.5 rounded-full hstack-sm"
                  {...scaleIn}
                >
                  <span className="text-xs">
                    {networkQuality === "good" && "🟢"}
                    {networkQuality === "medium" && "🟡"}
                    {networkQuality === "poor" && "🔴"}
                  </span>
                  <span className="text-xs text-white capitalize">
                    {networkQuality}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reconnecting overlay */}
        <AnimatePresence>
          {isReconnecting && (
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="glass-strong p-6 rounded-2xl flex flex-col items-center gap-3">
                <motion.div
                  className="w-8 h-8 border-2 border-[var(--accent-dream)] border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-sm text-white">Reconnecting...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Screen share indicator */}
        <AnimatePresence>
          {isScreenSharing && showControls && (
            <motion.div
              className="absolute top-20 right-4 glass-strong px-3 py-1.5 rounded-full hstack-sm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <span className="text-xs">🖥️</span>
              <span className="text-xs text-white">Sharing screen</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Local video - floating corner */}
        {!isVoiceOnly && (
          <AnimatePresence>
            {showControls && (
              <motion.div
                className="absolute bottom-24 right-4"
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                drag
                dragConstraints={{ top: -300, left: -300, right: 0, bottom: 0 }}
                dragElastic={0.1}
                whileDrag={{ scale: 1.05 }}
              >
                <VideoTileUltra
                  videoRef={localVideoRef}
                  label="You"
                  muted={true}
                  cameraOff={isCameraOff}
                  small={true}
                  mirror={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Bottom controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="px-6 py-6 bg-gradient-to-t from-black/80 to-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <CallControlsUltra
              callType={callType}
              isMuted={isMuted}
              isCameraOff={isCameraOff}
              isScreenSharing={isScreenSharing}
              onMute={onMute}
              onCamera={onCamera}
              onScreenShare={onScreenShare}
              onEnd={onEnd}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Voice call view with animated avatar
function VoiceCallView({
  partner,
  partnerMuted,
  callDuration,
  isReconnecting,
}) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-[var(--accent-love)]/20 to-[var(--accent-dream)]/20 relative overflow-hidden">
      {/* Animated background orbs */}
      <motion.div
        className="absolute w-96 h-96 bg-[var(--accent-love)] blur-3xl opacity-20 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-96 h-96 bg-[var(--accent-dream)] blur-3xl opacity-20 rounded-full"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Avatar with pulse animation */}
      <motion.div
        className="relative z-10"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <PartnerAvatar
          displayName={partner?.displayName}
          avatarUrl={partner?.avatarUrl}
          size="xl"
        />

        {/* Audio visualizer ring */}
        {!partnerMuted && !isReconnecting && (
          <motion.div
            className="absolute inset-0 border-4 border-[var(--accent-love)] rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        )}
      </motion.div>

      {/* Partner name */}
      <motion.div
        className="text-center z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold text-white mb-1">
          {partner?.displayName}
        </h2>
        {partnerMuted && (
          <p className="text-sm text-[var(--text-secondary)] hstack-sm justify-center">
            <span>🔇</span>
            <span>Muted</span>
          </p>
        )}
      </motion.div>
    </div>
  );
}
