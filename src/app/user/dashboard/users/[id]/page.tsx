"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User as UserIcon } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout";
import Alert from "@/components/ui/Alert";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

interface UserDetails {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  image: string | null;
  memberSince: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  plan: string | null;
  subscriptionPlan: string | null;
  subscriptionId: string | null;
  subscriptionStart: string | null;
  subscriptionEnd: string | null;
  walletBalance: number;
  isPremium: boolean;
  isActive: boolean;
  hasUsedTrial: boolean;
  trialStartAt: string | null;
  trialEndAt: string | null;
  company: {
    id: string;
    name: string;
    status: string;
  } | null;
  counts: {
    messages: number;
    campaigns: number;
    chatbots: number;
  };
}

interface UserDetailsResponse {
  user: UserDetails | null;
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

function boolText(value: boolean) {
  return value ? "Yes" : "No";
}

export default function DashboardUserDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const userId = useMemo(() => {
    const raw = params?.id;
    if (Array.isArray(raw)) {
      return raw[0];
    }

    return raw;
  }, [params]);

  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError("Invalid user id.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadUser() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/admin/users/${userId}`);
        const data = (await res.json()) as UserDetailsResponse;

        if (cancelled) {
          return;
        }

        if (!res.ok) {
          throw new Error(data.error ?? `Server error ${res.status}`);
        }

        setUser(data.user);
        setError(data.error ?? null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to fetch user details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/user/dashboard/users");
  };

  const details = user
    ? [
        ["User ID", user.id],
        ["Name", user.name],
        ["Email", user.email],
        ["Phone", user.phone ?? "—"],
        ["Role", user.role],
        ["Status", user.status],
        ["Company", user.company?.name ?? "—"],
        ["Company Status", user.company?.status ?? "—"],
        ["Plan", user.plan ?? "—"],
        ["Subscription Plan", user.subscriptionPlan ?? "—"],
        ["Subscription ID", user.subscriptionId ?? "—"],
        ["Subscription Start", formatDateTime(user.subscriptionStart)],
        ["Subscription End", formatDateTime(user.subscriptionEnd)],
        ["Member Since", formatDateTime(user.memberSince)],
        ["Created At", formatDateTime(user.createdAt)],
        ["Updated At", formatDateTime(user.updatedAt)],
        ["Wallet Balance", `₹${Number(user.walletBalance ?? 0).toLocaleString("en-IN")}`],
        ["Premium User", boolText(user.isPremium)],
        ["Active", boolText(user.isActive)],
        ["Used Trial", boolText(user.hasUsedTrial)],
        ["Trial Start", formatDateTime(user.trialStartAt)],
        ["Trial End", formatDateTime(user.trialEndAt)],
        ["Messages", user.counts.messages.toLocaleString("en-IN")],
        ["Campaigns", user.counts.campaigns.toLocaleString("en-IN")],
        ["Chatbots", user.counts.chatbots.toLocaleString("en-IN")],
      ]
    : [];

  return (
    <PageContainer>
      <Button variant="ghost" size="sm" className="-ml-2 mb-3" leftIcon={<ArrowLeft size={15} />} onClick={handleBack}>
        Back
      </Button>
      <PageHeader title="User Details" description="Complete information for selected user." />

      {loading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : error ? (
        <Alert variant="error" message={error} />
      ) : user ? (
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border-subtle px-5 py-4">
            <Avatar name={user.name} src={user.image} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">{user.name}</p>
              <p className="truncate text-[0.8125rem] text-muted-foreground">{user.email}</p>
            </div>
            <Badge variant={user.isActive ? "success" : "neutral"} dot>
              {user.status}
            </Badge>
          </div>

          <dl className="grid grid-cols-1 gap-px bg-border-subtle sm:grid-cols-2">
            {details.map(([label, value]) => (
              <div key={label} className="bg-surface px-5 py-3">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 break-words text-sm text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      ) : (
        <Card padding="none">
          <EmptyState icon={<UserIcon size={20} />} title="User not found." />
        </Card>
      )}
    </PageContainer>
  );
}
