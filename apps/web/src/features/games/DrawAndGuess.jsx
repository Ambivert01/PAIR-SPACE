import { useEffect, useRef, useState } from "react";

export default function DrawAndGuess({ session, currentUserId, partnerName, onMove }) {
  const canvasRef = useRef(null);
  const drawing   = useRef(false);
  const [guess, setGuess] = useState("");
  const [word, setWord]   = useState("");

  const { strokes = [], phase, word: hiddenWord } = session.state;
  const isDrawer = session.createdBy === currentUserId || session.players?.[0]?.toString() === currentUserId;

  // render strokes on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    for (const stroke of strokes) {
      if (!stroke.length) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (const pt of stroke.slice(1)) ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    }
  }, [strokes]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches?.[0] || e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const currentStroke = useRef([]);

  const startDraw = (e) => {
    if (!isDrawer) return;
    drawing.current = true;
    currentStroke.current = [getPos(e, canvasRef.current)];
  };

  const draw = (e) => {
    if (!drawing.current || !isDrawer) return;
    currentStroke.current.push(getPos(e, canvasRef.current));
    // local preview
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const s = currentStroke.current;
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(s[s.length-2]?.x || s[0].x, s[s.length-2]?.y || s[0].y);
    ctx.lineTo(s[s.length-1].x, s[s.length-1].y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (!drawing.current || !isDrawer) return;
    drawing.current = false;
    const newStrokes = [...strokes, currentStroke.current];
    onMove({ strokes: newStrokes });
    currentStroke.current = [];
  };

  return (
    <div className="space-y-3">
      {isDrawer ? (
        <div className="space-y-2">
          {!hiddenWord && (
            <div className="flex gap-2">
              <input value={word} onChange={(e) => setWord(e.target.value)}
                placeholder="Enter a word to draw..."
                className="flex-1 bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent-dream-soft)]" />
              <button onClick={() => word.trim() && onMove({ word: word.trim() })}
                className="gradient-mixed hover:bg-[var(--accent-dream)] rounded-xl px-4 py-2 text-sm transition-colors">Set</button>
            </div>
          )}
          {hiddenWord && <p className="text-center text-sm text-[var(--accent-dream-soft)]">Drawing: <strong>{hiddenWord}</strong></p>}
          <canvas ref={canvasRef} width={300} height={200}
            className="w-full bg-[var(--glass-bg-strong)] rounded-2xl cursor-crosshair touch-none"
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
          />
          <button onClick={() => onMove({ strokes: [] })}
            className="w-full bg-[var(--glass-bg-strong)] hover:bg-[var(--glass-bg-strong)] rounded-xl py-2 text-xs text-[var(--text-tertiary)] transition-colors">
            Clear canvas
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-center text-xs text-[var(--text-tertiary)]">{partnerName} is drawing...</p>
          <canvas ref={canvasRef} width={300} height={200}
            className="w-full bg-[var(--glass-bg-strong)] rounded-2xl" />
          <div className="flex gap-2">
            <input value={guess} onChange={(e) => setGuess(e.target.value)}
              placeholder="Your guess..."
              className="flex-1 bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent-dream-soft)]" />
            <button onClick={() => guess.trim() && onMove({ guess: guess.trim() })}
              className="gradient-mixed hover:bg-[var(--accent-dream)] rounded-xl px-4 py-2 text-sm transition-colors">Guess!</button>
          </div>
        </div>
      )}
    </div>
  );
}
