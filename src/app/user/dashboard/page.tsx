"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme, tokens } from "../../../context/ThemeContext";
import { StatCard } from "../../../types";
import { axiosInstance } from "@/lib/axiosInstance";
import CompanyOverview from "../../../components/CompanyOverview";
import UserManagement from "../../../components/UserManagement";
import PlatformGrowthChart, { GrowthPoint } from "../../../components/PlatformGrowthChart";
import AuditLogs from "../../../components/AuditLogs";

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

// Sums the "count" property across objects in an array (e.g. [{ status: "active", count: "16" }])
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

// Builds "Platform Growth" points directly from the companies list, since
// there's no dedicated growth endpoint — only /v1/admin/companies is
// available. Buckets companies by the month of `created_at` and counts how
// many were created in each of the last `monthsBack` months, ending with
// the current month. The x-axis labels are the real trailing months (e.g.
// if today is July 2026, labels run Feb → Jul 2026), so the range always
// reflects the actual date range in the data rather than a fixed period.
function growthPointsFromCompanies(
  companies: any[],
  monthsBack: number = 6
): GrowthPoint[] {
  const now = new Date();
  // Build the trailing month buckets, oldest first.
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

/* ─── Time Range Pills Filter ──────────────────────────────── */
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
        gap: "6px",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "4px 5px",
          borderRadius: "9999px",
          background: isDark ? "rgba(255, 255, 255, 0.06)" : "#f4f1ea",
          border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.06)"}`,
          boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.2)" : "0 1px 4px rgba(0,0,0,0.04)",
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
                padding: "8px 18px",
                borderRadius: "9999px",
                fontSize: "0.82rem",
                fontWeight: isActive ? 700 : 600,
                color: isActive ? "#ffffff" : isDark ? "rgba(255, 255, 255, 0.6)" : "#665e52",
                background: isActive
                  ? "linear-gradient(135deg, #f97316, #ea580c)"
                  : "transparent",
                boxShadow: isActive ? "0 3px 10px rgba(234, 88, 12, 0.35)" : "none",
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
          color: isDark ? "rgba(255, 255, 255, 0.4)" : "#8c8275",
          paddingRight: "6px",
        }}
      >
        Last updated: {lastUpdated || "—"}
      </span>
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
  const [growth, setGrowth]         = useState<GrowthPoint[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // ── Dashboard stats (Superadmin Overview API) ─────────
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

        // Parse companies / campaigns count
        const companiesVal = Array.isArray(data.companies)
          ? sumArrayCounts(data.companies)
          : safeNum(data.campaigns_count ?? data.total_campaigns ?? data.companies_count ?? data.companies ?? 0);

        // Parse users count
        const usersVal = Array.isArray(data.users)
          ? sumArrayCounts(data.users)
          : safeNum(data.users_count ?? data.total_users ?? data.users ?? 0);

        // Parse domains / chatbots count
        const chatbotsVal = Array.isArray(data.domains)
          ? sumArrayCounts(data.domains)
          : safeNum(data.chatbot_count ?? data.total_chatbots ?? data.chatbots ?? data.total_domains ?? data.domains_count ?? 0);

        // Parse credit balance or messages count
        const creditsTotal = Array.isArray(data.companies) && sumCreditBalances(data.companies) > 0
          ? sumCreditBalances(data.companies)
          : safeNum(data.total_messages ?? data.messages_count ?? data.total_credits ?? 0);

        const messagesFormatted = Array.isArray(data.companies) && sumCreditBalances(data.companies) > 0
          ? `₹${creditsTotal.toLocaleString()}`
          : creditsTotal.toLocaleString();

        setStats([
          { label: "Companies", value: companiesVal.toLocaleString(), icon: "🏢", change: "—", changeType: "up", accent: "blue" },
          { label: "Users",     value: usersVal.toLocaleString(),     icon: "👥", change: "—", changeType: "up", accent: "green" },
          { label: "Domains",   value: chatbotsVal.toLocaleString(),   icon: "🤖", change: "—", changeType: "up", accent: "purple" },
          { label: "Credits",   value: messagesFormatted,             icon: "💳", change: "—", changeType: "up", accent: "orange" },
        ]);

        // ── Users (Fetch first so we can map user counts per company) ────
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

        // Build map of user counts per company ID / company name
        const companyUserCounts: Record<string, number> = {};
        for (const u of usersData) {
          const cid = String(u.company_id || u.companyId || u.company?.id || "");
          const cname = (u.company?.name || u.company_name || "").toLowerCase();
          if (cid) companyUserCounts[cid] = (companyUserCounts[cid] || 0) + 1;
          if (cname) companyUserCounts[cname] = (companyUserCounts[cname] || 0) + 1;
        }

        setUsers(
          usersData.slice(0, 4).map((user: any, index: number) => ({
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
            col: ["#10b981", "#34d399", "#059669", "#0d9488"][index % 4],
          }))
        );

        // ── Companies ─────────────────────────────────────────
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

        // ── Platform Growth (Revenue API) ────────────────────
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

        const topCompanies = companiesData.slice(0, 4);

        const mappedCompanies = await Promise.all(
          topCompanies.map(async (company: any, index: number) => {
            const cId = String(company.id || company._id || index);
            const cName = company.name || company.company_name || "Unknown Company";

            // Dynamic plan lookup from all possible API response keys
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

            // Dynamic user count calculation
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
              col: ["#10b981", "#34d399", "#059669", "#0d9488"][index % 4],
              status: company.status
                ? company.status.charAt(0).toUpperCase() + company.status.slice(1).toLowerCase()
                : "Active",
              plan: normalisePlanName(finalPlan),
              users: safeNum(userCount),
            };
          })
        );

        setCompanies(mappedCompanies);

        // ── Activity Logs ──────────────────────────────────────
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
              "System",
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

        <TimeRangePills isDark={isDark} />
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

          <PlatformGrowthChart data={growth} loading={loading} error={error} />
        </Section>
        <Section isDark={isDark} isMobile={isMobile}>
          <AuditLogs logs={logs} loading={loading} error={error} />
        </Section>
      </div>
    </div>
  );
}