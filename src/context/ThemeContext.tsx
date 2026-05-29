"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
interface ThemeContextType { theme: Theme; toggleTheme: () => void; isDark: boolean; }

const ThemeContext = createContext<ThemeContextType>({ theme: "dark", toggleTheme: () => {}, isDark: true });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sa-theme") as Theme | null;
      if (saved === "light" || saved === "dark") {
        setTheme(saved);
        document.documentElement.setAttribute("data-theme", saved); 
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
      }
    } catch {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleTheme = () => setTheme(prev => {
    const next = prev === "dark" ? "light" : "dark";
    try { localStorage.setItem("sa-theme", next); } catch {}
    document.documentElement.setAttribute("data-theme", next); // ✅ FIX: update <html> on every toggle
    return next;
  });

  return <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export const tokens = {
  dark: {
    bg: "#070b14", surface: "#0d1117", surface2: "#0a0e17",
    border: "#244033", text: "#ffffff", textSub: "#e5e7eb",
    textMuted: "#b6c2d1", textFaint: "#7c8aa0",
    accent: "#10b981", accentBg: "rgba(16,185,129,0.16)",
    inputBg: "#161b27", tableHead: "#0a0e17",
    navActive: "linear-gradient(135deg,rgba(16,185,129,0.32),rgba(13,148,136,0.18))",
    navHover: "rgba(16,185,129,0.08)", rowHover: "rgba(16,185,129,0.06)",
    iconBox: "rgba(255,255,255,0.05)", shadow: "rgba(0,0,0,0.4)",
  },
  light: {
    bg: "#ffffff", surface: "#ffffff", surface2: "#f0fdf4",
    border: "#99f6e4", text: "#000000", textSub: "#111827",
    textMuted: "#1f2937", textFaint: "#4b5563",
    accent: "#10b981", accentBg: "rgba(16,185,129,0.12)",
    inputBg: "#ffffff", tableHead: "#ecfdf5",
    navActive: "linear-gradient(135deg,rgba(16,185,129,0.18),rgba(13,148,136,0.12))",
    navHover: "rgba(16,185,129,0.08)", rowHover: "rgba(16,185,129,0.06)",
    iconBox: "rgba(0,0,0,0.05)", shadow: "rgba(0,0,0,0.1)",
  },
} as const;

export type T = typeof tokens.dark;
