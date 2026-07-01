import { createContext, useContext } from "react";
import { useOfflineStatus } from "./useOfflineStatus.js";
import { useSyncQueue } from "./useSyncQueue.js";
import OfflineBanner from "./OfflineBanner.jsx";

const SyncContext = createContext(null);
export const useSyncContext = () => useContext(SyncContext);

export default function SyncProvider({ children }) {
  const isOnline = useOfflineStatus();
  const { enqueue, processQueue, retryFailed, pendingCount, failedCount, syncing } = useSyncQueue({ isOnline });

  return (
    <SyncContext.Provider value={{ isOnline, enqueue, processQueue, pendingCount, failedCount, syncing }}>
      <OfflineBanner
        isOnline={isOnline}
        pendingCount={pendingCount}
        failedCount={failedCount}
        syncing={syncing}
        onRetry={retryFailed}
      />
      {children}
    </SyncContext.Provider>
  );
}
