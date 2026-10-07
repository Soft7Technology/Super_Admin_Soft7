import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axiosInstance";

export interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  businessId?: string | null;
  status: string;
  creditBalance?: string;
}

interface CompaniesResponse {
  companies: Company[];
  loading: boolean;
  error: string | null;
}

function recordsFromResponse(json: any): any[] {
  if (Array.isArray(json?.data?.items)) return json.data.items;
  if (Array.isArray(json?.data?.data)) return json.data.data;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.items)) return json.items;
  return [];
}

function paginationFromResponse(json: any) {
  const p = json?.data?.pagination ?? json?.pagination ?? {};
  return {
    total: Number(p.total ?? p.totalCompanies ?? p.count ?? 0),
    page: Number(p.page ?? 1),
    limit: Number(p.limit ?? 100),
  };
}

function mapCompany(company: any): Company {
  return {
    id: String(company.id),
    name: String(company.name || "Unnamed Company"),
    email: company.email ? String(company.email) : undefined,
    phone: company.phone ? String(company.phone) : undefined,
    businessId: company.business_id ? String(company.business_id) : null,
    status: String(company.status || "").toLowerCase(),
    creditBalance:
      company.credit_balance !== undefined
        ? String(company.credit_balance)
        : undefined,
  };
}

export function useCompanies(): CompaniesResponse {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCompanies() {
      setLoading(true);
      setError(null);

      try {
        const limit = 1000;
        const page = 1;

        // Fetch a large page of companies so the dropdown is populated
        const { data: response } = await axiosInstance.get(
          "/v1/super-admin/companies",
          { params: { page, limit } },
        );

        const all = recordsFromResponse(response).map(mapCompany);

        const activeCompanies = all
          .filter((company) => company.status === "active")
          .sort((a, b) => a.name.localeCompare(b.name));

        if (!cancelled) {
          setCompanies(activeCompanies);
        }
      } catch (err: any) {
        if (!cancelled) {
          setCompanies([]);
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to fetch companies.",
          );
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

  return { companies, loading, error };
}
