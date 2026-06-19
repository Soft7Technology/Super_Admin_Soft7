"use client";

import { useState } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import { toast } from "react-toastify";

interface ResetPasswordModalProps {
  onClose: () => void;
}

export function ResetPasswordModal({ onClose }: ResetPasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [showCurrent,     setShowCurrent]     = useState(false);
  const [showNew,         setShowNew]         = useState(false);
  const [loading,         setLoading]         = useState(false);

  const handlePasswordChange = async () => {
  if (!currentPassword || !newPassword) {
  toast.error("All fields are required");
  return;
}

    try {
      setLoading(true);
      const { data } = await axiosInstance.post("/v1/auth/change-password", {
        current_password: currentPassword,
        new_password:     newPassword,
      });

     if (data.success) {
  toast.success("Password changed successfully");
  onClose();
} else {
       toast.error(data.message || "Password change failed");
      }
    } catch (error: any) {
  console.error("Password Error:", error);

  toast.error(
    error?.response?.data?.message ||
    "Something went wrong"
  );
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
            <div className="au-modal__sub">Update user password</div>
          </div>
          <button className="au-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="au-modal__body">
          {/* CURRENT PASSWORD */}
          <div className="au-field">
            <div className="au-field__label">CURRENT PASSWORD</div>
            <div className="au-password-wrap">
              <input
                type={showCurrent ? "text" : "password"}
                className="au-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                type="button"
                className="au-password-toggle"
                onClick={() => setShowCurrent(!showCurrent)}
              >
                👁
              </button>
            </div>
          </div>

          {/* NEW PASSWORD */}
          <div className="au-field">
            <div className="au-field__label">NEW PASSWORD</div>
            <div className="au-password-wrap">
              <input
                type={showNew ? "text" : "password"}
                className="au-input"
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
            {loading ? "Changing..." : "Change Password"}
          </button>
          <button className="au-btn au-btn--ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}