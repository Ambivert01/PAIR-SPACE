/**
 * ChatHeaderUltra Component
 *
 * Premium chat header with glass design and smooth animations
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeIn } from "../../utils/motionPresets.js";
import PartnerAvatar from "../../components/PartnerAvatar.jsx";
import PresenceIndicator from "../presence/PresenceIndicator.jsx";
import ActivityBadge from "../presence/ActivityBadge.jsx";
import StatusSelector from "../presence/StatusSelector.jsx";
import { useCallContext } from "../../context/CallProvider.jsx";

export default function ChatHeaderUltra({
  partner,
  partnerPresence,
  onSetStatus,
}) {
  const navigate = useNavigate();
  const [showSelector, setShowSelector] = useState(false);
  const call = useCallContext();
  const selectorRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!selectorRef.current?.contains(e.target)) setShowSelector(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const status = partnerPresence?.status || "offline";

  return (
    <motion.div
      className="glass-strong flex items-center gap-3 px-4 py-3 border-b border-[var(--glass-border)]"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back button */}
      <motion.button
        onClick={() => navigate("/relationship")}
        className="text-[var(--text-secondary)] hover:text-white transition-colors mr-1"
        whileHover={{ scale: 1.1, x: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        ←
      </motion.button>

      {/* Partner avatar with presence */}
      <motion.div className="relative" {...fadeIn}>
        <PartnerAvatar
          displayName={partner?.displayName}
          avatarUrl={partner?.avatarUrl}
          size="sm"
        />
        <span className="absolute -bottom-0.5 -right-0.5">
          <PresenceIndicator status={status} />
        </span>
      </motion.div>

      {/* Partner info */}
      <div className="flex-1 min-w-0">
        <motion.p
          className="text-sm font-medium text-white"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {partner?.displayName}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <ActivityBadge
            status={status}
            activity={partnerPresence?.activity}
            customMessage={partnerPresence?.customMessage}
          />
        </motion.div>
      </div>

      {/* Call buttons */}
      <div className="hstack-sm mr-1">
        <motion.button
          onClick={() => call?.startCall("voice")}
          title="Voice call"
          className="touch-target text-[var(--text-secondary)] hover:text-[var(--accent-love)] transition-colors glass rounded-lg"
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          📞
        </motion.button>
        <motion.button
          onClick={() => call?.startCall("video")}
          title="Video call"
          className="touch-target text-[var(--text-secondary)] hover:text-[var(--accent-dream)] transition-colors glass rounded-lg"
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          📹
        </motion.button>
      </div>

      {/* Status selector */}
      <div className="relative" ref={selectorRef}>
        <motion.button
          onClick={() => setShowSelector((v) => !v)}
          title="Set your status"
          className="touch-target text-[var(--text-secondary)] hover:text-white transition-colors glass rounded-lg"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
        >
          ⚙️
        </motion.button>
        {showSelector && (
          <div className="absolute right-0 top-full mt-1 z-50">
            <StatusSelector
              onSelect={onSetStatus}
              onClose={() => setShowSelector(false)}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
