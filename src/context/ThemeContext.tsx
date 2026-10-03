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
    bg: "#080b0f",
    surface: "#0e1218",
    surface2: "#131920",
    border: "rgba(255, 255, 255, 0.08)",
    text: "#edf2f7",
    textSub: "#c8d3de",
    textMuted: "#8a97a8",
    textFaint: "#64748b",
    accent: "#206bc4",
    accentBg: "rgba(32, 107, 196, 0.2)",
    inputBg: "#101620",
    tableHead: "#131920",
    navActive: "linear-gradient(135deg,rgba(32,107,196,0.35),rgba(66,153,225,0.2))",
    navHover: "rgba(32,107,196,0.12)",
    rowHover: "rgba(32,107,196,0.08)",
    iconBox: "rgba(255,255,255,0.06)",
    shadow: "rgba(0,0,0,0.35)",
  },
  light: {
    bg: "#f4f6fa",
    surface: "#ffffff",
    surface2: "#f8fafc",
    border: "#e6e8eb",
    text: "#1e293b",
    textSub: "#495057",
    textMuted: "#64748b",
    textFaint: "#94a3b8",
    accent: "#206bc4",
    accentBg: "rgba(32, 107, 196, 0.12)",
    inputBg: "#ffffff",
    tableHead: "#f8fafc",
    navActive: "linear-gradient(135deg,rgba(32,107,196,0.18),rgba(66,153,225,0.12))",
    navHover: "rgba(32,107,196,0.08)",
    rowHover: "rgba(32,107,196,0.05)",
    iconBox: "rgba(0,0,0,0.04)",
    shadow: "rgba(0,0,0,0.06)",
  },
} as const;

export type T = typeof tokens.dark;
