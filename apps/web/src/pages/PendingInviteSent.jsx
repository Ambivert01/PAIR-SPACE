import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getMyRelationship, cancelInvite } from "../services/relationship/relationshipService.js";
import PartnerAvatar from "../components/PartnerAvatar.jsx";
import RelationshipBadge from "../components/RelationshipBadge.jsx";
import ConfirmModal from "../components/ui/ConfirmModal.jsx";

export default function PendingInviteSent() {
  const navigate = useNavigate();
  const [rel, setRel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const load = () => {
    setLoading(true);
    getMyRelationship()
      .then((data) => {
        if (data.status === "active") navigate("/relationship", { replace: true });
        else if (data.status !== "pending") navigate("/invite", { replace: true });
        else setRel(data);
      })
      .catch(() => navigate("/invite", { replace: true }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async () => {
    setCancelling(true);
    setShowConfirmCancel(false);
    try {
      await cancelInvite(rel.id);
      navigate("/invite", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel");
      setCancelling(false);
    }
  };

  if (loading) return <Screen><Spinner /></Screen>;
  if (!rel) return null;

  const timeAgo = formatTimeAgo(new Date(rel.createdAt));

  return (
    <Screen>
      <motion.div
        className="w-full max-w-sm px-4 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <PartnerAvatar displayName={rel.partner?.displayName} avatarUrl={rel.partner?.avatarUrl} />
              <motion.span
                className="absolute -bottom-1 -right-1 text-xl"
                animate={{ rotate: [0, -15, 15, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                ⏳
              </motion.span>
            </div>
          </div>

          <div>
            <h1 className="text-h2 text-white">
              Waiting for {rel.partner?.displayName || "your partner"}
            </h1>
            <p className="text-caption mt-1">Invite sent {timeAgo}</p>
          </div>

          <RelationshipBadge type={rel.relationshipType} />
        </div>

        <div className="card-glass text-center text-sm">
          <p className="text-[var(--text-secondary)]">
            They'll see your invite when they sign in.
          </p>
          <p className="text-[var(--text-tertiary)] text-xs mt-1">
            Share the app link with them to speed things up.
          </p>
        </div>

        {error && (
          <p className="text-[var(--status-error)] text-sm text-center">{error}</p>
        )}

        <div className="stack-sm">
          <motion.button
            onClick={load}
            className="w-full btn-secondary btn-base text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Refresh status
          </motion.button>
          <motion.button
            onClick={() => setShowConfirmCancel(true)}
            disabled={cancelling}
            className="w-full text-[var(--text-disabled)] hover:text-[var(--status-error)] text-sm py-2 transition-colors disabled:opacity-50"
          >
            {cancelling ? "Cancelling..." : "Cancel invite"}
          </motion.button>
        </div>
      </motion.div>

      <ConfirmModal
        isOpen={showConfirmCancel}
        icon="🔓"
        title="Cancel this invite?"
        description="You can always invite them again later."
        confirmText="Yes, cancel it"
        danger
        onConfirm={handleCancel}
        onCancel={() => setShowConfirmCancel(false)}
      />
    </Screen>
  );
}

function formatTimeAgo(date) {
  const diff = Math.floor((Date.now() - date) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function Spinner() {
  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-8 h-8 border-2 border-[var(--accent-dream)] border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p className="text-[var(--text-tertiary)] text-sm">Loading...</p>
    </motion.div>
  );
}

function Screen({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-white">
      {children}
    </div>
  );
}
