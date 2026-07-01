import { useState } from "react";
import { EMOTION_META, MEMORY_TYPE_META } from "@shared/constants/memoryTypes.js";
import { togglePin, toggleFavorite, reactToMemory, addComment, deleteMemory } from "./memoryService.js";
import MediaViewer from "../media/MediaViewer.jsx";

import { MEDIA_BASE } from "@shared/constants/urls.js";
const BASE = MEDIA_BASE;
const QUICK_REACTIONS = ["❤️", "😍", "🥺", "😂", "🔥", "🙏"];

export default function MemoryDetailModal({ memory: initial, currentUserId, onClose, onUpdated, onDeleted }) {
  const [memory, setMemory] = useState(initial);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [viewerMedia, setViewerMedia] = useState(null);

  const { emoji: typeEmoji, label: typeLabel } = MEMORY_TYPE_META[memory.type] || { emoji: "💫", label: "Memory" };
  const { emoji: emotionEmoji, color } = EMOTION_META[memory.emotionTag] || EMOTION_META.custom;
  const isFav = memory.favoritedBy?.some((id) => id?.toString() === currentUserId || id === currentUserId);
  const myReaction = memory.reactions?.find((r) => r.userId?.toString() === currentUserId || r.userId === currentUserId);
  const isCreator = memory.creatorId?._id?.toString() === currentUserId || memory.creatorId?.toString() === currentUserId;

  const refresh = (patch) => { const updated = { ...memory, ...patch }; setMemory(updated); onUpdated?.(updated); };

  const handlePin = async () => {
    const { pinned } = await togglePin(memory._id);
    refresh({ pinned });
  };

  const handleFav = async () => {
    await toggleFavorite(memory._id);
    const already = memory.favoritedBy?.some((id) => id?.toString() === currentUserId);
    refresh({
      favoritedBy: already
        ? memory.favoritedBy.filter((id) => id?.toString() !== currentUserId)
        : [...(memory.favoritedBy || []), currentUserId],
    });
  };

  const handleReact = async (emoji) => {
    const { reactions } = await reactToMemory(memory._id, myReaction?.emoji === emoji ? null : emoji);
    refresh({ reactions });
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const { comments } = await addComment(memory._id, commentText.trim());
      refresh({ comments });
      setCommentText("");
    } finally { setSubmitting(false); }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => setShowDeleteConfirm(true);

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    await deleteMemory(memory._id);
    onDeleted(memory._id);
    onClose();
  };

  const date = new Date(memory.memoryDate).toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <>
      {viewerMedia && <MediaViewer media={viewerMedia} onClose={() => setViewerMedia(null)} />}

      <div className="fixed inset-0 bg-black/85 flex items-end sm:items-center justify-center z-40 p-4" onClick={onClose}>
        <div
          className="bg-[var(--glass-bg)] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--glass-border)] sticky top-0 bg-[var(--glass-bg)] z-10">
            <div className="flex items-center gap-2">
              <span className="text-lg">{typeEmoji}</span>
              <span className="text-sm text-[var(--text-secondary)]">{typeLabel}</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handlePin} className={`text-sm ${memory.pinned ? "text-[var(--status-warning)]" : "text-[var(--text-disabled)] hover:text-[var(--text-secondary)]"}`}>📌</button>
              <button onClick={handleFav} className={`text-sm ${isFav ? "text-[var(--status-error)]" : "text-[var(--text-disabled)] hover:text-[var(--text-secondary)]"}`}>{isFav ? "❤️" : "🤍"}</button>
              {isCreator && <button onClick={handleDelete} className="text-gray-700 hover:text-[var(--status-error)] text-sm transition-colors">🗑</button>}
              <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-white text-xl">×</button>
            </div>
          </div>

          {/* media gallery */}
          {memory.mediaIds?.length > 0 && (
            <div className={`grid gap-1 ${memory.mediaIds.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {memory.mediaIds.map((m) => {
                const url = `${BASE}${m.thumbnailUrl || m.url}`;
                return (
                  <div key={m._id} className="relative cursor-pointer" onClick={() => setViewerMedia({ ...m, url: `${BASE}${m.url}` })}>
                    {m.type === "video" ? (
                      <div className="relative h-48 bg-[var(--glass-bg-strong)] flex items-center justify-center">
                        {m.thumbnailUrl
                          ? <img src={`${BASE}${m.thumbnailUrl}`} className="w-full h-full object-cover" alt="" />
                          : <span className="text-4xl">🎬</span>}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 bg-black/60 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm ml-0.5">▶</span>
                          </div>
                        </div>
                      </div>
                    ) : m.type === "audio" ? (
                      <div className="h-24 bg-[var(--glass-bg-strong)] flex items-center justify-center gap-3 px-4">
                        <span className="text-3xl">🎵</span>
                        <audio src={`${BASE}${m.url}`} controls className="flex-1" onClick={(e) => e.stopPropagation()} />
                      </div>
                    ) : (
                      <img src={url} alt="" className="w-full h-48 object-cover" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* content */}
          <div className="p-5 space-y-4">
            {/* title + emotion */}
            <div className="flex items-start justify-between gap-3">
              <div>
                {memory.title && <h2 className="text-lg font-semibold text-white">{memory.title}</h2>}
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{date}</p>
              </div>
              <span className={`text-2xl ${color}`}>{emotionEmoji}</span>
            </div>

            {/* description */}
            {memory.description && (
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{memory.description}</p>
            )}

            {/* location */}
            {memory.location?.name && (
              <p className="text-xs text-[var(--text-tertiary)]">📍 {memory.location.name}</p>
            )}

            {/* tags */}
            {memory.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {memory.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-[var(--glass-bg-strong)] text-[var(--text-secondary)] px-2.5 py-1 rounded-full">#{tag}</span>
                ))}
              </div>
            )}

            {/* reactions */}
            <div className="space-y-2">
              <div className="flex gap-2">
                {QUICK_REACTIONS.map((e) => (
                  <button
                    key={e}
                    onClick={() => handleReact(e)}
                    className={`text-lg hover:scale-125 transition-transform ${myReaction?.emoji === e ? "opacity-100" : "opacity-50 hover:opacity-100"}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              {memory.reactions?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(
                    memory.reactions.reduce((acc, r) => { acc[r.emoji] = (acc[r.emoji] || 0) + 1; return acc; }, {})
                  ).map(([emoji, count]) => (
                    <span key={emoji} className="text-xs bg-[var(--glass-bg-strong)] px-2 py-0.5 rounded-full text-[var(--text-secondary)]">
                      {emoji} {count}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* comments */}
            <div className="space-y-3 border-t border-[var(--glass-border)] pt-4">
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Comments</p>
              {memory.comments?.length === 0 && (
                <p className="text-xs text-gray-700">No comments yet.</p>
              )}
              {memory.comments?.map((c, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-900 flex items-center justify-center text-xs flex-shrink-0">
                    {c.userId?.displayName?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[var(--text-secondary)]">{c.userId?.displayName || "You"}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}

              <form onSubmit={handleComment} className="flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  maxLength={500}
                  className="flex-1 bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-[var(--accent-dream-soft)]"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || submitting}
                  className="gradient-mixed hover:bg-[var(--accent-dream)] disabled:opacity-30 rounded-xl px-3 py-2 text-xs transition-colors"
                >
                  →
                </button>
              </form>
            </div>
          </div>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[1400] flex items-center justify-center p-4" style={{background:"rgba(8,2,14,0.7)"}}>
            <div className="card-glass glass-strong max-w-sm w-full text-center p-6 space-y-4">
              <p className="text-xl">🗑️</p>
              <p className="font-semibold text-white">Delete this memory?</p>
              <p className="text-[var(--text-tertiary)] text-sm">This is permanent for both of you.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 btn-secondary btn-base text-sm">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 btn-danger btn-base text-sm">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </>
  );
}
