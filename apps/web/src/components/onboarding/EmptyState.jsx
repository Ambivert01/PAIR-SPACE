/**
 * Empty State Component
 *
 * Shows helpful UI when no data exists
 * Encourages users to take action
 */

export default function EmptyState({
  emoji = "✨",
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-md space-y-6">
        {/* Icon */}
        <div className="text-6xl mb-4 animate-bounce-slow">{emoji}</div>

        {/* Text */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h3>
          <p className="text-[var(--text-secondary)] text-sm">{description}</p>
        </div>

        {/* Actions */}
        {(actionLabel || secondaryActionLabel) && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {actionLabel && onAction && (
              <button
                onClick={onAction}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all transform hover:scale-105"
              >
                {actionLabel}
              </button>
            )}
            {secondaryActionLabel && onSecondaryAction && (
              <button
                onClick={onSecondaryAction}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-white font-medium rounded-lg border border-white/10 transition-colors"
              >
                {secondaryActionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Preset empty states for common scenarios
export function NoMemoriesEmptyState({ onCreate }) {
  return (
    <EmptyState
      emoji="📸"
      title="No memories yet"
      description="Create your first memory together and start building your timeline ❤️"
      actionLabel="Create Memory"
      onAction={onCreate}
    />
  );
}

export function NoMessagesEmptyState() {
  return (
    <EmptyState
      emoji="💬"
      title="No messages yet"
      description="Say hello to your partner and start your conversation ❤️"
    />
  );
}

export function NoPlansEmptyState({ onCreate }) {
  return (
    <EmptyState
      emoji="📅"
      title="No plans yet"
      description="Create your first plan and start organizing together"
      actionLabel="Create Plan"
      onAction={onCreate}
    />
  );
}

export function NoGamesEmptyState({ onStart }) {
  return (
    <EmptyState
      emoji="🎮"
      title="No games played yet"
      description="Start a game and have fun together!"
      actionLabel="Start Game"
      onAction={onStart}
    />
  );
}

export function NoJournalEntriesEmptyState({ onCreate }) {
  return (
    <EmptyState
      emoji="📝"
      title="No journal entries yet"
      description="Start journaling together and share your thoughts"
      actionLabel="Write Entry"
      onAction={onCreate}
    />
  );
}

export function NoGiftsEmptyState({ onCreate }) {
  return (
    <EmptyState
      emoji="🎁"
      title="No gifts yet"
      description="Send your first gift and make your partner smile ❤️"
      actionLabel="Send Gift"
      onAction={onCreate}
    />
  );
}

export function NoCapsulesEmptyState({ onCreate }) {
  return (
    <EmptyState
      emoji="⏰"
      title="No time capsules yet"
      description="Create a time capsule and send a message to the future"
      actionLabel="Create Capsule"
      onAction={onCreate}
    />
  );
}

export function NoActivitiesEmptyState({ onStart }) {
  return (
    <EmptyState
      emoji="🎬"
      title="No activities yet"
      description="Start watching, listening, or doing something together"
      actionLabel="Start Activity"
      onAction={onStart}
    />
  );
}
