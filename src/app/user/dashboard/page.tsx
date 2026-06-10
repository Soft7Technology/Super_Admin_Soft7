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
  { label: "Campaigns", value: "—", icon: "📢", change: "—", changeType: "up", accent: "blue" },
  { label: "Users",     value: "—", icon: "👥", change: "—", changeType: "up", accent: "green" },
  { label: "Chatbots",  value: "—", icon: "🤖", change: "—", changeType: "up", accent: "purple" },
  { label: "Messages",  value: "—", icon: "💬", change: "—", changeType: "up", accent: "orange" },
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
  { icon: "💬", label: "Messages",  accent: "#10b981", glow: "rgba(16,185,129,0.18)" },
];

/* ─── Inline StatCards ────────────────────────────────────── */
function InlineStatCards({
  stats,
  isDark,
  isMobile,
  width,
}: {
  stats: StatCard[];
  isDark: boolean;
  isMobile: boolean;
  width: number;
}) {
  const isSmall  = width <= 1000;
  const isMedium = width <= 1300;

  // Responsive sizes
  const labelSize  = isSmall ? "9px"  : isMedium ? "10px" : "11px";
  const valueSize  = isSmall ? "20px" : isMedium ? "24px" : "30px";
  const iconBoxSize = isSmall ? 26     : isMedium ? 28    : 32;
  const iconFontSize = isSmall ? "12px" : isMedium ? "13px" : "15px";
  const cardPad    = isSmall ? "14px 16px" : isMedium ? "16px 18px" : "20px 22px";
  const orbSize    = isSmall ? 48 : isMedium ? 56 : 64;
  const accentBar  = isSmall ? "28px" : isMedium ? "32px" : "36px";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
        gap: isSmall ? "10px" : isMedium ? "12px" : "16px",
        marginBottom: isSmall ? "20px" : isMedium ? "24px" : "28px",
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
              borderRadius: isSmall ? "10px" : "14px",
              padding: cardPad,
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
                width: orbSize, height: orbSize, borderRadius: "50%",
                background: meta.glow, pointerEvents: "none",
              }}
            />
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", marginBottom: isSmall ? "10px" : isMedium ? "12px" : "14px",
            }}>
              <span style={{
                fontSize: labelSize, fontWeight: 600, letterSpacing: "0.04em",
                color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
                textTransform: "uppercase",
              }}>
                {meta.label}
              </span>
              <div style={{
                width: `${iconBoxSize}px`, height: `${iconBoxSize}px`, borderRadius: "9px",
                background: `${meta.accent}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: iconFontSize,
              }}>
                {meta.icon}
              </div>
            </div>
            <div style={{
              fontSize: valueSize, fontWeight: 800,
              color: isDark ? "#f1f5f9" : "#0f172a",
              letterSpacing: "-0.03em", lineHeight: 1,
              marginBottom: "6px",
            }}>
              {s.value}
            </div>
            <div style={{
              height: "2px", width: accentBar,
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
  width,
}: {
  children: React.ReactNode;
  isDark: boolean;
  isMobile: boolean;
  width: number;
}) {
  const isSmall  = width <= 1000;
  const isMedium = width <= 1300;
  const pad = isMobile ? "14px" : isSmall ? "16px 18px" : isMedium ? "20px 22px" : "26px 28px";

  return (
    <div
      style={{
        background: isDark ? "rgba(15,17,32,0.85)" : "#ffffff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
        borderRadius: isSmall ? "12px" : "16px",
        padding: pad,
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
  const isSmall      = width <= 1000;
  const isMedium     = width <= 1300;
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
          { id:"1", name:"Acme Corp",   ini:"AC", col:"#0d9488", status:"Active", plan:"Enterprise", users:248 },
          { id:"2", name:"Nova Labs",   ini:"NL", col:"#14b8a6", status:"Active", plan:"Basic",      users:132 },
          { id:"3", name:"Vertex AI",   ini:"VA", col:"#059669", status:"Active", plan:"Free Trial", users:54  },
          { id:"4", name:"Pulse Media", ini:"PM", col:"#0d9488", status:"Active", plan:"Enterprise", users:89  },
        ]);

        setUsers([
          { id:"1", un:"Sarah Johnson", role:"Admin", status:"Active", av:"SJ", col:"#0d9488" },
          { id:"2", un:"Michael Chen",  role:"User",  status:"Active", av:"MC", col:"#14b8a6" },
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
        padding: isMobile ? "16px" : isSmall ? "24px 22px 36px" : isMedium ? "28px 30px 44px" : "36px 38px 56px",
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
          gap: isSmall ? "12px" : "18px",
          marginBottom: isSmall ? "20px" : isMedium ? "24px" : "30px",
        }}
      >
        <div>
          <h1
            style={{
              fontWeight: 800,
              fontSize: isMobile ? "1.35rem" : isSmall ? "1.45rem" : isMedium ? "1.65rem" : "2rem",
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
              fontSize: isSmall ? "0.8rem" : isMedium ? "0.85rem" : "0.95rem",
              color: isDark ? t.textMuted : "#64748b",
              margin: isSmall ? "4px 0 0" : "7px 0 0",
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
          width={width}
        />
      </div>

      {/* Stats */}
      <InlineStatCards stats={stats} isDark={isDark} isMobile={isMobile} width={width} />

      {error && (
        <div
          style={{
            marginBottom: "18px", padding: "12px 16px",
            borderRadius: "10px",
            border: "1px solid rgba(239,68,68,0.25)",
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
          gridTemplateColumns: isHalfScreen ? "1fr" : "1fr 1fr",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <Section isDark={isDark} isMobile={isMobile} width={width}>
          <CompanyOverview companies={companies} loading={loading} error={error} />
        </Section>
        <Section isDark={isDark} isMobile={isMobile} width={width}>
          <UserManagement users={users} loading={loading} error={error} />
        </Section>
      </div>

      {/* Row 3 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isSmall ? "1fr" : "1fr 1fr",
          gap: "20px",
        }}
      >
        
       <Section isDark={isDark} isMobile={isMobile} width={width}>
  <div
    style={{
      marginBottom: isSmall ? "12px" : isMedium ? "14px" : "18px",
    }}
  >
    <h2
      style={{
        margin: 0,
        fontSize: isSmall ? "0.85rem" : isMedium ? "0.92rem" : "1rem",
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
        fontSize: isSmall ? "0.75rem" : isMedium ? "0.8rem" : "0.85rem",
        color: isDark ? t.textMuted : "#64748b",
      }}
    >
      Monthly platform activity and engagement overview
    </p>
  </div>

  <PlatformGrowthChart />
</Section>
        <Section isDark={isDark} isMobile={isMobile} width={width}>
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
  width = 1400,
}: {
  label: string;
  onClick?: () => void;
  isDark: boolean;
  width?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const isSmall  = width <= 1000;
  const isMedium = width <= 1300;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: isSmall ? "6px" : "8px",
        padding: isSmall ? "8px 16px" : isMedium ? "9px 18px" : "11px 22px",
        borderRadius: isSmall ? "8px" : "10px",
        fontSize: isSmall ? "0.78rem" : isMedium ? "0.82rem" : "0.9rem",
        fontWeight: 700,
        cursor: "pointer",
        border: "1px solid #0d9488",
        background: hovered ? "#0b7a70" : "#0d9488",
        color: "#fff",
        boxShadow: hovered
          ? "0 6px 20px rgba(13,148,136,0.40)"
          : "0 3px 12px rgba(13,148,136,0.28)",
        transition: "all 0.15s ease",
        fontFamily: "'Inter', sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      + {label}
    </button>
  );
}