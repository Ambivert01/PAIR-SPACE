import { useState } from "react";
import { motion } from "framer-motion";
import { useRelationship } from "../context/RelationshipProvider.jsx";
import { usePersonalization } from "../features/personalization/usePersonalization.js";
import { resetPersonalization } from "../features/personalization/personalizationService.js";
import { THEMES, ACCENT_COLORS, SOUND_THEMES } from "@shared/constants/themes.js";
import VisualMoodSelector from "../features/personalization/VisualMoodSelector.jsx";
import FontSelector from "../features/personalization/FontSelector.jsx";
import ChatStylePreview from "../features/personalization/ChatStylePreview.jsx";
import MemoryLayoutSelector from "../features/personalization/MemoryLayoutSelector.jsx";
import WallpaperUploader from "../features/personalization/WallpaperUploader.jsx";
import ConfirmModal from "../components/ui/ConfirmModal.jsx";
import PageLayout, { PageSpinner } from "../components/PageLayout.jsx";

const SECTIONS = [
  { id: "identity",  label: "Identity",   emoji: "💑" },
  { id: "theme",     label: "Theme",      emoji: "🎨" },
  { id: "mood",      label: "Mood",       emoji: "✨" },
  { id: "font",      label: "Font",       emoji: "🔤" },
  { id: "chat",      label: "Chat Style", emoji: "💬" },
  { id: "memories",  label: "Memories",   emoji: "📸" },
  { id: "wallpaper", label: "Wallpaper",  emoji: "🖼️" },
  { id: "sound",     label: "Sound",      emoji: "🔔" },
];

export default function PersonalizationPage() {
  const { rel, refresh } = useRelationship();
  const [activeSection, setActiveSection] = useState("identity");
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { personalization, loading, update } = usePersonalization(rel?.id);

  const set = async (key, value) => {
    await update({ [key]: value });
    setSaved(true); setTimeout(() => setSaved(false), 1500);
  };

  const handleReset = async () => {
    setShowResetConfirm(false);
    await resetPersonalization(rel.id);
    await refresh();
    window.location.reload();
  };

  if (loading || !personalization) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <PageSpinner label="Loading personalization..." />
    </div>
  );

  const p = personalization;

  return (
    <PageLayout
      title="Personalize"
      subtitle="Make your space uniquely yours"
      icon="🎨"
      accent="dream"
      noPad
      headerRight={
        <div className="flex items-center gap-2">
          {saved && <motion.span className="text-xs text-[var(--status-success)] font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Saved ✓</motion.span>}
          <button onClick={() => setShowResetConfirm(true)} className="text-xs text-[var(--text-disabled)] hover:text-[var(--text-secondary)] transition-colors glass px-3 py-1.5 rounded-lg">Reset</button>
        </div>
      }
    >
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-14 sm:w-48 border-r border-[var(--glass-border)] flex-shrink-0 overflow-y-auto bg-[var(--bg-secondary)]/40">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-3.5 text-left transition-all relative ${activeSection === s.id ? "text-white bg-[var(--accent-dream)]/10" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--glass-bg)]"}`}>
              {activeSection === s.id && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--accent-dream)] to-[var(--accent-love)]" />}
              <span className="text-lg flex-shrink-0">{s.emoji}</span>
              <span className="text-sm font-medium hidden sm:block">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 max-w-lg">
          {activeSection === "identity" && (
            <div className="space-y-4">
              <div className="card-glass relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-love)]/8 to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-3">
                  <p className="text-sm font-semibold text-white">Space Name</p>
                  <input defaultValue={p.relationshipName} onBlur={e => set("relationshipName", e.target.value)} placeholder="Our World ❤️" maxLength={60} className="input-field" />
                  <p className="text-xs text-[var(--text-disabled)]">This name appears in your home screen header.</p>
                </div>
              </div>
            </div>
          )}
          {activeSection === "theme" && (
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">Theme</p>
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map(t => (
                    <button key={t.value} onClick={() => set("theme", t.value)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${p.theme === t.value ? "border-[var(--accent-dream-soft)] bg-[var(--accent-dream)]/15 text-white" : "border-[var(--glass-border)] hover:border-[var(--glass-border-strong)] text-[var(--text-secondary)]"}`}>
                      <span className="text-xl">{t.emoji}</span>
                      <span className="text-sm font-medium">{t.label}</span>
                      {p.theme === t.value && <span className="ml-auto text-[var(--accent-dream-soft)] text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">Accent Color</p>
                <div className="flex gap-3 flex-wrap">
                  {ACCENT_COLORS.map(a => (
                    <motion.button key={a.value} onClick={() => set("accentColor", a.value)} title={a.label}
                      className="w-10 h-10 rounded-full transition-all"
                      style={{ backgroundColor: a.hex, outline: p.accentColor === a.value ? "3px solid white" : "none", outlineOffset: "2px" }}
                      whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeSection === "mood" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">Visual Mood</p>
              <VisualMoodSelector value={p.visualMood} onChange={v => set("visualMood", v)} />
            </div>
          )}
          {activeSection === "font" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">Font Style</p>
              <FontSelector value={p.fontStyle} onChange={v => set("fontStyle", v)} />
            </div>
          )}
          {activeSection === "chat" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">Chat Bubble Style</p>
              <ChatStylePreview value={p.chatBubbleStyle} onChange={v => set("chatBubbleStyle", v)} />
            </div>
          )}
          {activeSection === "memories" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">Memory Layout</p>
              <MemoryLayoutSelector value={p.memoryCardStyle} onChange={v => set("memoryCardStyle", v)} />
            </div>
          )}
          {activeSection === "wallpaper" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">Shared Wallpaper</p>
              <WallpaperUploader current={p.sharedWallpaper} relationshipId={rel?.id} onChange={url => set("sharedWallpaper", url)} />
              <p className="text-xs text-[var(--text-disabled)]">Applied as background across your shared space.</p>
            </div>
          )}
          {activeSection === "sound" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">Sound Theme</p>
              <div className="space-y-2">
                {SOUND_THEMES.map(s => (
                  <button key={s.value} onClick={() => set("soundTheme", s.value)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${p.soundTheme === s.value ? "border-[var(--accent-dream-soft)] bg-[var(--accent-dream)]/15 text-white" : "border-[var(--glass-border)] hover:border-[var(--glass-border-strong)] text-[var(--text-secondary)]"}`}>
                    <span className="text-xl">{s.emoji}</span>
                    <span className="text-sm font-medium">{s.label}</span>
                    {p.soundTheme === s.value && <span className="ml-auto text-[var(--accent-dream-soft)] text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal isOpen={showResetConfirm} icon="🎨" title="Reset personalization?" description="All your theme, wallpaper, and space name settings will go back to defaults." confirmText="Reset to defaults" danger onConfirm={handleReset} onCancel={() => setShowResetConfirm(false)} />
    </PageLayout>
  );
}
