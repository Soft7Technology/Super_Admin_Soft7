"use client";

import { useState } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import { User } from "../types";

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onUpdated: (updatedUser: Partial<User>) => void;
}

export function EditUserModal({ user, onClose, onUpdated }: EditUserModalProps) {
  const [name,    setName]    = useState(user.name  || "");
  const [email,   setEmail]   = useState(user.email || "");
  const [phone,   setPhone]   = useState(user.phone || "");
  const [loading, setLoading] = useState(false);

  const handleUpdateUser = async () => {
    if (!name || !email || !phone) {
      alert("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axiosInstance.put(`/v1/admin/users/${user.id}`, {
        name,
        email,
        phone,
      });

      if (data.success) {
        alert("User updated successfully");
        onUpdated({ name, email, phone });
        onClose();
      } else {
        alert(data.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Update User Error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="au-overlay" onClick={onClose}>
      <div className="au-modal" onClick={(e) => e.stopPropagation()}>
        <div className="au-modal__header">
          <div>
            <div className="au-modal__title">Edit User</div>
            <div className="au-modal__sub">Update user details</div>
          </div>
          <button className="au-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="au-modal__body">
          <div className="au-field">
            <div className="au-field__label">NAME</div>
            <input
              type="text"
              className="au-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="au-field">
            <div className="au-field__label">EMAIL</div>
            <input
              type="email"
              className="au-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="au-field">
            <div className="au-field__label">PHONE</div>
            <input
              type="text"
              className="au-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="au-modal__actions">
          <button
            className="au-btn au-btn--primary"
            onClick={handleUpdateUser}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update User"}
          </button>
          <button className="au-btn au-btn--ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
