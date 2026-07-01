import { useEffect, useState } from "react";

export default function CountdownRevealTimer({ scheduledRevealTime }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calc = () => {
      const diff = new Date(scheduledRevealTime) - Date.now();
      if (diff <= 0) { setTimeLeft("Ready!"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (d > 0) setTimeLeft(`${d}d ${h}h ${m}m`);
      else if (h > 0) setTimeLeft(`${h}h ${m}m ${s}s`);
      else setTimeLeft(`${m}m ${s}s`);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [scheduledRevealTime]);

  return (
    <div className="text-center space-y-2 py-4">
      <p className="text-4xl">⏳</p>
      <p className="text-white font-mono text-2xl font-bold">{timeLeft}</p>
      <p className="text-xs text-[var(--text-tertiary)]">until your surprise is revealed</p>
    </div>
  );
}
