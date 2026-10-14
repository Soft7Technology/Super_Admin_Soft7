"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import IconButton from "@/components/ui/IconButton";

/** Light/dark switch. ThemeContext owns the `.dark` class on <html>. */
export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <IconButton
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      icon={isDark ? <Sun size={18} /> : <Moon size={18} />}
      onClick={toggleTheme}
    />
  );
}

export { ThemeToggle };
