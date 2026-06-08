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
export const STATUS_CSS: Record<string, string> = {
  ACTIVE:    "au-badge--active",
  INACTIVE:  "au-badge--inactive",
  SUSPENDED: "au-badge--suspended",
  PENDING:   "au-badge--pending",
};

export const STATUS_DOT: Record<string, string> = {
  ACTIVE:    "au-status-dot--active",
  INACTIVE:  "au-status-dot--other",
  SUSPENDED: "au-status-dot--suspended",
  PENDING:   "au-status-dot--other",
};

const PLAN_COLOR: Record<string, string> = {
  Enterprise: "#10b981",
  Pro:        "#6366f1",
  Basic:      "#f59e0b",
  Starter:    "#34d399",
};

const ROLE_COLOR: Record<string, string> = {
  Admin: "#10b981",
  User:  "#64748b",
};

export function planColor(plan: string): string {
  return PLAN_COLOR[plan] ?? "#94a3b8";
}

export function roleColor(role: string): string {
  return ROLE_COLOR[role] ?? "#94a3b8";
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
