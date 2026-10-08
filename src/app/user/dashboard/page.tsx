"use client";

import React, { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { axiosInstance } from "@/lib/axiosInstance";

import CompanyOverview from "@/components/CompanyOverview";

import PlatformGrowthChart from "@/components/PlatformGrowthChart";

import UserManagement, { DbUser } from "@/components/UserManagement";

import AuditLogs, { LogEntry } from "@/components/AuditLogs";

import RecentTransactionsFeed from "@/components/RecentTransactionsFeed";

import QuickAdminActions from "@/components/QuickAdminActions";

import {
  Building2,
  Users,
  Globe,
  CreditCard,
  ArrowUpRight,
} from "lucide-react";

import "./dashboard.css";

// ─── API Endpoints & Auth ──────────────────────────────────────────────────
const OVERVIEW_API = "/v1/super-admin/overview";
const USERS_API = "/v1/super-admin/users";
const COMPANIES_API = "/v1/super-admin/companies";
const ACTIVITY_API = "/v1/super-admin/activities";

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

function isAxiosErrorLike(
  err: unknown,
): err is {
  isAxiosError: true;
  response?: { data?: { message?: string } };
  message?: string;
} {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as any).isAxiosError === true
  );
}

// Normalizes a variety of API response shapes into a flat array of records

function recordsFromResponse(json: any): any[] {
  if (!json) return [];

  if (Array.isArray(json?.data?.items)) return json.data.items;

  if (Array.isArray(json?.items)) return json.items;

  if (Array.isArray(json)) return json;

  if (Array.isArray(json?.data)) return json.data;

  if (Array.isArray(json?.data?.data)) return json.data.data;

  if (Array.isArray(json?.users)) return json.users;

  if (Array.isArray(json?.companies)) return json.companies;

  if (Array.isArray(json?.activities)) return json.activities;

  if (Array.isArray(json?.audit)) return json.audit;

  if (Array.isArray(json?.data?.companies)) return json.data.companies;

  if (Array.isArray(json?.data?.users)) return json.data.users;

  if (Array.isArray(json?.data?.activities)) return json.data.activities;

  if (Array.isArray(json?.data?.audit)) return json.data.audit;

  return [];
}

interface StatItem {
  label: string;

  value: string;

  icon: React.ReactNode;

  color: string;

  route?: string;

  trend?: string;
}

