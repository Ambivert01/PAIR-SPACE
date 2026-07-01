import { useState } from "react";
import TurnIndicator from "./TurnIndicator.jsx";

const EMOJI_SETS = ["❤️","😊","🌟","🎉","🔥","💫","🌈","🎵","🌙","☀️","🦋","🌸","🎨","🚀","💎","🌊","🎭","🍀","⚡","🎪"];

export default function EmojiStory({ session, currentUserId, partnerName, onMove }) {
  const [selected, setSelected] = useState("");
  const { story = [], turn } = session.state;
  const isMyTurn = session.currentTurn === currentUserId;

  return (
    <div className="space-y-4">
      <TurnIndicator isMyTurn={isMyTurn} partnerName={partnerName} />

      {/* story so far */}
      <div className="bg-[var(--glass-bg-strong)] rounded-2xl p-4 min-h-16 flex flex-wrap gap-1 items-center justify-center">
        {story.length === 0
          ? <p className="text-[var(--text-disabled)] text-sm">Story starts here...</p>
          : story.map((s, i) => <span key={i} className="text-2xl">{s.emoji}</span>)
        }
      </div>

      {/* emoji picker */}
      {isMyTurn && (
        <div className="space-y-3">
          <div className="grid grid-cols-10 gap-1">
            {EMOJI_SETS.map((e) => (
              <button key={e} onClick={() => setSelected(e)}
                className={`text-xl p-1 rounded-lg transition-all ${selected === e ? "gradient-mixed scale-110" : "hover:bg-[var(--glass-bg-strong)]"}`}>
                {e}
              </button>
            ))}
          </div>
          <button
            onClick={() => { if (selected) { onMove({ emoji: selected }); setSelected(""); } }}
            disabled={!selected}
            className="w-full gradient-mixed hover:bg-[var(--accent-dream)] disabled:opacity-30 rounded-xl py-2.5 text-sm font-medium transition-colors"
          >
            Add {selected || "emoji"} to story
          </button>
        </div>
      )}

      <p className="text-xs text-[var(--text-disabled)] text-center">{story.length}/20 emojis</p>
    </div>
  );
}
