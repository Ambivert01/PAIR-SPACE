import { motion } from "framer-motion";
import { scaleIn } from "../../utils/motionConfig.js";

export default function ErrorState({
  title = "Something went wrong 😕",
  message = "We're having trouble loading this content",
  onRetry,
  retryLabel = "Try again",
}) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      {...scaleIn}
    >
      <motion.span
        className="text-6xl mb-4"
        animate={{
          rotate: [0, -10, 10, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        😕
      </motion.span>
      <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm">
        {message}
      </p>
      {onRetry && (
        <motion.button
          onClick={onRetry}
          className="glass border border-[var(--glass-border)] px-6 py-3 rounded-xl text-sm font-medium hover:border-[var(--accent-dream)] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {retryLabel}
        </motion.button>
      )}
    </motion.div>
  );
}
