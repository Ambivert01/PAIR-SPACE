import { useNavigate } from "react-router-dom";
import { useRelationship } from "../context/RelationshipProvider.jsx";
import { useCurrentUserId } from "../hooks/useCurrentUserId.js";
import { useGame } from "../features/games/useGame.js";
import GamesHub from "../features/games/GamesHub.jsx";
import GameBoard from "../features/games/GameBoard.jsx";
import GameInviteModal from "../features/games/GameInviteModal.jsx";
import GameResultModal from "../features/games/GameResultModal.jsx";
import PageLayout, { PageSpinner } from "../components/PageLayout.jsx";

export default function GamesPage() {
  const navigate = useNavigate();
  const currentUserId = useCurrentUserId();
  const { rel, loading: relLoading } = useRelationship();

  const { session, incomingInvite, connected, createGame, joinGame, makeMove, restartGame, endGame, declineInvite } = useGame({ relationshipId: rel?.id });
  const isCompleted = session?.status === "completed";

  if (relLoading) return (
    <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <PageSpinner label="Loading games..." />
    </div>
  );

  if (!rel) return (
    <PageLayout title="Games" icon="🎮" accent="dream">
      <div className="empty-state"><span className="empty-state-icon">🎮</span><p className="empty-state-title">No active space</p><p className="empty-state-desc">Connect with your partner first.</p></div>
    </PageLayout>
  );

  return (
    <PageLayout
      title={session ? "Playing Together" : "Games"}
      subtitle={session ? session.gameType?.replace(/_/g, " ") : "8 games to play together"}
      icon="🎮"
      accent="dream"
      noPad
      headerRight={
        !connected ? (
          <span className="text-xs text-yellow-400 animate-pulse font-medium">Connecting...</span>
        ) : session ? (
          <button onClick={endGame} className="text-xs text-[var(--text-disabled)] hover:text-[var(--status-error)] transition-colors px-3 py-1.5 glass rounded-lg">Quit</button>
        ) : null
      }
    >
      <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
        {incomingInvite && (
          <GameInviteModal invite={incomingInvite} partnerName={rel?.partner?.displayName} onJoin={joinGame} onDecline={declineInvite} />
        )}
        {isCompleted && (
          <GameResultModal session={session} currentUserId={currentUserId} partnerName={rel?.partner?.displayName} onRestart={restartGame} onEnd={endGame} />
        )}
        <div className="flex-1 overflow-y-auto">
          {!session ? (
            <GamesHub onStart={createGame} />
          ) : (
            <div className="p-4">
              <GameBoard session={session} currentUserId={currentUserId} partnerName={rel?.partner?.displayName} onMove={makeMove} />
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
