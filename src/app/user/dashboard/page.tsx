"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { axiosInstance } from "@/lib/axiosInstance";
import CompanyOverview from "@/components/CompanyOverview";
import PlatformGrowthChart, { GrowthPoint } from "@/components/PlatformGrowthChart";
import UserManagement, { DbUser } from "@/components/UserManagement";
import AuditLogs, { LogEntry } from "@/components/AuditLogs";
import { Building2, Users, Globe, CreditCard, ArrowUpRight } from "lucide-react";
import "./dashboard.css";

// ─── API Endpoints & Auth ──────────────────────────────────────────────────
const DASHBOARD_API = "/v1/admin/companies/dashboard";
const USERS_API = "/v1/admin/companies/user";
const COMPANIES_API = "/v1/admin/companies?status=active";
const ACTIVITY_API = "/v1/admin/activity?role=user&page=1&limit=10&time_frame=7days";

const getExternalHeaders = () => {
  let token =
    typeof window !== "undefined"
      ? localStorage.getItem("console_access_token") ||
        localStorage.getItem("superadminToken") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token")
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

function safeNum(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (typeof val === "string") {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (Array.isArray(val)) return val.length;
  return 0;
}

// Sums the "count" property across objects in an array
function sumArrayCounts(arr: any): number {
  if (!Array.isArray(arr)) return 0;
  return arr.reduce((acc, item) => {
    if (typeof item === "number") return acc + safeNum(item);
    if (typeof item === "string") return acc + safeNum(item);
    if (typeof item === "object" && item !== null) {
      return acc + safeNum(item.count ?? item.total ?? item.value ?? 0);
    }
    return acc;
  }, 0);
}

// Sums credit balance across company objects
function sumCreditBalances(arr: any): number {
  if (!Array.isArray(arr)) return 0;
  return arr.reduce((acc, item) => acc + safeNum(item?.credit_balance ?? item?.balance ?? 0), 0);
}

function normalisePlanName(planName: string): string {
  if (!planName) return "Basic";
  const p = String(planName).trim();
  if (p.toLowerCase().includes("enterp")) return "Enterprise";
  if (p.toLowerCase().includes("pro")) return "Pro";
  if (p.toLowerCase().includes("basic")) return "Basic";
  if (p.toLowerCase().includes("start") || p.toLowerCase().includes("free")) return "Starter";
  return p.charAt(0).toUpperCase() + p.slice(1);
}

function isAxiosErrorLike(err: unknown): err is { isAxiosError: true; response?: { data?: { message?: string } }; message?: string } {
  return typeof err === "object" && err !== null && (err as any).isAxiosError === true;
}

// Normalizes a variety of API response shapes into a flat array of records
function recordsFromResponse(json: any): any[] {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.data?.data)) return json.data.data;
  if (Array.isArray(json?.users)) return json.users;
  if (Array.isArray(json?.companies)) return json.companies;
  if (Array.isArray(json?.activities)) return json.activities;
  if (Array.isArray(json?.audit)) return json.audit;
  if (Array.isArray(json?.revenue)) return json.revenue;
  if (Array.isArray(json?.data?.companies)) return json.data.companies;
  if (Array.isArray(json?.data?.users)) return json.data.users;
  if (Array.isArray(json?.data?.activities)) return json.data.activities;
  if (Array.isArray(json?.data?.audit)) return json.data.audit;
  if (Array.isArray(json?.data?.revenue)) return json.data.revenue;
  return [];
}

function growthPointsFromRevenueResponse(json: any): GrowthPoint[] {
  const records = recordsFromResponse(json);
  if (!Array.isArray(records) || records.length === 0) return [];

  return records.map((r: any) => {
    const label =
      r.label ||
      r.month ||
      r.period ||
      r.date ||
      (r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { month: "short" }) : "Month");

    const value = safeNum(
      r.value ?? r.revenue ?? r.amount ?? r.total ?? r.count ?? 0
    );

    return { label: String(label), value };
  });
}

