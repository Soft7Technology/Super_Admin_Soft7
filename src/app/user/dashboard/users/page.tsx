"use client";

import { ArrowLeft } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserManagement from "../../../../components/UserManagement";
import { axiosInstance } from "@/lib/axiosInstance";

const USERS_API = "/v1/admin/companies/user";

interface ApiUser {
  id: number | string;
  name: string;
  role: string;
  status: string;
}

interface UserRow {
  id: string;
  un: string;
  role: string;
  status: string;
  av: string;
  col: string;
}

const USER_COLORS = [
  "var(--color-primary)",
  "var(--color-primary)",
  "var(--color-warning)",
  "var(--color-primary)",
  "var(--color-error)",
];

// Same header pattern used across the dashboard for external API calls.
const getExternalHeaders = () => {
  let token =
    typeof window !== "undefined"
      ? localStorage.getItem("console_access_token")
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

// Same response-unwrapping helper used on the dashboard page, so both
// pages parse the external API's response shape identically.
function recordsFromResponse(json: any): any[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.data?.data)) return json.data.data;
  if (Array.isArray(json?.users)) return json.users;
  return [];
}

function isAxiosErrorLike(err: unknown): err is { isAxiosError: true; response?: { data?: { message?: string } }; message?: string } {
  return typeof err === "object" && err !== null && (err as any).isAxiosError === true;
}

function toInitials(name: string) {
  const cleaned = name.trim();
  if (!cleaned) {
    return "NA";
  }

  return cleaned
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function toUsername(name: string) {
  const cleaned = name.trim();
  if (!cleaned) {
    return "unknown_user";
  }

  return cleaned.toLowerCase().replace(/\s+/g, "_");
}

export default function DashboardUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setLoading(true);
      setError(null);

      try {
        const { data: usersResponse } = await axiosInstance.get(
          `${USERS_API}?limit=all`,
          {
            headers: getExternalHeaders(),
            withCredentials: false,
          }
        );

        if (cancelled) {
          return;
        }

        const records = recordsFromResponse(usersResponse) as ApiUser[];

        const mappedUsers: UserRow[] = records.map((user, index) => ({
          id: String(user.id),
          un: toUsername(user.name),
          role: user.role
            ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
            : "User",
          status: user.status
            ? user.status.charAt(0).toUpperCase() + user.status.slice(1).toLowerCase()
            : "Active",
          av: toInitials(user.name),
          col: USER_COLORS[index % USER_COLORS.length],
        }));

        setUsers(mappedUsers);
      } catch (err) {
        if (cancelled) {
          return;
        }
        if (isAxiosErrorLike(err)) {
          setError(err.response?.data?.message || err.message || "Failed to fetch users.");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to fetch users.");
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
      <PageHeader title="All Users" description="Complete user list in tabular view." />

      <UserManagement
        title="User Management"
        showViewAll={false}
        users={users}
        loading={loading}
        error={error}
        onUserClick={(user) => router.push(`/user/dashboard/users/${user.id}`)}
      />
    </PageContainer>
  );
}
