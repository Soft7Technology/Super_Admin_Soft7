"use client";
import React, { useState } from "react";
import { useTheme, tokens } from "../../../context/ThemeContext";
import { StatCard } from "../../../types";

/* ── inline components to keep file self-contained ── */
import StatCards from "../../../components/StatCards";
import CompanyOverview from "../../../components/CompanyOverview";
import UserManagement from "../../../components/UserManagement";
import SubscriptionChart from "../../../components/SubscriptionChart";
import AuditLogs from "../../../components/AuditLogs";

const STATS: StatCard[] = [
  { label:"Total Companies", value:"248",   icon:"🏢", change:"12%",  changeType:"up",   accent:"blue"   },
  { label:"Active User",     value:"5,831", icon:"👥", change:"8.4%", changeType:"up",   accent:"green"  },
  { label:"Subscription",    value:"194",   icon:"💳", change:"3.1%", changeType:"up",   accent:"purple" },
  { label:"Audit Logs",      value:"1,042", icon:"📋", change:"2%",   changeType:"down", accent:"orange" },
];

export default function DashboardPage() {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;

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
          <Btn variant="outline" label="📤 Export" />
          <Btn variant="primary" label="+ Add Company" />
        </div>
      </div>

      {/* Stats */}
      <StatCards stats={STATS} />

      {/* Row 2 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"18px", marginBottom:"18px" }}>
        <CompanyOverview />
        <UserManagement />
      </div>

      {/* Row 3 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"18px" }}>
        <SubscriptionChart />
        <AuditLogs />
      </div>
    </div>
  );
}

function Btn({ variant, label }: { variant:"outline"|"primary"; label:string }) {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const [hov, setHov] = useState(false);
  if (variant === "primary") return (
    <button onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"inline-flex", alignItems:"center", gap:"7px", padding:"9px 20px", borderRadius:"9px", fontSize:"0.875rem", fontWeight:600, cursor:"pointer", border:"none", background: hov?"linear-gradient(135deg,#2f4dc7,#5a35c0)":"linear-gradient(135deg,#3b5bdb,#6741d9)", color:"#fff", boxShadow: hov?"0 4px 20px rgba(59,91,219,0.4)":"0 2px 8px rgba(59,91,219,0.2)", transition:"all 0.15s", fontFamily:"inherit" }}>
      {label}
    </button>
  );
  return (
    <button onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"inline-flex", alignItems:"center", gap:"7px", padding:"9px 20px", borderRadius:"9px", fontSize:"0.875rem", fontWeight:600, cursor:"pointer", border:`1px solid ${hov?t.accent:t.border}`, background: hov?t.accentBg:"transparent", color: hov?t.accent:t.textMuted, transition:"all 0.15s", fontFamily:"inherit" }}>
      {label}
    </button>
  );
}
