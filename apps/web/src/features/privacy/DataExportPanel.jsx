import ConfirmModal from "../../components/ui/ConfirmModal.jsx";
import { useState } from "react";
import { exportData, clearChatHistory } from "./privacyService.js";

export default function DataExportPanel({ relationshipId }) {
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing]   = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportData(relationshipId);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `pairspace-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleClearChat = async () => {
    setShowClearConfirm(true); return;
    setClearing(true);
    try {
      await clearChatHistory(relationshipId);
      alert("Chat history cleared.");
    } catch {
      alert("Failed to clear chat.");
    } finally {
      setClearing(false);
    }
  };

  const confirmClearMessages = async () => {
    setShowClearConfirm(false);
    await clearMessages();
  };

  return (
    <div className="space-y-3">
      <div className="bg-[var(--glass-bg-strong)] rounded-xl p-4 space-y-2">
        <p className="text-sm text-white">Export your data</p>
        <p className="text-xs text-[var(--text-tertiary)]">Download all messages, memories, and plans as JSON.</p>
        <button onClick={handleExport} disabled={exporting || !relationshipId}
          className="w-full gradient-mixed hover:bg-[var(--accent-dream)] disabled:opacity-40 rounded-xl py-2.5 text-sm font-medium transition-colors mt-2">
          {exporting ? "Preparing export..." : "📥 Download my data"}
        </button>
      </div>

      <div className="bg-[var(--glass-bg-strong)] rounded-xl p-4 space-y-2">
        <p className="text-sm text-white">Clear chat history</p>
        <p className="text-xs text-[var(--text-tertiary)]">Permanently delete all messages in this space.</p>
        <button onClick={handleClearChat} disabled={clearing || !relationshipId}
          className="w-full bg-red-900/40 hover:bg-red-900/60 disabled:opacity-40 rounded-xl py-2.5 text-sm text-[var(--status-error)] transition-colors mt-2">
          {clearing ? "Clearing..." : "🗑 Clear chat history"}
        </button>
      </div>
    </div>
  );
}
