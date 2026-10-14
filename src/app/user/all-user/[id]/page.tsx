"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import {
  ArrowLeft,
  Mail,
  Phone,
  Pencil,
  Share2,
  KeyRound,
  Folder,
  Users,
  Send,
  MessageSquare,
  AlertCircle,
  UserCheck,
  UserX,
  Layers,
  TrendingUp,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { axiosInstance } from "@/lib/axiosInstance";
import { PageContainer, PageHeader } from "@/components/layout";
import KpiCard from "@/components/admin/KpiCard";
import type { KpiTone } from "@/components/admin/KpiCard";
import Avatar from "@/components/ui/Avatar";
import KitBadge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import type { ButtonVariant } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import Tabs from "@/components/ui/Tabs";
import { cn } from "@/lib/utils";
import { Badge } from "../components/Badge";
import { EditUserModal } from "../components/EditUserModal";
import { ResetPasswordModal } from "../components/ResetPasswordModal";
import { User as UserType, planVariant, roleVariant } from "../types";


// ─── TYPES & CONFIGS ────────────────────────────────────────────────────────
interface UserProfileDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  plan: string;
  company: string;
  companyDomain?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserProfileStats {
  totalCampaigns: number;
  totalContacts: number;
  uniqueContacts: number;
  messagesSent: number;
  messagesDelivered: number;
  failedMessages: number;
  totalMessages: number;
  contactLists: number;
  messageTemplates: number;
  templates: number;
}

const DEFAULT_STATS: UserProfileStats = {
  totalCampaigns: 0,
  totalContacts: 0,
  uniqueContacts: 0,
  messagesSent: 0,
  messagesDelivered: 0,
  failedMessages: 0,
  totalMessages: 0,
  contactLists: 0,
  messageTemplates: 0,
  templates: 0,
};

const PLAN_META: Record<
  string,
  { title: string; sub: string; maxContacts: number; maxCampaigns: number; features: string[] }
> = {
  Free: {
    title: "Free",
    sub: "Free Plan • ₹0.00/month",
    maxContacts: 0,
    maxCampaigns: 0,
    features: ["Up to 0 contacts", "Up to 0 campaigns", "Free support"],
  },
  Starter: {
    title: "Free",
    sub: "Free Plan • ₹0.00/month",
    maxContacts: 0,
    maxCampaigns: 0,
    features: ["Up to 0 contacts", "Up to 0 campaigns", "Free support"],
  },
  Basic: {
    title: "Basic",
    sub: "Basic Plan • ₹499.00/month",
    maxContacts: 1000,
    maxCampaigns: 50,
    features: ["Up to 1,000 contacts", "Up to 50 campaigns", "Standard support"],
  },
  Pro: {
    title: "Pro",
    sub: "Pro Plan • ₹1,499.00/month",
    maxContacts: 10000,
    maxCampaigns: 500,
    features: ["Up to 10,000 contacts", "Up to 500 campaigns", "Priority 24/7 support", "Custom WhatsApp templates"],
  },
  Enterprise: {
    title: "Enterprise",
    sub: "Enterprise Plan • ₹4,999.00/month",
    maxContacts: 100000,
    maxCampaigns: 5000,
    features: ["Unlimited contacts", "Unlimited campaigns", "Dedicated account manager", "Custom webhooks"],
  },
};

