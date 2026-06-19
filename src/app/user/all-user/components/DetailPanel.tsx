"use client";

import { useState } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import { User, STATUS_DOT, roleColor, planColor } from "../types";
import { Badge } from "./Badge";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
interface DetailPanelProps {
  user: User;
  onClose: () => void;
  onRefresh?: () => void;
}

interface UserActivityStats {
  messages: number;
  campaigns: number;
  contacts: number;
  templates: number;
  delivered: number;
  failed: number;
}

export function DetailPanel({ user, onClose, onRefresh }: DetailPanelProps) {
  const [tab,          setTab]          = useState<"info" | "stats">("info");
  const [userStats,    setUserStats]    = useState<UserActivityStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchUserStats = async () => {
    try {
      setStatsLoading(true);
      const { data } = await axiosInstance.get(`/v1/admin/companies/user-details/${user.id}`);
      if (data.success !== false) {
        const s = data?.data ?? data;
        setUserStats({
          messages:  Number(s?.sent_count      ?? s?.messages  ?? 0),
          campaigns: Number(s?.campaigns_count ?? s?.campaigns ?? 0),
          contacts:  Number(s?.contacts_count  ?? s?.contacts  ?? 0),
          templates: Number(s?.template_count  ?? s?.templates ?? 0),
          delivered: Number(s?.delivered_count ?? 0),
          failed:    Number(s?.failed_count    ?? 0),
        });
      }
    } catch (error: any) {
  console.error("Stats Error:", error);

  toast.error(
    error?.response?.data?.message ||
    "Failed to load user statistics"
  );
}finally {
      setStatsLoading(false);
    }
  };

  const handleTabChange = (key: "info" | "stats") => {
    setTab(key);
    if (key === "stats") fetchUserStats();
  };

  return (
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
                  ["Company",    user.company,      ""],
                  ["Plan",       user.plan,         "plan"],
                  ["Phone",      user.phone || "—", ""],
                  ["Joined",     user.joined,       ""],
                  ["Last Login", user.login,        ""],
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
                      ["messages",  userStats?.messages  ?? 0, "#10b981", "Messages Sent"],
                      ["campaigns", userStats?.campaigns ?? 0, "#6366f1", "Campaigns"],
                      ["contacts",  userStats?.contacts  ?? 0, "#3b82f6", "Contacts"],
                      ["templates", userStats?.templates ?? 0, "#f59e0b", "Templates"],
                      ["delivered", userStats?.delivered ?? 0, "#34d399", "Delivered"],
                      ["failed",    userStats?.failed    ?? 0, "#ef4444", "Failed"],
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
<<<<<<< HEAD

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
        <ResetPasswordModal user={user} onClose={() => setPasswordOpen(false)} />
      )}
    </>
=======
    </div>
>>>>>>> origin/main
  );
}