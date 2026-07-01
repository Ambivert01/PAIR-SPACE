import { motion } from "framer-motion";
import { scaleIn } from "../../utils/motionConfig.js";

export default function EmptyState({
  icon = "📭",
  title = "Nothing here yet",
  message = "Get started by creating something new",
  action,
  actionLabel = "Get started",
}) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      {...scaleIn}
    >
      <motion.span
        className="text-6xl mb-4"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {icon}
      </motion.span>
      <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm">
        {message}
      </p>
      {action && (
        <motion.button
          onClick={action}
          className="gradient-mixed px-6 py-3 rounded-xl text-sm font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}
