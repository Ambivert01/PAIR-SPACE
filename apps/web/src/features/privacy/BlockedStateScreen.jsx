import { useNavigate } from "react-router-dom";
import { unblockPartner } from "./privacyService.js";

export default function BlockedStateScreen({ relationshipId, partnerName, onUnblocked }) {
  const navigate = useNavigate();

  const handleUnblock = async () => {
    try {
      await unblockPartner(relationshipId);
      onUnblocked?.();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to unblock");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-white">
      <div className="w-full max-w-sm px-6 text-center space-y-6">
        <div className="text-5xl">🔒</div>
        <div>
          <h1 className="text-xl font-semibold">Space is paused</h1>
          <p className="text-[var(--text-tertiary)] text-sm mt-2">
            Your connection with {partnerName || "your partner"} is currently blocked.
            Chat, calls, and activities are disabled.
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={handleUnblock}
            className="w-full gradient-mixed hover:bg-[var(--accent-dream)] rounded-xl py-3 text-sm font-medium transition-colors"
          >
            Unblock & restore connection
          </button>
          <button
            onClick={() => navigate("/invite")}
            className="w-full text-[var(--text-disabled)] hover:text-[var(--text-secondary)] text-sm py-2 transition-colors"
          >
            End relationship instead
          </button>
        </div>
      </div>
    </div>
  );
}
