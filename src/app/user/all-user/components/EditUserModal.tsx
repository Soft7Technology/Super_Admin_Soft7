"use client";

import { useState } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import { User } from "../types";
import { toast } from "react-toastify";
import { InternationalPhoneInput } from "@/components/InternationalPhoneInput";
import { validatePhoneNumber, getCountryFromPhoneNumber } from "@/lib/phone";

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onUpdated: (updatedUser: Partial<User>) => void;
}

export function EditUserModal({ user, onClose, onUpdated }: EditUserModalProps) {
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    return getCountryFromPhoneNumber(user.phone) || "us";
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleUpdateUser = async () => {
    setErr(null);

    if (!name.trim()) {
      setErr("Name is required.");
      toast.error("Name is required.");
      return;
    }

    if (!email.trim()) {
      setErr("Email is required.");
      toast.error("Email is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErr("Please enter a valid email address.");
      toast.error("Please enter a valid email address.");
      return;
    }

    // Validate phone number using international phone utility
    const phoneValidation = validatePhoneNumber(phone, selectedCountry);
    if (!phoneValidation.isValid) {
      const errMsg = phoneValidation.error || "Please enter a valid international phone number.";
      setErr(errMsg);
      toast.error(errMsg);
      return;
    }
    const normalizedPhone = phoneValidation.e164!;

    try {
      setLoading(true);

      let updated = false;

      // 1. External backend update
      try {
        const { data } = await axiosInstance.put(`/v1/admin/users/${user.id}`, {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: normalizedPhone,
        });
        if (data?.success !== false) {
          updated = true;
        }
      } catch (extErr: any) {
        console.warn("External user update note:", extErr?.message);
      }

      // 2. Local Next.js Prisma API update
      try {
        const localRes = await fetch(`/api/admin/users/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: normalizedPhone,
          }),
        });
        if (localRes.ok) {
          updated = true;
        }
      } catch (locErr: any) {
        console.warn("Local user update note:", locErr?.message);
      }

      if (updated) {
        toast.success(`User "${name.trim()}" updated successfully`);
        onUpdated({ name: name.trim(), email: email.trim().toLowerCase(), phone: normalizedPhone });
        onClose();
      } else {
        toast.error("Failed to update user. Please try again.");
      }
    } catch (error: any) {
      console.error("Update User Error:", error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while updating user"
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
            <div className="au-modal__title">Edit User</div>
            <div className="au-modal__sub">Update user details</div>
          </div>
          <button type="button" className="au-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="au-modal__body">
          {err && (
            <div style={{ color: "#ef4444", fontSize: "12px", background: "rgba(239,68,68,0.1)", padding: "8px 12px", borderRadius: "8px" }}>
              {err}
            </div>
          )}

          <div className="au-field">
            <div className="au-field__label">NAME *</div>
            <input
              type="text"
              className="au-input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErr(null);
              }}
            />
          </div>

          <div className="au-field">
            <div className="au-field__label">EMAIL *</div>
            <input
              type="email"
              className="au-input"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErr(null);
              }}
            />
          </div>

          <div className="au-field">
            <div className="au-field__label">PHONE NUMBER *</div>
            <InternationalPhoneInput
              value={phone}
              onChange={(val, details) => {
                setPhone(val);
                if (details?.countryCode) {
                  setSelectedCountry(details.countryCode);
                }
                setErr(null);
              }}
              defaultCountry={selectedCountry}
              placeholder="Enter phone number"
            />
          </div>
        </div>

        <div className="au-modal__actions">
          <button
            type="button"
            className="au-btn au-btn--primary"
            onClick={handleUpdateUser}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update User"}
          </button>
          <button type="button" className="au-btn au-btn--ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
