import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ui/ConfirmModal.jsx";
import { useRelationship } from "../context/RelationshipProvider.jsx";
import { usePersonalization } from "../features/personalization/usePersonalization.js";
import { resetPersonalization } from "../features/personalization/personalizationService.js";
import { THEMES, ACCENT_COLORS, SOUND_THEMES } from "@shared/constants/themes.js";
import VisualMoodSelector from "../features/personalization/VisualMoodSelector.jsx";
import FontSelector from "../features/personalization/FontSelector.jsx";
import ChatStylePreview from "../features/personalization/ChatStylePreview.jsx";
import MemoryLayoutSelector from "../features/personalization/MemoryLayoutSelector.jsx";
import WallpaperUploader from "../features/personalization/WallpaperUploader.jsx";

const SECTIONS = [
  { id: "identity",   label: "Identity",    emoji: "💑" },
  { id: "theme",      label: "Theme",       emoji: "🎨" },
  { id: "mood",       label: "Mood",        emoji: "✨" },
  { id: "font",       label: "Font",        emoji: "🔤" },
  { id: "chat",       label: "Chat Style",  emoji: "💬" },
  { id: "memories",   label: "Memories",    emoji: "📸" },
  { id: "wallpaper",  label: "Wallpaper",   emoji: "🖼️" },
  { id: "sound",      label: "Sound",       emoji: "🔔" },
];

export default function PersonalizationPage() {
  const navigate = useNavigate();
  const { rel, loading: relLoading } = useRelationship();
  const [activeSection, setActiveSection] = useState("identity");
  const [saved, setSaved] = useState(false);


  const { personalization, loading, update } = usePersonalization(rel?.id);

  const set = async (key, value) => {
    await update({ [key]: value });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { refresh } = useRelationship();

  const handleReset = async () => {
    setShowResetConfirm(false);
    await resetPersonalization(rel.id);
    await refresh(); // re-fetch relationship context instead of full page reload
    window.location.reload(); // personalization applies CSS vars globally — safe reload here
  };

  if (loading || !personalization) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-white">
      <div className="w-6 h-6 border-2 border-[var(--accent-dream-soft)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const p = personalization;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white flex flex-col">
      {/* header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--glass-border)] sticky top-0 bg-[var(--bg-primary)] z-10">
        <button onClick={() => navigate("/relationship")} className="text-[var(--text-tertiary)] hover:text-white transition-colors">←</button>
        <h1 className="text-base font-semibold flex-1">Personalize Your Space</h1>
        {saved && <span className="text-xs text-[var(--status-success)]">Saved ✓</span>}
        <button onClick={() => setShowResetConfirm(true)} className="text-xs text-[var(--text-disabled)] hover:text-[var(--text-secondary)] transition-colors">Reset</button>
      </div>

      <div className="flex flex-1">
        {/* sidebar */}
        <div className="w-14 sm:w-44 border-r border-[var(--glass-border)] flex-shrink-0">
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors ${
                activeSection === s.id ? "bg-indigo-900/30 text-white border-r-2 border-[var(--accent-dream-soft)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--glass-bg)]"
              }`}>
              <span className="text-lg flex-shrink-0">{s.emoji}</span>
              <span className="text-sm hidden sm:block">{s.label}</span>
            </button>
          ))}
        </div>

        {/* content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 max-w-lg">

          {activeSection === "identity" && (
            <div className="space-y-4">
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Space Name</p>
              <input
                defaultValue={p.relationshipName}
                onBlur={(e) => set("relationshipName", e.target.value)}
                placeholder="Our World ❤️"
                maxLength={60}
                className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[var(--accent-dream-soft)]"
              />
              <p className="text-xs text-[var(--text-disabled)]">This name appears in your home screen header.</p>
            </div>
          )}

          {activeSection === "theme" && (
            <div className="space-y-4">
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Theme</p>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((t) => (
                  <button key={t.value} onClick={() => set("theme", t.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      p.theme === t.value ? "border-[var(--accent-dream-soft)] bg-indigo-900/20" : "border-[var(--glass-border)] hover:border-[var(--glass-border-strong)]"
                    }`}>
                    <span className="text-xl">{t.emoji}</span>
                    <span className="text-sm text-[var(--text-secondary)]">{t.label}</span>
                    {p.theme === t.value && <span className="ml-auto text-[var(--accent-dream-soft)] text-xs">✓</span>}
                  </button>
                ))}
              </div>

              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mt-4">Accent Color</p>
              <div className="flex gap-3 flex-wrap">
                {ACCENT_COLORS.map((a) => (
                  <button key={a.value} onClick={() => set("accentColor", a.value)} title={a.label}
                    className={`w-10 h-10 rounded-full transition-all`}
                    style={{ backgroundColor: a.hex, outline: p.accentColor === a.value ? `3px solid white` : "none", outlineOffset: "2px" }}
                  />
                ))}
              </div>
            </div>
          )}

          {activeSection === "mood" && (
            <div className="space-y-4">
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Visual Mood</p>
              <VisualMoodSelector value={p.visualMood} onChange={(v) => set("visualMood", v)} />
            </div>
          )}

          {activeSection === "font" && (
            <div className="space-y-4">
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Font Style</p>
              <FontSelector value={p.fontStyle} onChange={(v) => set("fontStyle", v)} />
            </div>
          )}

          {activeSection === "chat" && (
            <div className="space-y-4">
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Chat Bubble Style</p>
              <ChatStylePreview value={p.chatBubbleStyle} onChange={(v) => set("chatBubbleStyle", v)} />
            </div>
          )}

          {activeSection === "memories" && (
            <div className="space-y-4">
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Memory Layout</p>
              <MemoryLayoutSelector value={p.memoryCardStyle} onChange={(v) => set("memoryCardStyle", v)} />
            </div>
          )}

          {activeSection === "wallpaper" && (
            <div className="space-y-4">
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Shared Wallpaper</p>
              <WallpaperUploader
                current={p.sharedWallpaper}
                relationshipId={rel?.id}
                onChange={(url) => set("sharedWallpaper", url)}
              />
              <p className="text-xs text-[var(--text-disabled)]">Applied as background across your shared space.</p>
            </div>
          )}

          {activeSection === "sound" && (
            <div className="space-y-4">
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Sound Theme</p>
              <div className="space-y-2">
                {SOUND_THEMES.map((s) => (
                  <button key={s.value} onClick={() => set("soundTheme", s.value)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                      p.soundTheme === s.value ? "border-[var(--accent-dream-soft)] bg-indigo-900/20" : "border-[var(--glass-border)] hover:border-[var(--glass-border-strong)]"
                    }`}>
                    <span className="text-xl">{s.emoji}</span>
                    <span className="text-sm text-[var(--text-secondary)]">{s.label}</span>
                    {p.soundTheme === s.value && <span className="ml-auto text-[var(--accent-dream-soft)] text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      <ConfirmModal
        isOpen={showResetConfirm}
        icon="🎨"
        title="Reset personalization?"
        description="All your theme, wallpaper, and space name settings will go back to defaults."
        confirmText="Reset to defaults"
        danger
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}
