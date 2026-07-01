import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { slideInRight } from "../../utils/motionConfig.js";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              toast={toast}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onClose }) {
  const typeStyles = {
    success: "border-green-500/50 bg-green-900/20",
    error: "border-red-500/50 bg-red-900/20",
    warning: "border-yellow-500/50 bg-yellow-900/20",
    info: "border-[var(--accent-dream)]/50 bg-[var(--accent-dream)]/10",
  };

  const typeIcons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <motion.div
      className={`glass-strong border rounded-xl px-4 py-3 shadow-strong min-w-[300px] max-w-[400px] pointer-events-auto ${
        typeStyles[toast.type] || typeStyles.info
      }`}
      {...slideInRight}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">
          {typeIcons[toast.type] || typeIcons.info}
        </span>
        <p className="text-sm text-[var(--text-primary)] flex-1">
          {toast.message}
        </p>
        <motion.button
          onClick={onClose}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ×
        </motion.button>
      </div>
    </motion.div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
