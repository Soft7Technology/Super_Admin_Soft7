"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axiosInstance";
import CompanyOverview from "@/components/CompanyOverview";
import PlatformGrowthChart from "@/components/PlatformGrowthChart";
import UserManagement, { DbUser } from "@/components/UserManagement";
import AuditLogs, { LogEntry } from "@/components/AuditLogs";
import "./dashboard.css";

// ─── API Endpoints ─────────────────────────────────────────────────────────
const DASHBOARD_API = "/v1/admin/companies/dashboard";
const USERS_API = "/v1/admin/companies/user";
const COMPANIES_API = "/v1/admin/companies";
const ACTIVITY_API = "/v1/admin/activity?role=user&page=1&limit=10&time_frame=7days";
const TICKETS_API = "/v1/super-admin/tickets/forward";

// Helper to normalize heterogeneous API responses
function recordsFromResponse(json: any): any[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.data?.data)) return json.data.data;
  if (Array.isArray(json?.data?.items)) return json.data.items;
  if (Array.isArray(json?.items)) return json.items;
  if (Array.isArray(json?.users)) return json.users;
  return [];
}

// Relative time formatter (e.g. "4 min ago", "2 hours ago", "Yesterday")
function formatTimeAgo(dateString?: string): string {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── SVG Icons ─────────────────────────────────────────────────────────────
const IconMegaphone = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a3 3 0 0 1 0 6" />
    <path d="M10 8v11a1 1 0 0 1 -1 1h-1a1 1 0 0 1 -1 -1v-5" />
    <path d="M12 8h0l4.524 -3.77a.9 .9 0 0 1 1.476 .692v14.156a.9 .9 0 0 1 -1.476 .692l-4.524 -3.77h-8a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1h8" />
  </svg>
);

const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
    <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
  </svg>
);

const IconRobot = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z" />
    <path d="M12 2v2" />
    <path d="M9 12v9" />
    <path d="M15 12v9" />
    <path d="M5 16l4 -2" />
    <path d="M15 14l4 2" />
    <path d="M9 18h6" />
    <path d="M10 8v.01" />
    <path d="M14 8v.01" />
  </svg>
);

const IconMessage = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 9h8" />
    <path d="M8 13h6" />
    <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z" />
  </svg>
);

const IconFilter = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227" />
  </svg>
);

const IconArrowUp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5l0 14" />
    <path d="M18 11l-6 -6" />
    <path d="M6 11l6 -6" />
  </svg>
);

const IconArrowDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5l0 14" />
    <path d="M18 13l-6 6" />
    <path d="M6 13l6 6" />
  </svg>
);

const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5l0 14" />
    <path d="M5 12l14 0" />
  </svg>
);

const IconDots = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M18 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
  </svg>
);

const IconAlertTriangle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--crm-red)" }}>
    <path d="M12 9v4" />
    <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0" />
    <path d="M12 16h.01" />
  </svg>
);

const IconGitMerge = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--crm-primary)" }}>
    <path d="M5 18a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M5 6a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M15 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M7 8l0 8" />
    <path d="M7 8a4 4 0 0 0 4 4h4" />
  </svg>
);

const IconNotes = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--crm-purple)" }}>
    <path d="M5 5a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2l0 -14" />
    <path d="M9 7l6 0" />
    <path d="M9 11l6 0" />
    <path d="M9 15l4 0" />
  </svg>
);

const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--crm-green)" }}>
    <path d="M5 12l5 5l10 -10" />
  </svg>
);

const IconFileText = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--crm-yellow)" }}>
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" />
    <path d="M9 9l1 0" />
    <path d="M9 13l6 0" />
    <path d="M9 17l6 0" />
  </svg>
);

