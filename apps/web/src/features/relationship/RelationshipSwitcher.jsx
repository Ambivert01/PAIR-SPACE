import { useEffect, useRef, useState } from "react";
import { listMyRelationships } from "../../services/relationship/relationshipService.js";
import { setActiveRelationshipId } from "../../services/relationship/relationshipContext.js";
import PartnerAvatar from "../../components/PartnerAvatar.jsx";

export default function RelationshipSwitcher({ currentRelId, onSwitch }) {
  const [open, setOpen]               = useState(false);
  const [relationships, setRelationships] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    listMyRelationships()
      .then(({ relationships: r }) => setRelationships(r.filter((rel) => rel.status === "active")))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (relationships.length <= 1) return null;

  const current = relationships.find((r) => r.id === currentRelId);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 glass hover:bg-white/10 rounded-xl px-3 py-1.5 transition-colors"
      >
        {current?.partner && (
          <PartnerAvatar displayName={current.partner.displayName} avatarUrl={current.partner.avatarUrl} size="sm" />
        )}
        <span className="text-xs text-[var(--text-secondary)] max-w-[80px] truncate">
          {current?.nickname || current?.partner?.displayName || "Select space"}
        </span>
        <span className="text-[var(--text-disabled)] text-xs">▾</span>
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 w-56 glass-strong rounded-2xl shadow-strong z-50 overflow-hidden">
          <p className="text-xs text-[var(--text-disabled)] px-4 py-2 uppercase tracking-wider">Your spaces</p>
          {relationships.map((rel) => (
            <button
              key={rel.id}
              onClick={() => {
                setActiveRelationshipId(rel.id);
                onSwitch(rel);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors ${
                rel.id === currentRelId ? "bg-[var(--accent-dream)]/10" : ""
              }`}
            >
              <PartnerAvatar displayName={rel.partner?.displayName} avatarUrl={rel.partner?.avatarUrl} size="sm" />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm text-white truncate">{rel.nickname || rel.partner?.displayName}</p>
                <p className="text-xs text-[var(--text-disabled)] capitalize">{rel.relationshipType?.replace("_", " ")}</p>
              </div>
              {rel.unreadCount > 0 && (
                <span className="badge-dot" style={{ position: "static" }}>{rel.unreadCount}</span>
              )}
              {rel.id === currentRelId && <span className="text-[var(--accent-dream-soft)] text-xs">✓</span>}
            </button>
          ))}
          <div className="border-t border-[var(--glass-border)] px-4 py-2">
            <button
              onClick={() => { onSwitch(null); setOpen(false); }}
              className="text-xs text-[var(--accent-dream-soft)] hover:text-[var(--accent-dream-light)] transition-colors"
            >
              + New space
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
