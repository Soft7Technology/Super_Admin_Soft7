// hooks/useDashboardData.ts
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstance";
import { DateRangeKey, getDateRange } from "@/lib/dateRanges";

const getHeaders = () => {
  let token = typeof window !== "undefined"
    ? localStorage.getItem("console_access_token") : null;
  if (token?.startsWith('"') && token?.endsWith('"')) token = token.slice(1, -1);
  return {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ── Dashboard stats ──────────────────────────────────────────
async function fetchDashboardStats(rangeKey: DateRangeKey) {
  const { from, to } = getDateRange(rangeKey);
  const { data } = await axiosInstance.get("/v1/admin/companies/dashboard", {
    params: { from, to },        // your API needs to accept these
    headers: getHeaders(),
    withCredentials: false,
  });
  return data?.data ?? data;
}

export function useDashboardStats(rangeKey: DateRangeKey) {
  return useQuery({
    queryKey: ["dashboard", "stats", rangeKey],   // <-- cache key includes range
    queryFn: () => fetchDashboardStats(rangeKey),
    staleTime: 1000 * 60 * 3,   // 3 min — override global default for dashboard
  });
}

// ── Companies ────────────────────────────────────────────────
async function fetchCompanies() {
  const { data } = await axiosInstance.get("/v1/admin/companies?status=active", {
    headers: getHeaders(),
    withCredentials: false,
  });
  return data?.data ?? [];
}

export function useCompanies() {
  return useQuery({
    queryKey: ["dashboard", "companies"],
    queryFn: fetchCompanies,
    staleTime: 1000 * 60 * 5,
  });
}

// ── Users ────────────────────────────────────────────────────
async function fetchUsers() {
  const headers = getHeaders();
  const [regular, admins] = await Promise.all([
    axiosInstance.get("/v1/admin/companies/user?role=user&page=1&limit=4", { headers, withCredentials: false }),
    axiosInstance.get("/v1/admin/companies/user?role=admin", { headers, withCredentials: false })
      .catch(() => ({ data: null })),
  ]);

  const flatten = (json: any): any[] => {
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json?.data?.data)) return json.data.data;
    if (Array.isArray(json?.users)) return json.users;
    return [];
  };

  return [...flatten(regular.data), ...flatten(admins.data)];
}

export function useUsers() {
  return useQuery({
    queryKey: ["dashboard", "users"],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5,
  });
}

// ── Platform growth (range-aware) ────────────────────────────
async function fetchPlatformGrowth(rangeKey: DateRangeKey) {
  const { from, to } = getDateRange(rangeKey);
  const { data } = await axiosInstance.get("/v1/admin/companies/growth", {
    params: { from, to },
    headers: getHeaders(),
    withCredentials: false,
  });
  return data?.data ?? data;
}

export function usePlatformGrowth(rangeKey: DateRangeKey) {
  return useQuery({
    queryKey: ["dashboard", "growth", rangeKey],
    queryFn: () => fetchPlatformGrowth(rangeKey),
    staleTime: 1000 * 60 * 3,
  });
}