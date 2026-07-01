/**
 * RelationshipHomeUltra — Main dashboard. Fully redesigned.
 */
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { endRelationship, getRelationshipStats } from "../services/relationship/relationshipService.js";
import { logout } from "../services/auth/authService.js";
import { getPersonalization } from "../features/personalization/personalizationService.js";
import { getTimeline } from "../features/memory/memoryService.js";
import { usePresence } from "../features/presence/usePresence.js";
import { useCallContext } from "../context/CallProvider.jsx";
import { useRelationship } from "../context/RelationshipProvider.jsx";
import { useNotificationContext } from "../components/AppShell.jsx";
import { useCurrentUserId } from "../hooks/useCurrentUserId.js";
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

const QUICK = [
  { icon: "💬", label: "Chat",     to: "/chat",       bg: "rgba(255,93,126,0.18)",  border: "rgba(255,93,126,0.35)",  glow: "rgba(255,93,126,0.25)" },
  { icon: "📸", label: "Memories", to: "/memories",   bg: "rgba(168,85,247,0.18)",  border: "rgba(168,85,247,0.35)",  glow: "rgba(168,85,247,0.25)" },
  { icon: "🎬", label: "Activity", to: "/activities", bg: "rgba(255,193,99,0.18)",  border: "rgba(255,193,99,0.35)",  glow: "rgba(255,193,99,0.25)" },
  { icon: "📅", label: "Planner",  to: "/planner",    bg: "rgba(96,165,250,0.18)",  border: "rgba(96,165,250,0.35)",  glow: "rgba(96,165,250,0.25)" },
];

const FEATURES = [
  { icon: "🎮", title: "Games",         desc: "Play together",           to: "/games",    bg: "rgba(168,85,247,0.18)",  border: "rgba(168,85,247,0.35)" },
  { icon: "📊", title: "Insights",      desc: "Relationship patterns",   to: "/insights", bg: "rgba(255,93,126,0.18)",  border: "rgba(255,93,126,0.35)" },
  { icon: "📖", title: "Our Story",     desc: "Your narrative",          to: "/story",    bg: "rgba(255,193,99,0.18)",  border: "rgba(255,193,99,0.35)" },
  { icon: "📓", title: "Journal",       desc: "Shared reflections",      to: "/journal",  bg: "rgba(168,85,247,0.15)",  border: "rgba(168,85,247,0.3)" },
  { icon: "🎁", title: "Gifts",         desc: "Surprises & gestures",    to: "/gifts",    bg: "rgba(255,93,126,0.15)",  border: "rgba(255,93,126,0.3)" },
  { icon: "⏳", title: "Time Capsules", desc: "Messages from the past",  to: "/capsules", bg: "rgba(255,193,99,0.15)",  border: "rgba(255,193,99,0.3)" },
];

