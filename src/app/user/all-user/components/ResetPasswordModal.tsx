"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import { User } from "../types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

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
      toast.error("Password is required");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axiosInstance.put(`/v1/admin/users/${user.id}/reset-password`, {
        password: newPassword,
      });

      if (data.success !== false) {
        toast.success(`Password for ${user.name} reset successfully`);
        onClose();
      } else {
        toast.error(data.message || "Password reset failed");
      }
    } catch (error: any) {
      console.error("Password Reset Error:", error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="sm"
      title="Reset Password"
      description={`Update password for ${user.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handlePasswordChange} isLoading={loading} leftIcon={<KeyRound size={15} />}>
            Reset Password
          </Button>
        </>
      }
    >
      <Input
        label="New Password"
        type={showNew ? "text" : "password"}
        placeholder="Enter new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            aria-label={showNew ? "Hide password" : "Show password"}
            className="pointer-events-auto flex items-center text-muted-foreground hover:text-foreground"
          >
            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />
    </Modal>
  );
}