function growthPointsFromCompanies(companies: any[], monthsBack: number = 6): GrowthPoint[] {
  const now = new Date();
  const buckets: { key: string; label: string; value: number }[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
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

  return buckets.map(({ label, value }) => ({ label, value }));
}

interface StatItem {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  route?: string;
  trend?: string;
}

function TimeRangePills({ isDark }: { isDark: boolean }) {
  const [selected, setSelected] = useState("All Time");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    setLastUpdated(
      now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    );
  }, []);

  const options = [
    "Last 7 Days",
    "Last Month",
    "Last 6 Months",
    "Last Year",
    "All Time",
  ];

  const handleSelect = (opt: string) => {
    setSelected(opt);
    const now = new Date();
    setLastUpdated(
      now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "5px",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "3px 4px",
          borderRadius: "9999px",
          background: isDark ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9",
          border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0"}`,
          boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        {options.map((opt) => {
          const isActive = selected === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleSelect(opt)}
              style={{
                border: "none",
                outline: "none",
                cursor: "pointer",
                padding: "6px 14px",
                borderRadius: "9999px",
                fontSize: "0.8rem",
                fontWeight: isActive ? 600 : 500,
                color: isActive
                  ? "#ffffff"
                  : isDark
                  ? "rgba(255, 255, 255, 0.6)"
                  : "#64748b",
                background: isActive
                  ? "var(--crm-primary, #206bc4)"
                  : "transparent",
                boxShadow: isActive
                  ? "0 2px 8px rgba(32, 107, 196, 0.35)"
                  : "none",
                transition: "all 0.2s ease",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <span
        style={{
          fontSize: "0.74rem",
          fontWeight: 500,
          color: isDark ? "rgba(255, 255, 255, 0.4)" : "#64748b",
          paddingRight: "6px",
        }}
      >
        Last updated: {lastUpdated || "—"}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [stats, setStats] = useState<StatItem[]>([
    { label: "Companies", value: "0", icon: <Building2 size={20} />, color: "#206bc4", route: "/user/manage-companies" },
    { label: "Users",     value: "0", icon: <Users size={20} />,     color: "#2fb344", route: "/user/all-user" },
    { label: "Domains",   value: "0", icon: <Globe size={20} />,     color: "#4299e1" },
    { label: "Credits",   value: "0", icon: <CreditCard size={20} />, color: "#f59f00" },
  ]);

  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<DbUser[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [growth, setGrowth] = useState<GrowthPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // ── 1. Dashboard Stats (Superadmin Overview API) ─────────────
        let statsRes: any = null;
        try {
          statsRes = await axiosInstance.get("/v1/super-admin/overview", {
            headers: getExternalHeaders(),
            withCredentials: false,
          });
        } catch {
          statsRes = await axiosInstance
            .get(DASHBOARD_API, {
              headers: getExternalHeaders(),
              withCredentials: false,
            })
            .catch(() => null);
        }

        if (!mounted) return;
        const data = statsRes?.data?.data ?? statsRes?.data ?? {};

        const companiesVal = Array.isArray(data.companies)
          ? sumArrayCounts(data.companies)
          : safeNum(data.campaigns_count ?? data.total_campaigns ?? data.companies_count ?? data.companies ?? 0);

        const usersVal = Array.isArray(data.users)
          ? sumArrayCounts(data.users)
          : safeNum(data.users_count ?? data.total_users ?? data.users ?? 0);

        const chatbotsVal = Array.isArray(data.domains)
          ? sumArrayCounts(data.domains)
          : safeNum(data.chatbot_count ?? data.total_chatbots ?? data.chatbots ?? data.total_domains ?? data.domains_count ?? 0);

        const creditsTotal = Array.isArray(data.companies) && sumCreditBalances(data.companies) > 0
          ? sumCreditBalances(data.companies)
          : safeNum(data.total_messages ?? data.messages_count ?? data.total_credits ?? 0);

        const messagesFormatted = Array.isArray(data.companies) && sumCreditBalances(data.companies) > 0
          ? `₹${creditsTotal.toLocaleString()}`
          : creditsTotal.toLocaleString();

        setStats([
          { label: "Companies", value: companiesVal.toLocaleString(), icon: <Building2 size={20} />, color: "#206bc4", route: "/user/manage-companies", trend: "+8.4%" },
          { label: "Users",     value: usersVal.toLocaleString(),     icon: <Users size={20} />,     color: "#2fb344", route: "/user/all-user", trend: "+14%" },
          { label: "Domains",   value: chatbotsVal.toLocaleString(),   icon: <Globe size={20} />,     color: "#4299e1", trend: "+6.2%" },
          { label: "Credits",   value: messagesFormatted,             icon: <CreditCard size={20} />, color: "#f59f00", trend: "+22.5%" },
        ]);

        // ── 2. Users (Fetch first so we can map user counts per company) ─
        let usersRes: any = null;
        try {
          usersRes = await axiosInstance.get(`${USERS_API}?role=user&page=1&limit=50`, {
            headers: getExternalHeaders(),
            withCredentials: false,
          });
        } catch {
          usersRes = await axiosInstance
            .get("/v1/super-admin/users?page=1&limit=50", {
              headers: getExternalHeaders(),
              withCredentials: false,
            })
            .catch(() => null);
        }
        if (!mounted) return;

        let adminUsersRes: any = null;
        try {
          adminUsersRes = await axiosInstance.get(`${USERS_API}?role=admin`, {
            headers: getExternalHeaders(),
            withCredentials: false,
          });
        } catch {
          // ignore admin call error
        }

        const usersData = [
          ...recordsFromResponse(usersRes?.data),
          ...recordsFromResponse(adminUsersRes?.data),
        ];

        const companyUserCounts: Record<string, number> = {};
        for (const u of usersData) {
          const cid = String(u.company_id || u.companyId || u.company?.id || "");
          const cname = (u.company?.name || u.company_name || "").toLowerCase();
          if (cid) companyUserCounts[cid] = (companyUserCounts[cid] || 0) + 1;
          if (cname) companyUserCounts[cname] = (companyUserCounts[cname] || 0) + 1;
        }

        setUsers(
          usersData.slice(0, 5).map((user: any, index: number) => ({
            id: String(user.id || user._id || index),
            un: user.name || user.username || user.email || "Unknown User",
            role: user.role
              ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
              : "User",
            status: user.status
              ? user.status.charAt(0).toUpperCase() + user.status.slice(1).toLowerCase()
              : "Active",
            av: (user.name || user.username || "U")
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),
            col: ["#206bc4", "#2fb344", "#4299e1", "#f59f00", "#6366f1"][index % 5],
          }))
        );

        // ── 3. Companies ─────────────────────────────────────────────
        let companiesRes: any = null;
        try {
          companiesRes = await axiosInstance.get(COMPANIES_API, {
            headers: getExternalHeaders(),
            withCredentials: false,
          });
        } catch {
          companiesRes = await axiosInstance
            .get("/v1/super-admin/companies?page=1&limit=25&status=active", {
              headers: getExternalHeaders(),
              withCredentials: false,
            })
            .catch(() => null);
        }
        if (!mounted) return;

        const companiesData = recordsFromResponse(companiesRes?.data);

        // ── 4. Platform Growth ──────────────────────────────────────
        let growthPoints: GrowthPoint[] = [];
        try {
          const { data: revRes } = await axiosInstance.get(
            "/v1/super-admin/subscriptions/revenue",
            {
              headers: getExternalHeaders(),
              withCredentials: false,
            }
          );
          growthPoints = growthPointsFromRevenueResponse(revRes);
        } catch {
          // ignore error
        }

        if (growthPoints.length === 0) {
          growthPoints = growthPointsFromCompanies(companiesData, 6);
        }
        setGrowth(growthPoints);

        const topCompanies = companiesData.slice(0, 6);

        const mappedCompanies = await Promise.all(
          topCompanies.map(async (company: any, index: number) => {
            const cId = String(company.id || company._id || index);
            const cName = company.name || company.company_name || "Unknown Company";

            const rawPlan =
              company.plan ||
              company.plan_name ||
              company.subscription?.plan ||
              company.subscription?.name ||
              company.subscription_plan?.name ||
              company.subscription_plans?.[0]?.name ||
              company.UserSubscription?.[0]?.subscription_plans?.name ||
              company.package ||
              company.tier;

            let finalPlan = typeof rawPlan === "string" ? rawPlan : "";

            if (!finalPlan) {
              try {
                const { data: detailRes } = await axiosInstance.get(
                  `/v1/super-admin/companies/${cId}`,
                  { headers: getExternalHeaders(), withCredentials: false }
                );
                const detailData = detailRes?.data ?? detailRes ?? {};
                finalPlan =
                  detailData.plan ||
                  detailData.subscription?.plan ||
                  detailData.subscription_plan?.name ||
                  "Basic";
              } catch {
                finalPlan = "Basic";
              }
            }

            let userCount =
              company.users_count ??
              company.user_count ??
              company.usersCount ??
              company.total_users ??
              company._count?.users ??
              (Array.isArray(company.users) ? company.users.length : undefined);

            if (userCount === undefined || userCount === null || userCount === 0) {
              const mappedCount = companyUserCounts[cId] || companyUserCounts[cName.toLowerCase()];
              if (mappedCount && mappedCount > 0) {
                userCount = mappedCount;
              } else {
                try {
                  const { data: cUsersRes } = await axiosInstance.get(
                    `/v1/super-admin/companies/${cId}/users?page=1&limit=1`,
                    { headers: getExternalHeaders(), withCredentials: false }
                  );
                  const totalFromApi =
                    cUsersRes?.data?.pagination?.total ??
                    cUsersRes?.pagination?.total ??
                    cUsersRes?.total ??
                    recordsFromResponse(cUsersRes).length;

                  userCount = safeNum(totalFromApi);
                } catch {
                  userCount = 0;
                }
              }
            }

            return {
              id: cId,
              name: cName,
              ini: (cName || "C")
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2),
              col: ["#206bc4", "#2fb344", "#4299e1", "#f59f00", "#6366f1", "#17a2b8"][index % 6],
              status: company.status
                ? company.status.charAt(0).toUpperCase() + company.status.slice(1).toLowerCase()
                : "Active",
              plan: normalisePlanName(finalPlan),
              users: safeNum(userCount),
            };
          })
        );

        setCompanies(mappedCompanies);

        // ── 5. Activity Logs ─────────────────────────────────────────
        let activityRes: any = null;
        try {
          activityRes = await axiosInstance.get(ACTIVITY_API, {
            headers: getExternalHeaders(),
            withCredentials: false,
          });
        } catch {
          activityRes = await axiosInstance
            .get("/v1/super-admin/activities?page=1&limit=10", {
              headers: getExternalHeaders(),
              withCredentials: false,
            })
            .catch(() => null);
        }

        if (!mounted) return;

        const activityData = recordsFromResponse(activityRes?.data);

        setLogs(
          activityData.slice(0, 5).map((activity: any, index: number) => ({
            id: String(activity.id || activity._id || index),
            msg:
              activity.message ||
              activity.msg ||
              activity.description ||
              activity.action ||
              activity.event ||
              "Activity performed",
            actor:
              activity.actor ||
              activity.user_name ||
              activity.user?.name ||
              activity.created_by?.name ||
              activity.name ||
              "TB",
            time:
              activity.time ||
              activity.created_at ||
              activity.createdAt ||
              "Recently",
            sev:
              activity.severity ||
              activity.sev ||
              activity.type ||
              "info",
          }))
        );
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
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="crm-dashboard">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="crm-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="crm-header__title">Dashboard</h1>
          <p className="crm-header__subtitle">
            Welcome back — here&apos;s your platform overview for today.
          </p>
        </div>

        <TimeRangePills isDark={isDark} />
      </div>

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "10px 14px",
            borderRadius: "6px",
            background: "rgba(214, 57, 57, 0.1)",
            border: "1px solid rgba(214, 57, 57, 0.25)",
            color: "var(--crm-red, #d63939)",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      {/* ─── Top 4 Stat Cards (Dashboard Theme) ─────────────── */}
      <div className="crm-stats-grid">
        {stats.map((s) => (
          <div
            key={s.label}
            className="crm-stat-card"
            style={{ cursor: s.route ? "pointer" : "default" }}
            onClick={() => s.route && router.push(s.route)}
          >
            <div className="crm-stat-card__left">
              <span className="crm-avatar" style={{ background: `${s.color}15`, color: s.color }}>
                {s.icon}
              </span>
              <div className="crm-stat-card__info">
                <div className="crm-subheader">{s.label.toUpperCase()}</div>
                <div className="crm-stat-value">{loading ? "…" : s.value}</div>
                <div style={{ height: "2.5px", width: "32px", borderRadius: "2px", background: s.color, marginTop: "6px" }} />
              </div>
            </div>
            {s.trend && (
              <span className="crm-stat-trend crm-trend--up">
                {s.trend} <ArrowUpRight size={14} />
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ─── Two-Column Middle Section (Dashboard Theme) ────── */}
      <div className="crm-row-middle">
        {/* Left Column */}
        <div className="crm-col-stack">
          {/* Card: Platform Growth */}
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
              <PlatformGrowthChart data={growth} loading={loading} error={error} />
            </div>
          </div>

          {/* Card: Company Overview */}
          <CompanyOverview
            companies={companies}
            loading={loading}
            error={error}
            onViewAll={() => router.push("/user/manage-companies")}
            onCompanyClick={() => router.push("/user/manage-companies")}
          />
        </div>

        {/* Right Column */}
        <div className="crm-col-stack">
          {/* Card: User Management */}
          <UserManagement
            users={users}
            loading={loading}
            error={error}
            onViewAll={() => router.push("/user/all-user")}
            onUserClick={() => router.push("/user/all-user")}
          />

          {/* Card: Audit Logs */}
          <AuditLogs logs={logs} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
}