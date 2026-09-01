import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import { User, UserStats, timeAgo } from "../types";

const EXTERNAL_USERS_API = "/v1/admin/companies/user";

export interface PaginationInfo {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

interface UseUsersParams {
  page?: number;
  limit?: number;
  status?: string;
  role?: string;
  search?: string;
}

interface UseUsersReturn {
  users: User[];
  stats: UserStats;
  pagination: PaginationInfo;
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
  limit: 10,
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

function mapExternalUser(u: any): User {
  const email = String(u.email || "");
  const emailDomain = email.includes("@") ? email.split("@").pop() ?? "" : "";
  const role = String(u.role || "").toLowerCase() === "admin" ? "Admin" : "User";
  const plan = normalisePlan(String(u.plan_name || u.plan || u.subscription_plan || ""));
  const companyId = u.company_id ?? u.companyId ?? u.company?.id;
  const companyDomain = String(u.company?.domain || u.company_domain || u.domain || emailDomain || "");

  return {
    id: String(u.id),
    name: String(u.name || "No Name"),
    email,
    phone: String(u.phone || ""),
    role,
    status: String(u.status || "active").toUpperCase(),
    company: String(u.company?.name || u.company_name || (companyId ? `ID: ${String(companyId).slice(0, 8)}...` : "-")),
    companyId: companyId ? String(companyId) : undefined,
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

/**
 * Maps the UI status filter value (ALL / ACTIVE / INACTIVE / SUSPENDED)
 * to the `status` query param expected by the API:
 *   all | active | inactive | suspended
 */
function toApiStatus(status: string): string {
  switch (String(status).toUpperCase()) {
    case "ACTIVE":
      return "active";
    case "INACTIVE":
      return "inactive";
    case "SUSPENDED":
    case "SUSPEND":
      return "suspended";
    default:
      return "all";
  }
}

/**
 * Maps the UI role filter value (ALL / ADMIN / USER)
 * to the `role` query param expected by the API:
 *   all | admin | user
 */
function toApiRole(role: string): string {
  switch (String(role).toUpperCase()) {
    case "ADMIN":
      return "admin";
    case "USER":
      return "user";
    default:
      return "all";
  }
}

export function useUsers({
  page = 1,
  limit = 10,
  status = "ALL",
  role = "ALL",
  search = "",
}: UseUsersParams = {}): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>(EMPTY_STATS);
  const [pagination, setPagination] = useState<PaginationInfo>({
    ...DEFAULT_PAGINATION,
    page,
    limit,
  });
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
    const apiStatus = toApiStatus(status);
    const apiRole = toApiRole(role);

    async function loadUsers() {
      setLoading(true);
      setError(null);

      try {
        const params: Record<string, any> = {
          role: apiRole,
          page,
          limit,
          status: apiStatus,
        };
        const trimmedSearch = search.trim();
        if (trimmedSearch) {
          params.search = trimmedSearch;
        }

        const { data: resJson } = await axiosInstance.get(EXTERNAL_USERS_API, {
          params,
        });

        const p = paginationFromResponse(resJson);
        const records = recordsFromResponse(resJson);
        const mappedUsers = records.map(mapExternalUser);

        if (!cancelled) {
          setUsers(mappedUsers);
          const totalCount = p.total ?? mappedUsers.length;
          const totalPagesCount = Math.max(1, p.totalPages ?? Math.ceil(totalCount / limit));

          setPagination({
            total: totalCount,
            totalPages: totalPagesCount,
            page: p.page ?? page,
            limit: p.limit ?? limit,
          });

          setStats(buildStats(mappedUsers, totalCount, resJson?.data?.stats ?? resJson?.stats));
        }
      } catch (e) {
        if (!cancelled) {
          setUsers([]);
          setStats(EMPTY_STATS);
          setPagination({
            total: 0,
            totalPages: 1,
            page,
            limit,
          });
          setError(e instanceof Error ? e.message : "Failed to fetch users.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [tick, page, limit, status, role, search]);

  return { users, stats, pagination, loading, error, refresh, updateUserStatus };
}