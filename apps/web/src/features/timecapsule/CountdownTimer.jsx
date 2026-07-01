import { useEffect, useState } from "react";

export default function CountdownTimer({ lockedUntil, onUnlocked }) {
  const [parts, setParts] = useState({});

  useEffect(() => {
    const calc = () => {
      const diff = new Date(lockedUntil) - Date.now();
      if (diff <= 0) { setParts({ ready: true }); onUnlocked?.(); return; }
      setParts({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [lockedUntil]);

  if (parts.ready) return (
    <div className="text-center space-y-1">
      <p className="text-2xl">🎁</p>
      <p className="text-[var(--status-success)] font-medium text-sm">Ready to open!</p>
    </div>
  );

  return (
    <div className="flex items-center justify-center gap-3">
      {[["d","days"],["h","hrs"],["m","min"],["s","sec"]].map(([k, label]) => (
        <div key={k} className="text-center">
          <p className="text-2xl font-mono font-bold text-white">{String(parts[k] || 0).padStart(2,"0")}</p>
          <p className="text-[10px] text-[var(--text-disabled)]">{label}</p>
        </div>
      ))}
    </div>
  );
}
