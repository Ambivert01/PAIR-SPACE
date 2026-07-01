import { useState } from "react";

// Compatibility questions — mirrored from backend game.logic.js
const COMPAT_QUESTIONS = [
  { id: 1, question: "Ideal weekend?",         options: ["Stay home 🏠","Go out 🌆","Adventure 🏕️","Mix of both 🎭"] },
  { id: 2, question: "Love language?",          options: ["Words 💬","Touch 🤗","Gifts 🎁","Acts of service 🛠️"] },
  { id: 3, question: "Conflict style?",         options: ["Talk it out 💬","Need space 🚶","Hug it out 🤗","Write it down ✍️"] },
  { id: 4, question: "Dream vacation?",         options: ["Beach 🏖️","City 🏙️","Mountains 🏔️","Countryside 🌿"] },
  { id: 5, question: "Morning routine?",        options: ["Slow & cozy ☕","Quick & efficient ⚡","Workout 💪","No routine 🎲"] },
  { id: 6, question: "Future home?",            options: ["Big city 🏙️","Suburbs 🏡","Small town 🌳","Anywhere with you 💕"] },
];

export default function QuizGame({ session, currentUserId, partnerName, onMove }) {
  const [textAnswer, setTextAnswer] = useState("");
  const { gameType } = session;
  const state = session.state;
  const myAnswer = state.answers?.[currentUserId];
  const partnerAnswered = Object.keys(state.answers || {}).some((k) => k !== currentUserId);

  // ── This or That ──────────────────────────────────────────────────────
  if (gameType === "this_or_that") {
    const [a, b] = state.options || ["Option A", "Option B"];
    return (
      <div className="space-y-5 text-center">
        <p className="text-[var(--text-secondary)] text-sm">Pick one!</p>
        <div className="flex gap-3">
          {[a, b].map((opt) => (
            <button key={opt} onClick={() => !myAnswer && onMove({ answer: opt })}
              className={`flex-1 py-6 rounded-2xl text-sm font-medium transition-all ${
                myAnswer === opt ? "gradient-mixed text-white" : myAnswer ? "bg-[var(--glass-bg-strong)] opacity-40" : "bg-[var(--glass-bg-strong)] hover:bg-[var(--glass-bg-strong)]"
              }`}>
              {opt}
            </button>
          ))}
        </div>
        {myAnswer && <p className="text-xs text-[var(--text-tertiary)]">You chose: {myAnswer}</p>}
        {partnerAnswered && !myAnswer && <p className="text-xs text-yellow-500 animate-pulse">{partnerName} already chose!</p>}
      </div>
    );
  }

  // ── Compatibility Quiz ─────────────────────────────────────────────────
  if (gameType === "compatibility_quiz") {
    const qIdx = state.currentQ || 0;
    if (qIdx >= COMPAT_QUESTIONS.length) return <p className="text-center text-[var(--text-secondary)]">Calculating...</p>;
    const q = COMPAT_QUESTIONS[qIdx];
    const myAns = state.answers?.[q.id]?.[currentUserId];
    return (
      <div className="space-y-4">
        <p className="text-xs text-[var(--text-tertiary)] text-center">Question {qIdx + 1} of {COMPAT_QUESTIONS.length}</p>
        <p className="text-white text-center font-medium">{q.question}</p>
        <div className="grid grid-cols-2 gap-2">
          {q.options.map((opt) => (
            <button key={opt} onClick={() => !myAns && onMove({ answer: opt })}
              className={`py-3 rounded-xl text-sm transition-all ${
                myAns === opt ? "gradient-mixed text-white" : myAns ? "bg-[var(--glass-bg-strong)] opacity-40" : "bg-[var(--glass-bg-strong)] hover:bg-[var(--glass-bg-strong)] text-[var(--text-secondary)]"
              }`}>
              {opt}
            </button>
          ))}
        </div>
        {myAns && <p className="text-xs text-[var(--text-tertiary)] text-center">Waiting for {partnerName}...</p>}
      </div>
    );
  }

  // ── Text answer games (daily question, future prediction, custom) ───────
  const question = state.question || state.prompt || "What do you think?";
  return (
    <div className="space-y-4">
      <div className="bg-[var(--glass-bg-strong)] rounded-2xl p-5 text-center">
        <p className="text-white text-base leading-relaxed">"{question}"</p>
      </div>
      {!myAnswer ? (
        <div className="space-y-2">
          <textarea
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Your answer..."
            rows={3}
            maxLength={300}
            className="w-full bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[var(--accent-dream-soft)] resize-none"
          />
          <button onClick={() => { if (textAnswer.trim()) { onMove({ answer: textAnswer.trim() }); setTextAnswer(""); } }}
            disabled={!textAnswer.trim()}
            className="w-full gradient-mixed hover:bg-[var(--accent-dream)] disabled:opacity-30 rounded-xl py-2.5 text-sm font-medium transition-colors">
            Submit answer
          </button>
        </div>
      ) : (
        <div className="bg-indigo-900/30 border border-indigo-800 rounded-xl p-3 text-center">
          <p className="text-xs text-[var(--text-tertiary)] mb-1">Your answer</p>
          <p className="text-sm text-white">{myAnswer}</p>
          {!partnerAnswered && <p className="text-xs text-yellow-500 mt-2 animate-pulse">Waiting for {partnerName}...</p>}
        </div>
      )}
    </div>
  );
}
