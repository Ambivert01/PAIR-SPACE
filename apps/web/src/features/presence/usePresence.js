import { useEffect, useRef, useState } from "react";
import { getPresenceSocket, resetPresenceSocket } from "../../socket/presenceSocket.js";

const PING_INTERVAL = 25_000; // 25s (server expects 30s)

export const usePresence = (relationshipId) => {
  const [partnerPresence, setPartnerPresence] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const pingTimer = useRef(null);
  const idleTimer = useRef(null);

  const resetIdleTimer = () => {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      socketRef.current?.emit("presence_idle");
    }, 60_000); // 1 min no activity → idle
  };

  const handleActivity = () => {
    socketRef.current?.emit("presence_ping");
    resetIdleTimer();
  };

  useEffect(() => {
    if (!relationshipId) return;

    const socket = getPresenceSocket();
    socketRef.current = socket;
    socket.auth = { token: localStorage.getItem("pairspace_token") };
    socket.connect();

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("presence_join", { relId: relationshipId });

      // heartbeat
      pingTimer.current = setInterval(() => {
        socket.emit("presence_ping");
      }, PING_INTERVAL);

      resetIdleTimer();
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("partner_presence_update", (data) => {
      setPartnerPresence(data);
    });

    // tab visibility detection
    const handleVisibility = () => {
      if (document.hidden) {
        socket.emit("presence_idle");
      } else {
        socket.emit("presence_ping");
        resetIdleTimer();
      }
    };

    // user activity detection
    const activityEvents = ["mousemove", "keydown", "touchstart", "scroll"];
    const throttledActivity = throttle(handleActivity, 10_000);

    document.addEventListener("visibilitychange", handleVisibility);
    activityEvents.forEach((e) => window.addEventListener(e, throttledActivity, { passive: true }));

    return () => {
      clearInterval(pingTimer.current);
      clearTimeout(idleTimer.current);
      document.removeEventListener("visibilitychange", handleVisibility);
      activityEvents.forEach((e) => window.removeEventListener(e, throttledActivity));
      resetPresenceSocket();
    };
  }, [relationshipId]);

  const setStatus = (status, customMessage = "") => {
    socketRef.current?.emit("presence_update", { status, customMessage });
  };

  const setActivity = (activity) => {
    socketRef.current?.emit("presence_activity_start", { activity });
  };

  const clearActivity = () => {
    socketRef.current?.emit("presence_activity_stop");
  };

  const setVisibility = (visibility) => {
    socketRef.current?.emit("presence_visibility_change", { visibility });
  };

  return { partnerPresence, connected, setStatus, setActivity, clearActivity, setVisibility };
};

// simple throttle
const throttle = (fn, ms) => {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn(...args); }
  };
};
