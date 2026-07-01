export default function OfflineBanner({ isOnline, pendingCount, failedCount, syncing, onRetry }) {
  if (isOnline && pendingCount === 0 && failedCount === 0) return null;

  if (!isOnline) return (
    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-900/40 border-b border-yellow-800/50 text-yellow-300 text-xs">
      <span>📴</span>
      <span className="flex-1">You're offline — changes will sync when you reconnect</span>
      {pendingCount > 0 && <span className="bg-yellow-800/60 px-2 py-0.5 rounded-full">{pendingCount} pending</span>}
    </div>
  );

  if (syncing) return (
    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-900/30 border-b border-indigo-800/30 text-[var(--accent-dream-soft)] text-xs">
      <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin" />
      <span>Syncing {pendingCount} item{pendingCount !== 1 ? "s" : ""}...</span>
    </div>
  );

  if (failedCount > 0) return (
    <div className="flex items-center gap-2 px-4 py-2 bg-red-900/30 border-b border-red-800/30 text-red-300 text-xs">
      <span>⚠️</span>
      <span className="flex-1">{failedCount} item{failedCount !== 1 ? "s" : ""} failed to sync</span>
      <button onClick={onRetry} className="bg-red-800/60 hover:bg-red-700/60 px-2 py-0.5 rounded-full transition-colors">
        Retry
      </button>
    </div>
  );

  return null;
}
