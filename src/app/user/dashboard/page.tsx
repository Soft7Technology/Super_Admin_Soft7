"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme, tokens } from "../../../context/ThemeContext";
import { StatCard } from "../../../types";
import { axiosInstance } from "@/lib/axiosInstance";
import { getAuthHeaders, getAuthToken, redirectToLogin } from "@/lib/auth-client";
import CompanyOverview from "../../../components/CompanyOverview";
import UserManagement from "../../../components/UserManagement";
import PlatformGrowthChart, {
  GrowthPoint,
  GrowthTimeRange,
  TIME_RANGE_OPTIONS,
} from "../../../components/PlatformGrowthChart";
import AuditLogs from "../../../components/AuditLogs";
import StatCards from "../../../components/StatCards";

const COMPANIES_API = "/v1/admin/companies?status=active";
const USERS_API = "/v1/admin/companies/user";
const ACTIVITY_API = "/v1/admin/activity?role=user&page=1&limit=10&time_frame=7days";

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
        border: isDark ? "1px solid rgba(255, 255, 255, 0.07)" : "1px solid #cbd5e1",
        borderRadius: "16px",
        padding: isMobile ? "20px" : "26px 28px",
        minWidth: 0,
        boxShadow: isDark
          ? "0 2px 10px rgba(0,0,0,0.22)"
          : "0 2px 10px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {children}
    </div>
  );
}

/* ─── Initial Empty Stat Cards Placeholder ─────────────────── */
const INITIAL_STATS: StatCard[] = [
  {
    icon: "📢",
    label: "Campaigns",
    value: "—",
    change: "0.0%",
    changeType: "neutral",
    accent: "blue",
    dateRange: "",
    comparisonPeriod: "vs previous period",
  },
  {
    icon: "👥",
    label: "Users",
    value: "—",
    change: "0.0%",
    changeType: "neutral",
    accent: "green",
    dateRange: "",
    comparisonPeriod: "vs previous period",
  },
  {
    icon: "🤖",
    label: "Chatbots",
    value: "—",
    change: "0.0%",
    changeType: "neutral",
    accent: "purple",
    dateRange: "",
    comparisonPeriod: "vs previous period",
  },
  {
    icon: "💬",
    label: "Messages",
    value: "—",
    change: "0.0%",
    changeType: "neutral",
    accent: "orange",
    dateRange: "",
    comparisonPeriod: "vs previous period",
  },
];

