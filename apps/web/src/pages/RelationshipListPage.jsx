import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  listMyRelationships, pinRelationship, muteRelationship, archiveRelationship,
} from "../services/relationship/relationshipService.js";
import { setActiveRelationshipId } from "../services/relationship/relationshipContext.js";
import { logout } from "../services/auth/authService.js";
import RelationshipCard from "../features/relationship/RelationshipCard.jsx";
import ConfirmModal from "../components/ui/ConfirmModal.jsx";

export default function RelationshipListPage() {
  const navigate = useNavigate();
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showArchived, setShowArchived]   = useState(false);
  const [archiveTarget, setArchiveTarget] = useState(null);

  const load = (archived = showArchived) => {
    setLoading(true);
    listMyRelationships(archived)
      .then(({ relationships: r }) => setRelationships(r))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSelect = (rel) => {
    setActiveRelationshipId(rel.id);
    navigate("/relationship");
  };

  const handlePin     = async (id) => { await pinRelationship(id).catch(() => {}); load(); };
  const handleMute    = async (id, mute) => { await muteRelationship(id, mute).catch(() => {}); load(); };
  const handleArchive = async () => {
    await archiveRelationship(archiveTarget, true).catch(() => {});
    setArchiveTarget(null);
    load();
  };

  const active   = relationships.filter((r) => r.status === "active");
  const pending  = relationships.filter((r) => r.status === "pending");
  const archived = relationships.filter((r) => r.status === "archived");

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white flex flex-col">
      {/* header */}
      <motion.div
        className="glass-strong flex items-center justify-between px-4 py-3 border-b border-[var(--glass-border)] sticky top-0 z-30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-base font-semibold">Your Spaces</h1>
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => navigate("/invite")}
            className="btn-primary btn-base text-xs px-4 py-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            + New space
          </motion.button>
          <button
            onClick={() => { logout(); navigate("/login", { replace: true }); }}
            className="text-[var(--text-disabled)] hover:text-[var(--text-tertiary)] text-xs transition-colors"
          >
            Sign out
          </button>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <motion.div
              className="w-6 h-6 border-2 border-[var(--accent-dream)] border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : (
          <div className="px-4 py-4 space-y-4">
            {/* pending invites */}
            {pending.length > 0 && (
              <div>
                <p className="text-xs text-[var(--text-disabled)] uppercase tracking-wider mb-2">
                  Pending invites
                </p>
                {pending.map((r) => (
                  <RelationshipCard key={r.id} relationship={r}
                    onSelect={() => {
                      setActiveRelationshipId(r.id);
                      navigate("/relationship/pending-received");
                    }}
                    onPin={handlePin} onMute={handleMute}
                  />
                ))}
              </div>
            )}

            {/* active spaces */}
            {active.length > 0 ? (
              <div>
                <p className="text-xs text-[var(--text-disabled)] uppercase tracking-wider mb-2">
                  Active spaces
                </p>
                {active.map((r) => (
                  <RelationshipCard key={r.id} relationship={r}
                    onSelect={handleSelect}
                    onPin={handlePin}
                    onMute={handleMute}
                    onArchive={(id) => setArchiveTarget(id)}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                className="empty-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="empty-state-icon">🔒</span>
                <p className="empty-state-title">No active spaces yet</p>
                <p className="empty-state-desc">Create your first private space with someone special.</p>
                <motion.button
                  onClick={() => navigate("/invite")}
                  className="btn-primary btn-base mt-2"
                  whileHover={{ scale: 1.03 }}
                >
                  Create your first space
                </motion.button>
              </motion.div>
            )}

            {/* archived toggle */}
            <div className="pt-2 border-t border-[var(--glass-border)]">
              <button
                onClick={() => { setShowArchived((v) => !v); load(!showArchived); }}
                className="text-xs text-[var(--text-disabled)] hover:text-[var(--text-tertiary)] transition-colors"
              >
                {showArchived ? "Hide archived" : `Show archived (${archived.length})`}
              </button>
            </div>

            {showArchived && archived.length > 0 && (
              <div>
                <p className="text-xs text-[var(--text-disabled)] uppercase tracking-wider mb-2">Archived</p>
                {archived.map((r) => (
                  <RelationshipCard key={r.id} relationship={r}
                    onSelect={() => {}} onPin={handlePin} onMute={handleMute}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!archiveTarget}
        icon="📦"
        title="Archive this space?"
        description="You can restore it later from the archived list."
        confirmText="Archive"
        onConfirm={handleArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}
