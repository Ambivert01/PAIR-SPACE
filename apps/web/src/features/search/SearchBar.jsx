import { useEffect, useRef, useState } from "react";

export default function SearchBar({ onSearch, onFilterToggle, showFilter }) {
  const [value, setValue] = useState("");
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    if (value.trim().length >= 2) {
      timer.current = setTimeout(() => onSearch(value.trim()), 300);
    } else if (value === "") {
      onSearch("");
    }
    return () => clearTimeout(timer.current);
  }, [value]);

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--glass-border)] bg-[var(--bg-primary)] sticky top-0 z-10">
      <div className="flex-1 flex items-center gap-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-3 py-2 focus-within:border-[var(--accent-dream-soft)] transition-colors">
        <span className="text-[var(--text-tertiary)] text-sm">🔍</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search messages, memories, plans... or #tag"
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
          autoFocus
        />
        {value && (
          <button onClick={() => setValue("")} className="text-[var(--text-disabled)] hover:text-[var(--text-secondary)] text-lg leading-none">×</button>
        )}
      </div>
      <button
        onClick={onFilterToggle}
        className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-colors ${
          showFilter ? "border-[var(--accent-dream-soft)] bg-indigo-900/30 text-[var(--accent-dream-soft)]" : "border-[var(--glass-border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
        }`}
      >
        ⚙️
      </button>
    </div>
  );
}
