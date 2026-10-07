"use client";

import React from "react";

export interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  color?: "current" | "primary" | "white" | string;
  strokeWidth?: number;
  text?: React.ReactNode;
  variant?: "inline" | "center" | "fullscreen";
  className?: string;
  style?: React.CSSProperties;
}

const SIZE_MAP: Record<string, number> = {
  xs: 12,
  sm: 15,
  md: 22,
  lg: 34,
  xl: 46,
};

/**
 * Modern Minimalist Ring Loader
 * Consistently used across buttons, cards, tables, and page transitions.
 */
export default function Spinner({
  size = "sm",
  color = "current",
  strokeWidth,
  text,
  variant = "inline",
  className = "",
  style = {},
}: SpinnerProps) {
  const pixelSize = typeof size === "number" ? size : SIZE_MAP[size] || 15;
  const stroke = strokeWidth ?? (pixelSize <= 16 ? 2.5 : pixelSize <= 28 ? 2.75 : 3.2);

  const resolvedColor =
    color === "current"
      ? "currentColor"
      : color === "primary"
      ? "var(--crm-primary, #087f5b)"
      : color === "white"
      ? "#ffffff"
      : color;

  const ringSvg = (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        animation: "modern-ring-spin 0.75s linear infinite",
        flexShrink: 0,
      }}
      role="status"
      aria-label="Loading"
    >
      {/* Subtle translucent circular track */}
      <circle
        cx="12"
        cy="12"
        r="9.5"
        stroke={resolvedColor}
        strokeWidth={stroke}
        opacity="0.18"
      />
      {/* Crisp rotating arc with rounded ends */}
      <path
        d="M12 2.5A9.5 9.5 0 0 1 21.5 12"
        stroke={resolvedColor}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </svg>
  );

  const content = (
    <span
      className={`modern-spinner-wrap ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: pixelSize <= 16 ? "6px" : "10px",
        ...style,
      }}
    >
      {ringSvg}
      {text && (
        <span
          style={{
            fontSize: pixelSize <= 16 ? "0.85em" : pixelSize <= 24 ? "0.85rem" : "0.95rem",
            color: color === "current" ? "inherit" : "var(--crm-muted, #64748b)",
            fontWeight: 500,
            lineHeight: 1,
          }}
        >
          {text}
        </span>
      )}
    </span>
  );

  if (variant === "fullscreen") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      >
        <div
          style={{
            background: "var(--crm-card-bg, #ffffff)",
            padding: "20px 28px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.25)",
            border: "1px solid var(--crm-border, #e2e8f0)",
          }}
        >
          {content}
        </div>
      </div>
    );
  }

  if (variant === "center") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          padding: "32px 16px",
          minHeight: "100px",
        }}
      >
        {content}
      </div>
    );
  }

  return content;
}
