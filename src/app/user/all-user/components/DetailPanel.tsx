"use client";

import { useState } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import { User, STATUS_DOT, roleColor, planColor } from "../types";
import { Badge } from "./Badge";
import { EditUserModal } from "./EditUserModal";
import { ResetPasswordModal } from "./ResetPasswordModal";

interface DetailPanelProps {
  user: User;
  onClose: () => void;
  onRefresh?: () => void;
}

interface UserActivityStats {
  messages: number;
  campaigns: number;
  chatbots: number;
  flows: number;
}

export function DetailPanel({ user, onClose, onRefresh }: DetailPanelProps) {
  const [tab,           setTab]           = useState<"info" | "stats">("info");
  const [passwordOpen,  setPasswordOpen]  = useState(false);
  const [editOpen,      setEditOpen]      = useState(false);
  const [userStats,     setUserStats]     = useState<UserActivityStats | null>(null);
  const [statsLoading,  setStatsLoading]  = useState(false);
  const [suspending,    setSuspending]    = useState(false);
  const [localStatus,   setLocalStatus]   = useState(user.status);

  const fetchUserStats = async () => {
    try {
      setStatsLoading(true);
      const { data } = await axiosInstance.get("/v1/admin/users/stats");
      if (data.success) {
        setUserStats({
          messages:  data?.data?.messages  || data?.data?.total_messages  || 0,
          campaigns: data?.data?.campaigns || data?.data?.total_campaigns || 0,
          chatbots:  data?.data?.chatbots  || data?.data?.total_chatbots  || 0,
          flows:     data?.data?.flows     || data?.data?.total_flows     || 0,
        });
      }
    } catch (error) {
      console.error("Stats Error:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleTabChange = (key: "info" | "stats") => {
    setTab(key);
    if (key === "stats") fetchUserStats();
  };

  const handleSuspendToggle = async () => {
    const isSuspended = localStatus === "SUSPENDED";
    const action = isSuspended ? "restore" : "suspend";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      setSuspending(true);
      const endpoint = isSuspended
        ? `/v1/admin/users/${user.id}/active-user`
        : `/v1/admin/users/${user.id}/suspend-user`;

      const { data } = await axiosInstance.put(endpoint);
      if (data.success !== false) {
        const newStatus = isSuspended ? "ACTIVE" : "SUSPENDED";
        setLocalStatus(newStatus);
        user.status = newStatus;
        onRefresh?.();
        alert(`✅ User ${isSuspended ? "restored" : "suspended"} successfully`);
      } else {
        alert(data.message || `Failed to ${action} user`);
      }
    } catch (error: any) {
      console.error("Suspend/Restore Error:", error);
      alert(error?.response?.data?.message || "Something went wrong");
    } finally {
      setSuspending(false);
    }
  };

  return (
    <>
      <div className="au-overlay" onClick={onClose}>
        <div
          className="au-modal au-modal--detail"
          style={{ maxWidth: "520px", width: "100%", maxHeight: "85vh", overflowY: "auto" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="au-modal__header">
            <div>
              <div className="au-modal__title">User Details</div>
              <div className="au-modal__sub">{user.email}</div>
            </div>
            <button className="au-modal__close" onClick={onClose}>×</button>
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
                    STATUS_DOT[localStatus] ?? "au-status-dot--other"
                  }`}
                />
              </div>
              <div className="au-panel__name">{user.name}</div>
              <div className="au-panel__email">{user.email}</div>
              <div className="au-panel__badges">
                <Badge status={localStatus} />
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
                    ["Company",    user.company, ""],
                    ["Plan",       user.plan,    "plan"],
                    ["Phone",      user.phone || "—", ""],
                    ["Joined",     user.joined, ""],
                    ["Last Login", user.login,  ""],
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
                        ["messages",  userStats?.messages  ?? 0, "#10b981", "Messages"],
                        ["campaigns", userStats?.campaigns ?? 0, "#6366f1", "Campaigns"],
                        ["chatbots",  userStats?.chatbots  ?? 0, "#f59e0b", "Chatbots"],
                        ["flows",     userStats?.flows     ?? 0, "#34d399", "Flows"],
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

            {/* Actions */}
            {tab === "info" && (
              <div className="au-panel__actions">
                <button className="au-btn au-btn--primary" onClick={() => setEditOpen(true)}>
                  Edit User
                </button>
                <button className="au-btn au-btn--ghost" onClick={() => setPasswordOpen(true)}>
                  Reset Password
                </button>
                {localStatus === "SUSPENDED" ? (
                  <button
                    className="au-btn au-btn--success"
                    onClick={handleSuspendToggle}
                    disabled={suspending}
                  >
                    {suspending ? "Restoring…" : "Restore Account"}
                  </button>
                ) : (
                  <button
                    className="au-btn au-btn--danger"
                    onClick={handleSuspendToggle}
                    disabled={suspending}
                  >
                    {suspending ? "Suspending…" : "Suspend User"}
                  </button>
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
          onUpdated={(updatedUser) => {
            Object.assign(user, updatedUser);
            onRefresh?.();
          }}
        />
      )}

      {passwordOpen && (
        <ResetPasswordModal onClose={() => setPasswordOpen(false)} />
      )}
    </>
  );
}
