"use client";

import { useState } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import { User } from "../types";

interface ResetPasswordModalProps {
  user: User;
  onClose: () => void;
}

export function ResetPasswordModal({ user, onClose }: ResetPasswordModalProps) {
  const [newPassword,    setNewPassword]    = useState("");
  const [showNew,        setShowNew]        = useState(false);
  const [loading,        setLoading]        = useState(false);

  const handlePasswordChange = async () => {
    if (!newPassword) {
      alert("Password is required");
      return;
    }
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axiosInstance.put(`/v1/admin/users/${user.id}/reset-password`, {
        password: newPassword,
      });

      if (data.success !== false) {
        alert(`Password for ${user.name} reset successfully`);
        onClose();
      } else {
        alert(data.message || "Password reset failed");
      }
    } catch (error: any) {
      console.error("Password Reset Error:", error);
      alert(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="au-overlay" onClick={onClose}>
      <div className="au-modal" onClick={(e) => e.stopPropagation()}>
        <div className="au-modal__header">
          <div>
            <div className="au-modal__title">Reset Password</div>
            <div className="au-modal__sub">Update password for {user.name}</div>
          </div>
          <button className="au-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="au-modal__body">
          {/* NEW PASSWORD */}
          <div className="au-field">
            <div className="au-field__label">NEW PASSWORD</div>
            <div className="au-password-wrap">
              <input
                type={showNew ? "text" : "password"}
                className="au-input"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="au-password-toggle"
                onClick={() => setShowNew(!showNew)}
              >
                👁
              </button>
            </div>
          </div>
        </div>

        <div className="au-modal__actions">
          <button
            className="au-btn au-btn--primary"
            onClick={handlePasswordChange}
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
          <button className="au-btn au-btn--ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}