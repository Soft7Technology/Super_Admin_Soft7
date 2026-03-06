"use client";

import React, { useState } from "react";
import { Company, StatusType } from "../types";

const STATUS_STYLES: Record<StatusType, { bg: string; color: string }> = {
  Active: { bg: "rgba(56,217,169,0.12)", color: "#38d9a9" },
  Inactive: { bg: "rgba(247,79,106,0.10)", color: "#f74f6a" },
  Trial: { bg: "rgba(247,147,79,0.12)", color: "#f7934f" },
};

const DEFAULT_COMPANIES: Company[] = [
  { id: "1", name: "Acme Corp", initials: "AC", color: "linear-gradient(135deg,#4f8ef7,#7b61ff)", status: "Active", plan: "Enterprise", users: 320 },
  { id: "2", name: "Nexus Ltd", initials: "NX", color: "linear-gradient(135deg,#38d9a9,#4ade80)", status: "Active", plan: "Pro", users: 148 },
  { id: "3", name: "SkyLine Inc", initials: "SK", color: "linear-gradient(135deg,#f7934f,#fbbf24)", status: "Trial", plan: "Starter", users: 42 },
  { id: "4", name: "Vertex Co", initials: "VT", color: "linear-gradient(135deg,#f74f6a,#fb923c)", status: "Inactive", plan: "Basic", users: 87 },
  { id: "5", name: "Zenith Group", initials: "ZN", color: "linear-gradient(135deg,#a78bfa,#60a5fa)", status: "Active", plan: "Enterprise", users: 510 },
];

interface CompanyOverviewProps {
  companies?: Company[];
  onViewAll?: () => void;
}

const CompanyOverview: React.FC<CompanyOverviewProps> = ({
  companies = DEFAULT_COMPANIES,
  onViewAll,
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
      {/* Card Header */}
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
          Company Overview
        </span>
        <span
          onClick={onViewAll}
          style={{
            fontSize: "0.75rem",
            color: "#4f8ef7",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          View All →
        </span>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
        <thead>
          <tr style={{ background: "#181c24" }}>
            {["Company Name", "Status", "Plan", "Users"].map((h) => (
              <th
                key={h}
                style={{
                  padding: "10px 16px",
                  textAlign: "left",
                  fontSize: "0.7rem",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 700,
                  borderBottom: "1px solid #1f2535",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {companies.map((co, i) => (
            <CompanyRow
              key={co.id}
              company={co}
              isLast={i === companies.length - 1}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const CompanyRow: React.FC<{ company: Company; isLast: boolean }> = ({
  company,
  isLast,
}) => {
  const [hovered, setHovered] = useState(false);
  const s = STATUS_STYLES[company.status];

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderBottom: isLast ? "none" : "1px solid rgba(31,37,53,0.6)",
        background: hovered ? "rgba(79,142,247,0.05)" : "transparent",
        transition: "background 0.15s",
        cursor: "pointer",
      }}
    >
      {/* Company Name */}
      <td style={{ padding: "11px 16px", color: "#e8eaf0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px", fontWeight: 600 }}>
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "6px",
              background: company.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "0.65rem",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {company.initials}
          </div>
          {company.name}
        </div>
      </td>

      {/* Status */}
      <td style={{ padding: "11px 16px" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "3px 10px",
            borderRadius: "20px",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.04em",
            background: s.bg,
            color: s.color,
          }}
        >
          {company.status}
        </span>
      </td>

      {/* Plan */}
      <td style={{ padding: "11px 16px" }}>
        <span
          style={{
            fontSize: "0.72rem",
            color: "#6b7280",
            background: "#181c24",
            padding: "3px 9px",
            borderRadius: "6px",
            border: "1px solid #1f2535",
          }}
        >
          {company.plan}
        </span>
      </td>

      {/* Users */}
      <td style={{ padding: "11px 16px", color: "#e8eaf0" }}>{company.users}</td>
    </tr>
  );
};

export default CompanyOverview;
