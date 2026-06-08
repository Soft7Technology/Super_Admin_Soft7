import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import { User, UserStats, timeAgo } from "../types";

const EXTERNAL_USERS_API = "/v1/admin/companies/user";

interface UseUsersReturn {
  users: User[];
  stats: UserStats;
  loading: boolean;
  error: string | null;
}

export function useUsers(): UseUsersReturn {
  const [users,   setUsers]   = useState<User[]>([]);
  const [stats,   setStats]   = useState<UserStats>({
    totalUsers: 0, activeUsers: 0, adminUsers: 0, premiumUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setLoading(true);
      setError(null);

      try {
        // Step 1: fetch first page to get total page count
        const { data: firstJson } = await axiosInstance.get(
          `${EXTERNAL_USERS_API}?role=user&page=1&limit=10`
        );

        const totalPages: number = firstJson?.data?.pagination?.totalPages ?? 1;

        // Step 2: fetch remaining user pages + admins in parallel
        const pageRequests = Array.from({ length: totalPages - 1 }, (_, i) =>
          axiosInstance
            .get(`${EXTERNAL_USERS_API}?role=user&page=${i + 2}&limit=10`)
            .then((r) => r.data)
        );
        const adminRequest = axiosInstance
          .get(`${EXTERNAL_USERS_API}?role=admin`)
          .then((r) => r.data);

        const [adminJson, ...restPages] = await Promise.all([adminRequest, ...pageRequests]);

        // Step 3: flatten all raw records
        const allUserRecords: any[] = [
          ...(firstJson?.data?.data ?? []),
          ...restPages.flatMap((p) => p?.data?.data ?? []),
          ...(adminJson?.data?.data ?? []),
        ];

        const mappedUsers: User[] = allUserRecords.map((u: any) => ({
          id:      u.id,
          name:    u.name  || "No Name",
          email:   u.email || "",
          phone:   u.phone || "",
          role:    u.role === "admin" ? "Admin" : "User",
          status:  (u.status || "active").toUpperCase(),
          company: u.company_id ? `ID: ${u.company_id.slice(0, 8)}…` : "—",
          plan:
            u.plan_name === "Enterpriess" ? "Enterprise" :
            u.plan_name === "Free Trial"  ? "Starter"    :
            u.plan_name                   || "Starter",
          av:        "#10b981",
          login:     timeAgo(u.last_login_at),
          joined:    u.created_at ? new Date(u.created_at).toLocaleDateString() : "—",
          msgs:      0,
          campaigns: 0,
          chatbots:  0,
          pro:       ["Pro", "Enterprise"].includes(u.plan_name),
        }));

        if (!cancelled) {
          setUsers(mappedUsers);
          setStats({
            totalUsers:   mappedUsers.length,
            activeUsers:  mappedUsers.filter((u) => u.status === "ACTIVE").length,
            adminUsers:   mappedUsers.filter((u) => u.role === "Admin").length,
            premiumUsers: mappedUsers.filter((u) => ["Pro", "Enterprise"].includes(u.plan)).length,
          });
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUsers();
    return () => { cancelled = true; };
  }, []);

  return { users, stats, loading, error };
}
