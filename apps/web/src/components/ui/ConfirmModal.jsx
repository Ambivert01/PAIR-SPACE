import { AnimatePresence, motion } from "framer-motion";

/**
 * ConfirmModal — replaces native confirm() with a themed, animated dialog.
 *
 * Usage:
 *   const [confirmState, setConfirmState] = useState(null);
 *   setConfirmState({
 *     title: "End relationship?",
 *     description: "Your memories and messages will be kept safely.",
 *     confirmText: "End relationship",
 *     danger: true,
 *     onConfirm: () => { ...; setConfirmState(null); },
 *   });
 *   <ConfirmModal {...confirmState} isOpen={!!confirmState} onCancel={() => setConfirmState(null)} />
 */
export default function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  icon,
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1300] flex items-center justify-center p-4"
          style={{ background: "rgba(8, 2, 14, 0.6)", backdropFilter: "blur(6px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onCancel?.()}
        >
          <motion.div
            className="card-glass glass-strong w-full max-w-sm text-center"
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            {icon && <div className="text-4xl mb-3">{icon}</div>}
            <h3 className="text-h3 mb-2">{title}</h3>
            {description && (
              <p className="text-caption mb-6">{description}</p>
            )}

            <div className="stack-sm">
              <motion.button
                onClick={onConfirm}
                className={`w-full btn-base ${danger ? "btn-danger" : "btn-primary"}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {confirmText}
              </motion.button>
              <motion.button
                onClick={onCancel}
                className="w-full btn-ghost btn-base"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
              >
                {cancelText}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
