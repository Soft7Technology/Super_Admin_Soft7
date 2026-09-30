"use client";

import { useEffect } from "react";
import { User, roleColor, planColor } from "../types";
import { ShieldOff, ShieldCheck, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

interface StatusUserModalProps {
  user: User;
  targetStatus: "ACTIVE" | "SUSPENDED";
  isUpdating: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function StatusUserModal({
  user,
  targetStatus,
  isUpdating,
  onClose,
  onConfirm,
}: StatusUserModalProps) {
  const isSuspending = targetStatus === "SUSPENDED";
  const actionVerb = isSuspending ? "suspend" : "activate";
  const actionNoun = isSuspending ? "Suspension" : "Activation";
  const displayName = user.name?.trim() || user.email || "this user";

  const initials = (user.name || user.email || "U")
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  // Keyboard accessibility: Escape closes modal if not updating
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isUpdating) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isUpdating, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isUpdating) {
      onClose();
    }
  };

  return (
    <div
      className="au-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-user-title"
    >
      <div className="au-modal au-modal--status" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="au-modal__header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              className={`au-status-icon-box ${
                isSuspending ? "au-status-icon-box--suspend" : "au-status-icon-box--activate"
              }`}
            >
              {isSuspending ? <ShieldOff size={20} /> : <ShieldCheck size={20} />}
            </div>
            <div>
              <div id="status-user-title" className="au-modal__title">
                {isSuspending ? "Suspend User" : "Activate User"}
              </div>
              <div className="au-modal__sub">
                {isSuspending
                  ? "Block platform access for this user"
                  : "Restore platform access for this user"}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="au-modal__close"
            onClick={onClose}
            disabled={isUpdating}
            aria-label={`Close ${actionVerb} user confirmation modal`}
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="au-modal__body">
          <p className="au-status-prompt">
            Are you sure you want to {actionVerb} <strong>{displayName}</strong>?
          </p>

          {/* User Preview Card */}
          <div className="au-status-user-card">
            <div className="au-avatar au-avatar--38" style={{ background: user.av || "#6366f1" }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="au-status-user-card__name">{user.name || "Unnamed User"}</div>
              <div className="au-status-user-card__email">{user.email}</div>
            </div>
            <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
              {user.role && (
                <span
                  className="au-chip"
                  style={{
                    background: `${roleColor(user.role)}15`,
                    color: roleColor(user.role),
                    fontSize: "11px",
                  }}
                >
                  {user.role}
                </span>
              )}
              {user.plan && (
                <span
                  className="au-chip"
                  style={{
                    background: `${planColor(user.plan)}15`,
                    color: planColor(user.plan),
                    fontSize: "11px",
                  }}
                >
                  {user.plan}
                </span>
              )}
            </div>
          </div>

          {/* Impact Banner */}
          {isSuspending ? (
            <div className="au-status-warning-banner">
              <AlertTriangle size={16} className="au-status-warning-banner__icon" />
              <span>
                <strong>Warning:</strong> The user will be immediately blocked from logging in
                and accessing all platform services until re-activated.
              </span>
            </div>
          ) : (
            <div className="au-status-info-banner">
              <CheckCircle2 size={16} className="au-status-info-banner__icon" />
              <span>
                <strong>Access Restored:</strong> The user will regain full access to log in
                and use all features associated with their account plan.
              </span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="au-modal__actions">
          <button
            type="button"
            className="au-btn au-btn--ghost"
            onClick={onClose}
            disabled={isUpdating}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`au-btn ${
              isSuspending ? "au-btn--danger-solid" : "au-btn--success-solid"
            }`}
            onClick={onConfirm}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 size={15} className="au-spinner" />
                <span>{isSuspending ? "Suspending..." : "Activating..."}</span>
              </>
            ) : isSuspending ? (
              <>
                <ShieldOff size={15} />
                <span>Confirm {actionNoun}</span>
              </>
            ) : (
              <>
                <ShieldCheck size={15} />
                <span>Confirm {actionNoun}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
