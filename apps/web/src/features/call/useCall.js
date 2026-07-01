import { useCallback, useEffect, useRef, useState } from "react";
import { getCallSocket, resetCallSocket } from "../../socket/callSocket.js";

const MAX_RECONNECT = 3;

export const CALL_STATE = {
  IDLE:         "idle",
  CALLING:      "calling",
  RINGING:      "ringing",
  CONNECTED:    "connected",
  RECONNECTING: "reconnecting",
  ENDED:        "ended",
};

export const useCall = ({ relationshipId, onCallEnded, onSystemMessage }) => {
  const [callState, setCallState]       = useState(CALL_STATE.IDLE);
  const [callType, setCallType]         = useState("voice");
  const [callId, setCallId]             = useState(null);
  const [isMuted, setIsMuted]           = useState(false);
  const [isCameraOff, setIsCameraOff]   = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [partnerMuted, setPartnerMuted] = useState(false);
  const [partnerCameraOff, setPartnerCameraOff] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);

  const socketRef     = useRef(null);
  const pcRef         = useRef(null);
  const localStreamRef  = useRef(null);
  const screenStreamRef = useRef(null);
  const reconnectCount  = useRef(0);
  const localVideoRef   = useRef(null);
  const remoteVideoRef  = useRef(null);
  const iceServersRef   = useRef([{ urls: "stun:stun.l.google.com:19302" }]);
  const callIdRef       = useRef(null); // ref to avoid stale closure in ICE handler

  // ── init socket ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!relationshipId) return;
    const socket = getCallSocket();
    socketRef.current = socket;
    socket.auth = { token: localStorage.getItem("pairspace_token") };
    socket.connect();

    socket.on("connect", () => {
      socket.emit("call_join_room", { relationshipId });
    });

    socket.on("call_incoming", ({ callId: cid, callType: ct, callerId, iceServers }) => {
      iceServersRef.current = iceServers || iceServersRef.current;
      setIncomingCall({ callId: cid, callType: ct, callerId });
      setCallState(CALL_STATE.RINGING);
    });

    socket.on("call_initiated", ({ callId: cid, iceServers }) => {
      iceServersRef.current = iceServers || iceServersRef.current;
      callIdRef.current = cid;
      setCallId(cid);
    });

    socket.on("call_offer", async ({ offer, callId: cid }) => {
      setCallId(cid);
      await createPeerConnection();
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socket.emit("call_answer", { relationshipId, answer, callId: cid });
      setCallState(CALL_STATE.CONNECTED);
    });

    socket.on("call_answer", async ({ answer }) => {
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        setCallState(CALL_STATE.CONNECTED);
        reconnectCount.current = 0;
      }
    });

    socket.on("call_ice_candidate", async ({ candidate }) => {
      try {
        if (pcRef.current && candidate) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch { /* ignore stale candidates */ }
    });

    socket.on("call_rejected", () => {
      cleanup();
      setCallState(CALL_STATE.ENDED);
      setTimeout(() => setCallState(CALL_STATE.IDLE), 2000);
    });

    // Partner didn't answer within 30 seconds
    socket.on("call_missed", () => {
      cleanup();
      setCallState(CALL_STATE.IDLE);
      setCallId(null);
      callIdRef.current = null;
      setIncomingCall(null);
      onSystemMessage?.({ type: "call_missed", message: "Call wasn't answered" });
    });

    socket.on("call_ended", () => {
      cleanup();
      setCallState(CALL_STATE.ENDED);
      onCallEnded?.();
      setTimeout(() => setCallState(CALL_STATE.IDLE), 2000);
    });

    socket.on("call_reconnecting", () => setCallState(CALL_STATE.RECONNECTING));

    socket.on("call_media_toggle", ({ kind, enabled }) => {
      if (kind === "audio") setPartnerMuted(!enabled);
      if (kind === "video") setPartnerCameraOff(!enabled);
    });

    socket.on("call_screen_share_start", () => {});
    socket.on("call_screen_share_stop",  () => {});

    return () => {
      cleanup();
      resetCallSocket();
    };
  }, [relationshipId]);

  // ── peer connection ────────────────────────────────────────────────────
  const createPeerConnection = useCallback(async () => {
    if (pcRef.current) pcRef.current.close();

    const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });
    pcRef.current = pc;

    // add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current));
    }

    // remote stream → video element
    pc.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };

    // ICE candidates
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current?.emit("call_ice_candidate", {
          relationshipId, candidate: e.candidate, callId: callIdRef.current,
        });
      }
    };

    // connection state
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        if (reconnectCount.current < MAX_RECONNECT) {
          reconnectCount.current++;
          setCallState(CALL_STATE.RECONNECTING);
          socketRef.current?.emit("call_reconnect_attempt", { relationshipId, callId });
          setTimeout(() => attemptReconnect(), 2000);
        } else {
          endCall();
        }
      }
    };

    return pc;
  }, [relationshipId, callId]);

  const attemptReconnect = async () => {
    if (!pcRef.current || !callId) return;
    const offer = await pcRef.current.createOffer({ iceRestart: true });
    await pcRef.current.setLocalDescription(offer);
    socketRef.current?.emit("call_offer", { relationshipId, offer, callId });
  };

  // ── get user media ─────────────────────────────────────────────────────
  const getMedia = async (type) => {
    const constraints = {
      audio: true,
      video: type === "video" ? { width: 1280, height: 720, facingMode: "user" } : false,
    };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (err) {
      throw new Error(`Media permission denied: ${err.message}`);
    }
  };

  // ── start call ─────────────────────────────────────────────────────────
  const startCall = async (type = "voice") => {
    setCallType(type);
    setCallState(CALL_STATE.CALLING);
    try {
      await getMedia(type);
      await createPeerConnection();

      // ⚠️ Register listener BEFORE emitting — prevents race on fast local network
      socketRef.current?.once("call_initiated", async ({ callId: cid, iceServers }) => {
        iceServersRef.current = iceServers || iceServersRef.current;
        callIdRef.current = cid;
        setCallId(cid);
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        socketRef.current?.emit("call_offer", { relationshipId, offer, callId: cid });
      });

      socketRef.current?.emit("call_initiate", { relationshipId, callType: type });
    } catch (err) {
      setCallState(CALL_STATE.IDLE);
      throw err;
    }
  };

  // ── accept call ────────────────────────────────────────────────────────
  const acceptCall = async () => {
    if (!incomingCall) return;
    try {
      await getMedia(incomingCall.callType);
      await createPeerConnection();
      setIncomingCall(null);
      setCallType(incomingCall.callType);
    } catch (err) {
      rejectCall();
      throw err;
    }
  };

  // ── reject call ────────────────────────────────────────────────────────
  const rejectCall = () => {
    if (!incomingCall) return;
    socketRef.current?.emit("call_reject", { relationshipId, callId: incomingCall.callId });
    setIncomingCall(null);
    setCallState(CALL_STATE.IDLE);
  };

  // ── end call ───────────────────────────────────────────────────────────
  const endCall = () => {
    socketRef.current?.emit("call_end", { relationshipId, callId });
    cleanup();
    setCallState(CALL_STATE.ENDED);
    setTimeout(() => setCallState(CALL_STATE.IDLE), 1500);
  };

  // ── mute ───────────────────────────────────────────────────────────────
  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setIsMuted(!track.enabled);
    socketRef.current?.emit("call_media_toggle", { relationshipId, kind: "audio", enabled: track.enabled });
  };

  // ── camera ─────────────────────────────────────────────────────────────
  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setIsCameraOff(!track.enabled);
    socketRef.current?.emit("call_media_toggle", { relationshipId, kind: "video", enabled: track.enabled });
  };

  // ── screen share ───────────────────────────────────────────────────────
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      // restore camera track
      const camTrack = localStreamRef.current?.getVideoTracks()[0];
      if (camTrack && pcRef.current) {
        const sender = pcRef.current.getSenders().find((s) => s.track?.kind === "video");
        sender?.replaceTrack(camTrack);
      }
      setIsScreenSharing(false);
      socketRef.current?.emit("call_screen_share_stop", { relationshipId });
    } else {
      try {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screen;
        const screenTrack = screen.getVideoTracks()[0];
        const sender = pcRef.current?.getSenders().find((s) => s.track?.kind === "video");
        sender?.replaceTrack(screenTrack);
        screenTrack.onended = () => toggleScreenShare();
        setIsScreenSharing(true);
        socketRef.current?.emit("call_screen_share_start", { relationshipId });
      } catch { /* permission denied */ }
    }
  };

  // ── cleanup ────────────────────────────────────────────────────────────
  const cleanup = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current  = null;
    screenStreamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    if (localVideoRef.current)  localVideoRef.current.srcObject  = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  return {
    callState, callType, callId, incomingCall,
    isMuted, isCameraOff, isScreenSharing,
    partnerMuted, partnerCameraOff,
    localVideoRef, remoteVideoRef,
    startCall, acceptCall, rejectCall, endCall,
    toggleMute, toggleCamera, toggleScreenShare,
  };
};
