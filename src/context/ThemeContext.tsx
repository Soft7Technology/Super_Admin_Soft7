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
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch {}
  }, []);
  const toggleTheme = () => setTheme(prev => {
    const next = prev === "dark" ? "light" : "dark";
    try { localStorage.setItem("sa-theme", next); } catch {}
    return next;
  });
  return <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export const tokens = {
  dark: {
    bg: "#070b14", surface: "#0d1117", surface2: "#0a0e17",
    border: "#1c2333", text: "#ffffff", textSub: "#e2e8f0",
    textMuted: "#8b949e", textFaint: "#4b5563",
    accent: "#4dabf7", accentBg: "rgba(59,91,219,0.15)",
    inputBg: "#161b27", tableHead: "#0a0e17",
    navActive: "linear-gradient(135deg,rgba(59,91,219,0.4),rgba(103,65,217,0.3))",
    navHover: "rgba(255,255,255,0.05)", rowHover: "rgba(255,255,255,0.03)",
    iconBox: "rgba(255,255,255,0.05)", shadow: "rgba(0,0,0,0.4)",
  },
  light: {
    bg: "#f1f5f9", surface: "#ffffff", surface2: "#f8fafc",
    border: "#e2e8f0", text: "#0f172a", textSub: "#1e293b",
    textMuted: "#64748b", textFaint: "#94a3b8",
    accent: "#2563eb", accentBg: "rgba(37,99,235,0.08)",
    inputBg: "#f1f5f9", tableHead: "#f8fafc",
    navActive: "linear-gradient(135deg,rgba(37,99,235,0.15),rgba(99,60,200,0.1))",
    navHover: "rgba(0,0,0,0.04)", rowHover: "rgba(0,0,0,0.02)",
    iconBox: "rgba(0,0,0,0.05)", shadow: "rgba(0,0,0,0.1)",
  },
} as const;

export type T = typeof tokens.dark;
