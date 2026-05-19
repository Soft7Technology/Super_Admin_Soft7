"use client";

import React from "react";
import { useTheme } from "../context/ThemeContext";

export default function Logo({ size = 42 }: { size?: number }) {
  const { isDark } = useTheme();
  const src = isDark ? "/logo-dark.png" : "/logo-light.png";

  return (
    <img
      src={src}
      alt="Soft7"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain", borderRadius: 12 }}
    />
  );
}
