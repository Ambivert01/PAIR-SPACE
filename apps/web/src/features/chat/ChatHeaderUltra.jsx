import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PartnerAvatar from "../../components/PartnerAvatar.jsx";
import PresenceIndicator from "../presence/PresenceIndicator.jsx";
import ActivityBadge from "../presence/ActivityBadge.jsx";
import StatusSelector from "../presence/StatusSelector.jsx";
import { useCallContext } from "../../context/CallProvider.jsx";

export default function ChatHeaderUltra({ partner, partnerPresence, onSetStatus }) {
  const navigate = useNavigate();
  const [showSelector, setShowSelector] = useState(false);
  const call = useCallContext();
  const selectorRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!selectorRef.current?.contains(e.target)) setShowSelector(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const status = partnerPresence?.status || "offline";

  return (
    <motion.div
      className="glass-strong flex items-center gap-3 px-4 py-3 border-b border-[var(--glass-border)] sticky top-0 z-20"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back */}
      <motion.button
        onClick={() => navigate("/relationship")}
        className="w-9 h-9 glass rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-all flex-shrink-0"
        whileHover={{ scale: 1.08, x: -2 }}
        whileTap={{ scale: 0.93 }}
        aria-label="Go back"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.button>

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <PartnerAvatar displayName={partner?.displayName} avatarUrl={partner?.avatarUrl} size="sm" />
        <span className="absolute -bottom-0.5 -right-0.5">
          <PresenceIndicator status={status} />
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate leading-tight">{partner?.displayName}</p>
        <ActivityBadge status={status} activity={partnerPresence?.activity} customMessage={partnerPresence?.customMessage} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <motion.button onClick={() => call?.startCall("voice")} title="Voice call"
          className="touch-target text-[var(--text-secondary)] hover:text-[var(--accent-love)] glass rounded-xl transition-colors"
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.93 }}>📞</motion.button>
        <motion.button onClick={() => call?.startCall("video")} title="Video call"
          className="touch-target text-[var(--text-secondary)] hover:text-[var(--accent-dream)] glass rounded-xl transition-colors"
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.93 }}>📹</motion.button>

        <div className="relative" ref={selectorRef}>
          <motion.button onClick={() => setShowSelector(v => !v)} title="Set your status"
            className="touch-target text-[var(--text-secondary)] hover:text-white glass rounded-xl transition-colors"
            whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.93 }}>⚙️</motion.button>
          {showSelector && (
            <div className="absolute right-0 top-full mt-1 z-50">
              <StatusSelector onSelect={onSetStatus} onClose={() => setShowSelector(false)} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
