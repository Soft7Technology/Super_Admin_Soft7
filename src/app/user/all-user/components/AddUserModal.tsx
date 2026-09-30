"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import { getAuthHeaders } from "@/lib/auth-client";
import { toast } from "react-toastify";
import { InternationalPhoneInput } from "@/components/InternationalPhoneInput";
import { validatePhoneNumber } from "@/lib/phone";
import type { CompanyOption } from "../hooks/useUsers";

interface AddUserModalProps {
  companies: CompanyOption[];
  onClose: () => void;
  onSuccess: () => void;
}

export function AddUserModal({ companies = [], onClose, onSuccess }: AddUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("us");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [companyId, setCompanyId] = useState<string>("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [plan, setPlan] = useState<string>("Starter");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Close with Escape key
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

  const handleSubmit = async () => {
    setErr(null);

    // ── Validation ──────────────────────────────────────────────────────────
    if (!name.trim()) {
      return setErr("Full name is required.");
    }

    if (!email.trim()) {
      return setErr("Email address is required.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return setErr("Please enter a valid email address.");
    }

    const phoneValidation = validatePhoneNumber(phone, selectedCountry);
    if (!phoneValidation.isValid) {
      return setErr(phoneValidation.error || "Please enter a valid international phone number.");
    }
    const normalizedPhone = phoneValidation.e164!;

    if (!password.trim()) {
      return setErr("Password is required.");
    }

    if (password.length < 8) {
      return setErr("Password must be at least 8 characters long.");
    }

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: normalizedPhone,
      password,
      role,
      plan,
      status,
      companyId: companyId ? companyId : null,
    };

    setSaving(true);

    try {
      let created = false;

      // 1. Try external API endpoint
      try {
        const extRes = await axiosInstance.post("/v1/admin/users", payload);
        if (extRes.data?.success !== false) {
          created = true;
        }
      } catch (extErr: any) {
        if (extResIsConflict(extErr)) {
          setErr("A user with this email or phone already exists.");
          setSaving(false);
          return;
        }
      }

      // 2. Persist to internal Next.js Prisma API
      try {
        const localRes = await fetch("/api/admin/users", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });

        const localJson = await localRes.json().catch(() => null);

        if (!localRes.ok) {
          if (localRes.status === 409 || localJson?.message?.toLowerCase().includes("already exists")) {
            setErr("A user with this email already exists.");
            setSaving(false);
            return;
          }
          if (!created) {
            setErr(localJson?.message || "Failed to create user.");
            setSaving(false);
            return;
          }
        } else if (localJson?.success) {
          created = true;
        }
      } catch (localErr: any) {
        console.warn("Internal user creation fallback:", localErr);
      }

      if (created) {
        toast.success(`User "${name.trim()}" created successfully!`);
        onSuccess();
        onClose();
      } else {
        setErr("Failed to create user. Please check your network and try again.");
      }
    } catch (e: any) {
      console.error("[AddUserModal] error =>", e);
      setErr(
        e?.response?.data?.message ||
        e?.message ||
        "An unexpected error occurred while creating user."
      );
    } finally {
      setSaving(false);
    }
  };

  function extResIsConflict(err: any): boolean {
    const status = err?.response?.status;
    const msg = err?.response?.data?.message || err?.response?.data?.error || "";
    return status === 409 || String(msg).toLowerCase().includes("already exists");
  }

  return (
    <div className="au-overlay" onClick={handleClose}>
      <div className="au-modal au-modal--detail" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
        <div className="au-modal__header">
          <div>
            <div className="au-modal__title">+ Add New User</div>
            <div className="au-modal__sub">Create and register a platform user</div>
          </div>
          <button
            type="button"
            className="au-modal__close"
            onClick={handleClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="au-modal__body" style={{ maxHeight: "76vh", overflowY: "auto", paddingRight: "4px" }}>
          {err && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#ef4444",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "13px",
                marginBottom: "4px",
              }}
            >
              <AlertCircle size={16} />
              <span style={{ flex: 1 }}>{err}</span>
              <button
                type="button"
                onClick={() => setErr(null)}
                style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "16px" }}
              >
                ×
              </button>
            </div>
          )}

          {/* Full Name */}
          <div className="au-field">
            <div className="au-field__label">FULL NAME *</div>
            <input
              type="text"
              className="au-input"
              placeholder="e.g. Sarah Connor"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErr(null);
              }}
            />
          </div>

          {/* Email */}
          <div className="au-field">
            <div className="au-field__label">EMAIL ADDRESS *</div>
            <input
              type="email"
              className="au-input"
              placeholder="sarah@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErr(null);
              }}
            />
          </div>

          {/* Phone */}
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
              defaultCountry="us"
              placeholder="Enter phone number"
            />
          </div>

          {/* Password */}
          <div className="au-field">
            <div className="au-field__label">PASSWORD *</div>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="au-input"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErr(null);
                }}
                style={{ paddingRight: "42px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted, #9ca3af)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Company Dropdown */}
          <div className="au-field">
            <div className="au-field__label">ASSIGN COMPANY</div>
            <select
              className="au-select"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              style={{
                width: "100%",
                height: "44px",
                background: "var(--input-bg, #171929)",
                border: "1px solid var(--border, rgba(255,255,255,0.07))",
                color: "var(--text, #E2E4F0)",
                borderRadius: "10px",
                padding: "0 12px",
                fontSize: "13px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">— Independent / No Company —</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.domain ? `(${c.domain})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Role and Plan Grid */}
          <div className="au-modal__grid-2">
            <div className="au-field">
              <div className="au-field__label">ROLE</div>
              <select
                className="au-select"
                value={role}
                onChange={(e) => setRole(e.target.value as "USER" | "ADMIN")}
                style={{
                  width: "100%",
                  height: "44px",
                  background: "var(--input-bg, #171929)",
                  border: "1px solid var(--border, rgba(255,255,255,0.07))",
                  color: "var(--text, #E2E4F0)",
                  borderRadius: "10px",
                  padding: "0 12px",
                  fontSize: "13px",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="USER">User (Standard)</option>
                <option value="ADMIN">Admin (Super Admin / Manager)</option>
              </select>
            </div>

            <div className="au-field">
              <div className="au-field__label">SUBSCRIPTION PLAN</div>
              <select
                className="au-select"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                style={{
                  width: "100%",
                  height: "44px",
                  background: "var(--input-bg, #171929)",
                  border: "1px solid var(--border, rgba(255,255,255,0.07))",
                  color: "var(--text, #E2E4F0)",
                  borderRadius: "10px",
                  padding: "0 12px",
                  fontSize: "13px",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="Starter">Starter</option>
                <option value="Basic">Basic</option>
                <option value="Pro">Pro</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div className="au-field">
            <div className="au-field__label">ACCOUNT STATUS</div>
            <select
              className="au-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE")}
              style={{
                width: "100%",
                height: "44px",
                background: "var(--input-bg, #171929)",
                border: "1px solid var(--border, rgba(255,255,255,0.07))",
                color: "var(--text, #E2E4F0)",
                borderRadius: "10px",
                padding: "0 12px",
                fontSize: "13px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="ACTIVE">● Active</option>
              <option value="INACTIVE">● Inactive</option>
            </select>
          </div>

          {/* Actions */}
          <div className="au-modal__actions" style={{ marginTop: "16px" }}>
            <button
              type="button"
              className="au-btn au-btn--primary"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Creating User..." : "Create User"}
            </button>
            <button
              type="button"
              className="au-btn au-btn--ghost"
              onClick={handleClose}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
