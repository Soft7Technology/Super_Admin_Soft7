"use client";

import React, { useState } from "react";
import { SubscriptionTier } from "../../types";

const DEFAULT_TIERS: SubscriptionTier[] = [
  { name: "Enterprise", count: 58, max: 80, color: "#4dabf7" },
  { name: "Professional", count: 82, max: 100, color: "#4ade80" },
  { name: "Starter", count: 54, max: 70, color: "#fbbf24" },
  { name: "Trial", count: 24, max: 50, color: "#94a3b8" },
  { name: "Inactive", count: 30, max: 50, color: "#f87171" },
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
        background: "#0d1117",
        border: "1px solid #1c2333",
        borderRadius: "14px",
        overflow: "hidden",
        fontFamily: "'Inter', 'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          padding: "18px 20px 14px",
          borderBottom: "1px solid #1c2333",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#fff" }}>
          Subscription Status
        </span>
        <span
          onClick={onViewDetails}
          style={{ fontSize: "0.8rem", color: "#4dabf7", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}
        >
          Details
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </div>

      <div style={{ padding: "8px 0" }}>
        {tiers.map((tier, i) => (
          <TierRow key={tier.name} tier={tier} isLast={i === tiers.length - 1} />
        ))}
      </div>
    </div>
  );
};

const TierRow: React.FC<{ tier: SubscriptionTier; isLast: boolean }> = ({ tier, isLast }) => {
  const [hovered, setHovered] = useState(false);
  const pct = Math.round((tier.count / tier.max) * 100);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "11px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: isLast ? "none" : "1px solid rgba(28,35,51,0.6)",
        background: hovered ? "rgba(255,255,255,0.02)" : "transparent",
        transition: "background 0.12s",
        cursor: "pointer",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: "90px" }}>
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#e2e8f0" }}>{tier.name}</span>
        <span style={{ fontSize: "0.72rem", color: "#4b5563" }}>{tier.count} companies</span>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ height: "6px", borderRadius: "3px", background: "#161b27", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            borderRadius: "3px", background: tier.color,
            transition: "width 0.5s ease",
            boxShadow: `0 0 8px ${tier.color}60`,
          }} />
        </div>
      </div>

      <span style={{ fontSize: "0.75rem", color: "#6b7280", minWidth: "55px", textAlign: "right" }}>
        {tier.count} / {tier.max}
      </span>
    </div>
  );
};

export default SubscriptionStatus;
