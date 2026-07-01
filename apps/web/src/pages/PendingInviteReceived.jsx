import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getMyRelationship,
  acceptInvite,
  rejectInvite,
} from "../services/relationship/relationshipService.js";
import PartnerAvatar from "../components/PartnerAvatar.jsx";
import RelationshipBadge from "../components/RelationshipBadge.jsx";

export default function PendingInviteReceived() {
  const navigate = useNavigate();
  const [rel, setRel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // "accept" | "reject" | null
  const [error, setError] = useState("");

  useEffect(() => {
    getMyRelationship()
      .then((data) => {
        if (data.status === "active") {
          navigate("/relationship", { replace: true });
        } else if (data.status !== "pending") {
          navigate("/invite", { replace: true });
        } else {
          setRel(data);
        }
      })
      .catch(() => navigate("/invite", { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleAccept = async () => {
    setActionLoading("accept");
    setError("");
    try {
      await acceptInvite(rel.id);
      navigate("/relationship", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to accept invite");
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    setActionLoading("reject");
    setError("");
    try {
      await rejectInvite(rel.id);
      navigate("/invite", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to decline invite");
      setActionLoading(null);
    }
  };

  if (loading) return <Screen><Spinner /></Screen>;
  if (!rel) return null;

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
              <PartnerAvatar
                displayName={rel.partner?.displayName}
                avatarUrl={rel.partner?.avatarUrl}
              />
              <motion.span
                className="absolute -bottom-1 -right-1 text-xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                💌
              </motion.span>
            </div>
          </div>

          <div>
            <p className="text-caption">You have an invite from</p>
            <h1 className="text-h2 text-white mt-0.5">
              {rel.partner?.displayName}
            </h1>
          </div>

          <RelationshipBadge type={rel.relationshipType} />
        </div>

        <div className="card-glass text-sm text-center">
          <p className="text-[var(--text-secondary)]">
            {rel.partner?.displayName} wants to create a private space with you.
          </p>
        </div>

        {error && (
          <motion.p
            className="text-[var(--status-error)] text-sm text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="alert"
          >
            {error}
          </motion.p>
        )}

        <div className="stack-sm">
          <motion.button
            onClick={handleAccept}
            disabled={!!actionLoading}
            className="w-full btn-primary btn-base"
            whileHover={{ scale: actionLoading ? 1 : 1.02 }}
            whileTap={{ scale: actionLoading ? 1 : 0.97 }}
          >
            {actionLoading === "accept" ? (
              <span className="hstack-sm">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Accepting...
              </span>
            ) : "Accept invite 💞"}
          </motion.button>

          <motion.button
            onClick={handleReject}
            disabled={!!actionLoading}
            className="w-full btn-secondary btn-base text-sm"
            whileHover={{ scale: actionLoading ? 1 : 1.01 }}
            whileTap={{ scale: actionLoading ? 1 : 0.97 }}
          >
            {actionLoading === "reject" ? "Declining..." : "Decline"}
          </motion.button>
        </div>
      </motion.div>
    </Screen>
  );
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
