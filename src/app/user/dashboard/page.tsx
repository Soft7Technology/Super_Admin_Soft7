﻿"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme, tokens } from "../../../context/ThemeContext";
import { StatCard } from "../../../types";
import { axiosInstance } from "@/lib/axiosInstance";
import CompanyOverview from "../../../components/CompanyOverview";
import UserManagement from "../../../components/UserManagement";
import PlatformGrowthChart from "../../../components/PlatformGrowthChart";
import AuditLogs from "../../../components/AuditLogs";

const DASHBOARD_API =
  "/v1/admin/companies/dashboard";
  const USERS_API =
  "/v1/admin/companies/user";
  const COMPANIES_API =
  "/v1/admin/companies?status=active";

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

// Type guard so we don't need to import the raw `axios` package just for
// isAxiosError — keeps axiosInstance as the single integration pattern.
function isAxiosErrorLike(err: unknown): err is { isAxiosError: true; response?: { data?: { message?: string } }; message?: string } {
  return typeof err === "object" && err !== null && (err as any).isAxiosError === true;
}

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

// Normalizes a variety of API response shapes into a flat array of records.
// Handles:
//   - bare arrays:                [ ... ]
//   - { data: [ ... ] }
//   - { data: { data: [ ... ] } }  <-- e.g. paginated /companies responses
//   - { users: [ ... ] }
function recordsFromResponse(json: any): any[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.data?.data)) return json.data.data;
  if (Array.isArray(json?.users)) return json.users;
  return [];
}

function useWindowWidth() {
  const [width, setWidth] = useState<number>(1024);

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
        gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
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
                fontSize: "13px", fontWeight: 600, letterSpacing: "0.04em",
                color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
                textTransform: "uppercase",
              }}>
                {meta.label}
              </span>
              <div style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: `${meta.accent}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
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
        minWidth: 0,
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
  const isHalfScreen = width <= 768;

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

        // ── Dashboard stats ──────────────────────────────────
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

        // ── Companies ─────────────────────────────────────────
        // API shape: { success, message, data: { data: [...], pagination } }
        // axiosInstance unwraps one level (`apiResponse.data`), so
        // `companiesResponse` here is `{ data: [...], pagination }`.
        // Use recordsFromResponse to safely drill into `.data.data`
        // instead of assuming `.data` is already the array.
        const { data: companiesResponse } = await axiosInstance.get(
          COMPANIES_API,
          {
            headers: getExternalHeaders(),
            withCredentials: false,
          }
        );
        if (!mounted) return;

        const companiesData = recordsFromResponse(companiesResponse);

        setCompanies(
          companiesData.slice(0, 4).map((company: any, index: number) => ({
            id: company.id || index.toString(),

            name: company.name || "Unknown Company",

            ini: (company.name || "C")
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),

            col: [
              "#10b981",
              "#34d399",
              "#059669",
              "#0d9488",
            ][index % 4],

            status:
              company.status
                ? company.status.charAt(0).toUpperCase() +
                  company.status.slice(1)
                : "Active",

            plan: "Basic",

            users: 0,
          }))
        );

        // ── Users (regular + admin) ──────────────────────────
        const { data: usersResponse } = await axiosInstance.get(
          `${USERS_API}?role=user&page=1&limit=4`,
          {
            headers: getExternalHeaders(),
            withCredentials: false,
          }
        );
        if (!mounted) return;

        const { data: adminUsersResponse } = await axiosInstance
          .get(`${USERS_API}?role=admin`, {
            headers: getExternalHeaders(),
            withCredentials: false,
          })
          .catch(() => ({ data: null }));
        if (!mounted) return;

        const usersData = [
          ...recordsFromResponse(usersResponse),
          ...recordsFromResponse(adminUsersResponse),
        ];

        setUsers(
          usersData.slice(0, 4).map((user: any, index: number) => ({
            id: user.id || index.toString(),

            un: user.name || "Unknown User",

            role:
              user.role
                ? user.role.charAt(0).toUpperCase() +
                  user.role.slice(1).toLowerCase()
                : "User",

            status:
              user.status
                ? user.status.charAt(0).toUpperCase() +
                  user.status.slice(1).toLowerCase()
                : "Active",

            av: (user.name || "U")
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),

            col: [
              "#10b981",
              "#34d399",
              "#059669",
              "#0d9488",
            ][index % 4],
          }))
        );

        // ── Logs (static placeholder data) ───────────────────
        setLogs([
          { id:"1", msg:"New campaign launched successfully",          actor:"Sarah Johnson",     time:"2 mins ago",  sev:"info"    },
          { id:"2", msg:"Company subscription upgraded to Enterprise", actor:"Michael Chen",      time:"18 mins ago", sev:"success" },
          { id:"3", msg:"User access permissions updated",             actor:"Emily Davis",       time:"1 hour ago",  sev:"warning" },
          { id:"4", msg:"Monthly analytics report generated",         actor:"System",            time:"3 hours ago", sev:"info"    },
          { id:"5", msg:"API usage threshold reached",                actor:"Monitoring Service",time:"5 hours ago", sev:"warning" },
        ]);
      } catch (err) {
        if (!mounted) return;
        if (isAxiosErrorLike(err)) {
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
          gridTemplateColumns: isHalfScreen ? "1fr" : "minmax(0, 1fr) minmax(0, 1fr)",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <Section isDark={isDark} isMobile={isMobile}>
          <CompanyOverview
            companies={companies}
            loading={loading}
            error={error}
            onViewAll={() => router.push("/user/manage-companies")}
          />
        </Section>
        <Section isDark={isDark} isMobile={isMobile}>
        <UserManagement
  users={users}
  loading={loading}
  error={error}
  onViewAll={() => router.push("/user/all-user")}
/>
        </Section>
      </div>

      {/* Row 3 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isHalfScreen ? "1fr" : "minmax(0, 1fr) minmax(0, 1fr)",
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
                fontSize: "0.85rem",
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
                fontSize: "0.75rem",
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