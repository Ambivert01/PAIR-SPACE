/**
 * PageLayout — shared shell for all inner app pages.
 * Provides: ambient orbs, glass header, icon back button, gradient title.
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function PageLayout({
  title,
  subtitle,
  icon,
  backTo = "/relationship",
  headerRight,
  children,
  noPad = false,
  accent = "dream", // "dream" | "love" | "glow"
}) {
  const navigate = useNavigate();

  const orbColors = {
    dream: ["floating-orb-dream", "floating-orb-love"],
    love:  ["floating-orb-love",  "floating-orb-dream"],
    glow:  ["floating-orb-glow",  "floating-orb-dream"],
  };
  const [orb1, orb2] = orbColors[accent] || orbColors.dream;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white flex flex-col relative overflow-hidden">
      {/* Ambient orbs */}
      <div className={`floating-orb ${orb1} w-72 h-72 -top-16 -left-16 opacity-30`} />
      <div className={`floating-orb ${orb2} w-64 h-64 bottom-0 -right-16 opacity-20`} style={{ animationDelay: "4s" }} />

      {/* Header */}
      <motion.header
        className="glass-strong sticky top-0 z-30 border-b border-[var(--glass-border)]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-3 px-4 py-3.5">
          <motion.button
            onClick={() => navigate(backTo)}
            className="w-9 h-9 glass rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:border-[var(--glass-border-strong)] transition-all flex-shrink-0"
            whileHover={{ scale: 1.08, x: -2 }}
            whileTap={{ scale: 0.93 }}
            aria-label="Go back"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>

          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {icon && <span className="text-xl flex-shrink-0">{icon}</span>}
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-white truncate leading-tight">{title}</h1>
              {subtitle && <p className="text-[11px] text-[var(--text-tertiary)] truncate leading-tight mt-0.5">{subtitle}</p>}
            </div>
          </div>

          {headerRight && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {headerRight}
            </div>
          )}
        </div>
      </motion.header>

      {/* Page content */}
      <div className={`flex-1 relative z-10 ${noPad ? "" : ""}`}>
        {children}
      </div>
    </div>
  );
}

/** Reusable section label */
export function SectionLabel({ children, className = "" }) {
  return (
    <p className={`text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest ${className}`}>
      {children}
    </p>
  );
}

/** Reusable primary action button for headers */
export function HeaderButton({ onClick, children, variant = "primary", disabled = false }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={variant === "primary" ? "btn-primary btn-base text-xs px-4 py-2" : "btn-secondary btn-base text-xs px-4 py-2"}
      whileHover={{ scale: disabled ? 1 : 1.04 }}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
    >
      {children}
    </motion.button>
  );
}

/** Spinner for loading states */
export function PageSpinner({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <motion.div
        className="w-8 h-8 border-2 border-[var(--accent-dream)] border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p className="text-[var(--text-tertiary)] text-sm">{label}</p>
    </div>
  );
}

/** Empty state */
export function PageEmpty({ icon, title, desc, action, onAction }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 px-6 gap-4 text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.span
        className="text-6xl"
        animate={{ scale: [1, 1.08, 1], rotate: [0, 4, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {icon}
      </motion.span>
      <div>
        <p className="text-[var(--text-primary)] font-semibold text-base">{title}</p>
        {desc && <p className="text-[var(--text-tertiary)] text-sm mt-1 max-w-xs">{desc}</p>}
      </div>
      {action && onAction && (
        <motion.button
          onClick={onAction}
          className="btn-primary btn-base mt-1"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          {action}
        </motion.button>
      )}
    </motion.div>
  );
}