/* ─── Dashboard Page ──────────────────────────────────────── */
export default function DashboardPage() {
  const { isDark } = useTheme();
  const t = useMemo(() => (isDark ? tokens.dark : tokens.light), [isDark]);
  const router = useRouter();
  const width = useWindowWidth();
  const isMobile = width <= 768;
  const isHalfScreen = width <= 768;

  // Centralized time range state controlling all dashboard analytics
  const [timeRange, setTimeRange] = useState<GrowthTimeRange>("30D");

  const [stats, setStats] = useState<StatCard[]>(INITIAL_STATS);
  const [growth, setGrowth] = useState<GrowthPoint[]>([]);
  const [companies, setCompanies] = useState<DashboardCompany[]>([]);
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [logs, setLogs] = useState<DashboardLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async (selectedRange: GrowthTimeRange) => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/auth");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Primary centralized API call to fetch full real database analytics
      const res = await fetch(`/api/admin/dashboard?range=${selectedRange}`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        if (res.status === 401) {
          redirectToLogin("session_expired");
          return;
        }
        throw new Error(`Failed to load dashboard (${res.status})`);
      }

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      }

      const metrics = data.metrics || {};
      const cMetric = metrics.campaigns || {};
      const uMetric = metrics.users || {};
      const cbMetric = metrics.chatbots || {};
      const mMetric = metrics.messages || {};

      // 100% data-driven stat cards
      setStats([
        {
          label: "Campaigns",
          value: Number(cMetric.current ?? 0).toLocaleString(),
          icon: "📢",
          change: cMetric.change ?? "0.0%",
          changeType: cMetric.changeType ?? "neutral",
          dateRange: cMetric.dateRange ?? data.dateRange ?? "",
          comparisonPeriod: cMetric.comparisonPeriod ?? data.comparisonPeriod ?? "vs previous period",
          accent: "blue",
        },
        {
          label: "Users",
          value: Number(uMetric.current ?? 0).toLocaleString(),
          icon: "👥",
          change: uMetric.change ?? "0.0%",
          changeType: uMetric.changeType ?? "neutral",
          dateRange: uMetric.dateRange ?? data.dateRange ?? "",
          comparisonPeriod: uMetric.comparisonPeriod ?? data.comparisonPeriod ?? "vs previous period",
          accent: "green",
        },
        {
          label: "Chatbots",
          value: Number(cbMetric.current ?? 0).toLocaleString(),
          icon: "🤖",
          change: cbMetric.change ?? "0.0%",
          changeType: cbMetric.changeType ?? "neutral",
          dateRange: cbMetric.dateRange ?? data.dateRange ?? "",
          comparisonPeriod: cbMetric.comparisonPeriod ?? data.comparisonPeriod ?? "vs previous period",
          accent: "purple",
        },
        {
          label: "Messages",
          value: Number(mMetric.current ?? 0).toLocaleString(),
          icon: "💬",
          change: mMetric.change ?? "0.0%",
          changeType: mMetric.changeType ?? "neutral",
          dateRange: mMetric.dateRange ?? data.dateRange ?? "",
          comparisonPeriod: mMetric.comparisonPeriod ?? data.comparisonPeriod ?? "vs previous period",
          accent: "orange",
        },
      ]);

      // Dynamic growth points from real database records
      if (Array.isArray(data.growth)) {
        setGrowth(data.growth);
      }

      // Recent companies list
      if (Array.isArray(data.companies) && data.companies.length > 0) {
        setCompanies(data.companies);
      } else {
        // Fallback to secondary companies endpoint if DB has no companies yet
        try {
          const { data: companiesResponse } = await axiosInstance.get(COMPANIES_API, {
            headers: getAuthHeaders(),
            withCredentials: false,
          });
          const companiesData = recordsFromResponse(companiesResponse);
          if (companiesData.length > 0) {
            setCompanies(
              companiesData.slice(0, 4).map((company: any, index: number) => ({
                id: String(company.id || index),
                name: company.name || "Unknown Company",
                ini: (company.name || "C")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2),
                col: ["#10b981", "#34d399", "#059669", "#0d9488"][index % 4],
                status: company.status
                  ? company.status.charAt(0).toUpperCase() + company.status.slice(1)
                  : "Active",
                plan: "Basic",
                users: 0,
              }))
            );
          }
        } catch {
          // Ignore secondary fallback errors
        }
      }

      // Recent users list
      if (Array.isArray(data.users) && data.users.length > 0) {
        setUsers(data.users);
      } else {
        // Fallback to secondary users endpoint
        try {
          const { data: usersResponse } = await axiosInstance.get(
            `${USERS_API}?role=user&page=1&limit=4`,
            { headers: getAuthHeaders(), withCredentials: false }
          );
          const usersData = recordsFromResponse(usersResponse);
          if (usersData.length > 0) {
            setUsers(
              usersData.slice(0, 4).map((user: any, index: number) => ({
                id: String(user.id || index),
                un: user.name || "Unknown User",
                role: user.role
                  ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
                  : "User",
                status: user.status
                  ? user.status.charAt(0).toUpperCase() + user.status.slice(1).toLowerCase()
                  : "Active",
                av: (user.name || "U")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2),
                col: ["#10b981", "#34d399", "#059669", "#0d9488"][index % 4],
              }))
            );
          }
        } catch {
          // Ignore secondary fallback errors
        }
      }

      // Activity / Ticket logs
      if (Array.isArray(data.logs) && data.logs.length > 0) {
        setLogs(data.logs);
      } else {
        // Fallback to secondary activity logs endpoint
        try {
          const { data: activityResponse } = await axiosInstance.get(ACTIVITY_API, {
            headers: getAuthHeaders(),
            withCredentials: false,
          });
          const activityData = recordsFromResponse(activityResponse);
          if (activityData.length > 0) {
            setLogs(
              activityData.slice(0, 5).map((activity: any, index: number) => ({
                id: String(activity.id || activity._id || index),
                msg:
                  activity.message ||
                  activity.msg ||
                  activity.description ||
                  activity.action ||
                  "Activity performed",
                actor:
                  activity.actor ||
                  activity.user_name ||
                  activity.user?.name ||
                  activity.created_by?.name ||
                  activity.name ||
                  "System",
                time:
                  activity.time ||
                  activity.created_at ||
                  activity.createdAt ||
                  "Recently",
                sev: activity.severity || activity.sev || activity.type || "info",
              }))
            );
          }
        } catch {
          // Ignore secondary fallback errors
        }
      }
    } catch (err: any) {
      if (err?.message?.includes("401")) {
        redirectToLogin("session_expired");
        return;
      }
      setError(err?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData(timeRange);
  }, [timeRange, fetchDashboardData]);

  const handleTimeRangeChange = (newRange: GrowthTimeRange) => {
    if (newRange === timeRange) return;
    setTimeRange(newRange);
  };

  const handleStatCardClick = (stat: StatCard) => {
    if (stat.label === "Total Companies") {
      router.push("/user/manage-companies");
      return;
    }
    if (stat.label === "Users" || stat.label === "Active Users") {
      router.push("/user/all-user");
      return;
    }
    if (stat.label === "Campaigns") {
      router.push("/user/dashboard");
      return;
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

        {/* Global Time Filter Controls: 7D, 30D, 90D, 1Y, ALL */}
        <div
          role="group"
          aria-label="Dashboard time range filter"
          style={{
            display: "inline-flex",
            alignItems: "center",
            background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
            borderRadius: "10px",
            padding: "3px",
            gap: "3px",
            flexShrink: 0,
          }}
        >
          {TIME_RANGE_OPTIONS.map((rangeOption) => {
            const active = timeRange === rangeOption.value;
            return (
              <button
                key={rangeOption.value}
                type="button"
                onClick={() => handleTimeRangeChange(rangeOption.value)}
                aria-pressed={active}
                style={{
                  border: "none",
                  outline: "none",
                  cursor: "pointer",
                  padding: isMobile ? "4px 8px" : "6px 12px",
                  borderRadius: "7px",
                  fontSize: isMobile ? "11px" : "12px",
                  fontWeight: active ? 700 : 600,
                  background: active ? "#10b981" : "transparent",
                  color: active
                    ? "#ffffff"
                    : isDark
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(0,0,0,0.7)",
                  boxShadow: active
                    ? "0 2px 8px rgba(16,185,129,0.35)"
                    : "none",
                  transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {rangeOption.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Dynamic Metric Cards */}
      <StatCards stats={stats} isMobile={isMobile} />

      {error && (
        <div
          style={{
            marginBottom: "18px",
            padding: "12px 16px",
            borderRadius: "10px",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            background: isDark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.05)",
            color: "#ef4444",
            fontSize: "0.85rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Row 2: Company Overview & User Management */}
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

      {/* Row 3: Platform Growth Chart & Audit Logs */}
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
              display: "flex",
              alignItems: isMobile ? "flex-start" : "center",
              justifyContent: "space-between",
              flexDirection: isMobile ? "column" : "row",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
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
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: "8px",
                    background: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)",
                    color: "#10b981",
                    border: "1px solid rgba(16,185,129,0.25)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {TIME_RANGE_OPTIONS.find((o) => o.value === timeRange)?.badge ?? timeRange}
                </span>
              </div>

              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "0.75rem",
                  color: isDark ? t.textMuted : "#64748b",
                }}
              >
                {TIME_RANGE_OPTIONS.find((o) => o.value === timeRange)?.desc ?? "Platform activity and engagement overview"}
              </p>
            </div>

            {/* Synchronized Section Filter Controls */}
            <div
              role="group"
              aria-label="Platform growth time range"
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                borderRadius: "10px",
                padding: "3px",
                gap: "3px",
              }}
            >
              {TIME_RANGE_OPTIONS.map((rangeOption) => {
                const active = timeRange === rangeOption.value;
                return (
                  <button
                    key={rangeOption.value}
                    type="button"
                    onClick={() => handleTimeRangeChange(rangeOption.value)}
                    aria-pressed={active}
                    style={{
                      border: "none",
                      outline: "none",
                      cursor: "pointer",
                      padding: "4px 10px",
                      borderRadius: "7px",
                      fontSize: "11px",
                      fontWeight: active ? 700 : 600,
                      background: active ? "#10b981" : "transparent",
                      color: active
                        ? "#ffffff"
                        : isDark
                        ? "rgba(255,255,255,0.6)"
                        : "rgba(0,0,0,0.6)",
                      boxShadow: active
                        ? "0 2px 8px rgba(16,185,129,0.35)"
                        : "none",
                      transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    {rangeOption.label}
                  </button>
                );
              })}
            </div>
          </div>

          <PlatformGrowthChart
            data={growth}
            timeRange={timeRange}
            onTimeRangeChange={handleTimeRangeChange}
            loading={loading}
            error={error}
          />
        </Section>
        <Section isDark={isDark} isMobile={isMobile}>
          <AuditLogs logs={logs} loading={loading} error={error} />
        </Section>
      </div>
    </div>
  );
}