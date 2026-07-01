/**
 * RelationshipHomeUltra Component
 *
 * Premium master dashboard - the heart of the app
 * This is the screen users see most after login
 */

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { endRelationship } from "../services/relationship/relationshipService.js";
import { getRelationshipStats } from "../services/relationship/relationshipService.js";
import { logout } from "../services/auth/authService.js";
import { getPersonalization } from "../features/personalization/personalizationService.js";
import { getTimeline } from "../features/memory/memoryService.js";
import { usePresence } from "../features/presence/usePresence.js";
import { useCallContext } from "../context/CallProvider.jsx";
import { useRelationship } from "../context/RelationshipProvider.jsx";
import { useNotificationContext } from "../components/AppShell.jsx";
import { useCurrentUserId } from "../hooks/useCurrentUserId.js";
import { fadeUp } from "../utils/motionPresets.js";
import PartnerAvatar from "../components/PartnerAvatar.jsx";
import RelationshipBadge from "../components/RelationshipBadge.jsx";
import NotificationBell from "../features/notification/NotificationBell.jsx";
import RelationshipSwitcher from "../features/relationship/RelationshipSwitcher.jsx";
import ConfirmModal from "../components/ui/ConfirmModal.jsx";
import FirstConnectionCelebration from "../components/FirstConnectionCelebration.jsx";
import HeartbeatButton from "../features/heartbeat/HeartbeatButton.jsx";
import MoodCheckIn from "../features/mood/MoodCheckIn.jsx";
import TimezoneBridge from "../features/timezone/TimezoneBridge.jsx";
import api from "../services/api.js";

import { MEDIA_BASE } from "@shared/constants/urls.js";
const BASE = MEDIA_BASE;

export default function RelationshipHomeUltra() {
  const navigate = useNavigate();
  const currentUserId = useCurrentUserId();
  const { rel, loading: relLoading, switchRelationship } = useRelationship();

  const [contentLoading, setContentLoading] = useState(true);
  const [error, setError] = useState("");
  const [spaceName, setSpaceName] = useState("");
  const [recentMemories, setRecentMemories] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [stats, setStats] = useState({ messageCount: 0, memoryCount: 0, daysTogether: 0 });
  const [confirmEnd, setConfirmEnd] = useState(false);

  const call = useCallContext();
  const notif = useNotificationContext();
  const { partnerPresence } = usePresence(rel?.id);

  // Redirect away if there's no active relationship
  useEffect(() => {
    if (!relLoading && (!rel || rel.status !== "active")) {
      navigate("/invite", { replace: true });
    }
  }, [relLoading, rel, navigate]);

  // Load all dashboard content in PARALLEL (was sequential, ~900ms → now ~250ms)
  useEffect(() => {
    if (!rel?.id || rel.status !== "active") return;

    let cancelled = false;
    setContentLoading(true);

    Promise.allSettled([
      getPersonalization(rel.id),
      getTimeline(rel.id, { limit: 6 }),
      api.get(`/api/chat/messages/${rel.id}?limit=3`),
      getRelationshipStats(rel.id),
    ]).then(([personalizationR, timelineR, messagesR, statsR]) => {
      if (cancelled) return;

      if (personalizationR.status === "fulfilled") {
        setSpaceName(personalizationR.value?.relationshipName || "");
      }
      if (timelineR.status === "fulfilled") {
        setRecentMemories(timelineR.value?.memories || []);
      }
      if (messagesR.status === "fulfilled") {
        setRecentMessages(messagesR.value?.data?.messages || []);
      }
      if (statsR.status === "fulfilled") {
        setStats({
          messageCount: statsR.value?.messageCount ?? 0,
          memoryCount: statsR.value?.memoryCount ?? 0,
          daysTogether: statsR.value?.daysTogether ?? 0,
        });
      }
      setContentLoading(false);
    });

    return () => { cancelled = true; };
  }, [rel?.id, rel?.status]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleEnd = async () => {
    try {
      await endRelationship(rel.id);
      setConfirmEnd(false);
      navigate("/invite", { replace: true });
    } catch (err) {
      setConfirmEnd(false);
      setError(err.response?.data?.message || "Failed to end relationship");
    }
  };

  const loading = relLoading || (rel?.status === "active" && contentLoading && recentMemories.length === 0 && recentMessages.length === 0);

  if (relLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-8 h-8 border-2 border-[var(--accent-dream)] border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-[var(--text-secondary)] text-sm">Loading your space...</p>
        </motion.div>
      </div>
    );
  }

  if (!rel) return null;

  const status = partnerPresence?.status || "offline";
  const durationText =
    stats.daysTogether === 0
      ? "Connected today"
      : stats.daysTogether === 1
        ? "Connected 1 day ago"
        : `${stats.daysTogether} days together`;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white relative">
      <div className="floating-orb floating-orb-love w-96 h-96 -top-20 -left-20" />
      <div className="floating-orb floating-orb-dream w-80 h-80 top-1/2 -right-20" />

      <div className="relative z-10">
        <Header
          rel={rel}
          spaceName={spaceName}
          status={status}
          notif={notif}
          call={call}
          onNavigate={navigate}
          onSwitch={switchRelationship}
        />

        <HeroSection
          partner={rel.partner}
          spaceName={spaceName}
          durationText={durationText}
          stats={stats}
          relationshipType={rel.relationshipType}
        />

        {/* ── Connection Row: heartbeat tap + mood ───────────────── */}
        <motion.div
          className="px-4 pb-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card-glass flex items-center justify-around py-4">
            <HeartbeatButton relationshipId={rel.id} />
            <div className="w-px h-12 bg-[var(--glass-border)]" />
            <MoodCheckIn relationshipId={rel.id} className="flex-1 mx-4 border-0 p-0 bg-transparent" />
          </div>
        </motion.div>

        {/* ── Timezone Bridge (only renders if both have timezones set) ── */}
        <div className="px-4 pb-2">
          <TimezoneBridge relationshipId={rel.id} />
        </div>

        <QuickActions />

        {contentLoading ? (
          <PreviewSkeletons />
        ) : (
          <>
            {recentMessages.length > 0 && (
              <ChatPreview messages={recentMessages} currentUserId={currentUserId} />
            )}
            {recentMemories.length > 0 && <MemoryHighlights memories={recentMemories} />}
            {recentMemories.length === 0 && recentMessages.length === 0 && (
              <EmptyDashboardState partnerName={rel.partner?.displayName} />
            )}
          </>
        )}

        <FeatureCards />

        <Footer onLogout={handleLogout} />
      </div>

      <FloatingActionButton />

      <ConfirmModal
        isOpen={confirmEnd}
        icon="💔"
        title="End this relationship?"
        description="Your memories and messages will be kept safely — only the active connection ends."
        confirmText="End relationship"
        danger
        onConfirm={handleEnd}
        onCancel={() => setConfirmEnd(false)}
      />

      {/* First-time connection celebration — fires once when the space first activates */}
      <FirstConnectionCelebration
        partnerName={rel.partner?.displayName}
        isFirstEntry={stats.daysTogether === 0 && stats.messageCount === 0}
      />
    </div>
  );
}

