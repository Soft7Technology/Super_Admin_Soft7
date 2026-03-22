"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme, tokens } from "../../../context/ThemeContext";
import { StatCard } from "../../../types";

import StatCards from "../../../components/StatCards";
import CompanyOverview from "../../../components/CompanyOverview";
import UserManagement from "../../../components/UserManagement";
import SubscriptionChart from "../../../components/SubscriptionChart";
import AuditLogs from "../../../components/AuditLogs";

const DEFAULT_STATS: StatCard[] = [
  { label:"Total Companies", value:"—", icon:"🏢", change:"—", changeType:"up",   accent:"blue"   },
  { label:"Active Users",    value:"—", icon:"👥", change:"—", changeType:"up",   accent:"green"  },
  { label:"Subscriptions",   value:"—", icon:"💳", change:"—", changeType:"up",   accent:"purple" },
  { label:"Support Tickets", value:"—", icon:"📋", change:"—", changeType:"down", accent:"orange" },
];

interface DashboardCompany {
  id: string;
  name: string;
  ini: string;
  col: string;
  status: string;
  plan: string;
  users: number;
}

interface DashboardUser {
  id: string;
  un: string;
  role: string;
  status: string;
  av: string;
  col: string;
}

interface DashboardLog {
  id: string;
  msg: string;
  actor: string;
  time: string;
  sev: string;
}

export default function DashboardPage() {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const router = useRouter();
  const [stats, setStats] = useState<StatCard[]>(DEFAULT_STATS);
  const [companies, setCompanies] = useState<DashboardCompany[]>([]);
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [logs, setLogs] = useState<DashboardLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setError(data.error ?? null);
        setStats([
          {
            label: "Total Companies",
            value: Number(data.totalCompanies ?? 0).toLocaleString(),
            icon: "🏢",
            change: data.companyChange ?? "—",
            changeType: "up",
            accent: "blue",
          },
          {
            label: "Active Users",
            value: Number(data.activeUsers ?? 0).toLocaleString(),
            icon: "👥",
            change: data.userChange ?? "—",
            changeType: "up",
            accent: "green",
          },
          {
            label: "Subscriptions",
            value: Number(data.activeSubscriptions ?? 0).toLocaleString(),
            icon: "💳",
            change: "—",
            changeType: "up",
            accent: "purple",
          },
          {
            label: "Support Tickets",
            value: Number(data.auditLogCount ?? 0).toLocaleString(),
            icon: "📋",
            change: "—",
            changeType: "down",
            accent: "orange",
          },
        ]);
        setCompanies(data.companies ?? []);
        setUsers(data.users ?? []);
        setLogs(data.logs ?? []);
      })
      .catch(() => {
        setError("Failed to load dashboard data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleStatCardClick = (stat: StatCard) => {
    if (stat.label === "Total Companies") {
      router.push("/user/dashboard/companies");
      return;
    }

    if (stat.label === "Active Users") {
      router.push("/user/dashboard/users");
    }
  };

  return (
    <div style={{ padding:"28px 28px 48px", background:t.bg, minHeight:"100%", transition:"background 0.3s ease" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"28px" }}>
        <div>
          <h1 style={{ fontWeight:800, fontSize:"1.6rem", color:t.text, margin:0, letterSpacing:"-0.02em", transition:"color 0.3s" }}>
            Dashboard Overview
          </h1>
          <p style={{ fontSize:"0.875rem", color:t.textMuted, margin:"6px 0 0", transition:"color 0.3s" }}>
            Welcome back! Here&apos;s what&apos;s happening with your platform.
          </p>
        </div>
        <div style={{ display:"flex", gap:"10px", paddingTop:"4px" }}>
          <Btn
            variant="primary"
            label="Add Company Logo"
            onClick={() => router.push("/user/dashboard/create")}
          />
        </div>
      </div>

      {/* Stats */}
      <StatCards
        stats={stats}
        onCardClick={handleStatCardClick}
        isCardClickable={(stat) => stat.label === "Total Companies" || stat.label === "Active Users"}
      />

      {error && (
        <div style={{ marginBottom:"18px", padding:"12px 14px", borderRadius:"10px", border:`1px solid ${t.border}`, background:t.surface, color:t.textMuted, fontSize:"0.85rem" }}>
          {error}
        </div>
      )}

      {/* Row 2 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"18px", marginBottom:"18px" }}>
        <CompanyOverview companies={companies} loading={loading} error={error} />
        <UserManagement users={users} loading={loading} error={error} />
      </div>

      {/* Row 3 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"18px" }}>
        <SubscriptionChart />
        <AuditLogs logs={logs} loading={loading} error={error} />
      </div>
    </div>
  );
}

function Btn({
  variant,
  label,
  onClick
}: {
  variant: "outline" | "primary";
  label: string;
  onClick?: () => void;
}) {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const [hov, setHov] = useState(false);
  if (variant === "primary") return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display:"inline-flex", alignItems:"center", gap:"7px", padding:"9px 20px", borderRadius:"9px", fontSize:"0.875rem", fontWeight:600, cursor:"pointer", border:"none", background: hov?"linear-gradient(135deg,#2f4dc7,#5a35c0)":"linear-gradient(135deg,#3b5bdb,#6741d9)", color:"#fff", boxShadow: hov?"0 4px 20px rgba(59,91,219,0.4)":"0 2px 8px rgba(59,91,219,0.2)", transition:"all 0.15s", fontFamily:"inherit" }}>
      {label}
    </button>
  );
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display:"inline-flex", alignItems:"center", gap:"7px", padding:"9px 20px", borderRadius:"9px", fontSize:"0.875rem", fontWeight:600, cursor:"pointer", border:`1px solid ${hov?t.accent:t.border}`, background: hov?t.accentBg:"transparent", color: hov?t.accent:t.textMuted, transition:"all 0.15s", fontFamily:"inherit" }}>
      {label}
    </button>
  );
}
