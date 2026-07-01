import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRelationship } from "../context/RelationshipProvider.jsx";
import { useCurrentUserId } from "../hooks/useCurrentUserId.js";
import { useGame } from "../features/games/useGame.js";
import GamesHub from "../features/games/GamesHub.jsx";
import GameBoard from "../features/games/GameBoard.jsx";
import GameInviteModal from "../features/games/GameInviteModal.jsx";
import GameResultModal from "../features/games/GameResultModal.jsx";

export default function GamesPage() {
  const navigate = useNavigate();
  const currentUserId = useCurrentUserId();
  const { rel, loading: relLoading } = useRelationship();


  const {
    session,
    incomingInvite,
    connected,
    createGame,
    joinGame,
    makeMove,
    restartGame,
    endGame,
    declineInvite,
  } = useGame({ relationshipId: rel?.id });

  const isCompleted = session?.status === "completed";

  if (relLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-6 h-6 border-2 border-[var(--accent-dream)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!rel) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)] text-white">
        <div className="empty-state">
          <span className="empty-state-icon">🎮</span>
          <p className="empty-state-title">No active space</p>
          <p className="empty-state-desc">Connect with your partner first to play games together.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-white">
      <div className="hstack-md px-4 py-4 border-b border-[var(--glass-border)]">
        <button
          onClick={() => navigate("/relationship")}
          className="text-[var(--text-tertiary)] hover:text-white transition-colors"
        >
          ←
        </button>
        <h1 className="text-base font-semibold flex-1">
          {session ? "Playing" : "Games"}
        </h1>
        {!connected && (
          <span className="text-xs text-yellow-500 animate-pulse">
            Connecting...
          </span>
        )}
        {session && (
          <button
            onClick={endGame}
            className="text-xs text-[var(--text-disabled)] hover:text-[var(--status-error)] transition-colors"
          >
            Quit
          </button>
        )}
      </div>

      {incomingInvite && (
        <GameInviteModal
          invite={incomingInvite}
          partnerName={rel?.partner?.displayName}
          onJoin={joinGame}
          onDecline={declineInvite}
        />
      )}

      {isCompleted && (
        <GameResultModal
          session={session}
          currentUserId={currentUserId}
          partnerName={rel?.partner?.displayName}
          onRestart={restartGame}
          onEnd={endGame}
        />
      )}

      <div className="flex-1 overflow-y-auto">
        {!session ? (
          <GamesHub onStart={createGame} />
        ) : (
          <div className="p-4">
            <GameBoard
              session={session}
              currentUserId={currentUserId}
              partnerName={rel?.partner?.displayName}
              onMove={makeMove}
            />
          </div>
        )}
      </div>
    </div>
  );
}