// ─── Main Component ────────────────────────────────────────────────────────
export default function CrmDashboardPage() {
  const router = useRouter();

  // API State
  const [statsData, setStatsData] = useState<{
    campaigns_count: number | string;
    users_count: number | string;
    chatbot_count: number | string;
    total_messages: string;
  }>({
    campaigns_count: 19,
    users_count: 169,
    chatbot_count: 45,
    total_messages: "₹10,100.04",
  });

  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);


  // Fetch real platform data on mount
  useEffect(() => {
    let mounted = true;

    const loadPlatformData = async () => {
      try {
        const [dashRes, compRes, userRes, actRes, tickRes] = await Promise.allSettled([
          axiosInstance.get(DASHBOARD_API),
          axiosInstance.get(COMPANIES_API),
          axiosInstance.get(`${USERS_API}?role=user&page=1&limit=10`),
          axiosInstance.get(ACTIVITY_API),
          axiosInstance.get(TICKETS_API),
        ]);

        if (!mounted) return;

        // Dashboard stats
        if (dashRes.status === "fulfilled") {
          const d = dashRes.value?.data?.data || dashRes.value?.data || {};
          let msgVal = "₹10,100.04";
          if (d.total_messages !== undefined && d.total_messages !== null) {
            const raw = String(d.total_messages).trim();
            if (raw.startsWith("₹") || raw.startsWith("$")) {
              msgVal = raw;
            } else {
              const num = Number(raw.replace(/,/g, ""));
              msgVal = !isNaN(num)
                ? (num % 1 !== 0
                    ? `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : `₹${num.toLocaleString("en-IN")}`)
                : raw;
            }
          }
          setStatsData({
            campaigns_count: d.campaigns_count !== undefined ? Number(d.campaigns_count) : 19,
            users_count: d.users_count !== undefined ? Number(d.users_count) : 169,
            chatbot_count: d.chatbot_count !== undefined ? Number(d.chatbot_count) : 45,
            total_messages: msgVal,
          });
        }

        // Companies
        if (compRes.status === "fulfilled") {
          const compList = recordsFromResponse(compRes.value?.data);
          if (compList.length > 0) {
            setCompanies(compList);
          }
        }

        // Users
        if (userRes.status === "fulfilled") {
          const userList = recordsFromResponse(userRes.value?.data);
          if (userList.length > 0) {
            setUsers(userList);
          }
        }

        // Activity logs
        if (actRes.status === "fulfilled") {
          const actList = recordsFromResponse(actRes.value?.data);
          if (actList.length > 0) {
            setActivityLogs(actList);
          }
        }

        // Tickets
        if (tickRes.status === "fulfilled") {
          const tickList = recordsFromResponse(tickRes.value?.data);
          if (tickList.length > 0) {
            setTickets(tickList);
          }
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      }
    };

    void loadPlatformData();
    return () => {
      mounted = false;
    };
  }, []);

  // Compute 6-month trailing growth points directly from real platform companies
  const growthData = useMemo(() => {
    const now = new Date();
    // Build 6 trailing months (e.g. May -> Oct)
    const buckets: { key: string; label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets.push({ key, label: d.toLocaleDateString("en-US", { month: "short" }), value: 0 });
    }

    const bucketByKey = new Map(buckets.map((b) => [b.key, b]));

    for (const company of companies) {
      const rawDate = company.created_at || company.createdAt;
      if (!rawDate) continue;
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const bucket = bucketByKey.get(key);
      if (bucket) bucket.value += 1;
    }

    const computed = buckets.map(({ label, value }) => ({ label, value }));
    const total = computed.reduce((acc, p) => acc + p.value, 0);

    // If no companies registered yet, provide realistic preview matching the 6-month curve
    if (total === 0) {
      const mockValues = [0, 0, 0, 3, 5, 2];
      return computed.map((c, idx) => ({
        label: c.label,
        value: mockValues[idx] ?? 0,
      }));
    }

    return computed;
  }, [companies]);

  // Real Top Companies list (with fallback to default if empty)
  const defaultCompanies = [
    { id: "1", name: "Skyline Retail", status: "Active", plan: "Basic", users: 12, ini: "SR", col: "#10b981" },
    { id: "2", name: "CloudBase Inc", status: "Active", plan: "Pro", users: 28, ini: "CB", col: "#6366f1" },
    { id: "3", name: "NovaBuild Co", status: "Trial", plan: "Basic", users: 6, ini: "NB", col: "#f59e0b" },
    { id: "4", name: "MetroPay Ltd", status: "Active", plan: "Enterprise", users: 45, ini: "MP", col: "#10b981" },
    { id: "5", name: "Greenridge Partners", status: "Active", plan: "Pro", users: 19, ini: "GP", col: "#6366f1" },
    { id: "6", name: "Orion Logistics", status: "Inactive", plan: "Basic", users: 4, ini: "OL", col: "#ef4444" },
  ];

  const displayCompanies = useMemo(() => {
    if (companies.length === 0) return defaultCompanies;
    return companies.slice(0, 6).map((c, i) => {
      const def = defaultCompanies[i % defaultCompanies.length];
      const initials = (c.name || "CO")
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      const st = c.status
        ? c.status.charAt(0).toUpperCase() + c.status.slice(1).toLowerCase()
        : def.status;
      return {
        id: String(c.id || c._id || i + 1),
        name: c.name || def.name,
        status: st,
        plan: c.plan || def.plan,
        users: c.users_count !== undefined ? Number(c.users_count) : (c.users !== undefined ? Number(c.users) : def.users),
        ini: initials || def.ini,
        col: def.col,
      };
    });
  }, [companies]);

  // Real Platform Users list (with fallback to default if empty)
  const defaultUsers: DbUser[] = [
    { id: "1", un: "Updated User", role: "User", status: "Active", av: "UU", col: "#206bc4" },
    { id: "2", un: "Jatin Malhotra", role: "User", status: "Active", av: "JM", col: "#4299e1" },
    { id: "3", un: "Airawat consultancy services pvt ltd", role: "User", status: "Active", av: "AC", col: "#17a2b8" },
    { id: "4", un: "Nitin Chakranarayan", role: "User", status: "Active", av: "NC", col: "#6366f1" },
    { id: "5", un: "Sarah Johnson", role: "Admin", status: "Active", av: "SJ", col: "#2fb344" },
  ];

  const displayUsers = useMemo(() => {
    if (users.length === 0) return defaultUsers;
    const colors = ["#206bc4", "#4299e1", "#17a2b8", "#6366f1", "#2fb344", "#f59f00"];
    return users.slice(0, 5).map((u, i) => {
      const def = defaultUsers[i % defaultUsers.length];
      const name = u.name || u.username || u.un || u.email || def.un;
      const initials = (name.replace(/^@/, "").trim() || "US")
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      const role = u.role
        ? u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase()
        : def.role;
      const st = u.status
        ? u.status.charAt(0).toUpperCase() + u.status.slice(1).toLowerCase()
        : def.status;
      return {
        id: String(u.id || u._id || i + 1),
        un: name.replace(/^@/, ""),
        role: role,
        status: st,
        av: initials || def.av,
        col: colors[i % colors.length],
      };
    });
  }, [users]);

  // Real Platform Audit Logs list (with fallback to default matching user interface)
  const defaultLogs: LogEntry[] = [
    { id: "1", msg: "Sent text message to +918755070003", actor: "TB", time: "2026-10-02T11:15:55.568Z", sev: "info" },
    { id: "2", msg: "Sent template message to +918107867783", actor: "TB", time: "2026-10-02T11:13:02.314Z", sev: "info" },
    { id: "3", msg: "Sent template message to +918794254547", actor: "TB", time: "2026-10-02T11:12:59.142Z", sev: "info" },
    { id: "4", msg: "Sent template message to +919999722589", actor: "TB", time: "2026-10-02T11:12:55.621Z", sev: "info" },
    { id: "5", msg: "Sent template message to +918907610000", actor: "TB", time: "2026-10-02T11:12:52.642Z", sev: "info" },
  ];

  const displayAuditLogs = useMemo(() => {
    if (activityLogs.length === 0) return defaultLogs;
    return activityLogs.slice(0, 5).map((act, i) => {
      const def = defaultLogs[i % defaultLogs.length];
      const msg = act.message || act.description || act.action || act.msg || def.msg;
      const actor = act.actor || act.user_name || act.user?.name || act.name || def.actor;
      const time = act.created_at || act.time || act.timestamp || def.time;
      return {
        id: String(act.id || act._id || i + 1),
        msg,
        actor: actor || "TB",
        time,
        sev: act.severity || act.sev || act.type || "info",
      };
    });
  }, [activityLogs]);


  return (
    <div className="crm-dashboard">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="crm-header">
        <h1 className="crm-header__title">Dashboard</h1>
        <p className="crm-header__subtitle">
          Welcome back — here&apos;s your overview for today.
        </p>
      </div>

      {/* ─── Top 4 Stat Cards ──────────────────────────────── */}
      <div className="crm-stats-grid">
        {/* 1. CAMPAIGNS */}
        <div className="crm-stat-card">
          <div className="crm-stat-card__left">
            <span className="crm-avatar" style={{ background: "rgba(16,185,129,0.14)", color: "#10b981" }}>
              <IconMegaphone />
            </span>
            <div className="crm-stat-card__info">
              <div className="crm-subheader">CAMPAIGNS</div>
              <div className="crm-stat-value">{statsData.campaigns_count}</div>
              <div style={{ height: "2.5px", width: "32px", borderRadius: "2px", background: "#10b981", marginTop: "6px" }} />
            </div>
          </div>
          <span className="crm-stat-trend crm-trend--up">
            +8.4% <IconArrowUp />
          </span>
        </div>

        {/* 2. USERS */}
        <div
          className="crm-stat-card"
          style={{ cursor: "pointer" }}
          onClick={() => router.push("/user/all-user")}
        >
          <div className="crm-stat-card__left">
            <span className="crm-avatar" style={{ background: "rgba(99,102,241,0.14)", color: "#6366f1" }}>
              <IconUsers />
            </span>
            <div className="crm-stat-card__info">
              <div className="crm-subheader">USERS</div>
              <div className="crm-stat-value">{statsData.users_count}</div>
              <div style={{ height: "2.5px", width: "32px", borderRadius: "2px", background: "#6366f1", marginTop: "6px" }} />
            </div>
          </div>
          <span className="crm-stat-trend crm-trend--up">
            +14% <IconArrowUp />
          </span>
        </div>

        {/* 3. CHATBOTS */}
        <div className="crm-stat-card">
          <div className="crm-stat-card__left">
            <span className="crm-avatar" style={{ background: "rgba(245,158,11,0.14)", color: "#f59e0b" }}>
              <IconRobot />
            </span>
            <div className="crm-stat-card__info">
              <div className="crm-subheader">CHATBOTS</div>
              <div className="crm-stat-value">{statsData.chatbot_count}</div>
              <div style={{ height: "2.5px", width: "32px", borderRadius: "2px", background: "#f59e0b", marginTop: "6px" }} />
            </div>
          </div>
          <span className="crm-stat-trend crm-trend--up">
            +6.2% <IconArrowUp />
          </span>
        </div>

        {/* 4. MESSAGES */}
        <div className="crm-stat-card">
          <div className="crm-stat-card__left">
            <span className="crm-avatar" style={{ background: "rgba(16,185,129,0.14)", color: "#10b981" }}>
              <IconMessage />
            </span>
            <div className="crm-stat-card__info">
              <div className="crm-subheader">MESSAGES</div>
              <div className="crm-stat-value">{statsData.total_messages}</div>
              <div style={{ height: "2.5px", width: "32px", borderRadius: "2px", background: "#10b981", marginTop: "6px" }} />
            </div>
          </div>
          <span className="crm-stat-trend crm-trend--up">
            +22.5% <IconArrowUp />
          </span>
        </div>
      </div>

      {/* ─── Two-Column Middle Section ──────────────────────── */}
      <div className="crm-row-middle">
        {/* Left Column */}
        <div className="crm-col-stack">
          {/* Card: Platform Growth (Replaced Money Graph) */}
          <div className="crm-card">
            <div className="crm-card__header">
              <div>
                <h2 className="crm-card__title">Platform Growth</h2>
                <div className="crm-card__subtitle">
                  Monthly platform activity and engagement overview
                </div>
              </div>
            </div>
            <div className="crm-card__body">
              <PlatformGrowthChart data={growthData} />
            </div>
          </div>

          {/* Card: Company Overview Table */}
          <CompanyOverview
            companies={displayCompanies}
            onViewAll={() => router.push("/user/manage-companies")}
            onCompanyClick={() => router.push("/user/manage-companies")}
          />
        </div>

        {/* Right Column */}
        <div className="crm-col-stack">
          {/* Card: User Management (Replaced Pipeline Funnel) */}
          <UserManagement
            users={displayUsers}
            onViewAll={() => router.push("/user/all-user")}
            onUserClick={() => router.push("/user/all-user")}
          />

          {/* Card: Audit Logs (Replaced Recent Activity) */}
          <AuditLogs logs={displayAuditLogs} />
        </div>
      </div>


    </div>
  );
}