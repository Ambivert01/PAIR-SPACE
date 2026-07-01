import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../services/api.js";

export default function TimezoneBridge({ relationshipId, className = "" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!relationshipId) return;
    const fetch = () =>
      api.get(`/api/timezone/bridge/${relationshipId}`)
        .then(({ data: d }) => setData(d))
        .catch(() => {})
        .finally(() => setLoading(false));
    fetch();
    const interval = setInterval(fetch, 60_000);
    return () => clearInterval(interval);
  }, [relationshipId]);

  if (loading) return <div className="skeleton h-28 rounded-2xl" />;
  if (!data) return null;

  const { me, partner, bothAwakeNow, nextOverlap, distanceKm } = data;

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent)" }} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(168,85,247,0.25)", border: "1px solid rgba(168,85,247,0.4)" }}>
              <span className="text-sm">🌍</span>
            </div>
            <span className="text-sm font-semibold text-white">Your World</span>
          </div>
          {distanceKm && (
            <span className="text-[11px] text-[var(--text-tertiary)] px-2.5 py-1 rounded-lg"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              {distanceKm.toLocaleString()} km apart
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <ClockCard person={me} label="You" />
          <ClockCard person={partner} label="Partner" />
        </div>

        {bothAwakeNow ? (
          <motion.div className="flex items-center gap-2 py-2.5 px-3 rounded-xl"
            style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)" }}
            animate={{ opacity: [1, 0.75, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>
            <motion.div className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: "#34d399", boxShadow: "0 0 6px #34d399" }}
              animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <p className="text-xs font-medium" style={{ color: "#34d399" }}>
              You're both awake! Great time to connect 💬
            </p>
          </motion.div>
        ) : nextOverlap ? (
          <div className="py-2.5 px-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs text-[var(--text-tertiary)]">
              {nextOverlap.minutesFromNow === 0 ? "Overlap window starting now" :
               nextOverlap.minutesFromNow < 60 ? `Both awake in ~${nextOverlap.minutesFromNow}m` :
               `Both awake in ~${Math.round(nextOverlap.minutesFromNow / 60)}h`}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ClockCard({ person, label }) {
  const hour = person.hour ?? 12;
  const isNight = hour < 6 || hour >= 22;
  const isEvening = hour >= 18 && hour < 22;
  const isMorning = hour >= 6 && hour < 12;
  const timeEmoji = isNight ? "🌙" : isEvening ? "🌆" : isMorning ? "🌅" : "☀️";

  const cardBg = isNight
    ? "linear-gradient(135deg, rgba(80,30,140,0.55), rgba(40,15,80,0.7))"
    : isEvening
    ? "linear-gradient(135deg, rgba(160,80,20,0.45), rgba(100,50,10,0.6))"
    : "linear-gradient(135deg, rgba(255,180,40,0.18), rgba(255,140,20,0.10))";

  const cardBorder = isNight ? "rgba(140,80,220,0.45)" : isEvening ? "rgba(220,140,40,0.45)" : "rgba(255,200,60,0.45)";

  return (
    <div className="rounded-xl p-3 text-center"
      style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
        style={{ color: "rgba(255,255,255,0.55)" }}>{label}</p>
      <p className="text-base font-bold text-white">{person.localTime || "—"}</p>
      <p className="text-xl mt-1">{timeEmoji}</p>
      <div className="flex items-center justify-center gap-1.5 mt-1.5">
        <motion.div className="w-1.5 h-1.5 rounded-full"
          style={{ background: person.isAwake ? "#34d399" : "rgba(255,255,255,0.2)", boxShadow: person.isAwake ? "0 0 5px #34d399" : "none" }}
          animate={person.isAwake ? { scale: [1, 1.5, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }} />
        <p className="text-[9px] font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
          {person.isAwake ? "awake" : "sleeping"}
        </p>
      </div>
    </div>
  );
}
