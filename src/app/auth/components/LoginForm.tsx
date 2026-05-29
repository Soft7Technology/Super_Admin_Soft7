"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import type { Theme } from "../types/auth.types";

interface LoginFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  isPending: boolean;
  onForgot: () => void;
  onRegister?: () => void;
  theme: Theme;
  isMobile: boolean;
}

export function LoginForm({
  onSubmit,
  errors,
  setErrors,
  isPending,
  onForgot,
  theme,
  isMobile,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
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
        maxWidth: "500px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: isMobile ? "36px 24px 32px" : "48px 40px 44px",
        boxSizing: "border-box",
      }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#34d399",
            letterSpacing: "-0.4px",
            marginBottom: "6px",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Sign in
          </h1>
          <p style={{
            fontSize: "14px",
            color: "#6b7280",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Sign in to super admin to continue
          </p>
        </div>

        {/* Form */}
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

          {/* Email / Phone */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 600,
              color: "#374151",
              marginBottom: "6px",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Email or phone
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                name="identifier"
                placeholder="you@example.com"
                autoCapitalize="none"
                autoCorrect="off"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); clearError("identifier"); clearError("email"); }}
                onFocus={() => setFocusedField("identifier")}
                onBlur={() => setFocusedField(null)}
                style={fieldStyle("identifier", !!(errors.identifier || errors.email))}
              />
              <Mail size={16} style={{
                position: "absolute", right: "14px", top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
                pointerEvents: "none",
              }} />
            </div>
            {(errors.identifier || errors.email) && (
              <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px" }}>
                {errors.identifier || errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: "10px" }}>
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
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                style={{ ...fieldStyle("password", !!errors.password), paddingRight: "76px" }}
              />
              <div style={{
                position: "absolute", right: "12px", top: "50%",
                transform: "translateY(-50%)",
                display: "flex", gap: "6px", alignItems: "center",
              }}>
                <Lock size={15} style={{ color: "#9ca3af" }} />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    padding: "2px", display: "flex", alignItems: "center",
                    color: "#6b7280",
                  }}
                >
                  {showPassword ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
              </div>
            </div>
            {errors.password && (
              <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px" }}>
                {errors.password}
              </p>
            )}
          </div>

          {/* Forgot */}
          <div style={{ textAlign: "right", marginBottom: "24px" }}>
            <button
              type="button"
              onClick={onForgot}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "13px",
                color: "#059669",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                padding: 0,
              }}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
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
            }}
          >
            {isPending ? (
              <span style={{
                width: "18px", height: "18px",
                border: "2px solid rgba(255,255,255,0.4)",
                borderTopColor: "#fff",
                borderRadius: "50%",
                display: "inline-block",
                animation: "spin 0.7s linear infinite",
              }} />
            ) : (
              <>Sign in <ArrowRight size={15} strokeWidth={2.5} /></>
            )}
          </button>
        </form>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        input::placeholder { color: #9ca3af; }
      `}</style>
    </div>
  );
}