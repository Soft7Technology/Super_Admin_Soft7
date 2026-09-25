"use client";

import React, { useState, useEffect } from "react";
import { useTheme, tokens } from "../context/ThemeContext";
import { StatCard } from "../types";

export const STAT_META: Record<string, { accent: string; glow: string; icon: string }> = {
  Campaigns: { icon: "📢", accent: "#0d9488", glow: "rgba(13,148,136,0.18)" },
  Users:     { icon: "👥", accent: "#6366f1", glow: "rgba(99,102,241,0.18)" },
  Chatbots:  { icon: "🤖", accent: "#f59e0b", glow: "rgba(245,158,11,0.18)" },
  Messages:  { icon: "💬", accent: "#34d399", glow: "rgba(52,211,153,0.18)" },
};

const DEFAULT_META = { icon: "📊", accent: "#10b981", glow: "rgba(16,185,129,0.18)" };

export default function StatCards({
  stats,
  isMobile: externalIsMobile,
}: {
  stats: StatCard[];
  isMobile?: boolean;
}) {
  const [internalIsMobile, setInternalIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setInternalIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isMobile = externalIsMobile ?? internalIsMobile;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile
          ? "1fr"
          : "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "28px",
      }}
    >
      {stats.map((s) => (
        <Card key={s.label} stat={s} />
      ))}
    </div>
  );
}

function Card({ stat, onClick }: { stat: StatCard; onClick?: () => void }) {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const [hov, setHov] = useState(false);

  const meta = STAT_META[stat.label] ?? {
    icon: stat.icon || DEFAULT_META.icon,
    accent: DEFAULT_META.accent,
    glow: DEFAULT_META.glow,
  };

  const isUp = stat.changeType === "up";
  const isDown = stat.changeType === "down";

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        background: isDark ? "rgba(15,17,32,0.9)" : "#ffffff",
        border: `1px solid ${
          hov
            ? `${meta.accent}80`
            : isDark
            ? "rgba(255,255,255,0.07)"
            : t.border
        }`,
        borderRadius: "14px",
        padding: "20px 22px",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hov
          ? `0 12px 24px ${meta.glow}`
          : isDark
          ? "0 2px 8px rgba(0,0,0,0.25)"
          : "0 1px 6px rgba(0,0,0,0.06)",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {/* Soft background glow orb */}
      <div
        style={{
          position: "absolute",
          top: -12,
          right: -12,
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: meta.glow,
          pointerEvents: "none",
          filter: "blur(4px)",
        }}
      />

      {/* Top row: Label & Icon */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "14px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
            textTransform: "uppercase",
          }}
        >
          {stat.label}
        </span>
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: `${meta.accent}18`,
            border: `1px solid ${meta.accent}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            flexShrink: 0,
          }}
        >
          {meta.icon}
        </div>
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: "30px",
          fontWeight: 800,
          color: isDark ? "#f1f5f9" : "#0f172a",
          letterSpacing: "-0.03em",
          lineHeight: 1,
          marginBottom: "10px",
        }}
      >
        {stat.value}
      </div>

      {/* Percentage change (+/- % vs dynamic comparison period) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "6px",
          marginBottom: stat.dateRange ? "8px" : "12px",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
            padding: "2px 7px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.02em",
            background: isUp
              ? "rgba(16,185,129,0.14)"
              : isDown
              ? "rgba(239,68,68,0.14)"
              : isDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.06)",
            color: isUp
              ? "#10b981"
              : isDown
              ? "#ef4444"
              : isDark
              ? "rgba(255,255,255,0.6)"
              : "rgba(0,0,0,0.6)",
            border: `1px solid ${
              isUp
                ? "rgba(16,185,129,0.25)"
                : isDown
                ? "rgba(239,68,68,0.25)"
                : isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.1)"
            }`,
          }}
        >
          {isUp ? "▲" : isDown ? "▼" : "•"} {stat.change}
        </span>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
          }}
        >
          {stat.comparisonPeriod || "vs previous period"}
        </span>
      </div>

      {/* Date-range comparison indicator */}
      {stat.dateRange && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "10px",
            fontWeight: 500,
            color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)",
            background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
            border: `1px solid ${
              isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"
            }`,
            padding: "2px 6px",
            borderRadius: "5px",
            marginBottom: "8px",
          }}
        >
          <span>📅</span>
          <span>{stat.dateRange}</span>
        </div>
      )}

      {/* Accent progress line */}
      <div
        style={{
          height: "2px",
          width: "42px",
          borderRadius: "2px",
          background: meta.accent,
          opacity: 0.75,
          marginTop: "2px",
        }}
      />
    </div>
  );
}
