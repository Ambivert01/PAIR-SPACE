/**
 * TimelinePageUltra Component
 *
 * Premium memory timeline with emotional scrapbook design
 */

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRelationship } from "../context/RelationshipProvider.jsx";
import { useCurrentUserId } from "../hooks/useCurrentUserId.js";
import {
  getTimeline,
  togglePin,
  toggleFavorite,
  reactToMemory,
  searchMemories,
} from "../features/memory/memoryService.js";
import {
  fadeIn,
  fadeUp,
  staggerContainer,
  staggerItem,
} from "../utils/motionPresets.js";
import MemoryCardUltra from "../features/memory/MemoryCardUltra.jsx";
import MemoryCreateModalUltra from "../features/memory/MemoryCreateModalUltra.jsx";
import MemoryDetailModalUltra from "../features/memory/MemoryDetailModalUltra.jsx";
import MemoryFilterBarUltra from "../features/memory/MemoryFilterBarUltra.jsx";

export default function TimelinePageUltra() {
  const navigate = useNavigate();
  const currentUserId = useCurrentUserId();

  const { rel, loading: relLoading } = useRelationship();
  const [memories, setMemories] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [filters, setFilters] = useState({ emotion: "", type: "", pinned: "" });
  const [searchQ, setSearchQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [viewMode, setViewMode] = useState("timeline"); // timeline or grid
  const bottomRef = useRef(null);

  // Load relationship

  // Load timeline when rel or filters change
  useEffect(() => {
    if (!rel) return;
    setLoading(true);
    setMemories([]);
    setNextCursor(null);
    const params = { limit: 20 };
    if (filters.emotion) params.emotion = filters.emotion;
    if (filters.type) params.type = filters.type;
    if (filters.pinned) params.pinned = filters.pinned;

    getTimeline(rel.id, params)
      .then(({ memories: m, nextCursor: nc }) => {
        setMemories(m);
        setNextCursor(nc);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [rel, filters]);

  // Infinite scroll
  useEffect(() => {
    if (!bottomRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && nextCursor && !loadingMore) loadMore();
      },
      { threshold: 0.1 },
    );
    obs.observe(bottomRef.current);
    return () => obs.disconnect();
  }, [nextCursor, loadingMore]);

  const loadMore = async () => {
    if (!rel || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const params = { limit: 20, cursor: nextCursor };
      if (filters.emotion) params.emotion = filters.emotion;
      if (filters.type) params.type = filters.type;
      const { memories: m, nextCursor: nc } = await getTimeline(rel.id, params);
      setMemories((prev) => [...prev, ...m]);
      setNextCursor(nc);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQ.trim() || !rel) return;
    setSearching(true);
    try {
      const { memories: m } = await searchMemories(rel.id, searchQ.trim());
      setMemories(m);
      setNextCursor(null);
    } finally {
      setSearching(false);
    }
  };

  const updateMemory = (updated) =>
    setMemories((prev) =>
      prev.map((m) => (m._id === updated._id ? updated : m)),
    );

  const removeMemory = (id) =>
    setMemories((prev) => prev.filter((m) => m._id !== id));

  const handlePin = async (id) => {
    const { pinned } = await togglePin(id);
    setMemories((prev) =>
      prev.map((m) => (m._id === id ? { ...m, pinned } : m)),
    );
  };

  const handleFav = async (id) => {
    await toggleFavorite(id);
    setMemories((prev) =>
      prev.map((m) => {
        if (m._id !== id) return m;
        const already = m.favoritedBy?.some(
          (u) => u?.toString() === currentUserId,
        );
        return {
          ...m,
          favoritedBy: already
            ? m.favoritedBy.filter((u) => u?.toString() !== currentUserId)
            : [...(m.favoritedBy || []), currentUserId],
        };
      }),
    );
  };

  const handleReact = async (id, emoji) => {
    const { reactions } = await reactToMemory(id, emoji);
    setMemories((prev) =>
      prev.map((m) => (m._id === id ? { ...m, reactions } : m)),
    );
  };

  // Group memories by month
  const groupedMemories = groupByMonth(memories);

  // Pinned memories
  const pinnedMemories = memories.filter((m) => m.pinned);

  // Loading state
  if (!rel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-8 h-8 border-2 border-[var(--accent-dream)] border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-[var(--text-secondary)] text-sm">
            Loading memories...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white flex flex-col relative overflow-hidden">
      {/* Header */}
      <motion.div
        className="glass-strong flex items-center gap-3 px-4 py-4 border-b border-[var(--glass-border)] sticky top-0 z-30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.button
          onClick={() => navigate("/relationship")}
          className="text-[var(--text-secondary)] hover:text-white transition-colors"
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          ←
        </motion.button>
        <div className="flex-1">
          <h1 className="text-base font-semibold">Our Story</h1>
          <p className="text-xs text-[var(--text-tertiary)]">
            {memories.length} {memories.length === 1 ? "memory" : "memories"}
          </p>
        </div>

        {/* View mode toggle */}
        <div className="hstack-sm glass rounded-lg p-1">
          <motion.button
            onClick={() => setViewMode("timeline")}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              viewMode === "timeline"
                ? "bg-[var(--accent-dream)] text-white"
                : "text-[var(--text-secondary)]"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            📖
          </motion.button>
          <motion.button
            onClick={() => setViewMode("grid")}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              viewMode === "grid"
                ? "bg-[var(--accent-dream)] text-white"
                : "text-[var(--text-secondary)]"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            ⊞
          </motion.button>
        </div>

        <motion.button
          onClick={() => setShowCreate(true)}
          className="btn-primary btn-base"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          + Memory
        </motion.button>
      </motion.div>

      {/* Search */}
      <motion.form
        onSubmit={handleSearch}
        className="px-4 py-3 glass border-b border-[var(--glass-border)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex gap-2">
          <input
            value={searchQ}
            onChange={(e) => {
              setSearchQ(e.target.value);
              if (!e.target.value) {
                setFilters({ emotion: "", type: "", pinned: "" });
              }
            }}
            placeholder="Search memories..."
            className="flex-1 glass rounded-xl px-4 py-2 text-sm text-white placeholder-[var(--text-tertiary)] outline-none focus-ring transition-all"
          />
          <motion.button
            type="submit"
            disabled={searching}
            className="glass-strong rounded-xl px-4 py-2 text-sm transition-colors disabled"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {searching ? "..." : "🔍"}
          </motion.button>
        </div>
      </motion.form>

      {/* Filters */}
      <MemoryFilterBarUltra filters={filters} onChange={setFilters} />

      {/* Content */}
      <div className="flex-1 relative z-10">
        {loading ? (
          <div className="flex justify-center py-12">
            <motion.div
              className="w-8 h-8 border-2 border-[var(--accent-dream)] border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : memories.length === 0 ? (
          <EmptyState onAddMemory={() => setShowCreate(true)} />
        ) : viewMode === "grid" ? (
          <GridView
            memories={memories}
            currentUserId={currentUserId}
            onSelect={setSelectedMemory}
            onPin={handlePin}
            onFavorite={handleFav}
            onReact={handleReact}
          />
        ) : (
          <TimelineView
            groupedMemories={groupedMemories}
            pinnedMemories={pinnedMemories}
            currentUserId={currentUserId}
            onSelect={setSelectedMemory}
            onPin={handlePin}
            onFavorite={handleFav}
            onReact={handleReact}
          />
        )}

        {/* Infinite scroll sentinel */}
        <div ref={bottomRef} className="h-4" />
        {loadingMore && (
          <div className="flex justify-center py-4">
            <motion.div
              className="w-5 h-5 border-2 border-[var(--accent-dream)] border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        )}
      </div>

      {/* Floating add button */}
      <motion.button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-mixed shadow-strong flex items-center justify-center text-2xl z-40"
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        +
      </motion.button>

      {/* Modals */}
      {showCreate && rel && (
        <MemoryCreateModalUltra
          relationshipId={rel.id}
          onCreated={(m) => setMemories((prev) => [m, ...prev])}
          onClose={() => setShowCreate(false)}
        />
      )}

      {selectedMemory && (
        <MemoryDetailModalUltra
          memory={selectedMemory}
          currentUserId={currentUserId}
          onClose={() => setSelectedMemory(null)}
          onUpdated={updateMemory}
          onDeleted={removeMemory}
        />
      )}
    </div>
  );
}

// Timeline view with vertical line
function TimelineView({
  groupedMemories,
  pinnedMemories,
  currentUserId,
  onSelect,
  onPin,
  onFavorite,
  onReact,
}) {
  return (
    <div className="px-4 py-6 relative">
      {/* Pinned section */}
      {pinnedMemories.length > 0 && (
        <motion.div className="mb-12" {...fadeUp}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📌</span>
            <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
              Featured Moments
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pinnedMemories.map((m) => (
              <MemoryCardUltra
                key={m._id}
                memory={m}
                currentUserId={currentUserId}
                onClick={onSelect}
                onPin={onPin}
                onFavorite={onFavorite}
                onReact={onReact}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white/10 -translate-x-1/2 hidden md:block" />

        {/* Grouped memories */}
        {groupedMemories.map((group, groupIdx) => (
          <div key={group.month} className="mb-8">
            {/* Date separator */}
            <DateSeparator date={group.month} />

            {/* Memories */}
            <div className="space-y-8 mt-6">
              {group.memories.map((memory, idx) => {
                const isLeft = idx % 2 === 0;
                return (
                  <motion.div
                    key={memory._id}
                    className={`relative ${
                      isLeft ? "md:pr-[52%]" : "md:pl-[52%]"
                    }`}
                    initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-1/2 top-8 w-3 h-3 rounded-full bg-[var(--accent-dream)] -translate-x-1/2 z-10 hidden md:block shadow-glow-dream" />

                    <MemoryCardUltra
                      memory={memory}
                      currentUserId={currentUserId}
                      onClick={onSelect}
                      onPin={onPin}
                      onFavorite={onFavorite}
                      onReact={onReact}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Grid view (masonry-style)
function GridView({
  memories,
  currentUserId,
  onSelect,
  onPin,
  onFavorite,
  onReact,
}) {
  return (
    <div className="px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {memories.map((memory, idx) => (
          <motion.div
            key={memory._id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <MemoryCardUltra
              memory={memory}
              currentUserId={currentUserId}
              onClick={onSelect}
              onPin={onPin}
              onFavorite={onFavorite}
              onReact={onReact}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Date separator
function DateSeparator({ date }) {
  return (
    <motion.div
      className="sticky top-20 z-20 flex justify-center"
      initial={{ opacity: 0, y: -10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="glass-strong px-6 py-2 rounded-full shadow-soft">
        <span className="text-sm text-[var(--text-secondary)] font-medium">
          {date}
        </span>
      </div>
    </motion.div>
  );
}

// Empty state
function EmptyState({ onAddMemory }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 px-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-7xl mb-4"
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
        📖
      </motion.div>
      <motion.p
        className="text-[var(--text-secondary)] text-base mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        No memories yet ❤️
      </motion.p>
      <motion.p
        className="text-[var(--text-tertiary)] text-sm mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Start capturing your story
      </motion.p>
      <motion.button
        onClick={onAddMemory}
        className="btn-primary btn-base"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Add first memory
      </motion.button>
    </motion.div>
  );
}

// Helper: Group memories by month
function groupByMonth(memories) {
  const groups = [];
  let currentGroup = null;

  memories.forEach((memory) => {
    const date = new Date(memory.memoryDate);
    const month = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    if (!currentGroup || currentGroup.month !== month) {
      currentGroup = { month, memories: [] };
      groups.push(currentGroup);
    }

    currentGroup.memories.push(memory);
  });

  return groups;
}
