const EMOTION_STYLE = {
  happy:        { emoji: "😊", bg: "bg-yellow-900/40 text-yellow-300"  },
  excited:      { emoji: "🎉", bg: "bg-pink-900/40 text-pink-300"      },
  romantic:     { emoji: "❤️",  bg: "bg-red-900/40 text-red-300"       },
  sad:          { emoji: "😢", bg: "bg-blue-900/40 text-blue-300"      },
  angry:        { emoji: "😠", bg: "bg-red-900/50 text-[var(--status-error)]"        },
  frustrated:   { emoji: "😤", bg: "bg-orange-900/40 text-orange-300"  },
  anxious:      { emoji: "😰", bg: "bg-purple-900/40 text-purple-300"  },
  grateful:     { emoji: "🙏", bg: "bg-indigo-900/40 text-[var(--accent-dream-soft)]"  },
  supportive:   { emoji: "💪", bg: "bg-green-900/40 text-green-300"    },
  playful:      { emoji: "😂", bg: "bg-yellow-900/30 text-[var(--status-warning)]"  },
  affectionate: { emoji: "🥰", bg: "bg-rose-900/40 text-rose-300"      },
  apologetic:   { emoji: "😔", bg: "bg-[var(--glass-bg-strong)] text-[var(--text-secondary)]"         },
  motivational: { emoji: "🌟", bg: "bg-amber-900/40 text-amber-300"    },
  celebratory:  { emoji: "🥳", bg: "bg-pink-900/40 text-pink-300"      },
  lonely:       { emoji: "😞", bg: "bg-[var(--glass-bg-strong)] text-[var(--text-secondary)]"         },
  neutral:      { emoji: "💬", bg: "bg-[var(--glass-bg-strong)] text-[var(--text-tertiary)]"         },
};

export default function EmotionBadge({ emotion, confidence, size = "sm" }) {
  const { emoji, bg } = EMOTION_STYLE[emotion] || EMOTION_STYLE.neutral;
  if (!emotion || emotion === "neutral") return null;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${bg}`}>
      {emoji} {emotion}
      {confidence && <span className="opacity-50">{Math.round(confidence * 100)}%</span>}
    </span>
  );
}
