"use client";

import { useState } from "react";
import { Mail, Lock, User, Phone } from "lucide-react";
import type { Theme } from "../types/auth.types";

interface RegisterFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  isPending: boolean;
  onLogin: () => void;
  theme: Theme;
  isMobile: boolean;
}

export function RegisterForm({
  onSubmit,
  errors,
  setErrors,
  isPending,
  onLogin,
  theme,
  isMobile,
}: RegisterFormProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const clearError = (field: string) => {
    const next = { ...errors };
    delete next[field];
    setErrors(next);
  };

  const fieldStyle = (name: string, hasError?: boolean): React.CSSProperties => ({
    width: "100%",
    height: "48px",
    background: "#f9fafb",
    border: `1.5px solid ${
      hasError ? "#ef4444" : focusedField === name ? "#10b981" : "#e5e7eb"
    }`,
    borderRadius: "10px",
    color: "#111827",
    padding: "0 46px 0 14px",
    fontSize: "14px",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s ease",
    boxSizing: "border-box",
  });

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#c0f7d2",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      padding: "24px 16px",
      boxSizing: "border-box",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "520px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: isMobile ? "36px 24px 32px" : "48px 40px 44px",
        boxSizing: "border-box",
      }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#34d399",
            letterSpacing: "-0.4px",
            marginBottom: "6px",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Create account
          </h1>
          <p style={{
            fontSize: "14px",
            color: "#6b7280",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Register to access the super admin dashboard
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate>
          {errors.general && (
            <div style={{
              marginBottom: "18px",
              padding: "11px 14px",
              borderRadius: "8px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              fontSize: "13px",
            }}>
              {errors.general}
            </div>
          )}

          <div style={{ marginBottom: "14px" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 600,
              color: "#374151",
              marginBottom: "6px",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Full name
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                name="name"
                placeholder="Your full name"
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                onChange={() => clearError("name")}
                style={fieldStyle("name", !!errors.name)}
              />
              <User size={16} style={{
                position: "absolute", right: "14px", top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
                pointerEvents: "none",
              }} />
            </div>
            {errors.name && (
              <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px" }}>
                {errors.name}
              </p>
            )}
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 600,
              color: "#374151",
              marginBottom: "6px",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Email address
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                autoCapitalize="none"
                autoCorrect="off"
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                onChange={() => clearError("email")}
                style={fieldStyle("email", !!errors.email)}
              />
              <Mail size={16} style={{
                position: "absolute", right: "14px", top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
                pointerEvents: "none",
              }} />
            </div>
            {errors.email && (
              <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px" }}>
                {errors.email}
              </p>
            )}
          </div>

          <div style={{ display: "grid", gap: "14px", marginBottom: "14px", gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "6px",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Country code
              </label>
              <input
                type="text"
                name="countryCode"
                placeholder="+91"
                onFocus={() => setFocusedField("countryCode")}
                onBlur={() => setFocusedField(null)}
                onChange={() => clearError("countryCode")}
                style={fieldStyle("countryCode", !!errors.countryCode)}
              />
              {errors.countryCode && (
                <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px" }}>
                  {errors.countryCode}
                </p>
              )}
            </div>
            <div>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "6px",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Phone number
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="tel"
                  name="phone"
                  placeholder="9876543210"
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                  onChange={() => clearError("phone")}
                  style={fieldStyle("phone", !!errors.phone)}
                />
                <Phone size={16} style={{
                  position: "absolute", right: "14px", top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                  pointerEvents: "none",
                }} />
              </div>
              {errors.phone && (
                <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px" }}>
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 600,
              color: "#374151",
              marginBottom: "6px",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                name="password"
                placeholder="Create a secure password"
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                onChange={() => clearError("password")}
                style={fieldStyle("password", !!errors.password)}
              />
              <Lock size={16} style={{
                position: "absolute", right: "14px", top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
                pointerEvents: "none",
              }} />
            </div>
            {errors.password && (
              <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px" }}>
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            style={{
              width: "100%",
              height: "48px",
              borderRadius: "10px",
              border: "none",
              cursor: isPending ? "not-allowed" : "pointer",
              background: isPending ? "#6ee7b7" : "#10b981",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "background 0.2s ease",
            }}>
            {isPending ? "Registering…" : "Create account"}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <span style={{ color: "#6b7280", fontSize: "13px" }}>
            Already have an account?{' '}
          </span>
          <button
            type="button"
            onClick={onLogin}
            style={{
              background: "none",
              border: "none",
              color: "#10b981",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}>
            Sign in
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        input::placeholder { color: #9ca3af; }
      `}</style>
    </div>
  );
}
