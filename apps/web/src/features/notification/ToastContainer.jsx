import { AnimatePresence, motion } from "framer-motion";

const TYPE_ICON = {
  message_received: "💬", missed_call: "📵", incoming_call: "📞",
  memory_created: "📸", activity_invite: "🎬", planner_reminder: "📅",
  habit_reminder: "🔥", system_alert: "⚡",
  success: "✓", error: "✕", warning: "⚠️", info: "ℹ️",
};

const TONE_CLASS = {
  success: "toast-success",
  error: "toast-error",
  warning: "toast-warning",
  info: "toast-info",
};

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-stack pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.toastId}
            layout
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className={`toast pointer-events-auto ${TONE_CLASS[t.priority] || TONE_CLASS[t.tone] || ""}`}
          >
            <span className="text-lg flex-shrink-0 mt-0.5">{TYPE_ICON[t.type] || "🔔"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{t.title}</p>
              {t.message && (
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5 line-clamp-2">{t.message}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(t.toastId)}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-lg leading-none flex-shrink-0 transition-colors"
              aria-label="Dismiss"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
