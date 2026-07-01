import ConfirmModal from "../../components/ui/ConfirmModal.jsx";
import { useState } from "react";
import { setIncognito, blockPartner } from "./privacyService.js";
import SessionManager from "./SessionManager.jsx";
import DataExportPanel from "./DataExportPanel.jsx";
import ToggleSwitch from "../settings/ToggleSwitch.jsx";

export default function PrivacySettings({ relationshipId, partnerName, onBlocked }) {
  const [incognito, setIncognitoState] = useState(false);
  const [blocking, setBlocking]        = useState(false);

  const handleIncognito = async (val) => {
    setIncognitoState(val);
    await setIncognito(val).catch(() => setIncognitoState(!val));
  };

  const handleBlock = async () => {
    setShowBlockConfirm(true); return;
    setBlocking(true);
    try {
      await blockPartner(relationshipId);
      onBlocked?.();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to block");
    } finally {
      setBlocking(false);
    }
  };

  const confirmBlock = async () => {
    setShowBlockConfirm(false);
    await blockPartner();
  };

  return (
    <div className="space-y-6">
      {/* incognito */}
      <div className="bg-[var(--glass-bg)] rounded-2xl px-4 divide-y divide-gray-800">
        <ToggleSwitch
          value={incognito}
          onChange={handleIncognito}
          label="Incognito mode"
          description="Appear offline, hide typing and read receipts"
        />
      </div>

      {/* sessions */}
      <div className="space-y-2">
        <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider px-1">Active Sessions</p>
        <SessionManager />
      </div>

      {/* data */}
      <div className="space-y-2">
        <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider px-1">Your Data</p>
        <DataExportPanel relationshipId={relationshipId} />
      </div>

      {/* danger zone */}
      {relationshipId && (
        <div className="space-y-2">
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider px-1">Danger Zone</p>
          <div className="bg-[var(--glass-bg)] rounded-2xl p-4 space-y-3">
            <p className="text-xs text-[var(--text-disabled)]">Blocking pauses the relationship. Data is retained. You can unblock anytime.</p>
            <button onClick={handleBlock} disabled={blocking}
              className="w-full bg-red-900/30 hover:bg-red-900/50 disabled:opacity-40 rounded-xl py-2.5 text-sm text-[var(--status-error)] transition-colors">
              {blocking ? "Blocking..." : `Block ${partnerName || "partner"}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
