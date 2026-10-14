import type { BadgeVariant } from "@/components/ui/Badge";

// ─── TYPES ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  company: string;
  companyId?: string;
  companyDomain?: string;
  plan: string;
  av: string;
  login: string;
  joined: string;
  msgs: number;
  campaigns: number;
  chatbots: number;
  pro: boolean;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  premiumUsers: number;
}

// ─── LOOKUP MAPS ──────────────────────────────────────────────────────────────

export const STATUS_VARIANT: Record<string, BadgeVariant> = {
  ACTIVE:    "success",
  INACTIVE:  "neutral",
  SUSPENDED: "error",
  PENDING:   "warning",
};

const PLAN_VARIANT: Record<string, BadgeVariant> = {
  Enterprise: "primary",
  Pro:        "primary",
  Basic:      "warning",
  Starter:    "info",
};

const ROLE_VARIANT: Record<string, BadgeVariant> = {
  Admin: "primary",
  User:  "neutral",
};

export function statusVariant(status: string): BadgeVariant {
  return STATUS_VARIANT[status] ?? "neutral";
}

export function planVariant(plan: string): BadgeVariant {
  return PLAN_VARIANT[plan] ?? "neutral";
}

export function roleVariant(role: string): BadgeVariant {
  return ROLE_VARIANT[role] ?? "neutral";
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export function timeAgo(dateString: string | null): string {
  if (!dateString) return "—";
  const diffMs    = Date.now() - new Date(dateString).getTime();
  const diffDays  = Math.floor(diffMs / 86400000);
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffDays  > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return "Just now";
}
