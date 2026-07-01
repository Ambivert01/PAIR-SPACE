import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { listMyRelationships, pinRelationship, muteRelationship, archiveRelationship } from "../services/relationship/relationshipService.js";
import { setActiveRelationshipId } from "../services/relationship/relationshipContext.js";
import { logout } from "../services/auth/authService.js";
import RelationshipCard from "../features/relationship/RelationshipCard.jsx";
import ConfirmModal from "../components/ui/ConfirmModal.jsx";
import { PageSpinner, PageEmpty } from "../components/PageLayout.jsx";

export default function RelationshipListPage() {
  const navigate = useNavigate();
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState(null);

  const load = (archived = showArchived) => {
    setLoading(true);
    listMyRelationships(archived).then(({ relationships: r }) => setRelationships(r)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSelect = (rel) => { setActiveRelationshipId(rel.id); navigate("/relationship"); };
  const handlePin = async (id) => { await pinRelationship(id).catch(() => {}); load(); };
  const handleMute = async (id, mute) => { await muteRelationship(id, mute).catch(() => {}); load(); };
  const handleArchive = async () => { await archiveRelationship(archiveTarget, true).catch(() => {}); setArchiveTarget(null); load(); };

  const active = relationships.filter(r => r.status === "active");
  const pending = relationships.filter(r => r.status === "pending");
  const archived = relationships.filter(r => r.status === "archived");

  return (
    <div className="min-h-screen text-white flex flex-col relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 20% 10%, rgba(255,93,126,0.15) 0%, transparent 45%), radial-gradient(ellipse at 80% 80%, rgba(168,85,247,0.13) 0%, transparent 50%), #120a17" }}>
      {/* Ambient */}
      <div className="floating-orb floating-orb-love w-80 h-80 -top-20 -left-20 opacity-25" />
      <div className="floating-orb floating-orb-dream w-64 h-64 bottom-0 -right-16 opacity-20" style={{ animationDelay: "5s" }} />

      {/* Header */}
      <motion.header
        className="glass-strong sticky top-0 z-30 border-b border-[var(--glass-border)]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between px-4 py-3.5">
          <div>
            <h1 className="text-sm font-semibold text-white">Your Spaces</h1>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{active.length} active space{active.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button onClick={() => navigate("/invite")} className="btn-primary btn-base text-xs px-4 py-2" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>+ New space</motion.button>
            <button onClick={() => { logout(); navigate("/login", { replace: true }); }} className="text-[var(--text-disabled)] hover:text-[var(--text-tertiary)] text-xs transition-colors glass px-3 py-2 rounded-lg">Sign out</button>
          </div>
        </div>
      </motion.header>

      <div className="flex-1 overflow-y-auto relative z-10">
        {loading ? <PageSpinner label="Loading spaces..." /> : (
          <div className="px-4 py-5 space-y-5">
            {/* Pending */}
            {pending.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-[var(--accent-glow)] uppercase tracking-widest">Pending invites</p>
                {pending.map(r => (
                  <RelationshipCard key={r.id} relationship={r} onSelect={() => { setActiveRelationshipId(r.id); navigate("/relationship/pending-received"); }} onPin={handlePin} onMute={handleMute} />
                ))}
              </div>
            )}

            {/* Active */}
            {active.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">Active spaces</p>
                {active.map(r => (
                  <RelationshipCard key={r.id} relationship={r} onSelect={handleSelect} onPin={handlePin} onMute={handleMute} onArchive={id => setArchiveTarget(id)} />
                ))}
              </div>
            ) : (
              <PageEmpty icon="🔒" title="No active spaces yet" desc="Create your first private space with someone special." action="Create your first space" onAction={() => navigate("/invite")} />
            )}

            {/* Archived toggle */}
            <div className="pt-2 border-t border-[var(--glass-border)]">
              <button onClick={() => { setShowArchived(v => !v); load(!showArchived); }} className="text-xs text-[var(--text-disabled)] hover:text-[var(--text-tertiary)] transition-colors">
                {showArchived ? "Hide archived" : `Show archived (${archived.length})`}
              </button>
            </div>

            {showArchived && archived.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-[var(--text-disabled)] uppercase tracking-widest">Archived</p>
                {archived.map(r => <RelationshipCard key={r.id} relationship={r} onSelect={() => {}} onPin={handlePin} onMute={handleMute} />)}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal isOpen={!!archiveTarget} icon="📦" title="Archive this space?" description="You can restore it later from the archived list." confirmText="Archive" onConfirm={handleArchive} onCancel={() => setArchiveTarget(null)} />
    </div>
  );
}
