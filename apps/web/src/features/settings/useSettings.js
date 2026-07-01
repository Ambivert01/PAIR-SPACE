import { useEffect, useState, useCallback } from "react";
import { getUserSettings, updateUserSettings as apiUpdate } from "./settingsService.js";
import { USER_SETTINGS_DEFAULTS } from "@shared/constants/settingsDefaults.js";

const ACCENT_COLORS = {
  indigo:  { primary: "#6366f1", ring: "ring-indigo-500"  },
  purple:  { primary: "#a855f7", ring: "ring-purple-500"  },
  pink:    { primary: "#ec4899", ring: "ring-pink-500"    },
  neutral: { primary: "#6b7280", ring: "ring-gray-500"    },
};

export const applyTheme = (settings) => {
  const theme  = settings?.appearance?.theme  || "dark";
  const accent = settings?.appearance?.accentColor || "indigo";
  const anim   = settings?.appearance?.animationLevel || "normal";

  const root = document.documentElement;

  // theme class
  root.classList.remove("theme-dark","theme-light","theme-romantic","theme-minimal");
  root.classList.add(`theme-${theme}`);

  // accent CSS variable
  const color = ACCENT_COLORS[accent] || ACCENT_COLORS.indigo;
  root.style.setProperty("--accent", color.primary);

  // animation
  if (anim === "disabled") root.style.setProperty("--transition", "none");
  else if (anim === "reduced") root.style.setProperty("--transition", "0.1s");
  else root.style.removeProperty("--transition");
};

export const useSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getUserSettings()
      .then((s) => { setSettings(s); applyTheme(s); })
      .catch(() => setSettings(USER_SETTINGS_DEFAULTS))
      .finally(() => setLoading(false));
  }, []);

  const update = useCallback(async (section, key, value) => {
    const patch = { [section]: { [key]: value } };
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev?.[section], [key]: value },
    }));
    try {
      const updated = await apiUpdate(patch);
      applyTheme(updated);
      return updated;
    } catch { /* revert on error */ }
  }, []);

  const updateSection = useCallback(async (section, values) => {
    const patch = { [section]: values };
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev?.[section], ...values },
    }));
    try {
      const updated = await apiUpdate(patch);
      applyTheme(updated);
      return updated;
    } catch { /* revert on error */ }
  }, []);

  return { settings, loading, update, updateSection };
};
