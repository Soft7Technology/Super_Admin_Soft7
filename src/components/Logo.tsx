"use client";

import React from "react";
import { useTheme } from "../context/ThemeContext";


export default function Logo() {
  const { isDark } = useTheme();
  const src = isDark ? "/logo-dark.png" : "/logo-light.png";

  return (
    <>
      <img
        src={src}
        alt="Soft7"
        className="sidebar-logo"
      />

      <style jsx>{`
        .sidebar-logo {
          width: 100%;
          max-width: 80px;
          height: auto;
          object-fit: contain;
          display: block;
          transition: all 0.25s ease;
        }
      `}</style>
    </>
  );
}