function TimeRangePills() {
  const [selected, setSelected] = useState("all");
  const options = [
    { id: "7days", label: "7 Days", short: "7D" },
    { id: "30days", label: "1 Month", short: "1M" },
    { id: "6months", label: "6 Months", short: "6M" },
    { id: "1year", label: "1 Year", short: "1Y" },
    { id: "all", label: "All Time", short: "All" },
  ];

  return (
    <div className="crm-time-range-wrap">
      <div className="crm-time-pills" role="tablist">
        {options.map((opt) => {
          const isActive = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelected(opt.id)}
              className={`crm-time-pill ${
                isActive ? "crm-time-pill--active" : ""
              }`}
              aria-selected={isActive}
              role="tab"
            >
              <span className="crm-time-pill-full">{opt.label}</span>
              <span className="crm-time-pill-short">{opt.short}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<StatItem[]>([
    {
      label: "Companies",
      value: "0",
      icon: <Building2 size={20} />,
      color: "#087f5b",
      route: "/user/manage-companies",
    },

    {
      label: "Users",
      value: "0",
      icon: <Users size={20} />,
      color: "#2fb344",
      route: "/user/all-user",
    },

    {
      label: "Domains",
      value: "0",
      icon: <Globe size={20} />,
      color: "#52a77d",
    },

    {
      label: "Credits",
      value: "0",
      icon: <CreditCard size={20} />,
      color: "#f59f00",
    },
  ]);

  const [companies, setCompanies] = useState<any[]>([]);

  const [users, setUsers] = useState<DbUser[]>([]);

  const [logs, setLogs] = useState<LogEntry[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const config = {
          headers: getExternalHeaders(),
          withCredentials: false,
        };

        const overviewRes = await axiosInstance.get(OVERVIEW_API, config);

        const [usersRes, companiesRes, activityRes] = await Promise.all([
          axiosInstance.get(USERS_API, {
            ...config,
            params: { page: 1, limit: 5 },
          }),
          axiosInstance.get(COMPANIES_API, {
            ...config,
            params: { page: 1, limit: 5, status: "active" },
          }),
          axiosInstance.get(ACTIVITY_API, {
            ...config,
            params: { page: 1, limit: 5 },
          }),
        ]);

        if (!mounted) return;

        // ── 1. KPI Stats ──────────────────────────────────────────────
        const data = overviewRes?.data?.data ?? {};
        const sumCounts = (items: any[]) =>
          items.reduce((sum, item) => sum + safeNum(item?.count), 0);
        const companiesVal = sumCounts(
          Array.isArray(data.companies) ? data.companies : [],
        );
        const usersVal = sumCounts(Array.isArray(data.users) ? data.users : []);
        const domainsVal = sumCounts(
          Array.isArray(data.domains) ? data.domains : [],
        );
        const creditsTotal = (
          Array.isArray(data.companies) ? data.companies : []
        ).reduce(
          (sum: number, item: any) => sum + safeNum(item?.credit_balance),
          0,
        );
        setStats([
          {
            label: "Companies",
            value: companiesVal.toLocaleString(),
            icon: <Building2 size={20} />,
            color: "#087f5b",
            route: "/user/manage-companies",
            trend: "+8.4%",
          },
          {
            label: "Users",
            value: usersVal.toLocaleString(),
            icon: <Users size={20} />,
            color: "#2fb344",
            route: "/user/all-user",
            trend: "+14%",
          },
          {
            label: "Domains",
            value: domainsVal.toLocaleString(),
            icon: <Globe size={20} />,
            color: "#52a77d",
            trend: "+6.2%",
          },
          {
            label: "Credits",
            value: `₹${creditsTotal.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            icon: <CreditCard size={20} />,
            color: "#f59f00",
            trend: "+22.5%",
          },
        ]);

        // ── 2. Users ─────────────────────────────────────────────────
        const usersData = recordsFromResponse(usersRes?.data);
        setUsers(
          usersData.slice(0, 5).map((user: any, index: number) => ({
            id: String(user.id || user._id || index),
            un: user.name || user.username || user.email || "Unknown User",
            role: user.role
              ? user.role.charAt(0).toUpperCase() +
                user.role.slice(1).toLowerCase()
              : "User",
            status: user.status
              ? user.status.charAt(0).toUpperCase() +
                user.status.slice(1).toLowerCase()
              : "Active",
            av: (user.name || user.username || "U")
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),
            col: [
              "#087f5b",
              "#2fb344",
              "#52a77d",
              "#f59f00",
              "#6366f1",
              "#17a2b8",
            ][index % 6],
          })),
        );

        // ── 3. Companies ─────────────────────────────────────────────
        const companiesData = recordsFromResponse(companiesRes?.data);
        setCompanies(
          companiesData.slice(0, 5).map((company: any, index: number) => {
            const cId = String(company.id || company._id || index);
            const cName =
              company.name || company.company_name || "Unknown Company";
            return {
              id: cId,
              name: cName,
              ini: cName
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2),
              col: [
                "#087f5b",
                "#2fb344",
                "#52a77d",
                "#f59f00",
                "#6366f1",
                "#17a2b8",
              ][index % 6],
              status: company.status
                ? company.status.charAt(0).toUpperCase() +
                  company.status.slice(1).toLowerCase()
                : "Active",
              plan: company.plan || company.plan_name || "—",
              users:
                company.user_count ??
                company.users_count ??
                company.usersCount ??
                company.total_users,
            };
          }),
        );

        // ── 5. Activity Logs ─────────────────────────────────────────
        const activityData = recordsFromResponse(activityRes?.data);
        setLogs(
          activityData.slice(0, 5).map((activity: any, index: number) => ({
            id: String(activity.id || activity._id || index),
            msg:
              activity.description ||
              [activity.action, activity.entity_type]
                .filter(Boolean)
                .join(" · ") ||
              "Activity performed",
            actor: activity.user_id ? String(activity.user_id) : "System",
            time: activity.created_at || "Recently",
            sev: activity.status || "info",
          })),
        );
      } catch (err) {
        if (!mounted) return;
        if (isAxiosErrorLike(err))
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load dashboard.",
          );
        else if (err instanceof Error) setError(err.message);
        else setError("Failed to load dashboard.");
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
      <div
        className="crm-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1 className="crm-header__title">Dashboard</h1>

          <p className="crm-header__subtitle">
            Welcome back — here's your platform overview for today.
          </p>
        </div>

        <TimeRangePills />
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
              <span
                className="crm-avatar"
                style={{ background: `${s.color}15`, color: s.color }}
              >
                {s.icon}
              </span>

              <div className="crm-stat-card__info">
                <div className="crm-subheader">{s.label.toUpperCase()}</div>

                <div className="crm-stat-value">{loading ? "…" : s.value}</div>

                <div
                  style={{
                    height: "2.5px",
                    width: "32px",
                    borderRadius: "2px",
                    background: s.color,
                    marginTop: "6px",
                  }}
                />
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

      {/* ─── Top Cards Row (Equal Height: Platform Growth & Quick Actions) ─── */}

      <div className="crm-row-top">
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
            <PlatformGrowthChart data={[]} loading={false} error={null} />
          </div>
        </div>

        {/* Card: Quick Admin Actions */}

        <QuickAdminActions />
      </div>

      {/* ─── Two-Column Middle Section (Dashboard Theme) ────── */}

      <div className="crm-row-middle">
        {/* Left Column */}

        <div className="crm-col-stack">
          {/* Card: Company Overview */}

          <CompanyOverview
            companies={companies}
            loading={loading}
            error={error}
            onViewAll={() => router.push("/user/manage-companies")}
            onCompanyClick={() => router.push("/user/manage-companies")}
          />

          {/* Card: Recent Transactions Feed */}

          <RecentTransactionsFeed limit={5} />
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
