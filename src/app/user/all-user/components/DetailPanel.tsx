"use client";

import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import { User, STATUS_DOT, roleColor, planColor, formatPhoneNumber } from "../types";
import { Badge } from "./Badge";
import { EditUserModal } from "./EditUserModal";
import { ResetPasswordModal } from "./ResetPasswordModal";


interface DetailPanelProps {
  user: User;
  onClose: () => void;
  onRefresh?: () => void;
  companiesMap?: Record<string, string>;
}

interface UserActivityStats {
  messages: number;
  campaigns: number;
  contacts: number;
  templates: number;
  delivered: number;
  failed: number;
}

function isRawIdentifier(val: unknown): boolean {
  if (!val || typeof val !== "string") return false;
  const trimmed = val.trim();
  if (trimmed.startsWith("ID:")) return true;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
    return true;
  }
  if (/^\d+$/.test(trimmed)) {
    return true;
  }
  return false;
}

export function DetailPanel({ user, onClose, onRefresh, companiesMap = {} }: DetailPanelProps) {
  const [tab, setTab] = useState<"info" | "stats">("info");
  const [userStats, setUserStats] = useState<UserActivityStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  // Dynamic human-readable company name resolution
  const [resolvedCompany, setResolvedCompany] = useState<string>(() => {
    if (user.company && !isRawIdentifier(user.company) && user.company !== "—") {
      return user.company;
    }
    if (user.companyId && companiesMap[user.companyId]) {
      return companiesMap[user.companyId];
    }
    return user.company || "—";
  });

  // Resolve company name dynamically from backend if only UUID or ID is available
  useEffect(() => {
    let active = true;

    async function resolveCompany() {
      // If already a valid readable business name, keep it
      if (user.company && !isRawIdentifier(user.company) && user.company !== "—") {
        setResolvedCompany(user.company);
        return;
      }

      // Check map first
      if (user.companyId && companiesMap[user.companyId]) {
        setResolvedCompany(companiesMap[user.companyId]);
        return;
      }

      // Fetch company details by ID
      if (user.companyId) {
        try {
          const res = await axiosInstance.get(`/v1/admin/companies/${user.companyId}`).catch(() => null);
          const compName = res?.data?.data?.name || res?.data?.company?.name || res?.data?.name;
          if (active && compName) {
            setResolvedCompany(String(compName).trim());
            return;
          }
        } catch {}

        try {
          const localRes = await fetch(`/api/admin/companies/${user.companyId}`).catch(() => null);
          if (localRes && localRes.ok) {
            const data = await localRes.json();
            const compName = data?.company?.name || data?.name;
            if (active && compName) {
              setResolvedCompany(String(compName).trim());
              return;
            }
          }
        } catch {}
      }

      // Fallback
      if (active && (!resolvedCompany || resolvedCompany === "—" || isRawIdentifier(resolvedCompany))) {
        setResolvedCompany("Independent / No Company");
      }
    }

    resolveCompany();

    return () => {
      active = false;
    };
  }, [user, companiesMap]);

  // Keyboard accessibility: Escape closes modal immediately without page reload
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClose();
  };

  const fetchUserStats = async () => {
    try {
      setStatsLoading(true);
      const { data } = await axiosInstance.get(`/v1/admin/companies/user-details/${user.id}`);
      if (data.success !== false) {
        const s = data?.data ?? data;
        setUserStats({
          messages: Number(s?.sent_count ?? s?.messages ?? 0),
          campaigns: Number(s?.campaigns_count ?? s?.campaigns ?? 0),
          contacts: Number(s?.contacts_count ?? s?.contacts ?? 0),
          templates: Number(s?.template_count ?? s?.templates ?? 0),
          delivered: Number(s?.delivered_count ?? 0),
          failed: Number(s?.failed_count ?? 0),
        });

        // If user details response also carries company business name
        const backendCompName = s?.company_name || s?.company?.name;
        if (backendCompName && !isRawIdentifier(backendCompName)) {
          setResolvedCompany(backendCompName);
        }
      }
    } catch (error: any) {
      console.warn("User stats fetch note:", error?.message || error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleTabChange = (key: "info" | "stats") => {
    setTab(key);
    if (key === "stats") fetchUserStats();
  };

  return (
    <>
      <div className="au-overlay" onClick={handleClose}>
        <div
          className="au-modal au-modal--detail"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="au-modal__header">
            <div>
              <div className="au-modal__title">User Details</div>
              <div className="au-modal__sub">{user.email}</div>
            </div>
            <button
              type="button"
              className="au-modal__close"
              onClick={handleClose}
              aria-label="Close user details modal"
            >
              ×
            </button>
          </div>

          <div className="au-modal__body">
            {/* Identity */}
            <div className="au-panel__identity">
              <div className="au-panel__avatar-wrap">
                <div className="au-avatar au-avatar--68" style={{ background: user.av }}>
                  {user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div
                  className={`au-status-dot au-status-dot--panel ${
                    STATUS_DOT[user.status] ?? "au-status-dot--other"
                  }`}
                />
              </div>
              <div className="au-panel__name">{user.name}</div>
              <div className="au-panel__email">{user.email}</div>
              <div className="au-panel__badges">
                <Badge status={user.status} />
                <span
                  className="au-role-chip"
                  style={{ background: `${roleColor(user.role)}18`, color: roleColor(user.role) }}
                >
                  {user.role}
                </span>
                {user.pro && <span className="au-pro-badge--lg">PRO</span>}
              </div>
            </div>

            {/* Tabs */}
            <div className="au-panel__tabs">
              {(["info", "stats"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleTabChange(k)}
                  className={`au-panel__tab ${tab === k ? "au-panel__tab--active" : ""}`}
                >
                  {k[0].toUpperCase() + k.slice(1)}
                </button>
              ))}
            </div>

            {/* Info tab */}
            {tab === "info" && (
              <div>
                {(
                  [
                    ["Company", resolvedCompany, ""],
                    ["Plan", user.plan, "plan"],
                    ["Phone", formatPhoneNumber(user.phone), ""],
                    ["Joined", user.joined, ""],
                    ["Last Login", user.login, ""],
                  ] as [string, string, string][]
                ).map(([label, value, type]) => (
                  <div key={label} className="au-info-row">
                    <span className="au-info-row__label">{label}</span>
                    <span
                      className="au-info-row__value"
                      style={type === "plan" ? { color: planColor(value) } : undefined}
                    >
                      {value}
                    </span>
                  </div>
                ))}

                {/* Action buttons */}
                <div className="au-modal__actions" style={{ marginTop: "1.25rem" }}>
                  <button
                    type="button"
                    className="au-btn au-btn--primary"
                    onClick={() => setEditOpen(true)}
                  >
                    Edit User
                  </button>
                  <button
                    type="button"
                    className="au-btn au-btn--ghost"
                    onClick={() => setPasswordOpen(true)}
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            )}

            {/* Stats tab */}
            {tab === "stats" && (
              <div className="au-stats-grid">
                {statsLoading ? (
                  <div className="au-empty__title">Loading stats...</div>
                ) : (
                  <>
                    {(
                      [
                        ["messages", userStats?.messages ?? user.msgs ?? 0, "#10b981", "Messages Sent"],
                        ["campaigns", userStats?.campaigns ?? user.campaigns ?? 0, "#6366f1", "Campaigns"],
                        ["contacts", userStats?.contacts ?? 0, "#3b82f6", "Contacts"],
                        ["templates", userStats?.templates ?? 0, "#f59e0b", "Templates"],
                        ["delivered", userStats?.delivered ?? 0, "#34d399", "Delivered"],
                        ["failed", userStats?.failed ?? 0, "#ef4444", "Failed"],
                      ] as [string, number, string, string][]
                    ).map(([key, val, color, lbl]) => (
                      <div key={key} className="au-stats-cell">
                        <div className="au-stats-cell__val" style={{ color }}>{val}</div>
                        <div className="au-stats-cell__lbl">{lbl}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {editOpen && (
        <EditUserModal
          user={user}
          onClose={() => setEditOpen(false)}
          onUpdated={(updatedUser: Partial<User>) => {
            Object.assign(user, updatedUser);
            onRefresh?.();
          }}
        />
      )}

      {passwordOpen && (
        <ResetPasswordModal user={user} onClose={() => setPasswordOpen(false)} />
      )}
    </>
  );
}