// Header Component
function Header({ rel, spaceName, status, notif, call, onNavigate, onSwitch }) {
  return (
    <motion.div
      className="glass-strong flex items-center justify-between px-4 py-3 border-b border-[var(--glass-border)] sticky top-0 z-30"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <RelationshipSwitcher
        currentRelId={rel?.id}
        onSwitch={(r) => {
          if (!r) onNavigate("/invite");
          else onSwitch(r.id || r);
        }}
      />

      <div className="flex-1 text-center px-4">
        <h1 className="text-sm font-semibold truncate">
          {spaceName || rel.partner?.displayName}
        </h1>
        <p className="text-[10px] text-[var(--text-tertiary)]">
          {status === "online" ? "🟢 Online" : "⚫ Offline"}
        </p>
      </div>

      <div className="hstack-sm">
        <motion.button
          onClick={() => call?.startCall("voice")}
          className="touch-target text-[var(--text-secondary)] hover:text-[var(--accent-love)] transition-colors glass rounded-lg"
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          title="Voice call"
        >
          📞
        </motion.button>
        <motion.button
          onClick={() => call?.startCall("video")}
          className="touch-target text-[var(--text-secondary)] hover:text-[var(--accent-dream)] transition-colors glass rounded-lg"
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          title="Video call"
        >
          📹
        </motion.button>

        {notif && (
          <NotificationBell
            notifications={notif.notifications}
            unreadCount={notif.unreadCount}
            onRead={notif.markRead}
            onMarkAllRead={notif.markAllRead}
            onClearRead={notif.clearRead}
          />
        )}

        <Link to="/search">
          <motion.button
            className="touch-target text-[var(--text-secondary)] hover:text-white transition-colors glass rounded-lg"
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
          >
            🔍
          </motion.button>
        </Link>

        <Link to="/personalize">
          <motion.button
            className="touch-target text-[var(--text-secondary)] hover:text-white transition-colors glass rounded-lg"
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
          >
            🎨
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

// Hero Section Component — real stats, no more hardcoded zeros
function HeroSection({ partner, spaceName, durationText, stats, relationshipType }) {
  const [heartbeatPulse, setHeartbeatPulse] = useState(false);

  useEffect(() => {
    const onHeartbeat = () => {
      setHeartbeatPulse(true);
      setTimeout(() => setHeartbeatPulse(false), 1800);
    };
    document.addEventListener("heartbeat_received", onHeartbeat);
    return () => document.removeEventListener("heartbeat_received", onHeartbeat);
  }, []);
  return (
    <motion.div className="px-4 pt-6 pb-4" {...fadeUp}>
      <motion.div className="card-glass relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-love)]/10 to-[var(--accent-dream)]/10 pointer-events-none" />

        <div className="relative z-10 text-center space-y-4">
          <motion.div
            className="flex justify-center"
            initial={{ scale: 0 }}
            animate={heartbeatPulse ? { scale: [1, 1.25, 0.95, 1.15, 1] } : { scale: 1 }}
            transition={
              heartbeatPulse
                ? { duration: 0.7, ease: "easeInOut" }
                : { type: "spring", stiffness: 200, delay: 0.2 }
            }
          >
            <div className="relative">
              <PartnerAvatar displayName={partner?.displayName} avatarUrl={partner?.avatarUrl} size="lg" />
              <AnimatePresence>
                {heartbeatPulse && (
                  <motion.div
                    className="absolute -inset-3 rounded-full border-2 border-[var(--accent-love)]"
                    initial={{ opacity: 0.8, scale: 0.9 }}
                    animate={{ opacity: 0, scale: 1.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9 }}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <div className="stack-xs">
            <p className="text-[var(--text-tertiary)] text-xs uppercase tracking-widest">
              Your space with
            </p>
            <h2 className="text-2xl font-bold gradient-text-love">
              {spaceName || partner?.displayName}
            </h2>
            <p className="text-[var(--text-secondary)] text-sm">{durationText}</p>
          </div>

          <div className="flex justify-center">
            <RelationshipBadge type={relationshipType} />
          </div>

          <motion.div
            className="hstack-lg justify-center pt-4 border-t border-[var(--glass-border)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <StatBlock value={stats.daysTogether} label="Days" />
            <StatBlock value={stats.memoryCount} label="Memories" />
            <StatBlock value={stats.messageCount} label="Messages" />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatBlock({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold gradient-text-mixed">{value}</p>
      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">{label}</p>
    </div>
  );
}

// Quick Actions Component
function QuickActions() {
  const actions = [
    { icon: "💬", label: "Chat", to: "/chat" },
    { icon: "📸", label: "Memory", to: "/memories" },
    { icon: "🎬", label: "Activity", to: "/activities" },
    { icon: "📅", label: "Planner", to: "/planner" },
  ];

  return (
    <motion.div
      className="px-4 py-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action, idx) => (
          <Link key={action.to} to={action.to}>
            <motion.div
              className="card-glass card-interactive flex flex-col items-center gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.04 }}
              whileHover={{ scale: 1.08, y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-3xl">{action.icon}</span>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                {action.label}
              </span>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

// Preview Skeletons — shown while messages/memories load (replaces blank gap)
function PreviewSkeletons() {
  return (
    <div className="px-4 py-2 space-y-3">
      <div className="card-glass h-20 skeleton" />
      <div className="flex gap-3 overflow-hidden">
        <div className="skeleton w-32 h-32 rounded-xl flex-shrink-0" />
        <div className="skeleton w-32 h-32 rounded-xl flex-shrink-0" />
        <div className="skeleton w-32 h-32 rounded-xl flex-shrink-0" />
      </div>
    </div>
  );
}

// Empty state for brand-new relationships with no content yet
function EmptyDashboardState({ partnerName }) {
  return (
    <motion.div
      className="empty-state mx-4 card-glass"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="empty-state-icon">💌</div>
      <p className="empty-state-title">Say your first hello</p>
      <p className="empty-state-desc">
        This is your private space with {partnerName || "your partner"}. Send a message or save
        your first memory together.
      </p>
      <Link to="/chat">
        <motion.button
          className="btn-primary btn-base mt-2"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Send a message ✨
        </motion.button>
      </Link>
    </motion.div>
  );
}

// Chat Preview Component
function ChatPreview({ messages, currentUserId }) {
  return (
    <motion.div
      className="px-4 py-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <Link to="/chat">
        <motion.div
          className="card-glass card-interactive"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="hstack-md justify-between mb-3">
            <div className="hstack-sm">
              <span className="text-lg">💬</span>
              <h3 className="text-sm font-semibold">Recent Messages</h3>
            </div>
            <span className="text-[var(--text-tertiary)] text-xs">→</span>
          </div>

          <div className="space-y-2">
            {messages.slice(0, 3).map((msg) => {
              const isOwn = msg.senderId?.toString() === currentUserId;
              return (
                <div
                  key={msg._id}
                  className={`text-xs ${isOwn ? "text-[var(--text-secondary)]" : "text-white"}`}
                >
                  <span className="opacity-60">{isOwn ? "You" : "Partner"}:</span>{" "}
                  <span className="line-clamp-1">{msg.content}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// Memory Highlights Component
function MemoryHighlights({ memories }) {
  return (
    <motion.div
      className="py-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="px-4 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📸</span>
          <h3 className="text-sm font-semibold">Memory Highlights</h3>
        </div>
        <Link to="/memories" className="text-xs text-[var(--text-tertiary)] hover:text-white">
          See all →
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-hide">
        {memories.map((memory, idx) => {
          const firstMedia = memory.mediaIds?.[0];
          const thumb = firstMedia?.thumbnailUrl || firstMedia?.url;

          return (
            <Link key={memory._id} to="/memories">
              <motion.div
                className="card-glass w-32 flex-shrink-0 snap-start interactive overflow-hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + idx * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                {thumb ? (
                  <div className="relative h-32">
                    <img
                      src={`${BASE}${thumb}`}
                      alt={memory.title || "Memory"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {memory.title && (
                      <p className="absolute bottom-2 left-2 right-2 text-[10px] text-white font-medium line-clamp-2">
                        {memory.title}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center bg-gradient-to-br from-[var(--accent-love)]/20 to-[var(--accent-dream)]/20">
                    <span className="text-3xl">💫</span>
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}

// Feature Cards Component
function FeatureCards({ activeGame = false }) {
  const features = [
    { icon: "🎮", title: "Games",         desc: activeGame ? "Game in progress!" : "Play together",    to: "/games",    badge: activeGame },
    { icon: "📊", title: "Insights",      desc: "Relationship patterns",  to: "/insights"  },
    { icon: "📖", title: "Our Story",     desc: "Your narrative",         to: "/story"     },
    { icon: "📓", title: "Journal",       desc: "Shared reflections",     to: "/journal"   },
    { icon: "🎁", title: "Gifts",         desc: "Surprises & gestures",   to: "/gifts"     },
    { icon: "⏳", title: "Time Capsules", desc: "Messages from the past", to: "/capsules"  },
  ];

  return (
    <motion.div
      className="px-4 py-4 space-y-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {features.map((feature, idx) => (
        <Link key={feature.to} to={feature.to}>
          <motion.div
            className="card-glass hstack-md interactive"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + idx * 0.04 }}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              <span className="text-2xl">{feature.icon}</span>
              {feature.badge && (
                <motion.span
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--accent-love)]"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${feature.badge ? "text-[var(--accent-love-soft)]" : "text-white"}`}>
                {feature.title}
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">{feature.desc}</p>
            </div>
            <span className="text-[var(--text-tertiary)] text-sm">→</span>
          </motion.div>
        </Link>
      ))}
    </motion.div>
  );
}

// Footer Component — sign out only. "End relationship" moved to Settings > Danger Zone.
function Footer({ onLogout }) {
  return (
    <motion.div
      className="px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <button
        onClick={onLogout}
        className="w-full text-[var(--text-tertiary)] hover:text-white text-xs py-2 transition-colors"
      >
        Sign out
      </button>
      <p className="text-center text-[var(--text-disabled)] text-[10px] mt-1">
        To end the relationship, go to Settings → Danger Zone
      </p>
    </motion.div>
  );
}

// Floating Action Button Component
function FloatingActionButton() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <AnimatePresence>
        {showMenu && (
          <motion.div
            className="fixed bottom-24 right-6 glass-strong rounded-2xl p-3 shadow-strong z-40 stack-sm"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
          >
            <Link to="/chat">
              <motion.button
                className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/10 transition-colors w-full text-left"
                whileHover={{ x: 5 }}
              >
                <span>💬</span>
                <span className="text-sm">Send message</span>
              </motion.button>
            </Link>
            <Link to="/memories">
              <motion.button
                className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/10 transition-colors w-full text-left"
                whileHover={{ x: 5 }}
              >
                <span>📸</span>
                <span className="text-sm">Add memory</span>
              </motion.button>
            </Link>
            <Link to="/activities">
              <motion.button
                className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/10 transition-colors w-full text-left"
                whileHover={{ x: 5 }}
              >
                <span>🎬</span>
                <span className="text-sm">Start activity</span>
              </motion.button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setShowMenu((v) => !v)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-mixed shadow-strong flex items-center justify-center text-2xl z-40"
        whileHover={{ scale: 1.1, rotate: showMenu ? 45 : 90 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: showMenu ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        +
      </motion.button>
    </>
  );
}
