"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CompanyOverview from "../../../../components/CompanyOverview";
import { useTheme, tokens } from "../../../../context/ThemeContext";

interface CompanyRow {
  id: string;
  name: string;
  ini: string;
  col: string;
  status: string;
  plan: string;
  users: number;
}

interface CompaniesResponse {
  companies?: CompanyRow[];
  error?: string | null;
}

export default function DashboardCompaniesPage() {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const router = useRouter();

  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCompanies() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/admin/companies?limit=all");
        const data = (await res.json()) as CompaniesResponse;

        if (cancelled) {
          return;
        }

        if (!res.ok) {
          throw new Error(data.error ?? `Server error ${res.status}`);
        }

        setCompanies(data.companies ?? []);
        setError(data.error ?? null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to fetch companies.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCompanies();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/user/dashboard");
  };

  return (
    <div style={{ padding: "28px 28px 48px", background: t.bg, minHeight: "100%", transition: "background 0.3s ease" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "18px" }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.45rem", color: t.text, margin: 0, letterSpacing: "-0.02em" }}>
            All Companies
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: "0.875rem", color: t.textMuted }}>
            Complete company list in tabular view.
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

      <CompanyOverview
        title="Company Overview"
        showViewAll={false}
        companies={companies}
        loading={loading}
        error={error}
        onCompanyClick={(company) => router.push(`/user/dashboard/companies/${company.id}`)}
      />
    </div>
  );
}
