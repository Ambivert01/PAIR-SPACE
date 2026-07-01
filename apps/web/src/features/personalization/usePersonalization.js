import { MEDIA_BASE } from "@shared/constants/urls.js";
import { useCallback, useEffect, useState } from "react";
import { getPersonalization, updatePersonalization as apiUpdate } from "./personalizationService.js";
import { THEMES, ACCENT_COLORS, FONT_STYLES, CHAT_BUBBLE_STYLES, PERSONALIZATION_DEFAULTS } from "@shared/constants/themes.js";

export const applyPersonalization = (p) => {
  if (!p) return;
  const root = document.documentElement;

  // theme CSS vars
  const theme = THEMES.find((t) => t.value === p.theme);
  if (theme?.vars) {
    for (const [k, v] of Object.entries(theme.vars)) root.style.setProperty(k, v);
  }

  // accent color
  const accent = ACCENT_COLORS.find((a) => a.value === p.accentColor);
  if (accent) root.style.setProperty("--accent", accent.hex);

  // font
  const font = FONT_STYLES.find((f) => f.value === p.fontStyle);
  if (font) root.style.setProperty("--font-family", font.family);

  // chat bubble radius
  const bubble = CHAT_BUBBLE_STYLES.find((b) => b.value === p.chatBubbleStyle);
  if (bubble) root.style.setProperty("--bubble-radius", bubble.radius);

  // animation
  if (p.animationLevel === "disabled") root.style.setProperty("--transition", "none");
  else if (p.animationLevel === "reduced") root.style.setProperty("--transition", "0.1s");
  else root.style.removeProperty("--transition");

  // wallpaper
  if (p.sharedWallpaper) {
    root.style.setProperty("--wallpaper", `url(${MEDIA_BASE}${p.sharedWallpaper})`);
  } else {
    root.style.removeProperty("--wallpaper");
  }
};

export const usePersonalization = (relationshipId) => {
  const [personalization, setPersonalization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!relationshipId) { setLoading(false); return; }
    getPersonalization(relationshipId)
      .then((p) => { setPersonalization(p); applyPersonalization(p); })
      .catch(() => setPersonalization(PERSONALIZATION_DEFAULTS))
      .finally(() => setLoading(false));
  }, [relationshipId]);

  const update = useCallback(async (updates) => {
    // optimistic apply
    const merged = { ...personalization, ...updates };
    setPersonalization(merged);
    applyPersonalization(merged);
    try {
      const saved = await apiUpdate(relationshipId, updates);
      setPersonalization(saved);
      applyPersonalization(saved);
      return saved;
    } catch { /* revert */ applyPersonalization(personalization); }
  }, [personalization, relationshipId]);

  return { personalization, loading, update };
};
