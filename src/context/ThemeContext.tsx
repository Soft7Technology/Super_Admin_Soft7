"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
interface ThemeContextType { theme: Theme; toggleTheme: () => void; isDark: boolean; }

const ThemeContext = createContext<ThemeContextType>({ theme: "light", toggleTheme: () => {}, isDark: false });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sa-theme") as Theme | null;
      const initialTheme = (saved === "light" || saved === "dark")
        ? saved
        : (document.documentElement.getAttribute("data-theme") as Theme | null) || "light";
      setTheme(initialTheme);
      document.documentElement.setAttribute("data-theme", initialTheme);
      document.documentElement.classList.toggle("dark", initialTheme === "dark");
      document.documentElement.classList.toggle("light", initialTheme === "light");
    } catch {
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => setTheme(prev => {
    const next = prev === "dark" ? "light" : "dark";
    try { localStorage.setItem("sa-theme", next); } catch {}
    document.documentElement.setAttribute("data-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.classList.toggle("light", next === "light");
    return next;
  });

  return <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export const tokens = {
  dark: {
    bg: "#0b0e11",
    surface: "#13171d",
    surface2: "#171c24",
    border: "rgba(255, 255, 255, 0.08)",
    text: "#ffffff",
    textSub: "#cbd5e1",
    textMuted: "#94a3b8",
    textFaint: "#64748b",
    accent: "#10b981",
    accentBg: "rgba(16, 185, 129, 0.16)",
    inputBg: "#13171d",
    tableHead: "#171c24",
    navActive: "rgba(16, 185, 129, 0.16)",
    navHover: "rgba(16, 185, 129, 0.1)",
    rowHover: "rgba(16, 185, 129, 0.06)",
    iconBox: "rgba(255, 255, 255, 0.06)",
    shadow: "rgba(0,0,0,0.5)",
  },
  light: {
    bg: "#f0f7f3",
    surface: "#ffffff",
    surface2: "#f6faf8",
    border: "#dbe8e2",
    text: "#1b2d27",
    textSub: "#4f625a",
    textMuted: "#6c8177",
    textFaint: "#93a49c",
    accent: "#087f5b",
    accentBg: "rgba(8, 127, 91, 0.12)",
    inputBg: "#ffffff",
    tableHead: "#f6faf8",
    navActive: "linear-gradient(135deg,rgba(8,127,91,0.16),rgba(82,167,125,0.10))",
    navHover: "rgba(8,127,91,0.08)",
    rowHover: "rgba(8,127,91,0.05)",
    iconBox: "rgba(0,0,0,0.04)",
    shadow: "rgba(0,0,0,0.06)",
  },
} as const;

export type T = typeof tokens.dark;
