import TurnIndicator from "./TurnIndicator.jsx";

export default function TruthOrDare({ session, currentUserId, partnerName, onMove }) {
  const { phase, prompt, choice, round } = session.state;
  const isMyTurn = session.currentTurn === currentUserId;

  return (
    <div className="space-y-5 text-center">
      <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Round {round || 1}</p>
      <TurnIndicator isMyTurn={isMyTurn} partnerName={partnerName} />

      {phase === "choose" && isMyTurn && (
        <div className="space-y-3">
          <p className="text-[var(--text-secondary)] text-sm">Choose your challenge:</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => onMove({ choice: "truth" })}
              className="flex-1 gradient-mixed hover:bg-[var(--accent-dream)] rounded-2xl py-4 text-lg font-medium transition-colors">
              🤔 Truth
            </button>
            <button onClick={() => onMove({ choice: "dare" })}
              className="flex-1 bg-rose-600 hover:bg-rose-500 rounded-2xl py-4 text-lg font-medium transition-colors">
              🔥 Dare
            </button>
          </div>
        </div>
      )}

      {phase === "choose" && !isMyTurn && (
        <p className="text-[var(--text-tertiary)] text-sm">{partnerName} is choosing...</p>
      )}

      {phase === "respond" && prompt && (
        <div className="space-y-4">
          <div className="bg-[var(--glass-bg-strong)] rounded-2xl p-5">
            <p className="text-xs text-[var(--text-tertiary)] mb-2 uppercase">{choice}</p>
            <p className="text-white text-base leading-relaxed">"{prompt}"</p>
          </div>
          <p className="text-xs text-[var(--text-disabled)]">Answer in chat, then continue</p>
          <button onClick={() => onMove({ next: true })}
            className="w-full bg-[var(--glass-bg-strong)] hover:bg-[var(--glass-bg-strong)] rounded-xl py-2.5 text-sm transition-colors">
            Next round →
          </button>
        </div>
      )}
    </div>
  );
}
