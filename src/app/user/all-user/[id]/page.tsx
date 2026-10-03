"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "../../../../context/ThemeContext";
import "./user-profile.css";
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
  TrendingUp,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { axiosInstance } from "@/lib/axiosInstance";
import { EditUserModal } from "../components/EditUserModal";
import { ResetPasswordModal } from "../components/ResetPasswordModal";
import { User as UserType } from "../types";

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
  const topStats = [
    { label: "Total Campaigns", val: stats.totalCampaigns, icon: Folder, color: "#ec4899" },
    { label: "Total Contacts", val: stats.totalContacts, icon: Users, color: "#3b82f6" },
    { label: "Messages Sent", val: stats.messagesSent, icon: Send, color: "#f97316" },
    { label: "Messages Delivered", val: stats.messagesDelivered, icon: MessageSquare, color: "#10b981" },
    { label: "Failed Messages", val: stats.failedMessages, icon: Send, color: "#f43f5e", rotate: true },
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

  const quickActions = [
    {
      label: "Reset Password",
      icon: KeyRound,
      cls: "up-quick-btn--reset",
      onClick: () => setIsResetPasswordOpen(true),
    },
    {
      label: "Suspend User",
      cls: "up-quick-btn--suspend",
      onClick: () => {
        if (window.confirm(`Are you sure you want to suspend ${user?.name}?`)) {
          updateUserData({ status: "SUSPENDED" }, "User suspended successfully");
        }
      },
    },
    {
      label: "Activate User",
      icon: UserCheck,
      cls: "up-quick-btn--activate",
      onClick: () => {
        if (window.confirm(`Are you sure you want to activate ${user?.name}?`)) {
          updateUserData({ status: "ACTIVE" }, "User activated successfully");
        }
      },
    },
    {
      label: "Update Plan",
      cls: "up-quick-btn--plan",
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
        av: "#10b981",
        login: "Recently",
        joined: formatDate(user.createdAt),
        msgs: stats.totalMessages,
        campaigns: stats.totalCampaigns,
        chatbots: 0,
        pro: ["Pro", "Enterprise"].includes(user.plan),
      }
    : null;

  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div className={`up-container ${isDark ? "dark" : ""}`}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ── HEADER ── */}
      <div className="up-header">
        <button className="up-back-btn" onClick={handleBack} title="Back to All Users">
          <ArrowLeft size={20} />
          <span>User Profile</span>
        </button>
      </div>

      {loading ? (
        <div className="up-loader-box">
          <div className="up-spinner" />
          <p>Loading user details...</p>
        </div>
      ) : error || !user ? (
        <div className="up-hero-card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <AlertCircle size={44} style={{ color: "#ef4444", margin: "0 auto 12px" }} />
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>
            {error || "User Not Found"}
          </h2>
          <p style={{ color: "var(--up-muted)", marginBottom: "20px" }}>
            Could not retrieve profile information for user ID {userId}.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button className="up-btn-share" onClick={loadUserData}>
              Try Again
            </button>
            <button className="up-btn-edit" onClick={handleBack}>
              Back to All Users
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ── HERO BANNER CARD ── */}
          <div className="up-hero-card">
            <div className="up-hero-top">
              <div className="up-hero-user-info">
                <div className="up-hero-avatar">{initials}</div>

                <div className="up-hero-meta">
                  <div className="up-hero-title-row">
                    <span className="up-hero-name">{user.name || "User"}</span>
                    <span className="up-hero-badge">{user.role?.toLowerCase() || "user"}</span>
                  </div>

                  <div className="up-hero-contact-row">
                    <span className="up-hero-contact-item">
                      <Mail size={14} />
                      {user.email || "No email"}
                    </span>
                    {user.phone && (
                      <span className="up-hero-contact-item">
                        <Phone size={14} />
                        {user.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="up-hero-actions">
                <button className="up-btn-share" onClick={handleShareProfile} title="Share Profile">
                  <Share2 size={15} />
                  <span>Share Profile</span>
                </button>
                <button
                  className="up-btn-edit"
                  onClick={() => setIsEditOpen(true)}
                  title="Edit Profile"
                >
                  <Pencil size={15} />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* Inset Sub-bar */}
            <div className="up-hero-subbar">
              <div className="up-subbar-col">
                <span className="up-subbar-label">User ID</span>
                <span className="up-subbar-val" title={user.id}>
                  {user.id}
                </span>
              </div>
              <div className="up-subbar-col">
                <span className="up-subbar-label">Status</span>
                <span className="up-subbar-val up-subbar-val--status">
                  {user.status?.toLowerCase() || "active"}
                </span>
              </div>
              <div className="up-subbar-col">
                <span className="up-subbar-label">Joined</span>
                <span className="up-subbar-val">{formatDate(user.createdAt)}</span>
              </div>
              <div className="up-subbar-col">
                <span className="up-subbar-label">Last Active</span>
                <span className="up-subbar-val">{timeAgo(user.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* ── TOP 5 STAT CARDS (Loop) ── */}
          <div className="up-stats-row">
            {topStats.map((s) => (
              <div key={s.label} className="up-stat-card">
                <div className="up-stat-icon-wrap" style={{ background: `${s.color}18` }}>
                  <s.icon
                    size={18}
                    style={{ color: s.color, transform: s.rotate ? "rotate(45deg)" : "none" }}
                  />
                </div>
                <span className="up-stat-label">{s.label}</span>
                <span className="up-stat-val">{s.val}</span>
              </div>
            ))}
          </div>

          {/* ── LOWER 2-COLUMN SECTION ── */}
          <div className="up-main-grid">
            {/* Left Column: User Info & 4 Quick Actions */}
            <div className="up-left-col">
              <div className="up-sidebar-card">
                <h3 className="up-sidebar-title">User Info</h3>
                <div className="up-userinfo-text">
                  <div>
                    <strong>Email:</strong> {user.email || "—"}
                  </div>
                  <div style={{ marginTop: "4px" }}>
                    <strong>Status:</strong>{" "}
                    <span style={{ textTransform: "capitalize" }}>
                      {user.status?.toLowerCase() || "active"}
                    </span>
                  </div>
                  {user.company && (
                    <div style={{ marginTop: "4px" }}>
                      <strong>Company:</strong> {user.company}
                    </div>
                  )}
                  {user.plan && (
                    <div style={{ marginTop: "4px" }}>
                      <strong>Plan:</strong> {user.plan}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions (Exact 4 buttons) */}
              <div className="up-sidebar-card">
                <h3 className="up-sidebar-title">Quick Actions</h3>
                <div className="up-action-buttons">
                  {quickActions.map((act) => (
                    <button
                      key={act.label}
                      className={`up-quick-btn ${act.cls}`}
                      onClick={act.onClick}
                      disabled={actionLoading}
                    >
                      {act.icon && <act.icon size={16} className="up-quick-icon" />}
                      <span>{act.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Tab Navigation & Content */}
            <div className="up-right-col">
              <div className="up-tabs-bar">
                {(["Overview", "Activity Log", "Campaigns", "Plan"] as const).map((tab) => (
                  <button
                    key={tab}
                    className={`up-tab-pill ${activeTab === tab ? "up-tab-pill--active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab 1: Overview Grid (9 Metric Cards) */}
              {activeTab === "Overview" && (
                <div className="up-overview-grid">
                  {overviewMetrics.map((m) => (
                    <div key={m.label} className="up-grid-card">
                      <span className="up-grid-label">{m.label}</span>
                      <span className="up-grid-val">{m.val}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Activity Log */}
              {activeTab === "Activity Log" && (
                <div className="up-tab-content-card">
                  <h4 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>
                    Activity & Audit History
                  </h4>
                  <p style={{ color: "var(--up-muted)", fontSize: "14px", lineHeight: "1.8" }}>
                    • User account created on {formatDate(user.createdAt)}
                    <br />
                    • Last updated on {formatDate(user.updatedAt)} ({timeAgo(user.updatedAt)})
                    <br />• Current account status:{" "}
                    <strong style={{ textTransform: "uppercase" }}>{user.status}</strong>
                  </p>
                </div>
              )}

              {/* Tab 3: Campaigns */}
              {activeTab === "Campaigns" && (
                <div className="up-tab-content-card">
                  <h4 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>
                    User Campaigns
                  </h4>
                  <p style={{ color: "var(--up-muted)", fontSize: "14px" }}>
                    Total Campaigns launched: <strong>{stats.totalCampaigns}</strong>
                  </p>
                  {stats.totalCampaigns === 0 && (
                    <div style={{ marginTop: "14px", color: "var(--up-muted)", fontSize: "13px" }}>
                      No active or past campaigns recorded for this user yet.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Plan Tab (Matching Screenshot Layout) */}
              {activeTab === "Plan" && (
                <div className="up-plan-wrapper">
                  {(() => {
                    const currentPlanKey = user.plan || "Free";
                    const planInfo = PLAN_META[currentPlanKey] || PLAN_META["Free"];
                    const usages = [
                      { label: "Contact", count: stats.totalContacts, max: planInfo.maxContacts },
                      { label: "Campaign", count: stats.totalCampaigns, max: planInfo.maxCampaigns },
                    ];

                    return (
                      <>
                        <div className="up-plan-card">
                          <div className="up-plan-card-top">
                            <div>
                              <h3 className="up-plan-card-title">{planInfo.title}</h3>
                              <p className="up-plan-card-sub">{planInfo.sub}</p>
                            </div>
                            <span className="up-plan-active-badge">Active</span>
                          </div>

                          <div className="up-plan-dates-row">
                            <div className="up-plan-date-col">
                              <span className="up-plan-date-label">Start Date</span>
                              <span className="up-plan-date-val">{formatPlanDateTime(user.createdAt)}</span>
                            </div>
                            <div className="up-plan-date-col">
                              <span className="up-plan-date-label">End Date</span>
                              <span className="up-plan-date-val">
                                {formatPlanDateTime(user.createdAt, 10)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Usage Statistics */}
                        <div className="up-plan-usage-sec">
                          <div className="up-plan-sec-title">
                            <TrendingUp size={16} />
                            <span>Usage Statistics</span>
                          </div>

                          {usages.map((u) => (
                            <div key={u.label} className="up-plan-usage-item">
                              <div className="up-plan-usage-row">
                                <span>{u.label}</span>
                                <span>
                                  {u.count} / {u.max}
                                </span>
                              </div>
                              <div className="up-plan-progress-track">
                                <div
                                  className="up-plan-progress-fill"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      u.max > 0 ? (u.count / u.max) * 100 : 0
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Plan Features */}
                        <div className="up-plan-features-box">
                          <div className="up-plan-sec-title">
                            <Zap size={16} />
                            <span>Plan Features</span>
                          </div>

                          <div className="up-plan-features-list">
                            {planInfo.features.map((feat, i) => (
                              <div key={i} className="up-plan-feature-item">
                                <CheckCircle2 size={16} className="up-plan-check-icon" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Upgrade Button */}
                        <button
                          className="up-plan-upgrade-btn"
                          onClick={() => {
                            setSelectedPlan(user.plan || "Starter");
                            setIsPlanModalOpen(true);
                          }}
                        >
                          Upgrade / Change Plan
                        </button>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
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
      {isPlanModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setIsPlanModalOpen(false)}
        >
          <div
            style={{
              background: "var(--up-surf, #ffffff)",
              border: "1px solid var(--up-border, #e2e8f0)",
              padding: "24px",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "420px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>
              Update Subscription Plan
            </h3>
            <p style={{ color: "var(--up-muted)", fontSize: "13px", marginBottom: "16px" }}>
              Select a new plan for {user?.name}:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              {["Starter", "Basic", "Pro", "Enterprise"].map((planOption) => (
                <label
                  key={planOption}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: `1px solid ${
                      selectedPlan === planOption ? "var(--up-accent, #10b981)" : "var(--up-border, #e2e8f0)"
                    }`,
                    background:
                      selectedPlan === planOption
                        ? "var(--up-accent-subtle, rgba(16, 185, 129, 0.12))"
                        : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: "600" }}>{planOption}</span>
                  <input
                    type="radio"
                    name="plan"
                    checked={selectedPlan === planOption}
                    onChange={() => setSelectedPlan(planOption)}
                    style={{ accentColor: "var(--up-accent, #10b981)" }}
                  />
                </label>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                className="up-btn-share"
                onClick={() => setIsPlanModalOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="up-btn-edit"
                onClick={() =>
                  updateUserData(
                    { plan: selectedPlan },
                    `Plan updated to ${selectedPlan}`
                  )
                }
                disabled={actionLoading}
              >
                {actionLoading ? "Updating..." : "Save Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
