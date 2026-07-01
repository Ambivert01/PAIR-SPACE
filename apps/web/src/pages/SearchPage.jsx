import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { globalSearch } from "../features/search/searchService.js";
import SearchBar from "../features/search/SearchBar.jsx";
import SearchFilterPanel from "../features/search/SearchFilterPanel.jsx";
import SearchResultSection from "../features/search/SearchResultSection.jsx";
import MemoryDetailModal from "../features/memory/MemoryDetailModal.jsx";
import { useCurrentUserId } from "../hooks/useCurrentUserId.js";

const SECTIONS = ["messages","memories","plans","activities","files","games"];

export default function SearchPage() {
  const navigate = useNavigate();
  const currentUserId = useCurrentUserId();

  const [query, setQuery]           = useState("");
  const [results, setResults]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters]       = useState({ type: "", dateFrom: "", dateTo: "" });
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [total, setTotal]           = useState(0);

  const handleSearch = async (q) => {
    setQuery(q);
    if (!q) { setResults(null); setTotal(0); return; }
    setLoading(true);
    try {
      const params = { q, limit: 20 };
      if (filters.type)     params.type     = filters.type;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo)   params.dateTo   = filters.dateTo;
      const data = await globalSearch(params);
      setResults(data.results);
      setTotal(data.total);
    } catch { setResults(null); }
    finally { setLoading(false); }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    if (query) handleSearch(query);
  };

  const hasResults = results && total > 0;
  const noResults  = results && total === 0;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white flex flex-col">
      {/* back + title */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button onClick={() => navigate("/relationship")} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">←</button>
        <h1 className="text-base font-semibold">Search</h1>
      </div>

      <SearchBar onSearch={handleSearch} onFilterToggle={() => setShowFilter((v) => !v)} showFilter={showFilter} />

      {showFilter && <SearchFilterPanel filters={filters} onChange={handleFilterChange} />}

      {/* body */}
      <div className="flex-1 overflow-y-auto">
        {/* idle state */}
        {!query && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <span className="text-5xl">🔍</span>
            <p className="text-[var(--text-tertiary)] text-sm">Search across all your shared content</p>
            <div className="flex flex-wrap gap-2 justify-center px-8">
              {["#birthday","trip","exam","call","movie"].map((hint) => (
                <button key={hint} onClick={() => handleSearch(hint)}
                  className="text-xs glass border border-[var(--glass-border)] rounded-full px-3 py-1.5 text-[var(--text-secondary)] hover:border-[var(--glass-border-strong)] transition-colors">
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[var(--accent-dream-soft)] border-t-transparent rounded-full animate-spin border-[var(--accent-dream)] border-t-transparent" />
          </div>
        )}

        {/* no results */}
        {!loading && noResults && (
          <div className="flex flex-col items-center justify-center py-16 space-y-2">
            <span className="text-4xl">🤷</span>
            <p className="text-[var(--text-tertiary)] text-sm">No results for "{query}"</p>
            <p className="text-gray-700 text-xs">Try different keywords or use #tag to search tags</p>
          </div>
        )}

        {/* results */}
        {!loading && hasResults && (
          <div>
            <p className="text-xs text-[var(--text-disabled)] px-4 py-2">{total} result{total !== 1 ? "s" : ""} for "{query}"</p>
            <div className="divide-y divide-gray-800/30">
              {SECTIONS.map((section) =>
                results[section]?.length > 0 ? (
                  <SearchResultSection
                    key={section}
                    type={section}
                    items={results[section]}
                    query={query}
                    onMemoryOpen={setSelectedMemory}
                  />
                ) : null
              )}
            </div>
          </div>
        )}
      </div>

      {/* memory detail modal */}
      {selectedMemory && (
        <MemoryDetailModal
          memory={selectedMemory}
          currentUserId={currentUserId}
          onClose={() => setSelectedMemory(null)}
          onUpdated={() => {}}
          onDeleted={() => setSelectedMemory(null)}
        />
      )}
    </div>
  );
}
