import TurnIndicator from "./TurnIndicator.jsx";

export default function TicTacToe({ session, currentUserId, partnerName, onMove }) {
  const { board = Array(9).fill(null), winner, draw, symbols = {} } = session.state;
  const mySymbol = symbols[currentUserId];
  const isMyTurn = session.currentTurn === currentUserId;

  return (
    <div className="space-y-4">
      <TurnIndicator isMyTurn={isMyTurn} partnerName={partnerName} />

      <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => isMyTurn && !cell && !winner && !draw && onMove({ index: i })}
            className={`h-20 rounded-2xl text-3xl font-bold flex items-center justify-center transition-all ${
              cell
                ? cell === "X" ? "bg-indigo-900/60 text-[var(--accent-dream-soft)]" : "bg-rose-900/60 text-rose-300"
                : isMyTurn && !winner && !draw
                ? "bg-[var(--glass-bg-strong)] hover:bg-[var(--glass-bg-strong)] cursor-pointer"
                : "bg-[var(--glass-bg-strong)] cursor-default"
            }`}
          >
            {cell}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-6 text-sm">
        <span className="text-[var(--accent-dream-soft)]">You = {mySymbol || "?"}</span>
        <span className="text-rose-300">{partnerName} = {mySymbol === "X" ? "O" : "X"}</span>
      </div>
    </div>
  );
}
