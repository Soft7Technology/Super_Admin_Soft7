"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme, tokens } from "../../../../../context/ThemeContext";

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

function toInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;

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
    <div style={{ padding: "28px 28px 48px", background: t.bg, minHeight: "100%", transition: "background 0.3s ease" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "18px" }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.45rem", color: t.text, margin: 0, letterSpacing: "-0.02em" }}>
            User Details
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: "0.875rem", color: t.textMuted }}>
            Complete information for selected user.
          </p>
        </div>

        <button
          onClick={handleBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "9px 14px",
            borderRadius: "9px",
            border: `1px solid ${t.border}`,
            background: t.surface,
            color: t.textSub,
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ← Back
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "24px", borderRadius: "14px", border: `1px solid ${t.border}`, background: t.surface, color: t.textMuted }}>
          Loading user details...
        </div>
      ) : error ? (
        <div style={{ padding: "24px", borderRadius: "14px", border: `1px solid ${t.border}`, background: t.surface, color: t.textMuted }}>
          {error}
        </div>
      ) : user ? (
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ padding: "18px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg,#3b5bdb,#6741d9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: "0.8rem",
                flexShrink: 0,
              }}
            >
              {toInitials(user.name)}
            </div>
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: t.text }}>{user.name}</div>
              <div style={{ fontSize: "0.8rem", color: t.textMuted }}>{user.email}</div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0,1fr))",
              gap: "0",
            }}
          >
            {details.map(([label, value], index) => (
              <div
                key={label}
                style={{
                  padding: "14px 20px",
                  borderTop: index < 2 ? "none" : `1px solid ${t.border}`,
                  borderRight: index % 2 === 0 ? `1px solid ${t.border}` : "none",
                }}
              >
                <div style={{ fontSize: "0.7rem", letterSpacing: "0.08em", color: t.textFaint, fontWeight: 700, marginBottom: "6px" }}>
                  {label.toUpperCase()}
                </div>
                <div style={{ fontSize: "0.88rem", color: t.textSub, fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: "24px", borderRadius: "14px", border: `1px solid ${t.border}`, background: t.surface, color: t.textMuted }}>
          User not found.
        </div>
      )}
    </div>
  );
}
