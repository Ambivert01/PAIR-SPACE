import { useCallback, useEffect, useRef, useState } from "react";
import { getActivitySocket, resetActivitySocket } from "../../socket/activitySocket.js";

export const useActivity = ({ relationshipId }) => {
  const [activity, setActivity]         = useState(null);
  const [state, setState]               = useState({ currentTime: 0, paused: true, playbackRate: 1, volume: 1 });
  const [partnerJoined, setPartnerJoined] = useState(false);
  const [incomingInvite, setIncomingInvite] = useState(null);
  const [connected, setConnected]       = useState(false);

  const socketRef   = useRef(null);
  const syncTimer   = useRef(null);
  const playerRef   = useRef(null); // external ref to video/audio element

  useEffect(() => {
    if (!relationshipId) return;
    const socket = getActivitySocket();
    socketRef.current = socket;
    socket.auth = { token: localStorage.getItem("pairspace_token") };
    socket.connect();

    socket.on("connect",    () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("activity_created", ({ activity: act }) => {
      setActivity(act);
      setState(act.state);
    });

    socket.on("activity_joined", ({ activity: act }) => {
      setActivity(act);
      setState(act.state);
      startSyncPing(act._id);
    });

    socket.on("activity_partner_joined", ({ state: s }) => {
      setPartnerJoined(true);
      setState(s);
      applyToPlayer(s);
    });

    socket.on("activity_invite", (invite) => {
      setIncomingInvite(invite);
    });

    socket.on("activity_state_update", ({ state: s }) => {
      setState(s);
      applyToPlayer(s);
    });

    socket.on("activity_pause", ({ currentTime }) => {
      setState((p) => ({ ...p, paused: true, currentTime }));
      if (playerRef.current) { playerRef.current.currentTime = currentTime; playerRef.current.pause(); }
    });

    socket.on("activity_resume", ({ currentTime }) => {
      setState((p) => ({ ...p, paused: false, currentTime }));
      if (playerRef.current) { playerRef.current.currentTime = currentTime; playerRef.current.play().catch(() => {}); }
    });

    socket.on("activity_seek", ({ currentTime }) => {
      setState((p) => ({ ...p, currentTime }));
      if (playerRef.current) playerRef.current.currentTime = currentTime;
    });

    socket.on("activity_sync_correct", ({ currentTime, paused }) => {
      if (playerRef.current) {
        const drift = Math.abs(playerRef.current.currentTime - currentTime);
        if (drift > 0.5) playerRef.current.currentTime = currentTime;
        if (paused !== undefined) {
          if (paused && !playerRef.current.paused) playerRef.current.pause();
          else if (!paused && playerRef.current.paused) playerRef.current.play().catch(() => {});
        }
      }
      setState((p) => ({ ...p, currentTime, ...(paused !== undefined ? { paused } : {}) }));
    });

    // Partner joined → they request our live position so they can sync to it.
    socket.on("activity_request_position", ({ activityId }) => {
      const ct = playerRef.current?.currentTime ?? 0;
      const paused = playerRef.current?.paused ?? true;
      socket.emit("activity_position_report", { activityId, currentTime: ct, paused });
    });

    // Drift echo from the OTHER partner's sync ping — correct our position if needed.
    socket.on("activity_sync_ping_echo", ({ currentTime }) => {
      if (!playerRef.current || playerRef.current.paused) return;
      const drift = Math.abs(playerRef.current.currentTime - currentTime);
      if (drift > 0.5) {
        playerRef.current.currentTime = currentTime;
        setState((p) => ({ ...p, currentTime }));
      }
    });

    socket.on("activity_ended", () => {
      clearInterval(syncTimer.current);
      setActivity(null);
      setState({ currentTime: 0, paused: true, playbackRate: 1, volume: 1 });
      setPartnerJoined(false);
    });

    return () => {
      clearInterval(syncTimer.current);
      resetActivitySocket();
    };
  }, [relationshipId]);

  const applyToPlayer = (s) => {
    if (!playerRef.current) return;
    if (Math.abs(playerRef.current.currentTime - s.currentTime) > 0.5) {
      playerRef.current.currentTime = s.currentTime;
    }
    playerRef.current.playbackRate = s.playbackRate;
    if (s.paused) playerRef.current.pause();
    else playerRef.current.play().catch(() => {});
  };

  const startSyncPing = (activityId) => {
    clearInterval(syncTimer.current);
    syncTimer.current = setInterval(() => {
      const ct = playerRef.current?.currentTime || 0;
      socketRef.current?.emit("activity_sync_ping", { activityId, clientTime: ct });
    }, 5000);
  };

  const createActivity = (activityType, metadata = {}) => {
    socketRef.current?.emit("activity_create", { relationshipId, activityType, metadata });
  };

  const joinActivity = (activityId) => {
    socketRef.current?.emit("activity_join", { activityId, relationshipId });
    setIncomingInvite(null);
  };

  const declineInvite = () => setIncomingInvite(null);

  const pause = () => {
    const ct = playerRef.current?.currentTime || state.currentTime;
    socketRef.current?.emit("activity_pause", { activityId: activity?._id, currentTime: ct });
    setState((p) => ({ ...p, paused: true, currentTime: ct }));
    playerRef.current?.pause();
  };

  const resume = () => {
    const ct = playerRef.current?.currentTime || state.currentTime;
    socketRef.current?.emit("activity_resume", { activityId: activity?._id, currentTime: ct });
    setState((p) => ({ ...p, paused: false, currentTime: ct }));
    playerRef.current?.play().catch(() => {});
  };

  const seek = (time) => {
    socketRef.current?.emit("activity_seek", { activityId: activity?._id, currentTime: time });
    setState((p) => ({ ...p, currentTime: time }));
    if (playerRef.current) playerRef.current.currentTime = time;
  };

  const updateState = (patch) => {
    const newState = { ...state, ...patch };
    setState(newState);
    socketRef.current?.emit("activity_state_update", { activityId: activity?._id, state: newState });
  };

  const endActivity = () => {
    socketRef.current?.emit("activity_end", { activityId: activity?._id, relationshipId });
    clearInterval(syncTimer.current);
  };

  return {
    activity, state, partnerJoined, incomingInvite, connected,
    playerRef,
    createActivity, joinActivity, declineInvite,
    pause, resume, seek, updateState, endActivity,
  };
};
