"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme, tokens } from "../../../context/ThemeContext";
import { StatCard } from "../../../types";
import axios from "axios";
import { axiosInstance } from "@/lib/axiosInstance";
import CompanyOverview from "../../../components/CompanyOverview";
import UserManagement from "../../../components/UserManagement";
import PlatformGrowthChart from "../../../components/PlatformGrowthChart";
import AuditLogs from "../../../components/AuditLogs";

const DASHBOARD_API =
  "https://hostapi.soft7.in/v1/admin/companies/dashboard";
const BRAND = "#10b981";
const BRAND_HOVER = "#059669";
const BRAND_SOFT = "rgba(16, 22, 185, 0.16)";
const BRAND_GLOW = "rgba(16,185,129,0.32)";
const getExternalHeaders = () => {
  let token =
    typeof window !== "undefined"
      ? localStorage.getItem("console_access_token")
      : null;

  if (token && token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
  }

  return {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const DEFAULT_STATS: StatCard[] = [
  {
    icon: "📢",
    label: "Campaigns",
    value: "0",
    change: "—",
    changeType: "up",
    accent: "blue",
  },
  {
    icon: "👥",
    label: "Users",
    value: "0",
    change: "—",
    changeType: "up",
    accent: "green",
  },
  {
    icon: "🤖",
    label: "Chatbots",
    value: "0",
    change: "—",
    changeType: "up",
    accent: "purple",
  },
  {
    icon: "💬",
    label: "Messages",
    value: "0",
    change: "—",
    changeType: "up",
    accent: "orange",
  },
];

interface DashboardCompany {
  id: string; name: string; ini: string; col: string;
  status: string; plan: string; users: number;
}
interface DashboardUser {
  id: string; un: string; role: string; status: string; av: string; col: string;
}
interface DashboardLog {
  id: string; msg: string; actor: string; time: string; sev: string;
}

function useWindowWidth() {
  const [width, setWidth] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return width;
}

/* ─── Stat Meta ───────────────────────────────────────────── */
const STAT_META = [
  { icon: "📢", label: "Campaigns", accent: "#0d9488", glow: "rgba(13,148,136,0.18)" },
  { icon: "👥", label: "Users",     accent: "#6366f1", glow: "rgba(99,102,241,0.18)" },
  { icon: "🤖", label: "Chatbots",  accent: "#f59e0b", glow: "rgba(245,158,11,0.18)" },
  { icon: "💬", label: "Messages",  accent: "#34d399", glow: "rgba(52,211,153,0.18)" },
];

/* ─── Inline StatCards ────────────────────────────────────── */
function InlineStatCards({
  stats,
  isDark,
  isMobile,
}: {
  stats: StatCard[];
  isDark: boolean;
  isMobile: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
        gap: "16px",
        marginBottom: "28px",
      }}
    >
      {stats.map((s, i) => {
        const meta = STAT_META[i] ?? STAT_META[0];
        return (
          <div
            key={s.label}
            style={{
              background: isDark ? "rgba(15,17,32,0.9)" : "#ffffff",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
              borderRadius: "14px",
              padding: "20px 22px",
              position: "relative",
              overflow: "hidden",
              transition: "box-shadow 0.2s, transform 0.2s",
              boxShadow: isDark
                ? "0 2px 8px rgba(0,0,0,0.25)"
                : "0 1px 6px rgba(0,0,0,0.06)",
            }}
          >
            {/* Soft orb */}
            <div
              style={{
                position: "absolute", top: -10, right: -10,
                width: 64, height: 64, borderRadius: "50%",
                background: meta.glow, pointerEvents: "none",
              }}
            />
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", marginBottom: "14px",
            }}>
              <span style={{
                fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em",
                color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
                textTransform: "uppercase",
              }}>
                {meta.label}
              </span>
              <div style={{
                width: "32px", height: "32px", borderRadius: "9px",
                background: `${meta.accent}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "15px",
              }}>
                {meta.icon}
              </div>
            </div>
            <div style={{
              fontSize: "30px", fontWeight: 800,
              color: isDark ? "#f1f5f9" : "#0f172a",
              letterSpacing: "-0.03em", lineHeight: 1,
              marginBottom: "6px",
            }}>
              {s.value}
            </div>
            <div style={{
              height: "2px", width: "36px",
              borderRadius: "2px",
              background: meta.accent,
              opacity: 0.7,
            }} />
          </div>
        );
      })}
    </div>
  );
}

/* ─── Section wrapper ─────────────────────────────────────── */
function Section({
  children,
  isDark,
  isMobile,
}: {
  children: React.ReactNode;
  isDark: boolean;
  isMobile: boolean;
}) {
  return (
    <div
      style={{
        background: isDark ? "rgba(15,17,32,0.85)" : "#ffffff",
        border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.07)"}`,
        borderRadius: "16px",
        padding: isMobile ? "20px" : "26px 28px",
        boxShadow: isDark
          ? "0 2px 10px rgba(0,0,0,0.22)"
          : "0 1px 8px rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </div>
  );
}

/* ─── Dashboard Page ──────────────────────────────────────── */
export default function DashboardPage() {
  const { isDark } = useTheme();
  const t = useMemo(() => (isDark ? tokens.dark : tokens.light), [isDark]);
  const router = useRouter();
  const width = useWindowWidth();
  const isMobile     = width <= 768;
  const isHalfScreen = width <= 1100;

  const [stats, setStats]           = useState<StatCard[]>(DEFAULT_STATS);
  const [companies, setCompanies]   = useState<DashboardCompany[]>([]);
  const [users, setUsers]           = useState<DashboardUser[]>([]);
  const [logs, setLogs]             = useState<DashboardLog[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: apiResponse } = await axiosInstance.get(DASHBOARD_API, {
          headers: getExternalHeaders(),
          withCredentials: false,
        });
        if (!mounted) return;
        const data = apiResponse?.data ?? apiResponse;

        setStats([
          { label: "Campaigns", value: Number(data.campaigns_count ?? 0).toLocaleString(), icon: "📢", change: "—", changeType: "up", accent: "blue" },
          { label: "Users",     value: Number(data.users_count ?? 0).toLocaleString(),     icon: "👥", change: "—", changeType: "up", accent: "green" },
          { label: "Chatbots",  value: Number(data.chatbot_count ?? 0).toLocaleString(),   icon: "🤖", change: "—", changeType: "up", accent: "purple" },
          { label: "Messages",  value: Number(data.total_messages ?? 0).toLocaleString(),  icon: "💬", change: "—", changeType: "up", accent: "orange" },
        ]);

        setCompanies([
          { id:"1", name:"Acme Corp",   ini:"AC", col:"#10b981", status:"Active", plan:"Enterprise", users:248 },
          { id:"2", name:"Nova Labs",   ini:"NL", col:"#34d399", status:"Active", plan:"Basic",      users:132 },
          { id:"3", name:"Vertex AI",   ini:"VA", col:"#059669", status:"Active", plan:"Free Trial", users:54  },
          { id:"4", name:"Pulse Media", ini:"PM", col:"#10b981", status:"Active", plan:"Enterprise", users:89  },
        ]);

        setUsers([
          { id:"1", un:"Sarah Johnson", role:"Admin", status:"Active", av:"SJ", col:"#10b981" },
          { id:"2", un:"Michael Chen",  role:"User",  status:"Active", av:"MC", col:"#34d399" },
          { id:"3", un:"Emily Davis",   role:"Admin", status:"Active", av:"ED", col:"#059669" },
          { id:"4", un:"James Wilson",  role:"User",  status:"Active", av:"JW", col:"#0d9488" },
        ]);

        setLogs([
          { id:"1", msg:"New campaign launched successfully",          actor:"Sarah Johnson",     time:"2 mins ago",  sev:"info"    },
          { id:"2", msg:"Company subscription upgraded to Enterprise", actor:"Michael Chen",      time:"18 mins ago", sev:"success" },
          { id:"3", msg:"User access permissions updated",             actor:"Emily Davis",       time:"1 hour ago",  sev:"warning" },
          { id:"4", msg:"Monthly analytics report generated",         actor:"System",            time:"3 hours ago", sev:"info"    },
          { id:"5", msg:"API usage threshold reached",                actor:"Monitoring Service",time:"5 hours ago", sev:"warning" },
        ]);
      } catch (err) {
        if (!mounted) return;
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || err.message || "Failed to load dashboard.");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load dashboard.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadDashboard();
    return () => { mounted = false; };
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
    <div
      style={{
        padding: isMobile ? "24px" : "36px 38px 56px",
        background: t.bg,
        minHeight: "100%",
        transition: "background 0.3s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: "18px",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1
            style={{
              fontWeight: 800,
              fontSize: isMobile ? "1.75rem" : "2rem",
              color: t.text,
              margin: 0,
              letterSpacing: "-0.025em",
              transition: "color 0.3s",
            }}
          >
            Dashboard Overview
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: isDark ? t.textMuted : "#64748b",
              margin: "7px 0 0",
              transition: "color 0.3s",
            }}
          >
            Welcome back! Here&apos;s what&apos;s happening with your platform.
          </p>
        </div>

        <DashboardButton
          label="Add Company"
          onClick={() => router.push("/user/dashboard/create")}
          isDark={isDark}
        />
      </div>

      {/* Stats */}
      <InlineStatCards stats={stats} isDark={isDark} isMobile={isMobile} />

      {error && (
        <div
          style={{
            marginBottom: "18px", padding: "12px 16px",
            borderRadius: "10px",
            border: "1px solid rgba(179, 68, 239, 0.25)",
            background: isDark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.05)",
            color: "#ef4444", fontSize: "0.85rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Row 2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <Section isDark={isDark} isMobile={isMobile}>
          <CompanyOverview companies={companies} loading={loading} error={error} />
        </Section>
        <Section isDark={isDark} isMobile={isMobile}>
          <UserManagement users={users} loading={loading} error={error} />
        </Section>
      </div>

      {/* Row 3 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "20px",
        }}
      >
        
       <Section isDark={isDark} isMobile={isMobile}>
  <div
    style={{
      marginBottom: "18px",
    }}
  >
    <h2
      style={{
        margin: 0,
        fontSize: "1rem",
        fontWeight: 700,
        color: t.text,
        letterSpacing: "-0.02em",
      }}
    >
      Platform Growth
    </h2>

    <p
      style={{
        margin: "4px 0 0",
        fontSize: "0.85rem",
        color: isDark ? t.textMuted : "#64748b",
      }}
    >
      Monthly platform activity and engagement overview
    </p>
  </div>

  <PlatformGrowthChart />
</Section>
        <Section isDark={isDark} isMobile={isMobile}>
          <AuditLogs logs={logs} loading={loading} error={error} />
        </Section>
      </div>
    </div>
  );
}

/* ─── Dashboard Button ────────────────────────────────────── */
function DashboardButton({
  label,
  onClick,
  isDark,
}: {
  label: string;
  onClick?: () => void;
  isDark: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: "8px",
        padding: "11px 22px",
        borderRadius: "10px",
        fontSize: "0.9rem", fontWeight: 700,
        cursor: "pointer",
        border: `1px solid ${BRAND}`,
        background: hovered ? BRAND_HOVER : BRAND,
        color: "#fff",
       boxShadow: hovered
        ? "0 8px 24px rgba(16,185,129,0.38)"
        : "0 4px 14px rgba(16,185,129,0.24)",
        transition: "all 0.15s ease",
        fontFamily: "'Inter', sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      + {label}
    </button>
  );
}