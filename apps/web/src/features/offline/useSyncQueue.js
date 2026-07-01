import { useCallback, useEffect, useRef, useState } from "react";
import { queueAdd, queueGetAll, queueRemove, queueUpdate } from "./offlineDB.js";
import { generateQueueId, deduplicateQueue, buildBatchPayload, isRetryable } from "@shared/utils/syncQueue.js";
import api from "../../services/api.js";

const RETRY_DELAY = 5000;
const BATCH_SIZE  = 20;

export const useSyncQueue = ({ isOnline }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing]           = useState(false);
  const [failedCount, setFailedCount]   = useState(0);
  const processingRef = useRef(false);

  // load counts on mount
  useEffect(() => {
    queueGetAll().then((items) => {
      setPendingCount(items.filter((i) => i.status === "pending").length);
      setFailedCount(items.filter((i) => i.status === "failed").length);
    });
  }, []);

  // process queue when coming online
  useEffect(() => {
    if (isOnline) processQueue();
  }, [isOnline]);

  const enqueue = useCallback(async ({ actionType, entityType, entityId, payload, relationshipId }) => {
    const item = {
      id: generateQueueId(),
      actionType, entityType, entityId: entityId || null,
      payload, relationshipId: relationshipId || null,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      status: "pending",
    };
    await queueAdd(item);
    setPendingCount((c) => c + 1);
    return item;
  }, []);

  const processQueue = useCallback(async () => {
    if (processingRef.current || !navigator.onLine) return;
    processingRef.current = true;
    setSyncing(true);

    try {
      const all     = await queueGetAll();
      const pending = deduplicateQueue(all.filter((i) => i.status === "pending" || i.status === "syncing"));
      if (!pending.length) return;

      // process in batches
      for (let i = 0; i < pending.length; i += BATCH_SIZE) {
        const batch = pending.slice(i, i + BATCH_SIZE);

        // mark as syncing
        for (const item of batch) {
          await queueUpdate({ ...item, status: "syncing" });
        }

        try {
          const { data } = await api.post("/api/sync/batch", {
            actions: buildBatchPayload(batch),
          });

          for (const result of data.results) {
            const item = batch.find((b) => b.id === result.id);
            if (!item) continue;

            if (result.status === "synced") {
              await queueRemove(item.id);
              setPendingCount((c) => Math.max(0, c - 1));
            } else {
              const updated = { ...item, status: isRetryable(item) ? "pending" : "failed", retryCount: item.retryCount + 1 };
              await queueUpdate(updated);
              if (!isRetryable(item)) setFailedCount((c) => c + 1);
            }
          }
        } catch {
          // network error — revert to pending for retry
          for (const item of batch) {
            await queueUpdate({ ...item, status: "pending" });
          }
        }
      }
    } finally {
      processingRef.current = false;
      setSyncing(false);
    }
  }, []);

  const retryFailed = useCallback(async () => {
    const all = await queueGetAll();
    for (const item of all.filter((i) => i.status === "failed")) {
      await queueUpdate({ ...item, status: "pending", retryCount: 0 });
    }
    setFailedCount(0);
    setPendingCount((c) => c + all.filter((i) => i.status === "failed").length);
    processQueue();
  }, [processQueue]);

  return { enqueue, processQueue, retryFailed, pendingCount, failedCount, syncing };
};
