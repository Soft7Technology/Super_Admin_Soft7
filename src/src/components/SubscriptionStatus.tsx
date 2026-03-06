"use client";

import React, { useState } from "react";
import { SubscriptionTier } from "../types";

const DEFAULT_TIERS: SubscriptionTier[] = [
  { name: "Enterprise", count: 58, max: 80, color: "#4f8ef7" },
  { name: "Professional", count: 82, max: 100, color: "#38d9a9" },
  { name: "Starter", count: 54, max: 70, color: "#f7934f" },
  { name: "Trial", count: 24, max: 50, color: "#6b7280" },
  { name: "Inactive", count: 30, max: 50, color: "#f74f6a" },
];

interface SubscriptionStatusProps {
  tiers?: SubscriptionTier[];
  onViewDetails?: () => void;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  tiers = DEFAULT_TIERS,
  onViewDetails,
}) => {
  return (
    <div
      style={{
        background: "#111318",
        border: "1px solid #1f2535",
        borderRadius: "14px",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 22px 14px",
          borderBottom: "1px solid #1f2535",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "#e8eaf0",
          }}
        >
          Subscription Status
        </span>
        <span
          onClick={onViewDetails}
          style={{
            fontSize: "0.75rem",
            color: "#4f8ef7",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Details →
        </span>
      </div>

      {/* Tier list */}
      <div style={{ padding: "10px 0" }}>
        {tiers.map((tier, i) => (
          <TierRow key={tier.name} tier={tier} isLast={i === tiers.length - 1} />
        ))}
      </div>
    </div>
  );
};

const TierRow: React.FC<{ tier: SubscriptionTier; isLast: boolean }> = ({
  tier,
  isLast,
}) => {
  const [hovered, setHovered] = useState(false);
  const pct = Math.round((tier.count / tier.max) * 100);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "12px 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: isLast ? "none" : "1px solid rgba(31,37,53,0.5)",
        background: hovered ? "rgba(79,142,247,0.04)" : "transparent",
        transition: "background 0.15s",
        cursor: "pointer",
      }}
    >
      {/* Left */}
      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#e8eaf0" }}>
          {tier.name}
        </span>
        <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>
          {tier.count} companies
        </span>
      </div>

      {/* Right — progress bar */}
      <div style={{ width: "100px" }}>
        <div
          style={{
            fontSize: "0.7rem",
            color: "#6b7280",
            textAlign: "right",
            marginBottom: "4px",
          }}
        >
          {tier.count} / {tier.max}
        </div>
        <div
          style={{
            height: "5px",
            borderRadius: "3px",
            background: "#181c24",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: "3px",
              background: tier.color,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;
