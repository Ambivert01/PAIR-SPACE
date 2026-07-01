import { useState } from "react";
import { motion } from "framer-motion";
import { globalSearch } from "../features/search/searchService.js";
import SearchBar from "../features/search/SearchBar.jsx";
import SearchFilterPanel from "../features/search/SearchFilterPanel.jsx";
import SearchResultSection from "../features/search/SearchResultSection.jsx";
import MemoryDetailModal from "../features/memory/MemoryDetailModal.jsx";
import { useCurrentUserId } from "../hooks/useCurrentUserId.js";
import PageLayout, { PageSpinner } from "../components/PageLayout.jsx";

const SECTIONS = ["messages","memories","plans","activities","files","games"];
const HINTS = ["#birthday","trip","exam","call","movie"];

export default function SearchPage() {
  const currentUserId = useCurrentUserId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({ type: "", dateFrom: "", dateTo: "" });
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [total, setTotal] = useState(0);

  const handleSearch = async (q) => {
    setQuery(q);
    if (!q) { setResults(null); setTotal(0); return; }
    setLoading(true);
    try {
      const params = { q, limit: 20 };
      if (filters.type) params.type = filters.type;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      const data = await globalSearch(params);
      setResults(data.results); setTotal(data.total);
    } catch { setResults(null); }
    finally { setLoading(false); }
  };

  const handleFilterChange = (f) => { setFilters(f); if (query) handleSearch(query); };
  const hasResults = results && total > 0;
  const noResults = results && total === 0;

  return (
    <PageLayout title="Search" subtitle="Find anything in your space" icon="🔍" accent="dream" noPad>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Search bar */}
        <div className="px-4 py-3 border-b border-[var(--glass-border)] bg-[var(--bg-primary)]/80 backdrop-blur-sm">
          <SearchBar onSearch={handleSearch} onFilterToggle={() => setShowFilter(v => !v)} showFilter={showFilter} />
          {showFilter && <div className="mt-3"><SearchFilterPanel filters={filters} onChange={handleFilterChange} /></div>}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {!query && (
            <div className="flex flex-col items-center justify-center py-16 gap-5 px-6">
              <motion.span className="text-6xl" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>🔍</motion.span>
              <div className="text-center">
                <p className="text-[var(--text-secondary)] font-medium">Search your shared world</p>
                <p className="text-[var(--text-tertiary)] text-sm mt-1">Messages, memories, plans, games & more</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {HINTS.map(hint => (
                  <motion.button key={hint} onClick={() => handleSearch(hint)}
                    className="text-xs glass border border-[var(--glass-border)] rounded-full px-4 py-2 text-[var(--text-secondary)] hover:border-[var(--accent-dream-soft)] hover:text-white transition-all font-medium"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {hint}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {loading && <PageSpinner label="Searching..." />}

          {!loading && noResults && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="text-5xl">🤷</span>
              <p className="text-[var(--text-secondary)] font-medium">No results for "{query}"</p>
              <p className="text-[var(--text-tertiary)] text-sm">Try different keywords or use #tag to search tags</p>
            </div>
          )}

          {!loading && hasResults && (
            <div>
              <p className="text-xs text-[var(--text-disabled)] px-4 py-3 border-b border-[var(--glass-border)]">
                <span className="text-[var(--text-secondary)] font-semibold">{total}</span> result{total !== 1 ? "s" : ""} for "{query}"
              </p>
              <div className="divide-y divide-[var(--glass-border)]">
                {SECTIONS.map(section => results[section]?.length > 0 ? (
                  <SearchResultSection key={section} type={section} items={results[section]} query={query} onMemoryOpen={setSelectedMemory} />
                ) : null)}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedMemory && (
        <MemoryDetailModal memory={selectedMemory} currentUserId={currentUserId} onClose={() => setSelectedMemory(null)} onUpdated={() => {}} onDeleted={() => setSelectedMemory(null)} />
      )}
    </PageLayout>
  );
}
