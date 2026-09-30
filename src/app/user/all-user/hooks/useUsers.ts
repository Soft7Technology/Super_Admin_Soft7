import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import { getAuthHeaders, getAuthToken, redirectToLogin } from "@/lib/auth-client";
import { User, UserStats, timeAgo } from "../types";

const EXTERNAL_USERS_API = "/v1/admin/companies/user";
const INTERNAL_USERS_API = "/api/admin/users";
const COMPANIES_API = "/v1/admin/companies?status=active";
const INTERNAL_COMPANIES_API = "/api/admin/companies";

export interface PaginationInfo {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface CompanyOption {
  id: string;
  name: string;
  domain?: string;
}

interface UseUsersReturn {
  users: User[];
  stats: UserStats;
  pagination: PaginationInfo;
  companies: CompanyOption[];
  companiesMap: Record<string, string>;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  updateUserStatus: (userId: string, status: string) => void;
}

const EMPTY_STATS: UserStats = {
  totalUsers: 0,
  activeUsers: 0,
  adminUsers: 0,
  premiumUsers: 0,
};

const DEFAULT_PAGINATION: PaginationInfo = {
  total: 0,
  totalPages: 1,
  page: 1,
  limit: 20,
};

function recordsFromResponse(json: any): any[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.data?.data)) return json.data.data;
  if (Array.isArray(json?.users)) return json.users;
  return [];
}

function paginationFromResponse(json: any): Partial<PaginationInfo> {
  const p = json?.data?.pagination ?? json?.pagination ?? {};
  return {
    total: Number(p.total ?? p.totalUsers ?? p.count ?? 0),
    totalPages: Number(p.totalPages ?? p.total_pages ?? 1),
    page: Number(p.page ?? 1),
    limit: Number(p.limit ?? 10),
  };
}

function normalisePlan(planName: string): string {
  if (planName === "Enterpriess") return "Enterprise";
  if (planName === "Free Trial") return "Starter";
  return planName || "Starter";
}

function isRawIdentifier(val: unknown): boolean {
  if (!val || typeof val !== "string") return false;
  const trimmed = val.trim();
  if (trimmed.startsWith("ID:")) return true;
  // UUID pattern or pure numeric ID
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
    return true;
  }
  if (/^\d+$/.test(trimmed)) {
    return true;
  }
  return false;
}

function mapExternalUser(u: any, companyMap: Record<string, string>): User {
  const email = String(u.email || "");
  const emailDomain = email.includes("@") ? email.split("@").pop() ?? "" : "";
  const role = String(u.role || "").toLowerCase() === "admin" ? "Admin" : "User";
  const plan = normalisePlan(String(u.plan_name || u.plan || u.subscription_plan || ""));
  const companyId = u.company_id ?? u.companyId ?? (typeof u.company === "object" ? u.company?.id : u.company);
  const companyIdStr = companyId !== null && companyId !== undefined ? String(companyId) : "";

  // 1. Resolve human-readable business name dynamically from database & API references
  const rawCompanyName =
    (typeof u.company === "object" ? u.company?.name : null) ||
    u.company_name ||
    u.business_name ||
    (companyIdStr && companyMap[companyIdStr] ? companyMap[companyIdStr] : null);

  let finalCompanyName = "—";
  if (rawCompanyName && !isRawIdentifier(rawCompanyName)) {
    finalCompanyName = String(rawCompanyName).trim();
  } else if (typeof u.company === "string" && !isRawIdentifier(u.company) && u.company.trim() && u.company !== "—" && u.company !== "-") {
    finalCompanyName = u.company.trim();
  } else if (companyIdStr && companyMap[companyIdStr]) {
    finalCompanyName = companyMap[companyIdStr];
  }

  const companyDomain = String(
    u.company?.domain || u.company_domain || u.domain || (finalCompanyName !== "—" && !emailDomain.includes("gmail") ? emailDomain : "")
  );

  return {
    id: String(u.id),
    name: String(u.name || "No Name"),
    email,
    phone: String(u.phone || ""),
    role,
    status: String(u.status || "active").toUpperCase(),
    company: finalCompanyName,
    companyId: companyIdStr || undefined,
    companyDomain,
    plan,
    av: "#10b981",
    login: timeAgo(u.last_login_at || u.updated_at || null),
    joined: u.created_at ? new Date(u.created_at).toLocaleDateString() : "-",
    msgs: Number(u.msgs || u.messages || 0),
    campaigns: Number(u.campaigns || 0),
    chatbots: Number(u.chatbots || 0),
    pro: ["Pro", "Enterprise"].includes(plan),
  };
}

