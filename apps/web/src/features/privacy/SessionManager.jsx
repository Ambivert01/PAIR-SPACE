import ConfirmModal from "../../components/ui/ConfirmModal.jsx";
import { useEffect, useState } from "react";
import { getSessions, revokeSession, revokeAllSessions } from "./privacyService.js";

const timeAgo = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const getDeviceLabel = (ua = "") => {
  if (/mobile/i.test(ua))  return { label: "Mobile",  emoji: "📱" };
  if (/tablet/i.test(ua))  return { label: "Tablet",  emoji: "📱" };
  if (/firefox/i.test(ua)) return { label: "Firefox", emoji: "🦊" };
  if (/chrome/i.test(ua))  return { label: "Chrome",  emoji: "🌐" };
  if (/safari/i.test(ua))  return { label: "Safari",  emoji: "🧭" };
  return { label: "Browser", emoji: "💻" };
};

export default function SessionManager() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getSessions()
      .then(({ sessions: s }) => setSessions(s))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRevoke = async (id) => {
    await revokeSession(id).catch(() => {});
    setSessions((prev) => prev.filter((s) => s._id !== id));
  };

  const handleRevokeAll = async () => {
    setShowSignOutAllConfirm(true); return;
    await revokeAllSessions().catch(() => {});
    setSessions([]);
  };

  if (loading) return <p className="text-xs text-[var(--text-disabled)] py-4 text-center">Loading sessions...</p>;

  const confirmSignOutAll = async () => {
    setShowSignOutAllConfirm(false);
    await signOutAllDevices();
  };

  return (
    <div className="space-y-3">
      {sessions.length === 0 ? (
        <p className="text-xs text-gray-700 text-center py-4">No active sessions</p>
      ) : (
        <>
          {sessions.map((s) => {
            const { label, emoji } = getDeviceLabel(s.device);
            return (
              <div key={s._id} className="flex items-center gap-3 bg-[var(--glass-bg-strong)] rounded-xl p-3">
                <span className="text-xl">{emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{label}</p>
                  <p className="text-xs text-[var(--text-tertiary)] truncate">{s.ipAddress} · {timeAgo(s.lastActiveAt)}</p>
                </div>
                <button onClick={() => handleRevoke(s._id)}
                  className="text-xs text-[var(--text-disabled)] hover:text-[var(--status-error)] transition-colors">
                  Revoke
                </button>
              </div>
            );
          })}
          <button onClick={handleRevokeAll}
            className="w-full text-xs text-[var(--text-disabled)] hover:text-[var(--status-error)] py-2 transition-colors">
            Sign out from all devices
          </button>
        </>
      )}
    </div>
  );
}
