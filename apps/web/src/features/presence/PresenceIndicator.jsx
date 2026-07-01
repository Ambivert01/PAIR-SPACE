const DOT = {
  online:           "bg-green-400",
  idle:             "bg-yellow-400",
  away:             "bg-yellow-500",
  busy:             "bg-red-400",
  do_not_disturb:   "bg-red-500",
  sleeping:         "bg-blue-400",
  working:          "bg-orange-400",
  studying:         "bg-purple-400",
  commuting:        "bg-cyan-400",
  traveling:        "bg-teal-400",
  in_call:          "bg-green-500",
  watching:         "bg-pink-400",
  listening_music:  "bg-indigo-400",
  gaming:           "bg-violet-400",
  offline:          "bg-gray-600",
};

const PULSE = new Set(["online", "in_call"]);

export default function PresenceIndicator({ status = "offline", size = "sm" }) {
  const color = DOT[status] || DOT.offline;
  const dim = size === "lg" ? "w-3.5 h-3.5" : "w-2.5 h-2.5";

  return (
    <span className={`relative inline-flex ${dim}`}>
      {PULSE.has(status) && (
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-50`} />
      )}
      <span className={`relative inline-flex rounded-full ${dim} ${color}`} />
    </span>
  );
}
