"use client";

import { ArrowLeft } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CompanyOverview from "../../../../components/CompanyOverview";

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
    <PageContainer>
      <Button variant="ghost" size="sm" className="-ml-2 mb-3" leftIcon={<ArrowLeft size={15} />} onClick={handleBack}>
        Back
      </Button>
      <PageHeader title="All Companies" description="Complete company list in tabular view." />

      <CompanyOverview
        title="Company Overview"
        showViewAll={false}
        companies={companies}
        loading={loading}
        error={error}
        onCompanyClick={(company) => router.push(`/user/dashboard/companies/${company.id}`)}
      />
    </PageContainer>
  );
}