// ─── REUSABLE FORMATTERS ───────────────────────────────────────────────────
function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatPlanDateTime(dateStr: string | null | Date, offsetDays = 0) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (offsetDays) d.setDate(d.getDate() + offsetDays);
    const datePart = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timePart = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    return `${datePart}, ${timePart}`;
  } catch {
    return String(dateStr);
  }
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "Recently";
  try {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    const days = Math.floor(diff / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } catch {
    return "Recently";
  }
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function UserProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isDark } = useTheme();

  const userId = useMemo(() => {
    const raw = params?.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const [user, setUser] = useState<UserProfileDetails | null>(null);
  const [stats, setStats] = useState<UserProfileStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"Overview" | "Activity Log" | "Campaigns" | "Plan">("Overview");

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("Pro");

  // Load user data with instant cache + API fallback
  const loadUserData = useCallback(async () => {
    if (!userId) {
      setError("Invalid User ID.");
      setLoading(false);
      return;
    }

    let cachedFound = false;

    // 1. Instant load from sessionStorage cache
    try {
      const cached =
        sessionStorage.getItem(`user_${userId}`) ||
        sessionStorage.getItem("sa_selected_user");

      if (cached) {
        const p = JSON.parse(cached);
        if (String(p.id) === String(userId)) {
          cachedFound = true;
          setUser({
            id: String(p.id),
            name: p.name || "User",
            email: p.email || "",
            phone: p.phone || "",
            role: (p.role || "User").toLowerCase() === "admin" ? "Admin" : "User",
            status: (p.status || "ACTIVE").toUpperCase(),
            plan: p.plan || "Starter",
            company: p.company || "—",
            companyDomain: p.companyDomain || "—",
            createdAt: p.createdAt || new Date().toISOString(),
            updatedAt: p.updatedAt || new Date().toISOString(),
          });
          setStats((prev) => ({
            ...prev,
            totalCampaigns: Number(p.campaigns || 0),
            totalContacts: Number(p.contacts || 0),
            uniqueContacts: Number(p.contacts || 0),
            totalMessages: Number(p.msgs || p.messages || 0),
          }));
          setLoading(false);
        }
      }
    } catch {}

    // 2. Fresh fetch from backend API
    try {
      if (!cachedFound) setLoading(true);
      setError(null);

      const { data: resJson } = await axiosInstance.get("/v1/admin/companies/user", {
        params: { limit: 1000 },
      });

      const records: any[] = Array.isArray(resJson?.data?.data)
        ? resJson.data.data
        : Array.isArray(resJson?.data)
        ? resJson.data
        : Array.isArray(resJson?.users)
        ? resJson.users
        : [];

      const raw = records.find(
        (u: any) =>
          String(u.id) === String(userId) ||
          String(u._id) === String(userId) ||
          String(u.uuid) === String(userId)
      );

      if (raw) {
        const freshUser: UserProfileDetails = {
          id: String(raw.id),
          name: String(raw.name || "User"),
          email: String(raw.email || ""),
          phone: String(raw.phone || ""),
          role: String(raw.role || "").toLowerCase() === "admin" ? "Admin" : "User",
          status: String(raw.status || "active").toUpperCase(),
          plan: raw.plan_name || raw.plan || raw.subscription_plan || "Starter",
          company: raw.company?.name || raw.company_name || "—",
          companyDomain: raw.company?.domain || raw.company_domain || "—",
          createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
          updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString(),
        };

        setUser(freshUser);
        setStats((prev) => ({
          ...prev,
          totalCampaigns: Number(raw.campaigns || 0),
          totalContacts: Number(raw.contacts || 0),
          uniqueContacts: Number(raw.contacts || 0),
          messagesSent: Number(raw.msgs || raw.messages || 0),
          totalMessages: Number(raw.msgs || raw.messages || 0),
        }));

        try {
          sessionStorage.setItem(`user_${userId}`, JSON.stringify(freshUser));
        } catch {}
      } else if (!cachedFound) {
        throw new Error(`User profile not found for ID: ${userId}`);
      }
    } catch (err: any) {
      if (!cachedFound) {
        setError(err?.message || "Failed to load user profile");
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Unified status and plan updater
  const updateUserData = async (payload: { status?: string; plan?: string }, successMsg: string) => {
    if (!userId || !user) return;
    try {
      setActionLoading(true);
      const endpoint =
        payload.status === "ACTIVE"
          ? `/v1/admin/users/${userId}/active-user`
          : payload.status === "SUSPENDED"
          ? `/v1/admin/users/${userId}/suspend-user`
          : `/v1/admin/users/${userId}`;

      await axiosInstance.put(endpoint, payload).catch(() =>
        fetch(`/api/admin/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      );

      setUser((prev) => (prev ? { ...prev, ...payload } : null));
      toast.success(successMsg);
      if (payload.plan) setIsPlanModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Operation failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) return router.back();
    router.push("/user/all-user");
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile URL copied to clipboard!");
  };

  // Pre-configured arrays for clean rendering
  const topStats: { label: string; val: number; icon: typeof Folder; tone?: KpiTone; rotate?: boolean }[] = [
    { label: "Total Campaigns", val: stats.totalCampaigns, icon: Folder },
    { label: "Total Contacts", val: stats.totalContacts, icon: Users, tone: "info" },
    { label: "Messages Sent", val: stats.messagesSent, icon: Send, tone: "warning" },
    { label: "Messages Delivered", val: stats.messagesDelivered, icon: MessageSquare, tone: "success" },
    { label: "Failed Messages", val: stats.failedMessages, icon: Send, tone: "error", rotate: true },
  ];

  const overviewMetrics = [

    { label: "Total Campaigns", val: stats.totalCampaigns },
    { label: "Total Contacts", val: stats.totalContacts },
    { label: "Unique Contacts", val: stats.uniqueContacts },
    { label: "Total Messages", val: stats.totalMessages },
    { label: "Messages Delivered", val: stats.messagesDelivered },
    { label: "Contact Lists", val: stats.contactLists },
    { label: "Message Templates", val: stats.messageTemplates },
    { label: "Templates", val: stats.templates },
    { label: "Failed Messages", val: stats.failedMessages },
  ];

  const quickActions: { label: string; icon: typeof Folder; variant: ButtonVariant; onClick: () => void }[] = [
    {
      label: "Reset Password",
      icon: KeyRound,
      variant: "secondary",
      onClick: () => setIsResetPasswordOpen(true),
    },
    {
      label: "Suspend User",
      icon: UserX,
      variant: "danger",
      onClick: () => {
        if (window.confirm(`Are you sure you want to suspend ${user?.name}?`)) {
          updateUserData({ status: "SUSPENDED" }, "User suspended successfully");
        }
      },
    },
    {
      label: "Activate User",
      icon: UserCheck,
      variant: "secondary",
      onClick: () => {
        if (window.confirm(`Are you sure you want to activate ${user?.name}?`)) {
          updateUserData({ status: "ACTIVE" }, "User activated successfully");
        }
      },
    },
    {
      label: "Update Plan",
      icon: Layers,
      variant: "primary",
      onClick: () => {
        setSelectedPlan(user?.plan || "Starter");
        setIsPlanModalOpen(true);
      },
    },
  ];

  const modalUserObject: UserType | null = user

    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        company: user.company,
        companyDomain: user.companyDomain,
        plan: user.plan,
        av: "var(--color-brand)",
        login: "Recently",
        joined: formatDate(user.createdAt),
        msgs: stats.totalMessages,
        campaigns: stats.totalCampaigns,
        chatbots: 0,
        pro: ["Pro", "Enterprise"].includes(user.plan),
      }
    : null;

  const tabContent = (() => {
    if (!user) return null;

    if (activeTab === "Overview") {
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {overviewMetrics.map((m) => (
            <div key={m.label} className="rounded-lg border border-border-subtle bg-surface-muted px-4 py-3">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{m.val}</p>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === "Activity Log") {
      return (
        <div>
          <h4 className="mb-4 text-[0.9375rem] font-semibold text-foreground">Activity & Audit History</h4>
          <ul className="space-y-2 text-sm text-secondary-foreground">
            <li>• User account created on {formatDate(user.createdAt)}</li>
            <li>
              • Last updated on {formatDate(user.updatedAt)} ({timeAgo(user.updatedAt)})
            </li>
            <li>
              • Current account status: <Badge status={user.status} />
            </li>
          </ul>
        </div>
      );
    }

    if (activeTab === "Campaigns") {
      return (
        <div>
          <h4 className="mb-2 text-[0.9375rem] font-semibold text-foreground">User Campaigns</h4>
          <p className="text-sm text-secondary-foreground">
            Total Campaigns launched: <span className="font-semibold text-foreground">{stats.totalCampaigns}</span>
          </p>
          {stats.totalCampaigns === 0 && (
            <EmptyState
              compact
              className="mt-4"
              icon={<Folder size={20} />}
              title="No active or past campaigns recorded for this user yet."
            />
          )}
        </div>
      );
    }

    const currentPlanKey = user.plan || "Free";
    const planInfo = PLAN_META[currentPlanKey] || PLAN_META["Free"];
    const usages = [
      { label: "Contact", count: stats.totalContacts, max: planInfo.maxContacts },
      { label: "Campaign", count: stats.totalCampaigns, max: planInfo.maxCampaigns },
    ];

    return (
      <div className="space-y-5">
        <div className="rounded-lg border border-border-subtle bg-surface-muted p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{planInfo.title}</h3>
              <p className="text-[0.8125rem] text-muted-foreground">{planInfo.sub}</p>
            </div>
            <KitBadge variant="success" dot>
              Active
            </KitBadge>
          </div>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Start Date</dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">{formatPlanDateTime(user.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">End Date</dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">{formatPlanDateTime(user.createdAt, 10)}</dd>
            </div>
          </dl>
        </div>

        {/* Usage Statistics */}
        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <TrendingUp size={16} className="text-primary-text" /> Usage Statistics
          </p>
          <div className="space-y-4">
            {usages.map((u) => {
              const pct = Math.min(100, u.max > 0 ? (u.count / u.max) * 100 : 0);
              return (
                <div key={u.label}>
                  <div className="mb-1.5 flex justify-between text-[0.8125rem]">
                    <span className="text-secondary-foreground">{u.label}</span>
                    <span className="font-medium tabular-nums text-foreground">
                      {u.count} / {u.max}
                    </span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-surface-muted"
                    role="progressbar"
                    aria-label={`${u.label} usage`}
                    aria-valuenow={Math.round(pct)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan Features */}
        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Zap size={16} className="text-primary-text" /> Plan Features
          </p>
          <ul className="space-y-2">
            {planInfo.features.map((feat, i) => (
              <li key={i} className="flex items-center gap-2 text-[0.8125rem] text-secondary-foreground">
                <CheckCircle2 size={15} className="shrink-0 text-success" />
                {feat}
              </li>
            ))}
          </ul>
        </div>

        <Button
          className="w-full"
          onClick={() => {
            setSelectedPlan(user.plan || "Starter");
            setIsPlanModalOpen(true);
          }}
        >
          Upgrade / Change Plan
        </Button>
      </div>
    );
  })();

  return (
    <PageContainer>
      <ToastContainer position="top-right" autoClose={3000} theme={isDark ? "dark" : "light"} />

      <Button variant="ghost" size="sm" className="-ml-2 mb-3" leftIcon={<ArrowLeft size={15} />} onClick={handleBack}>
        Back to All Users
      </Button>
      <PageHeader title="User Profile" description="Account details, usage and quick actions for this user." />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-44 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      ) : error || !user ? (
        <Card padding="none">
          <EmptyState
            icon={<AlertCircle size={20} />}
            title={error || "User Not Found"}
            description={`Could not retrieve profile information for user ID ${userId}.`}
            action={
              <div className="flex justify-center gap-3">
                <Button variant="secondary" onClick={loadUserData}>
                  Try Again
                </Button>
                <Button onClick={handleBack}>Back to All Users</Button>
              </div>
            }
          />
        </Card>
      ) : (
        <>
          {/* ── HERO CARD ── */}
          <Card padding="none" className="mb-4 overflow-hidden">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <Avatar name={user.name || "User"} size="xl" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-lg font-semibold text-foreground">{user.name || "User"}</h2>
                    <KitBadge variant={roleVariant(user.role)}>{user.role || "User"}</KitBadge>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Mail size={14} />
                      {user.email || "No email"}
                    </span>
                    {user.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone size={14} />
                        {user.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" size="sm" leftIcon={<Share2 size={14} />} onClick={handleShareProfile}>
                  Share Profile
                </Button>
                <Button size="sm" leftIcon={<Pencil size={14} />} onClick={() => setIsEditOpen(true)}>
                  Edit Profile
                </Button>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-px border-t border-border-subtle bg-border-subtle lg:grid-cols-4">
              <div className="bg-surface-muted px-5 py-3">
                <dt className="text-xs text-muted-foreground">User ID</dt>
                <dd className="mt-0.5 truncate text-sm font-medium text-foreground" title={user.id}>
                  {user.id}
                </dd>
              </div>
              <div className="bg-surface-muted px-5 py-3">
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd className="mt-1">
                  <Badge status={user.status || "ACTIVE"} />
                </dd>
              </div>
              <div className="bg-surface-muted px-5 py-3">
                <dt className="text-xs text-muted-foreground">Joined</dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">{formatDate(user.createdAt)}</dd>
              </div>
              <div className="bg-surface-muted px-5 py-3">
                <dt className="text-xs text-muted-foreground">Last Active</dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">{timeAgo(user.updatedAt)}</dd>
              </div>
            </dl>
          </Card>

          {/* ── TOP 5 STAT CARDS ── */}
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {topStats.map((s) => (
              <KpiCard
                key={s.label}
                label={s.label}
                value={s.val.toLocaleString()}
                tone={s.tone}
                icon={<s.icon size={18} className={s.rotate ? "rotate-45" : undefined} />}
              />
            ))}
          </div>

          {/* ── LOWER 2-COLUMN SECTION ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <div className="space-y-4">
              <Card>
                <CardHeader title="User Info" />
                <dl className="space-y-2.5 text-[0.8125rem]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="truncate font-medium text-foreground">{user.email || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Status</dt>
                    <dd className="font-medium capitalize text-foreground">{user.status?.toLowerCase() || "active"}</dd>
                  </div>
                  {user.company && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Company</dt>
                      <dd className="truncate font-medium text-foreground">{user.company}</dd>
                    </div>
                  )}
                  {user.plan && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Plan</dt>
                      <dd>
                        <KitBadge variant={planVariant(user.plan)}>{user.plan}</KitBadge>
                      </dd>
                    </div>
                  )}
                </dl>
              </Card>

              <Card>
                <CardHeader title="Quick Actions" />
                <div className="space-y-2">
                  {quickActions.map((act) => (
                    <Button
                      key={act.label}
                      variant={act.variant}
                      className="w-full justify-start"
                      leftIcon={<act.icon size={15} />}
                      onClick={act.onClick}
                      disabled={actionLoading}
                    >
                      {act.label}
                    </Button>
                  ))}
                </div>
              </Card>
            </div>

            <Card>
              <Tabs
                variant="pills"
                activeTab={activeTab}
                onChange={(id) => setActiveTab(id as typeof activeTab)}
                tabs={(["Overview", "Activity Log", "Campaigns", "Plan"] as const).map((tab) => ({
                  id: tab,
                  label: tab,
                  content: activeTab === tab ? tabContent : null,
                }))}
              />
            </Card>
          </div>
        </>
      )}

      {/* ── MODALS ── */}
      {isEditOpen && modalUserObject && (
        <EditUserModal
          user={modalUserObject}
          onClose={() => setIsEditOpen(false)}
          onUpdated={(updated) => {
            setUser((prev) => (prev ? { ...prev, ...updated } : null));
          }}
        />
      )}

      {isResetPasswordOpen && modalUserObject && (
        <ResetPasswordModal
          user={modalUserObject}
          onClose={() => setIsResetPasswordOpen(false)}
        />
      )}

      {/* Plan Selection Modal */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        size="sm"
        title="Update Subscription Plan"
        description={`Select a new plan for ${user?.name ?? "this user"}:`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsPlanModalOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              isLoading={actionLoading}
              onClick={() => updateUserData({ plan: selectedPlan }, `Plan updated to ${selectedPlan}`)}
            >
              Save Plan
            </Button>
          </>
        }
      >
        <div role="radiogroup" aria-label="Plan" className="space-y-2">
          {["Starter", "Basic", "Pro", "Enterprise"].map((planOption) => {
            const selected = selectedPlan === planOption;
            return (
              <label
                key={planOption}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                  selected
                    ? "border-primary bg-primary-lighter text-primary-text"
                    : "border-border text-foreground hover:border-primary-soft hover:bg-surface-hover",
                )}
              >
                {planOption}
                <input
                  type="radio"
                  name="plan"
                  checked={selected}
                  onChange={() => setSelectedPlan(planOption)}
                  className="accent-primary"
                />
              </label>
            );
          })}
        </div>
      </Modal>
    </PageContainer>
  );
}
