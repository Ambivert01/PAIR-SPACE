/**
 * First Action Cards - Phase 9 of Onboarding
 *
 * Suggests first actions to help users get started
 */

export default function FirstActionCards({ onAction, onDismiss }) {
  const actions = [
    {
      id: "first_message",
      emoji: "💬",
      title: "Send first message",
      description: "Say hello to your partner",
      color: "from-pink-500 to-rose-600",
    },
    {
      id: "create_memory",
      emoji: "📸",
      title: "Create first memory",
      description: "Share a special moment",
      color: "from-purple-500 to-indigo-600",
    },
    {
      id: "start_call",
      emoji: "📞",
      title: "Start a call",
      description: "See and hear each other",
      color: "from-blue-500 to-cyan-600",
    },
    {
      id: "play_game",
      emoji: "🎮",
      title: "Play a game",
      description: "Have fun together",
      color: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)] rounded-2xl p-6 max-w-2xl w-full border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Your space is ready!
          </h2>
          <p className="text-purple-200">What would you like to do first?</p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className="group relative overflow-hidden rounded-xl p-6 text-left transition-all hover:scale-105"
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-80 group-hover:opacity-100 transition-opacity`}
              ></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="text-4xl mb-3">{action.emoji}</div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-white/80">{action.description}</p>
              </div>

              {/* Hover Arrow */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="w-full text-[var(--text-secondary)] hover:text-white text-sm transition-colors"
        >
          I'll explore on my own
        </button>
      </div>
    </div>
  );
}
