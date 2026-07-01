import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { listMyRelationships } from "../services/relationship/relationshipService.js";
import {
  getActiveRelationshipId,
  setActiveRelationshipId,
} from "../services/relationship/relationshipContext.js";
import { useCurrentUserId } from "../hooks/useCurrentUserId.js";
import { getOnboardingStatus } from "../services/onboarding/onboardingService.js";

export default function AuthRedirect() {
  const navigate = useNavigate();
  const currentUserId = useCurrentUserId();
  const [error, setError] = useState(false);

  const check = async () => {
    setError(false);
    try {
      const onboardingStatus = await getOnboardingStatus();
      if (!onboardingStatus.completed) {
        navigate("/onboarding", { replace: true });
        return;
      }

      const { relationships } = await listMyRelationships();
      const active  = relationships.filter((r) => r.status === "active");
      const pending = relationships.filter((r) => r.status === "pending");

      if (active.length > 1) {
        const savedId  = getActiveRelationshipId();
        const savedRel = active.find((r) => r.id === savedId);
        navigate(savedRel ? "/relationship" : "/spaces", { replace: true });
        return;
      }

      if (active.length === 1) {
        setActiveRelationshipId(active[0].id);
        navigate("/relationship", { replace: true });
        return;
      }

      if (pending.length > 0) {
        const inv = pending[0];
        setActiveRelationshipId(inv.id);
        const isInvitee =
          inv.partner !== null &&
          String(inv.partner.id) !== String(currentUserId);
        navigate(
          isInvitee ? "/relationship/pending-received" : "/relationship/pending-sent",
          { replace: true },
        );
        return;
      }

      navigate("/invite", { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login", { replace: true });
      } else {
        setError(true);
      }
    }
  };

  useEffect(() => { check(); }, []);

  if (error) {
    return (
      <LoadingScreen>
        <div className="text-center space-y-4">
          <p className="text-[var(--text-tertiary)] text-sm">Something went wrong</p>
          <button
            onClick={check}
            className="text-[var(--accent-dream-soft)] text-sm hover:underline"
          >
            Retry
          </button>
        </div>
      </LoadingScreen>
    );
  }

  return (
    <LoadingScreen>
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
        <p className="text-[var(--text-tertiary)] text-sm">Loading your space...</p>
      </motion.div>
    </LoadingScreen>
  );
}

function LoadingScreen({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-white">
      {children}
    </div>
  );
}
