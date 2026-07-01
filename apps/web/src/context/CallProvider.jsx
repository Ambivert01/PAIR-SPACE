import { createContext, useContext, useState, useEffect } from "react";
import { useCall, CALL_STATE } from "../features/call/useCall.js";
import CallScreenUltra from "../features/call/CallScreenUltra.jsx";
import IncomingCallModalUltra from "../features/call/IncomingCallModalUltra.jsx";
import { useNotificationContext } from "../context/NotificationContext.js";

const CallContext = createContext(null);

export const useCallContext = () => useContext(CallContext);

export default function CallProvider({ children, relationship }) {
  const [showCallScreen, setShowCallScreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const notif = useNotificationContext();

  const call = useCall({
    relationshipId: relationship?.id,
    onCallEnded: () => setTimeout(() => setShowCallScreen(false), 1500),
  });

  // Track call duration
  useEffect(() => {
    let interval;
    if (call.callState === CALL_STATE.CONNECTED) {
      setCallDuration(0);
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [call.callState]);

  const handleStartCall = async (type) => {
    setShowCallScreen(true);
    try {
      await call.startCall(type);
    } catch (err) {
      setShowCallScreen(false);
      notif?.addToast({
        type: "error",
        priority: "error",
        title: "Couldn't start call",
        message: err.message || "Check your camera/microphone permissions and try again.",
      });
    }
  };

  const handleAccept = async () => {
    setShowCallScreen(true);
    try {
      await call.acceptCall();
    } catch (err) {
      setShowCallScreen(false);
      notif?.addToast({
        type: "error",
        priority: "error",
        title: "Couldn't join call",
        message: err.message || "Check your camera/microphone permissions and try again.",
      });
    }
  };

  const handleEnd = () => {
    call.endCall();
    setTimeout(() => setShowCallScreen(false), 1500);
  };

  return (
    <CallContext.Provider value={{ ...call, startCall: handleStartCall }}>
      {children}

      {/* incoming call overlay — visible from any page */}
      {call.incomingCall &&
        call.callState === CALL_STATE.RINGING &&
        !showCallScreen && (
          <IncomingCallModalUltra
            partner={relationship?.partner}
            callType={call.incomingCall.callType}
            onAccept={handleAccept}
            onReject={call.rejectCall}
          />
        )}

      {/* active call screen */}
      {showCallScreen && call.callState !== CALL_STATE.IDLE && (
        <CallScreenUltra
          callState={call.callState}
          callType={call.callType}
          partner={relationship?.partner}
          localVideoRef={call.localVideoRef}
          remoteVideoRef={call.remoteVideoRef}
          isMuted={call.isMuted}
          isCameraOff={call.isCameraOff}
          isScreenSharing={call.isScreenSharing}
          partnerMuted={call.partnerMuted}
          partnerCameraOff={call.partnerCameraOff}
          onMute={call.toggleMute}
          onCamera={call.toggleCamera}
          onScreenShare={call.toggleScreenShare}
          onEnd={handleEnd}
          callDuration={callDuration}
        />
      )}
    </CallContext.Provider>
  );
}
