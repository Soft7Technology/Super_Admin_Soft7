"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme, tokens } from "../../../../../context/ThemeContext";

interface PlanInfo {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billingCycle: "MONTHLY" | "YEARLY";
  isActive: boolean;
  isPopular: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface CompanyDetails {
  id: string;
  name: string;
  domain: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  logo: string | null;
  createdAt: string;
  updatedAt: string;
  counts: {
    users: number;
    activeUsers: number;
    inactiveUsers: number;
    plans: number;
    subscriptions: number;
    activeSubscriptions: number;
    expiredSubscriptions: number;
    cancelledSubscriptions: number;
    trialSubscriptions: number;
  };
  latestPlan: PlanInfo | null;
  plans: PlanInfo[];
}

interface CompanyDetailsResponse {
  company: CompanyDetails | null;
  error?: string | null;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(value: number) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function toInitials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function DashboardCompanyDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;

  const companyId = useMemo(() => {
    const raw = params?.id;
    if (Array.isArray(raw)) {
      return raw[0];
    }

    return raw;
  }, [params]);

  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) {
      setError("Invalid company id.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadCompany() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/admin/companies/${companyId}`);
        const data = (await res.json()) as CompanyDetailsResponse;

        if (cancelled) {
          return;
        }

        if (!res.ok) {
          throw new Error(data.error ?? `Server error ${res.status}`);
        }

        setCompany(data.company);
        setError(data.error ?? null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to fetch company details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCompany();

    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/user/dashboard/companies");
  };

  const detailRows = company
    ? [
        ["Company ID", company.id],
        ["Company Name", company.name],
        ["Domain", company.domain ?? "—"],
        ["Status", company.status],
        ["Logo URL", company.logo ?? "—"],
        ["Created At", formatDateTime(company.createdAt)],
        ["Updated At", formatDateTime(company.updatedAt)],
        ["Total Users", company.counts.users.toLocaleString("en-IN")],
        ["Active Users", company.counts.activeUsers.toLocaleString("en-IN")],
        ["Inactive Users", company.counts.inactiveUsers.toLocaleString("en-IN")],
        ["Total Plans", company.counts.plans.toLocaleString("en-IN")],
        ["Total Subscriptions", company.counts.subscriptions.toLocaleString("en-IN")],
        ["Active Subscriptions", company.counts.activeSubscriptions.toLocaleString("en-IN")],
        ["Expired Subscriptions", company.counts.expiredSubscriptions.toLocaleString("en-IN")],
        ["Cancelled Subscriptions", company.counts.cancelledSubscriptions.toLocaleString("en-IN")],
        ["Trial Subscriptions", company.counts.trialSubscriptions.toLocaleString("en-IN")],
        ["Latest Plan", company.latestPlan?.name ?? "—"],
        ["Latest Plan Price", company.latestPlan ? formatPrice(company.latestPlan.price) : "—"],
        ["Latest Billing Cycle", company.latestPlan?.billingCycle ?? "—"],
      ]
    : [];

  return (
    <div style={{ padding: "28px 28px 48px", background: t.bg, minHeight: "100%", transition: "background 0.3s ease" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "18px" }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.45rem", color: t.text, margin: 0, letterSpacing: "-0.02em" }}>
            Company Details
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: "0.875rem", color: t.textMuted }}>
            Complete information for selected company.
          </p>
        </div>

        <button
          onClick={handleBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "9px 14px",
            borderRadius: "9px",
            border: `1px solid ${t.border}`,
            background: t.surface,
            color: t.textSub,
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ← Back
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "24px", borderRadius: "14px", border: `1px solid ${t.border}`, background: t.surface, color: t.textMuted }}>
          Loading company details...
        </div>
      ) : error ? (
        <div style={{ padding: "24px", borderRadius: "14px", border: `1px solid ${t.border}`, background: t.surface, color: t.textMuted }}>
          {error}
        </div>
      ) : company ? (
        <div style={{ display: "grid", gap: "18px" }}>
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "14px", overflow: "hidden" }}>
            <div style={{ padding: "18px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg,#3b5bdb,#6741d9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  flexShrink: 0,
                }}
              >
                {toInitials(company.name)}
              </div>
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: t.text }}>{company.name}</div>
                <div style={{ fontSize: "0.8rem", color: t.textMuted }}>{company.domain ?? "No domain"}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "0" }}>
              {detailRows.map(([label, value], index) => (
                <div
                  key={label}
                  style={{
                    padding: "14px 20px",
                    borderTop: index < 2 ? "none" : `1px solid ${t.border}`,
                    borderRight: index % 2 === 0 ? `1px solid ${t.border}` : "none",
                  }}
                >
                  <div style={{ fontSize: "0.7rem", letterSpacing: "0.08em", color: t.textFaint, fontWeight: 700, marginBottom: "6px" }}>
                    {label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: "0.88rem", color: t.textSub, fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "14px", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.border}`, fontWeight: 700, color: t.text }}>
              Subscription Plans
            </div>

            {company.plans.length === 0 ? (
              <div style={{ padding: "20px", color: t.textMuted, fontSize: "0.85rem" }}>No plans found.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: t.tableHead }}>
                    {[
                      "PLAN",
                      "PRICE",
                      "CYCLE",
                      "ACTIVE",
                      "POPULAR",
                      "UPDATED",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 20px",
                          textAlign: "left",
                          fontSize: "0.68rem",
                          color: t.textFaint,
                          letterSpacing: "0.08em",
                          fontWeight: 700,
                          borderBottom: `1px solid ${t.border}`,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {company.plans.map((plan, index) => (
                    <tr key={plan.id} style={{ borderBottom: index === company.plans.length - 1 ? "none" : `1px solid ${t.border}` }}>
                      <td style={{ padding: "12px 20px", color: t.textSub, fontWeight: 600 }}>{plan.name}</td>
                      <td style={{ padding: "12px 20px", color: t.textSub }}>{formatPrice(plan.price)}</td>
                      <td style={{ padding: "12px 20px", color: t.textSub }}>{plan.billingCycle}</td>
                      <td style={{ padding: "12px 20px", color: plan.isActive ? "#16a34a" : t.textMuted, fontWeight: 600 }}>{plan.isActive ? "Yes" : "No"}</td>
                      <td style={{ padding: "12px 20px", color: plan.isPopular ? "#f59f00" : t.textMuted, fontWeight: 600 }}>{plan.isPopular ? "Yes" : "No"}</td>
                      <td style={{ padding: "12px 20px", color: t.textMuted }}>{formatDateTime(plan.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div style={{ padding: "24px", borderRadius: "14px", border: `1px solid ${t.border}`, background: t.surface, color: t.textMuted }}>
          Company not found.
        </div>
      )}
    </div>
  );
}
