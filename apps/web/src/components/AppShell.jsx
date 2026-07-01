import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { getToken } from "../services/auth/authService.js";
import CallProvider from "../context/CallProvider.jsx";
import RelationshipProvider, { useRelationship } from "../context/RelationshipProvider.jsx";
import { NotificationContext } from "../context/NotificationContext.js";
import { useNotifications } from "../features/notification/useNotifications.js";
import ToastContainer from "../features/notification/ToastContainer.jsx";
import { getUserSettings } from "../features/settings/settingsService.js";
import { applyTheme } from "../features/settings/useSettings.js";
import { getPersonalization } from "../features/personalization/personalizationService.js";
import { applyPersonalization } from "../features/personalization/usePersonalization.js";
import SyncProvider from "../features/offline/SyncProvider.jsx";
import FeedbackButton from "../features/feedback/FeedbackButton.jsx";

// Re-exported for any existing imports of `useNotificationContext` from this file
export { useNotificationContext } from "../context/NotificationContext.js";

function NotificationProvider({ children }) {
  const notif = useNotifications();
  return (
    <NotificationContext.Provider value={notif}>
      {children}
      <ToastContainer toasts={notif.toasts} onDismiss={notif.dismissToast} />
    </NotificationContext.Provider>
  );
}

// Applies theme + personalization once the relationship context resolves.
// Lives inside RelationshipProvider so it can read the shared `rel` value
// instead of fetching it separately.
function PersonalizationLoader({ children }) {
  const { rel } = useRelationship();

  useEffect(() => {
    if (!getToken()) return;
    getUserSettings().then(applyTheme).catch(() => {});
  }, []);

  useEffect(() => {
    if (rel?.status === "active") {
      getPersonalization(rel.id).then(applyPersonalization).catch(() => {});
    }
  }, [rel?.id, rel?.status]);

  return children;
}

function CallProviderBridge({ children }) {
  const { rel } = useRelationship();
  return <CallProvider relationship={rel}>{children}</CallProvider>;
}

export default function AppShell() {
  return (
    <NotificationProvider>
      <RelationshipProvider>
        <PersonalizationLoader>
          <CallProviderBridge>
            <SyncProvider>
              <Outlet />
              <FeedbackButton />
            </SyncProvider>
          </CallProviderBridge>
        </PersonalizationLoader>
      </RelationshipProvider>
    </NotificationProvider>
  );
}
