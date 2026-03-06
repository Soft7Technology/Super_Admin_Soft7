"use client";

import React from "react";
import StatCards from "../../../components/StatCards";
import CompanyOverview from "../../../components/CompanyOverview";
import SubscriptionStatus from "../../../components/SubscriptionStatus";
import UserManagement from "../../../components/UserManagement";
import AuditLogs from "../../../components/AuditLogs";
import { StatCard } from "../../../types";

/* ── Static data ─────────────────────────────────────────────── */
const STATS: StatCard[] = [
  { label: "Total Companies", value: "248",   icon: "🏢", change: "12%",  changeType: "up",   accent: "blue"   },
  { label: "Active Users",    value: "5,831", icon: "👥", change: "8.4%", changeType: "up",   accent: "green"  },
  { label: "Subscriptions",   value: "194",   icon: "💳", change: "3.1%", changeType: "up",   accent: "orange" },
  { label: "Audit Events",    value: "1,042", icon: "📋", change: "2%",   changeType: "down", accent: "red"    },
];

/* ── Page component ───────────────────────────────────────────── */
export default function DashboardPage() {
  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "28px 28px 40px",
        fontFamily: "'DM Sans', sans-serif",
        background: "#0a0c10",
        minHeight: "100%",
      }}
    >
      {/* ── Page Header ──────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "1.3rem",
              color: "#e8eaf0",
              margin: 0,
            }}
          >
            Super Admin Dashboard
          </h1>
          <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "4px 0 0" }}>
            Overview of all companies, users &amp; activity
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <OutlineButton label="📤 Export" />
          <PrimaryButton label="+ Add Company" />
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────── */}
      <StatCards stats={STATS} />

      {/* ── Mid Row: Company Overview + Subscription ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: "18px",
          marginBottom: "28px",
        }}
      >
        <CompanyOverview />
        <SubscriptionStatus />
      </div>

      {/* ── Bottom Row: User Mgmt + Audit Logs ──── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "18px",
        }}
      >
        <UserManagement />
        <AuditLogs />
      </div>
    </div>
  );
}

/* ── Small reusable buttons ───────────────────────────────────── */
function OutlineButton({ label }: { label: string }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        padding: "8px 18px",
        borderRadius: "8px",
        fontSize: "0.82rem",
        fontWeight: 700,
        cursor: "pointer",
        border: `1px solid ${hovered ? "#4f8ef7" : "#1f2535"}`,
        background: "transparent",
        color: hovered ? "#4f8ef7" : "#6b7280",
        fontFamily: "'DM Sans', sans-serif",
        transition: "all 0.18s",
      }}
    >
      {label}
    </button>
  );
}

function PrimaryButton({ label }: { label: string }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        padding: "8px 18px",
        borderRadius: "8px",
        fontSize: "0.82rem",
        fontWeight: 700,
        cursor: "pointer",
        border: "none",
        background: hovered ? "#3a7de8" : "#4f8ef7",
        color: "#fff",
        fontFamily: "'DM Sans', sans-serif",
        transition: "background 0.18s",
      }}
    >
      {label}
    </button>
  );
}