export default function RelationshipHomeUltra() {
  const navigate = useNavigate();
  const currentUserId = useCurrentUserId();
  const { rel, loading: relLoading, switchRelationship } = useRelationship();
  const [contentLoading, setContentLoading] = useState(true);
  const [spaceName, setSpaceName] = useState("");
  const [recentMemories, setRecentMemories] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [stats, setStats] = useState({ messageCount: 0, memoryCount: 0, daysTogether: 0 });
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [error, setError] = useState("");

  const call = useCallContext();
  const notif = useNotificationContext();
  const { partnerPresence } = usePresence(rel?.id);

  useEffect(() => {
    if (!relLoading && (!rel || rel.status !== "active")) navigate("/invite", { replace: true });
  }, [relLoading, rel, navigate]);

  useEffect(() => {
    if (!rel?.id || rel.status !== "active") return;
    let cancelled = false;
    setContentLoading(true);
    Promise.allSettled([
      getPersonalization(rel.id),
      getTimeline(rel.id, { limit: 6 }),
      api.get(`/api/chat/messages/${rel.id}?limit=3`),
      getRelationshipStats(rel.id),
    ]).then(([pR, tR, mR, sR]) => {
      if (cancelled) return;
      if (pR.status === "fulfilled") setSpaceName(pR.value?.relationshipName || "");
      if (tR.status === "fulfilled") setRecentMemories(tR.value?.memories || []);
      if (mR.status === "fulfilled") setRecentMessages(mR.value?.data?.messages || []);
      if (sR.status === "fulfilled") setStats({ messageCount: sR.value?.messageCount ?? 0, memoryCount: sR.value?.memoryCount ?? 0, daysTogether: sR.value?.daysTogether ?? 0 });
      setContentLoading(false);
    });
    return () => { cancelled = true; };
  }, [rel?.id, rel?.status]);

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };
  const handleEnd = async () => {
    try { await endRelationship(rel.id); setConfirmEnd(false); navigate("/invite", { replace: true }); }
    catch (err) { setConfirmEnd(false); setError(err.response?.data?.message || "Failed to end relationship"); }
  };

  if (relLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <motion.div className="flex flex-col items-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div className="w-8 h-8 border-2 border-[var(--accent-dream)] border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
        <p className="text-[var(--text-secondary)] text-sm">Loading your space...</p>
      </motion.div>
    </div>
  );

  if (!rel) return null;

  const status = partnerPresence?.status || "offline";
  const durationText = stats.daysTogether === 0 ? "Connected today ✨" : stats.daysTogether === 1 ? "1 day together 💞" : `${stats.daysTogether} days together 💞`;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white relative overflow-hidden">
      {/* Ambient - much stronger */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute w-[600px] h-[600px] rounded-full -top-40 -left-40"
          style={{ background: "radial-gradient(circle, rgba(255,93,126,0.18), transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute w-[500px] h-[500px] rounded-full top-1/3 -right-40"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.16), transparent 70%)", filter: "blur(60px)", animationDelay: "5s" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full bottom-0 left-1/3"
          style={{ background: "radial-gradient(circle, rgba(255,193,99,0.10), transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <div className="relative z-10">
        {/* ── Header ── */}
        <motion.header
          className="glass-strong sticky top-0 z-30 border-b border-[var(--glass-border)]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 px-4 py-3">
            <RelationshipSwitcher
              currentRelId={rel?.id}
              onSwitch={(r) => { if (!r) navigate("/invite"); else switchRelationship(r.id || r); }}
            />
            <div className="flex-1 text-center px-2">
              <p className="text-sm font-semibold truncate leading-tight">{spaceName || rel.partner?.displayName}</p>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${status === "online" ? "bg-[var(--status-success)]" : "bg-[var(--text-disabled)]"}`} />
                <p className="text-[10px] text-[var(--text-tertiary)]">{status === "online" ? "Online" : "Offline"}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <motion.button onClick={() => call?.startCall("voice")} className="touch-target text-[var(--text-secondary)] hover:text-[var(--accent-love)] glass rounded-xl transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.93 }} title="Voice call">📞</motion.button>
              <motion.button onClick={() => call?.startCall("video")} className="touch-target text-[var(--text-secondary)] hover:text-[var(--accent-dream)] glass rounded-xl transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.93 }} title="Video call">📹</motion.button>
              {notif && <NotificationBell notifications={notif.notifications} unreadCount={notif.unreadCount} onRead={notif.markRead} onMarkAllRead={notif.markAllRead} onClearRead={notif.clearRead} />}
              <Link to="/search"><motion.button className="touch-target text-[var(--text-secondary)] hover:text-white glass rounded-xl transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.93 }}>🔍</motion.button></Link>
              <Link to="/personalize"><motion.button className="touch-target text-[var(--text-secondary)] hover:text-white glass rounded-xl transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.93 }}>🎨</motion.button></Link>
            </div>
          </div>
        </motion.header>

        {/* ── Hero ── */}
        <motion.section className="px-4 pt-6 pb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="relative overflow-hidden rounded-2xl"
            style={{ background: "linear-gradient(135deg, rgba(255,93,126,0.15) 0%, rgba(168,85,247,0.12) 100%)", border: "1px solid rgba(255,93,126,0.3)", boxShadow: "0 0 40px rgba(255,93,126,0.12), 0 16px 48px rgba(0,0,0,0.4)" }}>
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,93,126,0.8), rgba(168,85,247,0.6), transparent)" }} />
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,93,126,0.12), transparent 60%)" }} />
            <div className="relative z-10 text-center py-2 space-y-4">
              <HeroAvatar partner={rel.partner} />
              <div>
                <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Your space with</p>
                <h2 className="text-2xl font-bold gradient-text-love">{spaceName || rel.partner?.displayName}</h2>
                <p className="text-[var(--text-secondary)] text-sm mt-1">{durationText}</p>
              </div>
              <div className="flex justify-center">
                <RelationshipBadge type={rel.relationshipType} />
              </div>
              <motion.div className="flex justify-center gap-8 pt-4 border-t border-white/10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <StatBlock value={stats.daysTogether} label="Days" />
                <StatBlock value={stats.memoryCount} label="Memories" />
                <StatBlock value={stats.messageCount} label="Messages" />
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ── Heartbeat + Mood (separate cards) ── */}
        <motion.section className="px-4 pb-3 grid grid-cols-2 gap-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {/* Heartbeat card */}
          <div className="relative overflow-hidden rounded-2xl flex flex-col items-center justify-center py-5 gap-1"
            style={{ background: "linear-gradient(135deg, rgba(255,93,126,0.18), rgba(255,93,126,0.06))", border: "1px solid rgba(255,93,126,0.35)", boxShadow: "0 0 20px rgba(255,93,126,0.08)" }}>
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,93,126,0.7), transparent)" }} />
            <HeartbeatButton relationshipId={rel.id} />
          </div>
          {/* Mood card */}
          <MoodCheckIn relationshipId={rel.id} />
        </motion.section>

        {/* ── Timezone ── */}
        <div className="px-4 pb-3">
          <TimezoneBridge relationshipId={rel.id} />
        </div>

        {/* ── Quick Actions ── */}
        <motion.section className="px-4 pb-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="grid grid-cols-4 gap-3">
            {QUICK.map((q, i) => (
              <Link key={q.to} to={q.to}>
                <motion.div
                  className="flex flex-col items-center gap-2 py-4 rounded-2xl cursor-pointer relative overflow-hidden"
                  style={{ background: q.bg, border: `1px solid ${q.border}` }}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.18 + i * 0.04, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.08, y: -4, boxShadow: `0 8px 24px ${q.glow}` }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-2xl">{q.icon}</span>
                  <span className="text-[10px] text-white font-semibold tracking-wide">{q.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* ── Content previews ── */}
        {contentLoading ? <PreviewSkeletons /> : (
          <>
            {recentMessages.length > 0 && <ChatPreview messages={recentMessages} currentUserId={currentUserId} />}
            {recentMemories.length > 0 && <MemoryHighlights memories={recentMemories} />}
            {recentMemories.length === 0 && recentMessages.length === 0 && <EmptyDashboardState partnerName={rel.partner?.displayName} />}
          </>
        )}

        {/* ── Feature Cards ── */}
        <motion.section className="px-4 py-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest mb-3 px-1">Explore</p>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <Link key={f.to} to={f.to}>
                <motion.div
                  className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer relative overflow-hidden"
                  style={{ background: f.bg, border: `1px solid ${f.border}` }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28 + i * 0.04 }}
                  whileHover={{ scale: 1.03, y: -3, boxShadow: `0 8px 24px ${f.border}` }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: f.bg, border: `1px solid ${f.border}` }}>
                    <span className="text-xl">{f.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{f.title}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)] truncate">{f.desc}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* ── Footer ── */}
        <motion.footer className="px-4 py-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <button onClick={handleLogout} className="text-[var(--text-disabled)] hover:text-[var(--text-tertiary)] text-xs py-2 transition-colors">Sign out</button>
          <p className="text-[var(--text-disabled)] text-[10px] mt-1">To end the relationship, go to Settings → Data → Danger Zone</p>
        </motion.footer>
      </div>

      {/* ── FAB ── */}
      <FAB />

      <ConfirmModal isOpen={confirmEnd} icon="💔" title="End this relationship?" description="Your memories and messages will be kept safely — only the active connection ends." confirmText="End relationship" danger onConfirm={handleEnd} onCancel={() => setConfirmEnd(false)} />
      <FirstConnectionCelebration partnerName={rel.partner?.displayName} isFirstEntry={stats.daysTogether === 0 && stats.messageCount === 0} />
    </div>
  );
}

function HeroAvatar({ partner }) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const h = () => { setPulse(true); setTimeout(() => setPulse(false), 1800); };
    document.addEventListener("heartbeat_received", h);
    return () => document.removeEventListener("heartbeat_received", h);
  }, []);
  return (
    <motion.div className="flex justify-center" initial={{ scale: 0 }} animate={pulse ? { scale: [1, 1.25, 0.95, 1.15, 1] } : { scale: 1 }} transition={pulse ? { duration: 0.7 } : { type: "spring", stiffness: 200, delay: 0.2 }}>
      <div className="relative">
        <PartnerAvatar displayName={partner?.displayName} avatarUrl={partner?.avatarUrl} size="lg" />
        <AnimatePresence>
          {pulse && (
            <motion.div className="absolute -inset-3 rounded-full border-2 border-[var(--accent-love)]" initial={{ opacity: 0.8, scale: 0.9 }} animate={{ opacity: 0, scale: 1.6 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function StatBlock({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold gradient-text-mixed">{value}</p>
      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}

function PreviewSkeletons() {
  return (
    <div className="px-4 py-2 space-y-3">
      <div className="card-glass h-20 skeleton" />
      <div className="flex gap-3 overflow-hidden">
        {[1,2,3].map(i => <div key={i} className="skeleton w-32 h-32 rounded-2xl flex-shrink-0" />)}
      </div>
    </div>
  );
}

function EmptyDashboardState({ partnerName }) {
  return (
    <motion.div className="mx-4 my-2 card-glass text-center py-10 px-6 relative overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-love)]/8 to-[var(--accent-dream)]/8 pointer-events-none" />
      <div className="relative z-10 space-y-3">
        <motion.span className="text-5xl block" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>💌</motion.span>
        <p className="font-semibold text-white">Say your first hello</p>
        <p className="text-[var(--text-tertiary)] text-sm">This is your private space with {partnerName || "your partner"}.</p>
        <Link to="/chat">
          <motion.button className="btn-primary btn-base mt-2" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>Send a message ✨</motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

function ChatPreview({ messages, currentUserId }) {
  return (
    <motion.section className="px-4 py-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
      <Link to="/chat">
        <motion.div className="card-glass card-interactive relative overflow-hidden" whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-love)]/8 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[var(--accent-love)]/20 flex items-center justify-center"><span className="text-base">💬</span></div>
                <p className="text-sm font-semibold">Recent Messages</p>
              </div>
              <span className="text-[var(--accent-love-soft)] text-xs font-medium">Open →</span>
            </div>
            <div className="space-y-2">
              {messages.slice(0, 3).map((msg) => {
                const isOwn = msg.senderId?.toString() === currentUserId;
                return (
                  <div key={msg._id} className="flex items-start gap-2">
                    <span className="text-[10px] text-[var(--text-tertiary)] flex-shrink-0 mt-0.5">{isOwn ? "You" : "Partner"}</span>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-1 flex-1">{msg.content}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.section>
  );
}

function MemoryHighlights({ memories }) {
  return (
    <motion.section className="py-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <div className="px-4 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent-dream)]/20 flex items-center justify-center"><span className="text-sm">📸</span></div>
          <p className="text-sm font-semibold">Memory Highlights</p>
        </div>
        <Link to="/memories" className="text-xs text-[var(--accent-dream-soft)] hover:text-white transition-colors font-medium">See all →</Link>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
        {memories.map((memory, idx) => {
          const firstMedia = memory.mediaIds?.[0];
          const thumb = firstMedia?.thumbnailUrl || firstMedia?.url;
          return (
            <Link key={memory._id} to="/memories">
              <motion.div
                className="w-36 flex-shrink-0 snap-start rounded-2xl overflow-hidden relative"
                style={{ height: 140 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + idx * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                {thumb ? (
                  <>
                    <img src={`${BASE}${thumb}`} alt={memory.title || "Memory"} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    {memory.title && <p className="absolute bottom-2 left-2 right-2 text-[10px] text-white font-medium line-clamp-2">{memory.title}</p>}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[var(--accent-love)]/20 to-[var(--accent-dream)]/20 border border-[var(--glass-border)]">
                    <span className="text-3xl">💫</span>
                    {memory.title && <p className="text-[10px] text-[var(--text-secondary)] mt-1 px-2 text-center line-clamp-2">{memory.title}</p>}
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.section>
  );
}

function FAB() {
  const [open, setOpen] = useState(false);
  const items = [
    { icon: "💬", label: "Message", to: "/chat" },
    { icon: "📸", label: "Memory",  to: "/memories" },
    { icon: "🎬", label: "Activity", to: "/activities" },
  ];
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-24 right-5 glass-strong rounded-2xl p-2 shadow-strong z-40 flex flex-col gap-1"
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 16 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {items.map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)}>
                <motion.div className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/10 transition-colors" whileHover={{ x: 4 }}>
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-5 w-14 h-14 rounded-full gradient-mixed shadow-strong flex items-center justify-center z-40"
        style={{ boxShadow: "0 0 24px rgba(255,93,126,0.4), 0 8px 32px rgba(0,0,0,0.4)" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <span className="text-2xl text-white font-light">+</span>
      </motion.button>
    </>
  );
}
