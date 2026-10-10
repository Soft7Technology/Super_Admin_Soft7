"use client";

import React, { useState } from "react";

export function getInitials(name?: string): string {
  if (!name || typeof name !== "string") return "??";
  const trimmed = name.trim();
  if (!trimmed) return "??";

  // Strip leading non-alphanumeric characters if any
  const clean = trimmed.replace(/^[^a-zA-Z0-9]+/, "");
  if (!clean) return "??";

  return clean.slice(0, 2).toUpperCase();
}

export interface ProfileAvatarProps {
  name?: string;
  initials?: string;
  src?: string | null;
  size?: number | "sm" | "md" | "lg" | "xl";
  fontSize?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  title?: string;
}

export default function ProfileAvatar({
  name,
  initials,
  src,
  size = 36,
  fontSize,
  borderRadius,
  className = "",
  style = {},
  onClick,
  title,
}: ProfileAvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Determine numeric size
  const numSize =
    typeof size === "number"
      ? size
      : size === "sm"
      ? 28
      : size === "md"
      ? 36
      : size === "lg"
      ? 44
      : size === "xl"
      ? 52
      : 36;

  const calculatedRadius =
    borderRadius !== undefined
      ? typeof borderRadius === "number"
        ? `${borderRadius}px`
        : borderRadius
      : `${Math.max(6, Math.round(numSize * 0.25))}px`;

  const calculatedFontSize =
    fontSize !== undefined
      ? typeof fontSize === "number"
        ? `${fontSize}px`
        : fontSize
      : `${Math.max(10, Math.round(numSize * 0.38))}px`;

  const displayInitials = initials || getInitials(name);

  return (
    <div
      className={`global-profile-avatar ${className}`}
      title={title || name || displayInitials}
      onClick={onClick}
      style={{
        width: `${numSize}px`,
        height: `${numSize}px`,
        minWidth: `${numSize}px`,
        minHeight: `${numSize}px`,
        borderRadius: calculatedRadius,
        backgroundColor: "var(--avatar-bg, #e8f5ef)",
        color: "var(--avatar-color, #278b67)",
        fontWeight: 800,
        fontSize: calculatedFontSize,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        userSelect: "none",
        overflow: "hidden",
        letterSpacing: "0.02em",
        cursor: onClick ? "pointer" : "default",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={name || "Profile"}
          onError={() => setImgError(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: calculatedRadius,
          }}
        />
      ) : (
        <span>{displayInitials}</span>
      )}
    </div>
  );
}
