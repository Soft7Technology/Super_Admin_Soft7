"use client";

import { useTheme } from "../context/ThemeContext";

export default function Logo({ className }: { className?: string }) {
  const { isDark } = useTheme();
  return <img src={isDark ? "/logo-dark.png" : "/logo-light.png"} alt="Soft7" className={className} />;
}
