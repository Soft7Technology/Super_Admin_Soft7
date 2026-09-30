"use client";

import { useEffect } from "react";
import { User, roleColor, planColor } from "../types";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

interface DeleteUserModalProps {
  user: User;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteUserModal({
  user,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteUserModalProps) {
  // Keyboard accessibility: Escape closes modal if not currently deleting
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDeleting, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  const displayName = user.name?.trim() || user.email || "this user";
  const initials = (user.name || user.email || "U")
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  return (
    <div
      className="au-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-user-title"
    >
      <div className="au-modal au-modal--delete" onClick={(e) => e.stopPropagation()}>
        <div className="au-modal__header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="au-delete-icon-box">
              <Trash2 size={20} />
            </div>
            <div>
              <div id="delete-user-title" className="au-modal__title">
                Delete User
              </div>
              <div className="au-modal__sub">Permanent account removal</div>
            </div>
          </div>
          <button
            type="button"
            className="au-modal__close"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Close delete user confirmation modal"
          >
            ×
          </button>
        </div>

        <div className="au-modal__body">
          <p className="au-delete-prompt">
            Are you sure you want to delete <strong>{displayName}</strong>?
          </p>

          {/* User information card preview */}
          <div className="au-delete-user-card">
            <div className="au-avatar au-avatar--38" style={{ background: user.av || "#6366f1" }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="au-delete-user-card__name">{user.name || "Unnamed User"}</div>
              <div className="au-delete-user-card__email">{user.email}</div>
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

          <div className="au-delete-warning-banner">
            <AlertTriangle size={16} className="au-delete-warning-banner__icon" />
            <span>
              <strong>Warning:</strong> This action cannot be undone. The user account and all associated data will be permanently removed.
            </span>
          </div>
        </div>

        <div className="au-modal__actions">
          <button
            type="button"
            className="au-btn au-btn--ghost"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="au-btn au-btn--danger-solid"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 size={15} className="au-spinner" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={15} />
                <span>Delete User</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
