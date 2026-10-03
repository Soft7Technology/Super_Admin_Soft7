"use client";

import React from "react";
import { useTheme } from "../context/ThemeContext";

export default function Logo() {
  const { isDark } = useTheme();
  const src = isDark ? "/logo-dark.png" : "/logo-light.png";

  return (
    <img
      src={src}
      alt="Soft7"
      width={120}
      height={35}
      style={{
        width: "100%",
        maxWidth: "120px",
        height: "auto",
        objectFit: "contain",
        display: "block",
        transition: "all 0.25s ease",
      }}
      className="sidebar-logo"
    />
  );
}