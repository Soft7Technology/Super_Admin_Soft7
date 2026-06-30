import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import { User, UserStats, timeAgo } from "../types";

const EXTERNAL_USERS_API = "/v1/admin/companies/user";

interface UseUsersReturn {
  users: User[];
  stats: UserStats;
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

function recordsFromResponse(json: any): any[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.data?.data)) return json.data.data;
  if (Array.isArray(json?.users)) return json.users;
  return [];
}

function paginationFromResponse(json: any) {
  return json?.data?.pagination ?? json?.pagination ?? {};
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

function buildStats(users: User[]): UserStats {
  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "ACTIVE").length,
    adminUsers: 0, // No admins on this page
    premiumUsers: users.filter((u) =>
      ["Pro", "Enterprise"].includes(u.plan)
    ).length,
  };
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = () => setTick((t) => t + 1);

  // Optimistically update a single user's status in local state
  const updateUserStatus = (userId: string, status: string) => {
    setUsers((prev) => {
      const updated = prev.map((u) =>
        u.id === userId ? { ...u, status } : u
      );
      setStats(buildStats(updated));
      return updated;
    });
  };

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setLoading(true);
      setError(null);

      try {
        const { data: firstJson } = await axiosInstance.get(
          `${EXTERNAL_USERS_API}?role=user&page=1&limit=10`
        );

        const pagination = paginationFromResponse(firstJson);
        const totalPages = Number(pagination.totalPages || pagination.total_pages || 1);

        const pageRequests = Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) =>
          axiosInstance
            .get(`${EXTERNAL_USERS_API}?role=user&page=${i + 2}&limit=10`)
            .then((r) => r.data)
        );

       const restPages = await Promise.all(pageRequests);

const allRecords = [
  ...recordsFromResponse(firstJson),
  ...restPages.flatMap(recordsFromResponse),
];

// Extra safety: only keep users
const onlyUsers = allRecords.filter(
  (u) => String(u.role || "").toLowerCase() === "user"
);

const mappedUsers = onlyUsers.map(mapExternalUser);
        if (!cancelled) {
          setUsers(mappedUsers);
          setStats(buildStats(mappedUsers));
        }
      } catch (e) {
        if (!cancelled) {
          setUsers([]);
          setStats(EMPTY_STATS);
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
  }, [tick]);

  return { users, stats, loading, error, refresh, updateUserStatus };
}
