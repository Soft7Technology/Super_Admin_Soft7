"use client";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DEFAULT_MODE, MODE_STORAGE_KEY } from "@/theme/config";
import { ThemeColorProvider } from "@/theme/ThemeColorProvider";

type Theme = "dark" | "light";
interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_MODE,
  isDark: DEFAULT_MODE === "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

/** Apply the mode to <html>: `.dark` drives styles/tokens.css; `data-theme` is kept for legacy selectors. */
function applyMode(mode: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.setAttribute("data-theme", mode);
  root.style.colorScheme = mode;
}

/**
 * The one theme provider for SuperAdmin:
 *  - light/dark mode, persisted as `sa-theme` (default dark), applied as
 *    `.dark` on <html> — the pre-paint script in app/layout.tsx reads the same key
 *  - the brand color + Theme Editor overrides (ThemeColorProvider; blue default)
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_MODE);

  // Adopt what the bootstrap script already painted (no flash, no mismatch).
  useEffect(() => {
    let saved: Theme = DEFAULT_MODE;
    try {
      const value = localStorage.getItem(MODE_STORAGE_KEY);
      if (value === "light" || value === "dark") saved = value;
    } catch {
      /* storage unavailable — keep the default */
    }
    setThemeState(saved);
    applyMode(saved);
  }, []);

  const setTheme = useCallback((mode: Theme) => {
    setThemeState(mode);
    applyMode(mode);
    try {
      localStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch {
      /* storage unavailable — the mode still applies for this session */
    }
  }, []);

  const toggleTheme = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [setTheme, theme]);

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === "dark", toggleTheme, setTheme }}>
      <ThemeColorProvider>{children}</ThemeColorProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

/**
 * Legacy inline-style palette. Every value is a reference to the central design
 * tokens (src/styles/tokens.css), so inline styles follow light/dark mode and
 * the blue brand automatically. Both entries are identical on purpose: the
 * `.dark` class on <html> switches the underlying values.
 */
const cssTokens = {
  bg: "var(--color-background)",
  surface: "var(--color-surface)",
  surface2: "var(--color-surface-muted)",
  border: "var(--color-border)",
  text: "var(--color-text)",
  textSub: "var(--color-text-secondary)",
  textMuted: "var(--color-text-muted)",
  textFaint: "var(--color-text-muted)",
  accent: "var(--color-primary-text)",
  accentBg: "var(--color-primary-light)",
  inputBg: "var(--color-input)",
  tableHead: "var(--color-surface-muted)",
  navActive: "var(--color-sidebar-active-bg)",
  navHover: "var(--color-sidebar-hover)",
  rowHover: "var(--color-surface-hover)",
  iconBox: "var(--color-surface-hover)",
  shadow: "color-mix(in oklab, var(--color-text) 14%, transparent)",
} as const;

export const tokens = {
  dark: cssTokens,
  light: cssTokens,
} as const;

export type T = typeof tokens.dark;
