"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "../../../../context/ThemeContext";
import "./user-profile.css";
import Spinner from "@/components/ui/Spinner";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Folder,
  KeyRound,
  Layers,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  Send,
  Share2,
  TrendingUp,
  UserCheck,
  Users,
  Zap, ChevronDown, ArrowDown, Plus, Edit2, LogIn, Trash2,
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
  companyId?: string;
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
  totalActivities: number;
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
  totalActivities: 0,
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

// --- TIMELINE HELPERS ---
function groupDataByDate(data: any[]) {
  const groups: { [key: string]: any[] } = {};
  data.forEach(item => {
    const d = new Date(item.createdAt || item.timestamp || item.created_at || new Date());
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let label = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    if (d.toDateString() === today.toDateString()) label = "Today";
    else if (d.toDateString() === yesterday.toDateString()) label = "Yesterday";
    
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  });
  return Object.entries(groups);
}

function getIconForAction(actionStr: string) {
  const act = (actionStr || "").toLowerCase();
  if (act.includes("create") || act.includes("add")) return { Icon: Plus, cls: "create" };
  if (act.includes("update") || act.includes("edit")) return { Icon: Pencil, cls: "update" };
  if (act.includes("delete") || act.includes("remove") || act.includes("suspend")) return { Icon: Trash2, cls: "delete" };
  if (act.includes("login") || act.includes("auth")) return { Icon: LogIn, cls: "login" };
  if (act.includes("send") || act.includes("message")) return { Icon: Send, cls: "send" };
  return { Icon: Activity, cls: "default" };
}

