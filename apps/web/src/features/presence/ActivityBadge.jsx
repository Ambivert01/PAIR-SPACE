const STATUS_LABEL = {
  online:          { text: "online",          emoji: "" },
  idle:            { text: "idle",            emoji: "💤" },
  away:            { text: "away",            emoji: "🚶" },
  busy:            { text: "busy",            emoji: "🔴" },
  do_not_disturb:  { text: "do not disturb", emoji: "🔕" },
  sleeping:        { text: "sleeping",        emoji: "😴" },
  working:         { text: "working",         emoji: "💼" },
  studying:        { text: "studying",        emoji: "📚" },
  commuting:       { text: "commuting",       emoji: "🚌" },
  traveling:       { text: "traveling",       emoji: "✈️" },
  in_call:         { text: "in a call",       emoji: "📞" },
  watching:        { text: "watching",        emoji: "🎬" },
  listening_music: { text: "listening",       emoji: "🎵" },
  gaming:          { text: "gaming",          emoji: "🎮" },
  offline:         { text: "offline",         emoji: "" },
};

const ACTIVITY_LABEL = {
  chatting:          "chatting",
  watching_video:    "watching a video",
  listening_song:    "listening to music",
  studying_session:  "in a study session",
  focus_mode:        "in focus mode",
  gaming:            "gaming",
  planning:          "planning",
  journal_writing:   "writing",
  memory_uploading:  "adding memories",
  call_active:       "on a call",
};

export default function ActivityBadge({ status = "offline", activity, customMessage, className = "" }) {
  const { text, emoji } = STATUS_LABEL[status] || STATUS_LABEL.offline;

  const display = customMessage
    ? customMessage
    : activity
    ? ACTIVITY_LABEL[activity] || activity
    : text;

  if (status === "offline") return <span className={`text-xs text-[var(--text-disabled)] ${className}`}>offline</span>;

  return (
    <span className={`text-xs text-[var(--text-secondary)] ${className}`}>
      {emoji && <span className="mr-1">{emoji}</span>}
      {display}
    </span>
  );
}
