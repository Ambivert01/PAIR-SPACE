import { useEffect, useRef, useState } from "react";
import { getGameSocket, resetGameSocket } from "../../socket/gameSocket.js";

export const useGame = ({ relationshipId }) => {
  const [session, setSession]         = useState(null);
  const [incomingInvite, setIncomingInvite] = useState(null);
  const [connected, setConnected]     = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!relationshipId) return;
    const socket = getGameSocket();
    socketRef.current = socket;
    socket.auth = { token: localStorage.getItem("pairspace_token") };
    socket.connect();

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("game_join_room", { relationshipId });
    });
    socket.on("disconnect", () => setConnected(false));

    socket.on("game_invite",   (invite) => setIncomingInvite(invite));
    socket.on("game_created",  ({ session: s }) => setSession(s));
    socket.on("game_started",  ({ session: s }) => { setSession(s); setIncomingInvite(null); });
    socket.on("game_restarted",({ session: s }) => setSession(s));
    socket.on("game_ended",    () => { setSession(null); });
    socket.on("game_partner_disconnected", ({ message }) => {
      setSession((prev) => prev ? { ...prev, status: "abandoned", abandonedMessage: message } : null);
    });

    socket.on("game_state_update", ({ state, currentTurn, completed, result }) => {
      setSession((prev) => prev ? { ...prev, state, currentTurn, status: completed ? "completed" : prev.status, result } : prev);
    });


    return () => {
      socket.off("connect"); socket.off("disconnect");
      socket.off("game_invite"); socket.off("game_created");
      socket.off("game_started"); socket.off("game_restarted");
      socket.off("game_ended"); socket.off("game_state_update");
      socket.off("game_error");
      resetGameSocket();
    };
  }, [relationshipId]);

  const createGame = (gameType) =>
    socketRef.current?.emit("game_create", { relationshipId, gameType });

  const joinGame = (gameId) =>
    socketRef.current?.emit("game_join", { gameId, relationshipId });

  const makeMove = (move) =>
    socketRef.current?.emit("game_move", { gameId: session?._id, relationshipId, move });

  const restartGame = () =>
    socketRef.current?.emit("game_restart", { gameId: session?._id, relationshipId });

  const endGame = () => {
    socketRef.current?.emit("game_end", { gameId: session?._id, relationshipId });
    setSession(null);
  };

  const declineInvite = () => setIncomingInvite(null);

  return {
    session, incomingInvite, connected,
    createGame, joinGame, makeMove, restartGame, endGame, declineInvite,
  };
};
