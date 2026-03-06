"use client";

import React, { useState } from "react";
import { StatCard } from "../types";

const ACCENT_GRADIENTS: Record<StatCard["accent"], string> = {
  blue: "linear-gradient(90deg,#4f8ef7,#7b61ff)",
  green: "linear-gradient(90deg,#38d9a9,#4ade80)",
  orange: "linear-gradient(90deg,#f7934f,#fbbf24)",
  red: "linear-gradient(90deg,#f74f6a,#fb923c)",
};

interface StatCardsProps {
  stats: StatCard[];
}

const StatCards: React.FC<StatCardsProps> = ({ stats }) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "18px",
        marginBottom: "28px",
      }}
    >
      {stats.map((stat, i) => (
        <StatCardItem key={i} stat={stat} />
      ))}
    </div>
  );
};

const StatCardItem: React.FC<{ stat: StatCard }> = ({ stat }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#111318",
        border: `1px solid ${hovered ? "rgba(79,142,247,0.35)" : "#1f2535"}`,
        borderRadius: "14px",
        padding: "20px 22px",
        position: "relative",
        overflow: "hidden",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.2s ease",
        cursor: "default",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Label row */}
      <div
        style={{
          fontSize: "0.75rem",
          color: "#6b7280",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 600,
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          gap: "7px",
        }}
      >
        <span>{stat.icon}</span>
        {stat.label}
      </div>

      {/* Value */}
      <div
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "2rem",
          fontWeight: 800,
          color: "#e8eaf0",
          lineHeight: 1,
        }}
      >
        {stat.value}
      </div>

      {/* Change indicator */}
      <div
        style={{
          fontSize: "0.75rem",
          color: "#6b7280",
          marginTop: "6px",
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <span
          style={{ color: stat.changeType === "up" ? "#38d9a9" : "#f74f6a" }}
        >
          {stat.changeType === "up" ? "▲" : "▼"} {stat.change}
        </span>
        vs last month
      </div>

      {/* Bottom accent bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: ACCENT_GRADIENTS[stat.accent],
        }}
      />
    </div>
  );
};

export default StatCards;
