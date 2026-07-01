import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../services/api.js";

export default function TimezoneBridge({ relationshipId, className = "" }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!relationshipId) return;
    let interval;

    const fetch = () =>
      api.get(`/api/timezone/bridge/${relationshipId}`)
        .then(({ data: d }) => setData(d))
        .catch(() => {})
        .finally(() => setLoading(false));

    fetch();
    // Refresh every minute so clocks stay current
    interval = setInterval(fetch, 60_000);
    return () => clearInterval(interval);
  }, [relationshipId]);

  if (loading) return <div className="skeleton h-28 rounded-2xl" />;
  if (!data) return null;

  const { me, partner, bothAwakeNow, nextOverlap, distanceKm, distanceMiles } = data;

  return (
    <div className={`card-glass ${className}`}>
      <div className="hstack-sm mb-3">
        <span>🌍</span>
        <h3 className="text-sm font-semibold">Your World</h3>
        {distanceKm && (
          <span className="ml-auto text-xs text-[var(--text-tertiary)]">
            {distanceKm.toLocaleString()} km apart
          </span>
        )}
      </div>

      {/* Two clocks */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <ClockCard person={me} label="You" />
        <ClockCard person={partner} label="Partner" />
      </div>

      {/* Status line */}
      {bothAwakeNow ? (
        <motion.div
          className="flex items-center gap-2 py-2 px-3 rounded-xl"
          style={{ background: "rgba(52, 211, 153, 0.12)", border: "1px solid rgba(52, 211, 153, 0.25)" }}
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-[var(--status-success)] text-sm">✓</span>
          <p className="text-xs text-[var(--status-success)]">
            You're both awake! Great time to connect 💬
          </p>
        </motion.div>
      ) : nextOverlap ? (
        <div className="py-2 px-3 glass rounded-xl">
          <p className="text-xs text-[var(--text-tertiary)]">
            {nextOverlap.minutesFromNow === 0
              ? "Overlap window starting now"
              : nextOverlap.minutesFromNow < 60
              ? `Both awake in ~${nextOverlap.minutesFromNow}m`
              : `Both awake in ~${Math.round(nextOverlap.minutesFromNow / 60)}h`}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function ClockCard({ person, label }) {
  const hour = person.hour ?? 12;
  const isNight = hour < 6 || hour >= 22;
  const isEvening = hour >= 18 && hour < 22;

  const bgColor = isNight
    ? "rgba(30, 10, 50, 0.7)"
    : isEvening
    ? "rgba(80, 40, 0, 0.4)"
    : "rgba(255, 200, 100, 0.1)";

  const timeEmoji = isNight ? "🌙" : isEvening ? "🌆" : hour < 12 ? "🌅" : "☀️";

  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{ background: bgColor, border: "1px solid var(--glass-border)" }}
    >
      <p className="text-[10px] text-[var(--text-tertiary)] mb-1">{label}</p>
      <p className="text-base font-semibold text-white">{person.localTime || "—"}</p>
      <p className="text-sm mt-1">{timeEmoji}</p>
      <div className="flex items-center justify-center gap-1 mt-1">
        <motion.div
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: person.isAwake ? "var(--status-success)" : "var(--text-disabled)",
          }}
          animate={person.isAwake ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <p className="text-[9px] text-[var(--text-disabled)]">
          {person.isAwake ? "awake" : "sleeping"}
        </p>
      </div>
    </div>
  );
}