function getRelativeTime(dStr: string) {
  if (!dStr) return "";
  const d = new Date(dStr);
  const diffMs = Date.now() - d.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHrs / 24);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 60) return `${Math.max(0, diffMins)} min ago`;
  if (diffHrs < 24) return `${diffHrs} hr ago`;
  return `${diffDays} days ago`;
}

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
  const [activeTab, setActiveTab] = useState<"Overview" | "Activity Log" | "Campaigns" | "Plan" | "Messages" | "Contacts">("Overview");
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [showAllCampaigns, setShowAllCampaigns] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);




  // Specific user data states from endpoints
  const [activePlanData, setActivePlanData] = useState<any>(null);
  const [contactsData, setContactsData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [campaignData, setCampaignData] = useState<any[]>([]);
  const [messagesData, setMessagesData] = useState<any[]>([]);

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
        sessionStorage.getItem(`user_${userId}`) ;

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
            companyId: p.companyId ? String(p.companyId) : undefined,
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
          companyId: (raw.company_id ?? raw.companyId ?? raw.company?.id)
            ? String(raw.company_id ?? raw.companyId ?? raw.company?.id)
            : undefined,
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

  useEffect(() => {
    if (!user?.companyId || !user?.id) return;

    const fetchSpecificData = async () => {
      const cId = user.companyId;
      const uId = user.id;

      // Helper: extract array from any API response shape
      const extractArray = (res: any): any[] => {
        const d = res?.data?.data ?? res?.data ?? res;
        if (Array.isArray(d)) return d;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d?.items)) return d.items;
        if (Array.isArray(d?.records)) return d.records;
        if (Array.isArray(d?.results)) return d.results;
        if (Array.isArray(d?.list)) return d.list;
        if (Array.isArray(d?.contacts)) return d.contacts;
        if (Array.isArray(d?.campaigns)) return d.campaigns;
        if (Array.isArray(d?.messages)) return d.messages;
        if (Array.isArray(d?.activities)) return d.activities;
        return [];
      };

      // Helper: extract object from response
      const extractObj = (res: any): any => {
        const d = res?.data;
        if (d && typeof d === "object" && !Array.isArray(d)) {
          if (d.data && typeof d.data === "object" && !Array.isArray(d.data)) return d.data;
          return d;
        }
        return res;
      };

      try {
        const [planRes, contactsRes, activityRes, campaignRes, messagesRes] =
          await Promise.allSettled([
            axiosInstance.get(`/v1/super-admin/companies/${cId}/${uId}/active-plan`),
            axiosInstance.get(`/v1/super-admin/companies/${cId}/${uId}/contacts`),
            axiosInstance.get(`/v1/super-admin/companies/${cId}/${uId}/activity`),
            axiosInstance.get(`/v1/super-admin/companies/${cId}/${uId}/campaign`),
            axiosInstance.get(`/v1/super-admin/companies/${cId}/${uId}/messages`),
          ]);

        // ── Active Plan ──────────────────────────────────────────
        if (planRes.status === "fulfilled") {
          // Structure: { data: { data: { active_plan: {...} | null } } }
          const planObj = planRes.value.data?.data?.active_plan ?? null;
          setActivePlanData(planObj);
        } else {
          console.warn("[active-plan] failed:", planRes.reason);
        }

        // ── Contacts ─────────────────────────────────────────────
        if (contactsRes.status === "fulfilled") {
          // Structure: { data: { data: { items: [], pagination: { total: N } } } }
          const inner = contactsRes.value.data?.data ?? {};
          const arr = Array.isArray(inner.items) ? inner.items : [];
          const total = Number(inner.pagination?.total ?? arr.length);
          setContactsData(arr);
          setStats(prev => ({ ...prev, totalContacts: total, uniqueContacts: total }));
        } else {
          console.warn("[contacts] failed:", contactsRes.reason);
        }

        // ── Activity ─────────────────────────────────────────────
        if (activityRes.status === "fulfilled") {
          // Structure: { data: { data: { items: [], pagination: { total: N } } } }
          const inner = activityRes.value.data?.data ?? {};
          const arr = Array.isArray(inner.items) ? inner.items : [];
          setActivityData(arr);
        } else {
          console.warn("[activity] failed:", activityRes.reason);
        }

        // ── Campaigns ────────────────────────────────────────────
        if (campaignRes.status === "fulfilled") {
          // Structure: { data: { data: { items: [], pagination: { total: N } } } }
          const inner = campaignRes.value.data?.data ?? {};
          const arr = Array.isArray(inner.items) ? inner.items : [];
          const total = Number(inner.pagination?.total ?? arr.length);
          setCampaignData(arr);
          setStats(prev => ({ ...prev, totalCampaigns: total }));
        } else {
          console.warn("[campaign] failed:", campaignRes.reason);
        }

        // ── Messages ─────────────────────────────────────────────
        if (messagesRes.status === "fulfilled") {
          // Structure: { data: { data: { items: [], pagination: { total: N } } } }
          const inner = messagesRes.value.data?.data ?? {};
          const arr = Array.isArray(inner.items) ? inner.items : [];
          const total = Number(inner.pagination?.total ?? arr.length);
          setMessagesData(arr);
          setStats(prev => ({
            ...prev,
            totalMessages: total,
            messagesSent: Number(inner.sent ?? inner.messagesSent ?? arr.filter((m: any) => m.status === "sent" || m.status === "SENT").length),
            messagesDelivered: Number(inner.delivered ?? inner.messagesDelivered ?? arr.filter((m: any) => m.status === "delivered" || m.status === "DELIVERED").length),
            failedMessages: Number(inner.failed ?? inner.failedMessages ?? arr.filter((m: any) => m.status === "failed" || m.status === "FAILED").length),
          }));
        } else {
          console.warn("[messages] failed:", messagesRes.reason);
        }

      } catch (err) {
        console.error("[fetchSpecificData] unexpected error:", err);
      }
    };

    fetchSpecificData();
  }, [user?.companyId, user?.id]);

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
      toast.success(successMsg, {
        position: "top-right",
        autoClose: 3000,
        icon: () => <span>✅</span>,
      });
      if (payload.plan) setIsPlanModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Operation failed", {
        position: "top-right",
        autoClose: 4000,
        icon: () => <span>❌</span>,
      });
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
        const toastId = toast.info(
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>Suspend User?</div>
            <div style={{ fontSize: "13px", color: "#475569" }}>
              Are you sure you want to suspend <strong>{user?.name}</strong>?
            </div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button
                onClick={() => { toast.dismiss(toastId); updateUserData({ status: "SUSPENDED" }, "User suspended successfully"); }}
                style={{ padding: "5px 14px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}
              >
                Yes, Suspend
              </button>
              <button
                onClick={() => toast.dismiss(toastId)}
                style={{ padding: "5px 14px", background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}
              >
                Cancel
              </button>
            </div>
          </div>,
          { autoClose: false, closeButton: false, draggable: false, closeOnClick: false }
        );
      },
    },
    {
      label: "Activate User",
      icon: UserCheck,
      cls: "up-quick-btn--activate",
      onClick: () => {
        const toastId = toast.info(
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>Activate User?</div>
            <div style={{ fontSize: "13px", color: "#475569" }}>
              Are you sure you want to activate <strong>{user?.name}</strong>?
            </div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button
                onClick={() => { toast.dismiss(toastId); updateUserData({ status: "ACTIVE" }, "User activated successfully"); }}
                style={{ padding: "5px 14px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}
              >
                Yes, Activate
              </button>
              <button
                onClick={() => toast.dismiss(toastId)}
                style={{ padding: "5px 14px", background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}
              >
                Cancel
              </button>
            </div>
          </div>,
          { autoClose: false, closeButton: false, draggable: false, closeOnClick: false }
        );
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
        companyId: user.companyId,
        companyDomain: user.companyDomain,
        plan: user.plan,
        av: "#206bc4",
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
        <Spinner variant="center" size="lg" color="primary" text="Loading user details..." />
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
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <strong style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</strong>
                      <span style={{ fontSize: "14px", color: "var(--title-color)", wordBreak: "break-all" }}>{user.email || "—"}</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <strong style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Account Status</strong>
                      <div>
                        <span style={{ 
                          display: "inline-block", 
                          padding: "2px 8px", 
                          borderRadius: "4px", 
                          fontSize: "12px", 
                          fontWeight: "600",
                          textTransform: "capitalize",
                          background: (user.status || "").toLowerCase() === "active" ? "rgba(47,179,68,0.12)" : "rgba(214,57,57,0.12)",
                          color: (user.status || "").toLowerCase() === "active" ? "#2fb344" : "#d63939"
                        }}>
                          {user.status?.toLowerCase() || "active"}
                        </span>
                      </div>
                    </div>



                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <strong style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Current Plan</strong>
                      <span style={{ fontSize: "14px", color: "var(--title-color)", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                        {activePlanData?.plan_name || user.plan || "Free"}
                        {activePlanData?.active && (
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2fb344", display: "inline-block" }}></span>
                        )}
                      </span>
                    </div>
                  </div>
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
              <div className="up-tabs-bar" role="tablist">
                {[
                  { id: "Overview", label: "Overview", shortLabel: "Overview", icon: Layers },
                  { id: "Activity Log", label: "Activity Log", shortLabel: "Activity", icon: Activity },
                  { id: "Campaigns", label: "Campaigns", shortLabel: "Campaigns", icon: Share2 },
                  { id: "Plan", label: "Plan", shortLabel: "Plan", icon: CreditCard },

                  { id: "Messages", label: "Messages", shortLabel: "Msgs", icon: MessageSquare },
                  { id: "Contacts", label: "Contacts", shortLabel: "Contacts", icon: Users },

                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      className={`up-tab-pill ${activeTab === tab.id ? "up-tab-pill--active" : ""}`}
                      onClick={() => setActiveTab(tab.id as any)}
                    >
                      <Icon size={14} />
                      <span className="up-tab-label-full">{tab.label}</span>
                      <span className="up-tab-label-short">{tab.shortLabel}</span>
                    </button>
                  );
                })}
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
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>Activity & Audit History</h4>
                    <span style={{ fontSize: "13px", color: "var(--muted)", fontWeight: "500" }}>
                      Total: <strong style={{ color: "var(--title-color)" }}>{stats.totalActivities > 0 ? String(stats.totalActivities) : "0"}</strong>
                    </span>
                  </div>

                  {activityData.length > 0 ? (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {activityData.slice(0, 5).map((act: any, idx: number) => {
                          const { Icon, cls } = getIconForAction(act.action || "");
                          const entityTypeLower = (act.entity_type || "").toLowerCase();
                          const isSuccess = (act.status || "").toUpperCase() === "SUCCESS";
                          return (
                            <div
                              key={act.id || idx}
                              className="up-act-card"
                              onClick={() => setSelectedActivity(act)}
                            >
                              {/* Icon */}
                              <div className={`up-act-icon ${cls}`}>
                                <Icon size={14} />
                              </div>

                              {/* Content */}
                              <div className="up-act-content">
                                <div className="up-act-top-row">
                                  <span className="up-act-action">{act.action || "Activity"}</span>
                                  <span className={`up-act-entity-badge up-act-entity--${entityTypeLower}`}>
                                    {act.entity_type || "—"}
                                  </span>
                                </div>
                                <div className="up-act-desc">{act.description || "—"}</div>
                              </div>

                              {/* Right: time + status + arrow */}
                              <div className="up-act-right">
                                <div className="up-act-time-col">
                                  <span className="up-act-time">{formatPlanDateTime(act.created_at)}</span>
                                  <span className="up-act-rel">{getRelativeTime(act.created_at)}</span>
                                </div>
                                <span className={`up-act-status ${isSuccess ? "up-act-status--ok" : "up-act-status--fail"}`}>
                                  {act.status || "—"}
                                </span>
                                <svg className="up-act-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ marginTop: "14px", textAlign: "center" }}>
                        <button
                          className="up-btn-share"
                          onClick={() => router.push(`/user/all-user/${userId}/activity?companyId=${user.companyId || ""}`)}
                          style={{ padding: "6px 20px", fontSize: "13px", cursor: "pointer" }}
                        >
                          View All ({stats.totalActivities || activityData.length})
                        </button>
                      </div>
                    </>
                  ) : (
                    <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: "1.8" }}>
                      • User account created on {formatDate(user.createdAt)}<br />
                      • Last updated on {formatDate(user.updatedAt)} ({timeAgo(user.updatedAt)})<br />
                      • Current status: <strong style={{ textTransform: "uppercase" }}>{user.status}</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Activity Detail Slide Drawer */}
              {selectedActivity && (
                <>
                  <div className="up-camp-drawer-overlay" onClick={() => setSelectedActivity(null)} />
                  <div className="up-camp-drawer">
                    <div className="up-camp-drawer-header">
                      <div className="up-camp-drawer-title">
                        {(() => { const { Icon, cls } = getIconForAction(selectedActivity.action || ""); return <div className={`up-act-icon ${cls}`} style={{ width: 32, height: 32, borderRadius: 8 }}><Icon size={16} /></div>; })()}
                        <div>
                          <div style={{ fontSize: "16px", fontWeight: "700" }}>{selectedActivity.action || "Activity"}</div>
                          <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "400", marginTop: "2px" }}>Audit Log Detail</div>
                        </div>
                      </div>
                      <button className="up-camp-drawer-close" onClick={() => setSelectedActivity(null)}>&#x2715;</button>
                    </div>

                    <div className="up-camp-drawer-body">

                      {/* Status + Entity strip */}
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                        <span className={`up-act-entity-badge up-act-entity--${(selectedActivity.entity_type || "").toLowerCase()}`} style={{ fontSize: "12px", padding: "4px 10px" }}>
                          {selectedActivity.entity_type || "—"}
                        </span>
                        <span className={`up-act-status ${(selectedActivity.status || "").toUpperCase() === "SUCCESS" ? "up-act-status--ok" : "up-act-status--fail"}`} style={{ fontSize: "12px", padding: "4px 10px" }}>
                          {selectedActivity.status || "—"}
                        </span>
                      </div>

                      {/* Description */}
                      <div className="up-cd-section">
                        <div className="up-cd-section-title">Description</div>
                        <div style={{ fontSize: "13.5px", color: "var(--text)", lineHeight: "1.7", background: "var(--surf2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "12px 14px", wordBreak: "break-all" }}>
                          {selectedActivity.description || "—"}
                        </div>
                      </div>

                      {/* Action Details */}
                      <div className="up-cd-section">
                        <div className="up-cd-section-title">Action Info</div>
                        {([
                          { label: "Action",      val: selectedActivity.action      },
                          { label: "Entity Type", val: selectedActivity.entity_type },
                          { label: "Entity ID",   val: selectedActivity.entity_id || "N/A" },
                          { label: "Status",      val: selectedActivity.status      },
                        ] as { label: string; val: string }[]).map(({ label, val }) => (
                          <div key={label} className="up-cd-info-row">
                            <span className="up-cd-info-label">{label}</span>
                            <span className="up-cd-info-val">{val || "—"}</span>
                          </div>
                        ))}
                      </div>

                      {/* Timestamp */}
                      <div className="up-cd-section">
                        <div className="up-cd-section-title">Timestamp</div>
                        <div className="up-cd-info-row">
                          <span className="up-cd-info-label">Date & Time</span>
                          <span className="up-cd-info-val">{formatPlanDateTime(selectedActivity.created_at)}</span>
                        </div>
                        <div className="up-cd-info-row">
                          <span className="up-cd-info-label">Relative</span>
                          <span className="up-cd-info-val">{getRelativeTime(selectedActivity.created_at)}</span>
                        </div>
                      </div>

                      {/* Identifiers */}
                      <div className="up-cd-section">
                        <div className="up-cd-section-title">Identifiers</div>
                        {([
                          { label: "Log ID",      val: selectedActivity.id         },
                          { label: "User ID",     val: selectedActivity.user_id    },
                          { label: "Company ID",  val: selectedActivity.company_id },
                        ] as { label: string; val: string }[]).map(({ label, val }) => (
                          <div key={label} className="up-cd-info-row">
                            <span className="up-cd-info-label">{label}</span>
                            <span className="up-cd-info-val" style={{ fontSize: "11.5px", fontFamily: "monospace" }}>{val || "—"}</span>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                </>
              )}
              {/* Tab 3: Campaigns */}
              {activeTab === "Campaigns" && (
                <div className="up-tab-content-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>User Campaigns</h4>
                    <span style={{ fontSize: "13px", color: "var(--muted)", fontWeight: "500" }}>
                      Total: <strong style={{ color: "var(--title-color)" }}>{stats.totalCampaigns}</strong>
                    </span>
                  </div>
                  {campaignData.length > 0 ? (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {campaignData.slice(0, 5).map((camp: any, idx: number) => {
                          const statusCls = `up-camp-status--${(camp.status || "draft").toLowerCase()}`;
                          return (
                            <div
                              key={camp.id || idx}
                              className="up-camp-card"
                              onClick={() => setSelectedCampaign(camp)}
                            >
                              <div className="up-camp-card-left">
                                <span className="up-camp-name">{camp.name || "Campaign"}</span>
                                <div className="up-camp-meta">
                                  <span className={`up-camp-status ${statusCls}`}>{camp.status || "—"}</span>
                                  <span>Recipients: <strong>{camp.total_recipients ?? 0}</strong></span>
                                  <span>Sent: <strong>{camp.sent_count ?? 0}</strong></span>
                                  {(camp.failed_count ?? 0) > 0 && (
                                    <span style={{ color: "#d63939" }}>Failed: <strong>{camp.failed_count}</strong></span>
                                  )}
                                  {camp.created_at && <span>{formatDate(camp.created_at)}</span>}
                                </div>
                              </div>
                              <svg className="up-camp-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ marginTop: "14px", textAlign: "center" }}>
                        <button
                          className="up-btn-share"
                          onClick={() => router.push(`/user/all-user/${userId}/campaigns?companyId=${user.companyId || ""}`)}
                          style={{ padding: "6px 20px", fontSize: "13px", cursor: "pointer" }}
                        >
                          View All ({stats.totalCampaigns || campaignData.length})
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ marginTop: "14px", color: "var(--muted)", fontSize: "13px" }}>
                      No campaigns recorded for this user yet.
                    </div>
                  )}
                </div>
              )}

              {/* Campaign Detail Slide Drawer */}
              {selectedCampaign && (
                <>
                  <div className="up-camp-drawer-overlay" onClick={() => setSelectedCampaign(null)} />
                  <div className="up-camp-drawer">
                    <div className="up-camp-drawer-header">
                      <div className="up-camp-drawer-title">
                        <Share2 size={18} style={{ color: "var(--crm-primary, #206bc4)" }} />
                        <div>
                          <div style={{ fontSize: "16px", fontWeight: "700" }}>{selectedCampaign.name || "Campaign"}</div>
                          <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "400", marginTop: "2px" }}>Campaign Details</div>
                        </div>
                      </div>
                      <button className="up-camp-drawer-close" onClick={() => setSelectedCampaign(null)}>&#x2715;</button>
                    </div>
                    <div className="up-camp-drawer-body">
                      {/* Status + Cost */}
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                        <span className={`up-camp-status up-camp-status--${(selectedCampaign.status || "draft").toLowerCase()}`} style={{ fontSize: "12.5px", padding: "4px 12px" }}>
                          {selectedCampaign.status || "—"}
                        </span>
                        <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                          Cost: <strong style={{ color: "var(--title-color)" }}>&#8377;{selectedCampaign.total_cost ?? "0.00"}</strong>
                        </span>
                      </div>

                      {/* Message Statistics */}
                      <div className="up-cd-section">
                        <div className="up-cd-section-title">Message Statistics</div>
                        <div className="up-cd-stat-grid">
                          <div className="up-cd-stat-cell">
                            <span className="up-cd-stat-label">Total Recipients</span>
                            <span className="up-cd-stat-val up-cd-stat-val--blue">{selectedCampaign.total_recipients ?? 0}</span>
                          </div>
                          <div className="up-cd-stat-cell">
                            <span className="up-cd-stat-label">Sent</span>
                            <span className="up-cd-stat-val up-cd-stat-val--green">{selectedCampaign.sent_count ?? 0}</span>
                          </div>
                          <div className="up-cd-stat-cell">
                            <span className="up-cd-stat-label">Delivered</span>
                            <span className="up-cd-stat-val up-cd-stat-val--green">{selectedCampaign.delivered_count ?? 0}</span>
                          </div>
                          <div className="up-cd-stat-cell">
                            <span className="up-cd-stat-label">Read</span>
                            <span className="up-cd-stat-val up-cd-stat-val--purple">{selectedCampaign.read_count ?? 0}</span>
                          </div>
                          <div className="up-cd-stat-cell">
                            <span className="up-cd-stat-label">Failed</span>
                            <span className="up-cd-stat-val up-cd-stat-val--red">{selectedCampaign.failed_count ?? 0}</span>
                          </div>
                          <div className="up-cd-stat-cell">
                            <span className="up-cd-stat-label">Invalid Numbers</span>
                            <span className="up-cd-stat-val up-cd-stat-val--orange">{selectedCampaign.invalid_numbers_count ?? 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Breakdown progress bars */}
                      {(selectedCampaign.total_recipients ?? 0) > 0 && (
                        <div className="up-cd-section">
                          <div className="up-cd-section-title">Delivery Breakdown</div>
                          {([
                            { label: "Sent",     val: selectedCampaign.sent_count ?? 0,              cls: "green"  },
                            { label: "Delivered",val: selectedCampaign.delivered_count ?? 0,         cls: "blue"   },
                            { label: "Read",     val: selectedCampaign.read_count ?? 0,              cls: "purple" },
                            { label: "Failed",   val: selectedCampaign.failed_count ?? 0,            cls: "red"    },
                            { label: "Invalid",  val: selectedCampaign.invalid_numbers_count ?? 0,   cls: "orange" },
                          ] as { label: string; val: number; cls: string }[]).map(({ label, val, cls }) => {
                            const pct = Math.min(100, selectedCampaign.total_recipients > 0 ? (val / selectedCampaign.total_recipients) * 100 : 0);
                            return (
                              <div key={label} className="up-cd-progress-wrap">
                                <div className="up-cd-progress-row">
                                  <span>{label}</span>
                                  <span>{val} / {selectedCampaign.total_recipients} ({pct.toFixed(1)}%)</span>
                                </div>
                                <div className="up-cd-progress-track">
                                  <div className={`up-cd-progress-fill up-cd-progress-fill--${cls}`} style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Timeline */}
                      <div className="up-cd-section">
                        <div className="up-cd-section-title">Timeline</div>
                        {([
                          { label: "Created At",   val: formatPlanDateTime(selectedCampaign.created_at)   },
                          { label: "Scheduled At", val: formatPlanDateTime(selectedCampaign.scheduled_at) },
                          { label: "Started At",   val: formatPlanDateTime(selectedCampaign.started_at)   },
                          { label: "Completed At", val: formatPlanDateTime(selectedCampaign.completed_at) },
                          { label: "Last Updated", val: formatPlanDateTime(selectedCampaign.updated_at)   },
                        ] as { label: string; val: string }[]).map(({ label, val }) => (
                          <div key={label} className="up-cd-info-row">
                            <span className="up-cd-info-label">{label}</span>
                            <span className="up-cd-info-val">{val || "—"}</span>
                          </div>
                        ))}
                      </div>

                      {/* Identifiers */}
                      <div className="up-cd-section">
                        <div className="up-cd-section-title">Identifiers</div>
                        {([
                          { label: "Campaign ID",     val: selectedCampaign.id              },
                          { label: "Template ID",     val: selectedCampaign.template_id     },
                          { label: "Phone Number ID", val: selectedCampaign.phone_number_id },
                          { label: "Failure Reason",  val: selectedCampaign.failure_reason || "None" },
                        ] as { label: string; val: string }[]).map(({ label, val }) => (
                          <div key={label} className="up-cd-info-row">
                            <span className="up-cd-info-label">{label}</span>
                            <span className="up-cd-info-val" style={{ fontSize: "11.5px", fontFamily: "monospace" }}>{val || "—"}</span>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                </>
              )}
              {/* Tab 4: Plan Tab */}
              {activeTab === "Plan" && (
                <div className="up-plan-wrapper">
                  {(() => {
                    const hasActivePlan = activePlanData !== null;
                    const planName      = activePlanData?.plan_name || user.plan || "Free";
                    const price         = activePlanData?.price         ?? null;
                    const billingCycle  = activePlanData?.billing_cycle ?? null;
                    const durationDays  = activePlanData?.duration_days ?? null;
                    const planStatus    = activePlanData?.status        ?? null;
                    const isActive      = activePlanData?.active        ?? false;
                    const subId         = activePlanData?.subscription_id ?? null;

                    const startDate = activePlanData?.start_date  || activePlanData?.created_at || user.createdAt;
                    const endDate   = activePlanData?.end_date    || null;

                    const limContacts  = Number(activePlanData?.limits?.contacts?.limit  ?? 0);
                    const limCampaigns = Number(activePlanData?.limits?.campaigns?.limit ?? 0);
                    const limChatbot   = Number(activePlanData?.limits?.chatbot?.limit   ?? 0);

                    const usageContacts  = Number(activePlanData?.usage?.Contact   ?? activePlanData?.usage?.contacts   ?? stats.totalContacts);
                    const usageCampaigns = Number(activePlanData?.usage?.Campaign  ?? activePlanData?.usage?.campaigns  ?? stats.totalCampaigns);
                    const usageChatbot   = Number(activePlanData?.usage?.Chatbot   ?? activePlanData?.usage?.chatbot    ?? 0);
                    const usageTeam      = Number(activePlanData?.usage?.TeamInvite ?? 0);

                    const usages = [
                      { label: "Contacts",    used: usageContacts,  limit: limContacts,  color: "#3b82f6" },
                      { label: "Campaigns",   used: usageCampaigns, limit: limCampaigns, color: "#6366f1" },
                      { label: "Chatbots",    used: usageChatbot,   limit: limChatbot,   color: "#f59f00" },
                      { label: "Team Invites",used: usageTeam,      limit: null,         color: "#10b981" },
                    ];

                    return (
                      <>
                        {!hasActivePlan && (
                          <div style={{ padding: "16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", fontSize: "13px", color: "#ef4444", marginBottom: "16px" }}>
                            No active plan found for this user.
                          </div>
                        )}

                        <div className="up-plan-card">
                          <div className="up-plan-card-top">
                            <div>
                              <h3 className="up-plan-card-title">{planName}</h3>
                              <p className="up-plan-card-sub">
                                {price
                                  ? `${planName} Plan \u2022 \u20b9${Number(price).toLocaleString("en-IN")}${billingCycle ? ` / ${billingCycle}` : ""}`
                                  : `${planName} Plan`}
                              </p>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                              <span
                                className="up-plan-active-badge"
                                style={isActive
                                  ? { background: "rgba(47,179,68,0.12)", color: "#2fb344" }
                                  : { background: "rgba(100,100,100,0.15)", color: "#aaa" }}
                              >
                                {isActive ? "Active" : "Inactive"}
                              </span>
                              {planStatus && (
                                <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "500" }}>
                                  {planStatus}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="up-plan-dates-row">
                            <div className="up-plan-date-col">
                              <span className="up-plan-date-label">Start Date</span>
                              <span className="up-plan-date-val">{formatPlanDateTime(startDate)}</span>
                            </div>
                            <div className="up-plan-date-col">
                              <span className="up-plan-date-label">End Date</span>
                              <span className="up-plan-date-val">{endDate ? formatPlanDateTime(endDate) : "\u2014"}</span>
                            </div>
                            {durationDays && (
                              <div className="up-plan-date-col">
                                <span className="up-plan-date-label">Duration</span>
                                <span className="up-plan-date-val">{durationDays} days</span>
                              </div>
                            )}
                            {billingCycle && (
                              <div className="up-plan-date-col">
                                <span className="up-plan-date-label">Billing</span>
                                <span className="up-plan-date-val">{billingCycle}</span>
                              </div>
                            )}
                          </div>

                          {subId && (
                            <div style={{ fontSize: "11.5px", color: "var(--muted)", borderTop: "1px solid var(--border)", paddingTop: "10px", fontFamily: "monospace", wordBreak: "break-all" }}>
                              Sub ID: {subId}
                            </div>
                          )}
                        </div>

                        <div className="up-plan-usage-sec">
                          <div className="up-plan-sec-title">
                            <TrendingUp size={16} />
                            <span>Usage Statistics</span>
                          </div>

                          {usages.map((u) => {
                            const pct = u.limit && u.limit > 0
                              ? Math.min(100, (u.used / u.limit) * 100)
                              : 0;
                            const isOver = u.limit && u.used > u.limit;
                            return (
                              <div key={u.label} className="up-plan-usage-item">
                                <div className="up-plan-usage-row">
                                  <span>{u.label}</span>
                                  <span style={{ color: isOver ? "#d63939" : "var(--title-color)", fontWeight: "600" }}>
                                    {u.used.toLocaleString()}
                                    {u.limit ? ` / ${u.limit.toLocaleString()}` : ""}
                                    {u.limit ? ` (${pct.toFixed(1)}%)` : ""}
                                  </span>
                                </div>
                                {u.limit ? (
                                  <div className="up-plan-progress-track">
                                    <div
                                      className="up-plan-progress-fill"
                                      style={{ width: `${pct}%`, background: isOver ? "#d63939" : u.color }}
                                    />
                                  </div>
                                ) : (
                                  <div style={{ fontSize: "11px", color: "var(--muted)" }}>No limit</div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {hasActivePlan && (limContacts > 0 || limCampaigns > 0 || limChatbot > 0) && (
                          <div className="up-plan-features-box">
                            <div className="up-plan-sec-title">
                              <Zap size={16} />
                              <span>Plan Limits</span>
                            </div>
                            <div className="up-plan-features-list" style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                              {limContacts > 0 && (
                                <div className="up-plan-feature-item">
                                  <CheckCircle2 size={16} className="up-plan-check-icon" />
                                  <span>Up to {limContacts.toLocaleString()} contacts</span>
                                </div>
                              )}
                              {limCampaigns > 0 && (
                                <div className="up-plan-feature-item">
                                  <CheckCircle2 size={16} className="up-plan-check-icon" />
                                  <span>Up to {limCampaigns.toLocaleString()} campaigns</span>
                                </div>
                              )}
                              {limChatbot > 0 && (
                                <div className="up-plan-feature-item">
                                  <CheckCircle2 size={16} className="up-plan-check-icon" />
                                  <span>Up to {limChatbot.toLocaleString()} chatbots</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

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

              {/* Tab 5: Messages */}
              {activeTab === "Messages" && (
                <div className="up-tab-content-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>WhatsApp Messages</h4>
                    <span style={{ fontSize: "13px", color: "var(--muted)", fontWeight: "500" }}>
                      Total: <strong style={{ color: "var(--title-color)" }}>{stats.totalMessages}</strong>
                    </span>
                  </div>

                  {messagesData.length > 0 ? (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {messagesData.slice(0, 5).map((msg: any, idx: number) => {
                          const st = (msg.status || "").toLowerCase();
                          const iconCls = `up-msg-icon--${["sent","delivered","read","failed"].includes(st) ? st : "default"}`;
                          const statusIcon = st === "sent" ? "\u2709" : st === "delivered" ? "\u2714" : st === "read" ? "\uD83D\uDC41" : st === "failed" ? "\u2715" : "\uD83D\uDCE8";
                          const templateName = msg.content?.template?.name || msg.type || "Message";
                          return (
                            <div key={msg.id || idx} className="up-msg-card" onClick={() => setSelectedMessage(msg)}>
                              <div className={`up-msg-icon ${iconCls}`}>{statusIcon}</div>
                              <div className="up-msg-content">
                                <div className="up-msg-top-row">
                                  <span className="up-msg-template-name">{templateName}</span>
                                  <span className={`up-msg-status up-msg-status--${st}`}>{msg.status || "\u2014"}</span>
                                </div>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                  <span className="up-msg-to-phone">{msg.to_phone || "\u2014"}</span>
                                  {msg.error_message && (
                                    <span className="up-msg-error-text">\u26a0 {msg.error_message}</span>
                                  )}
                                </div>
                              </div>
                              <div className="up-msg-right">
                                <span className="up-msg-time">{formatPlanDateTime(msg.created_at)}</span>
                                <svg className="up-msg-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ marginTop: "14px", textAlign: "center" }}>
                        <button
                          className="up-btn-share"
                          onClick={() => router.push(`/user/all-user/${userId}/messages?companyId=${user.companyId || ""}`)}
                          style={{ padding: "6px 20px", fontSize: "13px", cursor: "pointer" }}
                        >
                          View All ({stats.totalMessages || messagesData.length})
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ color: "var(--muted)", fontSize: "13px" }}>No messages found for this user.</div>
                  )}
                </div>
              )}

              {/* Message Detail Slide Drawer */}
              {selectedMessage && (
                <>
                  <div className="up-camp-drawer-overlay" onClick={() => setSelectedMessage(null)} />
                  <div className="up-camp-drawer">
                    <div className="up-camp-drawer-header">
                      <div className="up-camp-drawer-title">
                        <MessageSquare size={18} style={{ color: "var(--crm-primary,#206bc4)" }} />
                        <div>
                          <div style={{ fontSize: "16px", fontWeight: "700" }}>
                            {selectedMessage.content?.template?.name || "Message"}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "400", marginTop: "2px" }}>
                            WhatsApp Message Detail
                          </div>
                        </div>
                      </div>
                      <button className="up-camp-drawer-close" onClick={() => setSelectedMessage(null)}>&#x2715;</button>
                    </div>

                    <div className="up-camp-drawer-body">
                      {/* Status strip */}
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                        {(() => { const st = (selectedMessage.status || "").toLowerCase(); return (
                          <span className={`up-msg-status up-msg-status--${st}`} style={{ fontSize: "12.5px", padding: "4px 12px" }}>
                            {selectedMessage.status || "\u2014"}
                          </span>
                        ); })()}
                        <span style={{ fontSize: "12px", color: "var(--muted)", background: "var(--surf2)", border: "1px solid var(--border)", padding: "3px 10px", borderRadius: "9999px", fontWeight: "500" }}>
                          {selectedMessage.direction || "outbound"} \u2022 {selectedMessage.type || "template"}
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                          Cost: <strong style={{ color: "var(--title-color)" }}>&#8377;{selectedMessage.cost ?? "0.00"}</strong>
                        </span>
                      </div>

                      {/* Template Body */}
                      {selectedMessage.content?.template && (
                        <div className="up-cd-section">
                          <div className="up-cd-section-title">Template Message</div>
                          <div className="up-msg-body-box">
                            {(() => {
                              const components = selectedMessage.content?.template?.components || [];
                              const body = components.find((c: any) => c.type === "BODY");
                              if (!body) return <span style={{ color: "var(--muted)" }}>No body text</span>;
                              let text: string = body.text || "";
                              const params: any[] = body.parameters || [];
                              params.forEach((p: any, i: number) => {
                                text = text.replace(`{{${i + 1}}}`, `[${p.text || "?"}]`);
                              });
                              return <span>{text}</span>;
                            })()}
                          </div>

                          {(() => {
                            const components = selectedMessage.content?.template?.components || [];
                            const body = components.find((c: any) => c.type === "BODY");
                            const params = body?.parameters || [];
                            if (!params.length) return null;
                            return (
                              <div style={{ marginTop: "8px" }}>
                                <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Recipients</span>
                                <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                  {params.map((p: any, i: number) => (
                                    <span key={i} className="up-msg-param-chip">{p.text}</span>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}

                          <div className="up-cd-info-row" style={{ marginTop: "8px" }}>
                            <span className="up-cd-info-label">Template</span>
                            <span className="up-cd-info-val">{selectedMessage.content.template.name}</span>
                          </div>
                          <div className="up-cd-info-row">
                            <span className="up-cd-info-label">Language</span>
                            <span className="up-cd-info-val">{selectedMessage.content.template.language?.code || "\u2014"}</span>
                          </div>
                        </div>
                      )}

                      {/* Phone Info */}
                      <div className="up-cd-section">
                        <div className="up-cd-section-title">Phone Details</div>
                        {([
                          { label: "From",      val: selectedMessage.from_phone },
                          { label: "To",        val: selectedMessage.to_phone   },
                          { label: "Direction", val: selectedMessage.direction  },
                          { label: "Type",      val: selectedMessage.type       },
                        ] as { label: string; val: string }[]).map(({ label, val }) => (
                          <div key={label} className="up-cd-info-row">
                            <span className="up-cd-info-label">{label}</span>
                            <span className="up-cd-info-val" style={{ fontFamily: "monospace", fontSize: "12.5px" }}>{val || "\u2014"}</span>
                          </div>
                        ))}
                      </div>

                      {/* Error Info */}
                      {selectedMessage.error_message && (
                        <div className="up-cd-section">
                          <div className="up-cd-section-title">Error Details</div>
                          <div style={{ padding: "12px", background: "rgba(214,57,57,0.07)", border: "1px solid rgba(214,57,57,0.2)", borderRadius: "8px", fontSize: "13px", color: "#d63939", lineHeight: "1.6" }}>
                            <div><strong>Code:</strong> {selectedMessage.error_code || "\u2014"}</div>
                            <div style={{ marginTop: "4px" }}><strong>Reason:</strong> {selectedMessage.error_message}</div>
                          </div>
                        </div>
                      )}

                      {/* Timeline */}
                      <div className="up-cd-section">
                        <div className="up-cd-section-title">Timeline</div>
                        {([
                          { label: "Created At",   val: selectedMessage.created_at   },
                          { label: "Queued At",    val: selectedMessage.queued_at    },
                          { label: "Sent At",      val: selectedMessage.sent_at      },
                          { label: "Delivered At", val: selectedMessage.delivered_at },
                          { label: "Read At",      val: selectedMessage.read_at      },
                          { label: "Failed At",    val: selectedMessage.failed_at    },
                        ] as { label: string; val: string | null }[])
                          .filter(({ val }) => val)
                          .map(({ label, val }) => (
                            <div key={label} className="up-cd-info-row">
                              <span className="up-cd-info-label">{label}</span>
                              <span className="up-cd-info-val">{formatPlanDateTime(val)}</span>
                            </div>
                          ))}
                      </div>

                      {/* Identifiers */}
                      <div className="up-cd-section">
                        <div className="up-cd-section-title">Identifiers</div>
                        {([
                          { label: "Message ID",  val: selectedMessage.id              },
                          { label: "Campaign ID", val: selectedMessage.campaign_id     },
                          { label: "Phone Num ID",val: selectedMessage.phone_number_id },
                          { label: "WAMID",       val: selectedMessage.wamid           },
                        ] as { label: string; val: string }[]).map(({ label, val }) => (
                          <div key={label} className="up-cd-info-row">
                            <span className="up-cd-info-label">{label}</span>
                            <span className="up-cd-info-val" style={{ fontSize: "11px", fontFamily: "monospace", wordBreak: "break-all" }}>{val || "\u2014"}</span>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                </>
              )}

              {/* Tab 6: Contacts */}
              {activeTab === "Contacts" && (
                <div className="up-tab-content-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>Contacts</h4>
                    <span style={{ fontSize: "13px", color: "var(--muted)", fontWeight: "500" }}>
                      Total: <strong style={{ color: "var(--title-color)" }}>{stats.totalContacts}</strong>
                    </span>
                  </div>

                  {contactsData.length > 0 ? (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {contactsData.slice(0, 5).map((contact: any, idx: number) => {
                          const isValid = contact.is_valid !== false;
                          return (
                            <div key={contact.id || idx} className="up-contact-card" onClick={() => setSelectedContact(contact)}>
                              <div className="up-contact-icon"><Users size={18} /></div>
                              <div className="up-contact-content">
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                  <span className="up-contact-name">{contact.name || "Unknown"}</span>
                                  <span className={`up-contact-status ${isValid ? "up-contact-status--valid" : "up-contact-status--invalid"}`}>
                                    {isValid ? "Valid" : "Invalid"}
                                  </span>
                                </div>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                  <span className="up-contact-phone">{contact.phone_number || "\u2014"}</span>
                                  {contact.source && (
                                    <span style={{ fontSize: "11px", color: "var(--muted)", background: "var(--surf2)", padding: "1px 6px", borderRadius: "4px" }}>
                                      {contact.source}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="up-contact-right">
                                <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>{formatDate(contact.created_at)}</span>
                                <svg className="up-contact-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ marginTop: "14px", textAlign: "center" }}>
                        <button
                          className="up-btn-share"
                          onClick={() => router.push(`/user/all-user/${userId}/contacts?companyId=${user.companyId || ""}`)}
                          style={{ padding: "6px 20px", fontSize: "13px", cursor: "pointer" }}
                        >
                          View All ({stats.totalContacts || contactsData.length})
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ color: "var(--muted)", fontSize: "13px" }}>No contacts found for this user.</div>
                  )}
                </div>
              )}

              {/* Contact Detail Slide Drawer */}
              {selectedContact && (
                <>
                  <div className="up-camp-drawer-overlay" onClick={() => setSelectedContact(null)} />
                  <div className="up-camp-drawer">
                    <div className="up-camp-drawer-header">
                      <div className="up-camp-drawer-title">
                        <div style={{ width: 32, height: 32, background: "rgba(32,107,196,0.1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--crm-primary,#206bc4)" }}><Users size={18} /></div>
                        <div>
                          <div style={{ fontSize: "16px", fontWeight: "700" }}>
                            {selectedContact.name || "Contact Details"}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "400", marginTop: "2px" }}>
                            User Contact Record
                          </div>
                        </div>
                      </div>
                      <button className="up-camp-drawer-close" onClick={() => setSelectedContact(null)}>&#x2715;</button>
                    </div>

                    <div className="up-camp-drawer-body">
                      {/* Status Strip */}
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                        <span className={`up-contact-status ${selectedContact.is_valid !== false ? "up-contact-status--valid" : "up-contact-status--invalid"}`} style={{ fontSize: "12.5px", padding: "4px 12px" }}>
                          {selectedContact.is_valid !== false ? "Valid Number" : "Invalid Number"}
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--muted)", background: "var(--surf2)", border: "1px solid var(--border)", padding: "3px 10px", borderRadius: "9999px", fontWeight: "500", textTransform: "capitalize" }}>
                          Source: {selectedContact.source || "unknown"}
                        </span>
                      </div>

                      {/* Contact Details */}
                      <div className="up-cd-section">
                        <div className="up-cd-section-title">Contact Info</div>
                        {([
                          { label: "Name",       val: selectedContact.name },
                          { label: "Phone",      val: selectedContact.phone_number },
                          { label: "Email",      val: selectedContact.email },
                          { label: "Country Code", val: selectedContact.country_code },
                        ] as { label: string; val: string }[]).map(({ label, val }) => (
                          <div key={label} className="up-cd-info-row">
                            <span className="up-cd-info-label">{label}</span>
                            <span className="up-cd-info-val" style={label === "Phone" ? { fontFamily: "monospace", fontSize: "13px", fontWeight: "600" } : {}}>{val || "\u2014"}</span>
                          </div>
                        ))}
                      </div>

                      {/* Engagement Stats */}
                      <div className="up-cd-section">
                        <div className="up-cd-section-title">Engagement Statistics</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div style={{ background: "var(--surf2)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)", textAlign: "center" }}>
                            <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--title-color)" }}>{selectedContact.message_count || 0}</div>
                            <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", marginTop: "4px" }}>Messages Sent</div>
                          </div>
                          <div style={{ background: "rgba(214,57,57,0.05)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(214,57,57,0.1)", textAlign: "center" }}>
                            <div style={{ fontSize: "20px", fontWeight: "700", color: "#d63939" }}>{selectedContact.failed_count || 0}</div>
                            <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", marginTop: "4px" }}>Failed Msgs</div>
                          </div>
                        </div>
                      </div>

                      {/* Invalid Reason */}
                      {!selectedContact.is_valid && selectedContact.invalid_reason && (
                        <div className="up-cd-section">
                          <div className="up-cd-section-title">Invalid Reason</div>
                          <div style={{ padding: "12px", background: "rgba(214,57,57,0.07)", border: "1px solid rgba(214,57,57,0.2)", borderRadius: "8px", fontSize: "13px", color: "#d63939", lineHeight: "1.6" }}>
                            {selectedContact.invalid_reason}
                          </div>
                        </div>
                      )}

                      {/* Timeline */}
                      <div className="up-cd-section">
                        <div className="up-cd-section-title">Timeline</div>
                        {([
                          { label: "Created At",        val: selectedContact.created_at },
                          { label: "Last Contacted",    val: selectedContact.last_contacted_at },
                          { label: "Last Invalid",      val: selectedContact.last_invalid_at },
                          { label: "Updated At",        val: selectedContact.updated_at },
                        ] as { label: string; val: string | null }[])
                          .filter(({ val }) => val)
                          .map(({ label, val }) => (
                            <div key={label} className="up-cd-info-row">
                              <span className="up-cd-info-label">{label}</span>
                              <span className="up-cd-info-val">{formatPlanDateTime(val)}</span>
                            </div>
                          ))}
                      </div>

                      {/* Identifiers */}
                      <div className="up-cd-section">
                        <div className="up-cd-section-title">Identifiers</div>
                        {([
                          { label: "Contact ID",   val: selectedContact.id },
                          { label: "Phone Num ID", val: selectedContact.phone_number_id },
                        ] as { label: string; val: string }[]).map(({ label, val }) => (
                          <div key={label} className="up-cd-info-row">
                            <span className="up-cd-info-label">{label}</span>
                            <span className="up-cd-info-val" style={{ fontSize: "11px", fontFamily: "monospace", wordBreak: "break-all" }}>{val || "\u2014"}</span>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                </>
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
            try {
              const cached = sessionStorage.getItem(`user_${userId}`);
              if (cached) {
                const parsed = JSON.parse(cached);
                sessionStorage.setItem(`user_${userId}`, JSON.stringify({ ...parsed, ...updated }));
              }
            } catch {}
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
                      selectedPlan === planOption ? "var(--crm-primary, #206bc4)" : "var(--up-border, #e2e8f0)"
                    }`,
                    background:
                      selectedPlan === planOption
                        ? "rgba(32, 107, 196, 0.12)"
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
                    style={{ accentColor: "var(--crm-primary, #206bc4)" }}
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



