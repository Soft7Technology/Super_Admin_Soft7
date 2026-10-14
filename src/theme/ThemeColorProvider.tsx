"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DEFAULT_PRIMARY, THEME_STORAGE_KEY, normalizeHex } from "./colors";
import {
  THEME_CONFIG_KEY,
  type ThemeConfig,
  type ThemeModeName,
  applyThemeConfig,
  buildThemeCss,
  cloneConfig,
  countOverrides,
  createDefaultConfig,
  sanitizeConfig,
} from "./themeConfig";

export { DEFAULT_PRIMARY };

// ─────────────────────────────────────────────────────────────────────────────
// The ONE place the workspace theme lives at runtime.
//
// The provider holds a saved config and a live draft. Applying either writes a
// single <style> block of CSS custom properties (see theme/themeConfig.ts);
// every token, Tailwind utility and component style derives from those. A theme
// change therefore never re-renders the app tree — only the few components that
// read the config (the editor, canvas charts) update.
//
// The draft is applied immediately so editing is a live preview of the real UI;
// `save` persists it and `cancel` puts the saved theme back.
// ─────────────────────────────────────────────────────────────────────────────

type Bucket = "brand" | "light" | "dark" | "semantic";

interface ThemeColorContextValue {
  /** Current brand color as "#rrggbb" (the saved theme's primary). */
  primaryColor: string;
  setPrimaryColor: (hex: string) => void;
  resetToDefault: () => void;
  isPickerOpen: boolean;
  setPickerOpen: (open: boolean) => void;

  /** Saved theme. */
  config: ThemeConfig;
  /** Live editing copy — what the UI is currently painting. */
  draft: ThemeConfig;
  isDirty: boolean;
  overrideCount: number;

  setPrimary: (hex: string) => void;
  setRole: (bucket: Bucket, key: string, hex: string) => void;
  clearRole: (bucket: Bucket, key: string) => void;
  clearBucket: (bucket: Bucket) => void;
  save: () => void;
  cancel: () => void;
  resetAll: () => void;
  /** Bumps whenever the painted theme changes, so previews can re-read vars. */
  revision: number;
}

const noop = () => {};
const fallbackConfig = createDefaultConfig();

const ThemeColorContext = createContext<ThemeColorContextValue>({
  primaryColor: DEFAULT_PRIMARY,
  setPrimaryColor: noop,
  resetToDefault: noop,
  isPickerOpen: false,
  setPickerOpen: noop,
  config: fallbackConfig,
  draft: fallbackConfig,
  isDirty: false,
  overrideCount: 0,
  setPrimary: noop,
  setRole: noop,
  clearRole: noop,
  clearBucket: noop,
  save: noop,
  cancel: noop,
  resetAll: noop,
  revision: 0,
});

export function useThemeColors() {
  return useContext(ThemeColorContext);
}

/** Read the saved theme, migrating a pre-editor HEX-only save if present. */
function readSaved(): ThemeConfig {
  try {
    const raw = localStorage.getItem(THEME_CONFIG_KEY);
    if (raw) return sanitizeConfig(JSON.parse(raw));
  } catch {
    /* corrupt or unavailable — fall through to the legacy key */
  }
  try {
    const legacy = normalizeHex(localStorage.getItem(THEME_STORAGE_KEY) || "");
    if (legacy) return { ...createDefaultConfig(), primary: legacy };
  } catch {
    /* storage unavailable — use defaults for this session */
  }
  return createDefaultConfig();
}

function persist(config: ThemeConfig, css: string) {
  try {
    // `css` rides along so the <head> bootstrap can paint before first render
    // without having to re-derive anything.
    localStorage.setItem(THEME_CONFIG_KEY, JSON.stringify({ ...config, css }));
    // Keep the legacy key in step so older tabs still read the brand color.
    localStorage.setItem(THEME_STORAGE_KEY, config.primary);
  } catch {
    /* storage unavailable — the theme still applies for this session */
  }
}

export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ThemeConfig>(fallbackConfig);
  const [draft, setDraft] = useState<ThemeConfig>(fallbackConfig);
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [revision, setRevision] = useState(0);
  const hydrated = useRef(false);

  // Paint the draft whenever it changes — this is the live preview.
  useEffect(() => {
    if (!hydrated.current) return;
    applyThemeConfig(draft);
    setRevision((n) => n + 1);
  }, [draft]);

  // Hydrate from storage (the inline head script already painted it) and keep
  // multiple tabs in sync.
  useEffect(() => {
    const saved = readSaved();
    hydrated.current = true;
    setConfig(saved);
    setDraft(saved);
    applyThemeConfig(saved);
    setRevision((n) => n + 1);

    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_CONFIG_KEY && e.key !== THEME_STORAGE_KEY) return;
      const next = readSaved();
      setConfig(next);
      setDraft(next);
      applyThemeConfig(next);
      setRevision((n) => n + 1);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setPrimary = useCallback((input: string) => {
    const hex = normalizeHex(input);
    if (!hex) return;
    setDraft((d) => ({ ...d, primary: hex }));
  }, []);

  const setRole = useCallback((bucket: Bucket, key: string, input: string) => {
    const hex = normalizeHex(input);
    if (!hex) return;
    setDraft((d) => ({ ...d, [bucket]: { ...d[bucket], [key]: hex } }));
  }, []);

  const clearRole = useCallback((bucket: Bucket, key: string) => {
    setDraft((d) => {
      const next = { ...d[bucket] };
      delete next[key];
      return { ...d, [bucket]: next };
    });
  }, []);

  const clearBucket = useCallback((bucket: Bucket) => {
    setDraft((d) => ({ ...d, [bucket]: {} }));
  }, []);

  const save = useCallback(() => {
    setDraft((current) => {
      const saved = cloneConfig(current);
      persist(saved, buildThemeCss(saved));
      setConfig(saved);
      return current;
    });
  }, []);

  const cancel = useCallback(() => {
    setDraft(cloneConfig(config));
  }, [config]);

  const resetAll = useCallback(() => {
    const fresh = createDefaultConfig();
    setDraft(fresh);
    setConfig(fresh);
    persist(fresh, buildThemeCss(fresh));
  }, []);

  // Legacy single-color API, kept so existing callers keep working. It saves
  // straight away — the old picker had no draft/save step.
  const setPrimaryColor = useCallback((input: string) => {
    const hex = normalizeHex(input);
    if (!hex) return;
    setDraft((d) => {
      const next = { ...d, primary: hex };
      persist(next, buildThemeCss(next));
      setConfig(cloneConfig(next));
      return next;
    });
  }, []);

  const resetToDefault = useCallback(() => resetAll(), [resetAll]);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(config),
    [draft, config],
  );

  const value = useMemo(
    () => ({
      primaryColor: draft.primary,
      setPrimaryColor,
      resetToDefault,
      isPickerOpen,
      setPickerOpen,
      config,
      draft,
      isDirty,
      overrideCount: countOverrides(draft),
      setPrimary,
      setRole,
      clearRole,
      clearBucket,
      save,
      cancel,
      resetAll,
      revision,
    }),
    [
      draft, config, isDirty, isPickerOpen, revision,
      setPrimaryColor, resetToDefault, setPrimary, setRole,
      clearRole, clearBucket, save, cancel, resetAll,
    ],
  );

  return <ThemeColorContext.Provider value={value}>{children}</ThemeColorContext.Provider>;
}

export type { ThemeConfig, ThemeModeName };