function buildStats(users: User[], totalUsers?: number, rawStats?: any): UserStats {
  if (rawStats && typeof rawStats.totalUsers === "number") {
    return {
      totalUsers: rawStats.totalUsers,
      activeUsers: rawStats.activeUsers ?? 0,
      adminUsers: rawStats.adminUsers ?? 0,
      premiumUsers: rawStats.premiumUsers ?? 0,
    };
  }
  return {
    totalUsers: totalUsers ?? users.length,
    activeUsers: users.filter((u) => u.status === "ACTIVE").length,
    adminUsers: users.filter((u) => u.role.toLowerCase() === "admin").length,
    premiumUsers: users.filter((u) =>
      ["Pro", "Enterprise"].includes(u.plan)
    ).length,
  };
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>(EMPTY_STATS);
  const [pagination, setPagination] = useState<PaginationInfo>(DEFAULT_PAGINATION);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [companiesMap, setCompaniesMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = () => setTick((t) => t + 1);

  // Optimistically update a single user's status in local state
  const updateUserStatus = (userId: string, statusVal: string) => {
    setUsers((prev) => {
      const updated = prev.map((u) =>
        u.id === userId ? { ...u, status: statusVal } : u
      );
      setStats((prevStats) => buildStats(updated, prevStats.totalUsers));
      return updated;
    });
  };

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const token = getAuthToken();
      if (!token) {
        redirectToLogin("session_expired");
        return;
      }

      setLoading(true);
      setError(null);

      // 1. Fetch Companies to build authoritative ID -> Name lookup map
      const compMap: Record<string, string> = {};
      const compList: CompanyOption[] = [];

      try {
        let compRes: any = null;
        try {
          compRes = await axiosInstance.get(COMPANIES_API);
        } catch {
          // Fallback to internal API
        }

        if (!compRes || !compRes.data) {
          const localRes = await fetch(INTERNAL_COMPANIES_API, {
            headers: getAuthHeaders(),
          });
          if (localRes.ok) {
            compRes = { data: await localRes.json() };
          }
        }

        const rawComps = recordsFromResponse(compRes?.data);
        for (const c of rawComps) {
          if (c && c.name) {
            const cId = String(c.id);
            const cName = String(c.name).trim();
            compMap[cId] = cName;
            compMap[cName] = cName;
            compList.push({ id: cId, name: cName, domain: c.domain });
          }
        }
      } catch (cErr) {
        console.warn("Companies fetch for mapping:", cErr);
      }

      if (!cancelled) {
        setCompanies(compList);
        setCompaniesMap(compMap);
      }

      // 2. Fetch Users
      try {
        let resJson: any = null;
        let succeeded = false;

        // Try external hostapi first
        try {
          const extRes = await axiosInstance.get(EXTERNAL_USERS_API, {
            params: { limit: 1000 },
          });
          if (extRes.data && (Array.isArray(extRes.data) || extRes.data.data || extRes.data.users)) {
            resJson = extRes.data;
            succeeded = true;
          }
        } catch (extErr) {
          console.warn("External users API:", extErr);
        }

        // Fallback to internal Next.js Prisma API if external fails
        if (!succeeded) {
          const internalRes = await fetch(INTERNAL_USERS_API, {
            headers: getAuthHeaders(),
          });
          if (internalRes.ok) {
            resJson = await internalRes.json();
            succeeded = true;
          }
        }

        const p = paginationFromResponse(resJson);
        const records = recordsFromResponse(resJson);
        const mappedUsers = records.map((r) => mapExternalUser(r, compMap));

        if (!cancelled) {
          setUsers(mappedUsers);
          const totalCount = p.total || mappedUsers.length;
          setPagination({
            total: totalCount,
            totalPages: Math.max(1, p.totalPages ?? Math.ceil(totalCount / 20)),
            page: 1,
            limit: 20,
          });
          setStats(buildStats(mappedUsers, totalCount, resJson?.data?.stats ?? resJson?.stats));
        }
      } catch (e: any) {
        if (!cancelled) {
          if (e?.response?.status === 401) {
            redirectToLogin("session_expired");
            return;
          }
          setUsers([]);
          setStats(EMPTY_STATS);
          setPagination(DEFAULT_PAGINATION);
          setError(e instanceof Error ? e.message : "Failed to fetch users.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [tick]);

  return { users, stats, pagination, companies, companiesMap, loading, error, refresh, updateUserStatus };
}