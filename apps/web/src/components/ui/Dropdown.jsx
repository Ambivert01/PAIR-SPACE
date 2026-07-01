/**
 * Dropdown Component
 *
 * Consistent dropdown menu
 * Features: keyboard navigation, click outside to close
 */

import { useState, useRef, useEffect } from "react";

export default function Dropdown({
  trigger,
  children,
  align = "right",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const alignmentClasses = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 transform -translate-x-1/2",
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={`absolute ${alignmentClasses[align]} mt-2 w-56 bg-[var(--glass-bg-strong)] rounded-xl shadow-xl border border-white/10 py-2 z-50 animate-scale-in ${className}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Dropdown Item
 */
export function DropdownItem({
  children,
  onClick,
  icon,
  danger = false,
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full hstack-md px-4 py-2.5 text-sm transition-colors ${
        danger
          ? "text-[var(--status-error)] hover:bg-red-500/10"
          : "text-[var(--text-secondary)] hover:bg-white/10 hover:text-white"
      } ${className}`}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {children}
    </button>
  );
}

/**
 * Dropdown Divider
 */
export function DropdownDivider() {
  return <div className="my-2 border-t border-white/10" />;
}

/**
 * Dropdown Label
 */
export function DropdownLabel({ children }) {
  return (
    <div className="px-4 py-2 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
      {children}
    </div>
  );
}
