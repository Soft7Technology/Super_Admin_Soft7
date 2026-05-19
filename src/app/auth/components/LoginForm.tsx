"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import type { Theme } from "../types/auth.types";

interface LoginFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  isPending: boolean;
  onForgot: () => void;
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

  const isDark = theme === "dark";

  const inputBase: React.CSSProperties = {
    width: "100%",
    height: isMobile ? "46px" : "52px",

    background: isDark
      ? "rgba(3,18,14,0.95)"
      : "rgba(5,150,105,0.08)",

    border: isDark
      ? "1.5px solid rgba(16,185,129,0.55)"
      : "1.5px solid rgba(5,150,105,0.35)",

    borderRadius: "14px",
    fontSize: "15px",

    color: isDark ? "#ecfdf5" : "#052e26",

    padding: "0 44px 0 16px",

    outline: "none",

    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

    fontFamily: "'Inter', sans-serif",

    backdropFilter: "blur(10px)",

    boxShadow: isDark
      ? "inset 0 1px 2px rgba(0,0,0,0.5)"
      : "inset 0 1px 2px rgba(16,185,129,0.08)",
  };

  const clearError = (field: string) => {
    const next = { ...errors };
    delete next[field];
    setErrors(next);
  };

  return (
    <form onSubmit={onSubmit} style={{ width: "100%" }} noValidate>
      {/* General Error */}
      {errors.general && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            borderRadius: "12px",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#ef4444",
            fontSize: "13px",
            textAlign: "center",
            backdropFilter: "blur(12px)",
          }}
        >
          {errors.general}
        </div>
      )}

      {/* Identifier */}
      <div
        style={{
          position: "relative",
          marginBottom: errors.identifier ? "6px" : "18px",
        }}
      >
        <input
          type="text"
          name="identifier"
          placeholder="Email or phone"
          autoCapitalize="none"
          autoCorrect="off"
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            clearError("identifier");
            clearError("email");
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#10b981";
            e.target.style.boxShadow =
              "0 0 0 4px rgba(16,185,129,0.18)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor =
              errors.identifier || errors.email
                ? "#ef4444"
                : isDark
                  ? "rgba(16,185,129,0.55)"
                  : "rgba(5,150,105,0.35)";

            e.target.style.boxShadow =
              isDark
                ? "inset 0 1px 2px rgba(0,0,0,0.5)"
                : "inset 0 1px 2px rgba(16,185,129,0.08)";
          }}
          style={{
            ...inputBase,
            borderColor:
              errors.identifier || errors.email
                ? "#ef4444"
                : isDark
                  ? "rgba(16,185,129,0.55)"
                  : "rgba(5,150,105,0.35)",
          }}
        />

        <Mail
          size={17}
          style={{
            position: "absolute",
            right: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            color: isDark
              ? "rgba(167,243,208,0.7)"
              : "rgba(5,150,105,0.6)",
            pointerEvents: "none",
          }}
        />
      </div>

      {(errors.identifier || errors.email) && (
        <p
          style={{
            color: "#ef4444",
            fontSize: "12px",
            marginBottom: "12px",
            marginLeft: "4px",
          }}
        >
          {errors.identifier || errors.email}
        </p>
      )}

      {/* Password */}
      <div
        style={{
          position: "relative",
          marginBottom: errors.password ? "6px" : "24px",
        }}
      >
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError("password");
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#10b981";
            e.target.style.boxShadow =
              "0 0 0 4px rgba(16,185,129,0.18)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = errors.password
              ? "#ef4444"
              : isDark
                ? "rgba(16,185,129,0.55)"
                : "rgba(5,150,105,0.35)";

            e.target.style.boxShadow =
              isDark
                ? "inset 0 1px 2px rgba(0,0,0,0.5)"
                : "inset 0 1px 2px rgba(16,185,129,0.08)";
          }}
          style={{
            ...inputBase,
            paddingRight: "72px",
            borderColor: errors.password
              ? "#ef4444"
              : isDark
                ? "rgba(16,185,129,0.55)"
                : "rgba(5,150,105,0.35)",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <Lock
            size={17}
            style={{
              color: isDark
                ? "rgba(167,243,208,0.75)"
                : "rgba(5,150,105,0.6)",
            }}
          />

          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
            }}
          >
            {showPassword ? (
              <Eye
                size={17}
                style={{
                  color: isDark ? "#a7f3d0" : "#059669",
                }}
              />
            ) : (
              <EyeOff
                size={17}
                style={{
                  color: isDark ? "#a7f3d0" : "#059669",
                }}
              />
            )}
          </button>
        </div>
      </div>

      {errors.password && (
        <p
          style={{
            color: "#ef4444",
            fontSize: "12px",
            marginBottom: "12px",
            marginLeft: "4px",
          }}
        >
          {errors.password}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        style={{
          width: "100%",
          height: "52px",
          borderRadius: "14px",
          border: "none",
          cursor: isPending ? "not-allowed" : "pointer",

          background: isPending
            ? isDark
              ? "rgba(16,185,129,0.4)"
              : "rgba(16,185,129,0.5)"
            : "linear-gradient(135deg, #10b981 0%, #059669 100%)",

          color: "#ffffff",

          fontSize: "15px",
          fontWeight: 700,
          letterSpacing: "0.3px",

          boxShadow: isPending
            ? "none"
            : "0 10px 28px rgba(16,185,129,0.35)",

          transition:
            "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

          fontFamily: "'Inter', sans-serif",
        }}
        onMouseEnter={(e) => {
          if (!isPending) {
            (e.target as HTMLButtonElement).style.transform =
              "translateY(-2px)";
          }
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.transform =
            "translateY(0)";
        }}
      >
        {isPending ? "Signing in…" : "Sign In"}
      </button>

      {/* Forgot Password */}
      <div style={{ textAlign: "center", marginTop: "18px" }}>
        <button
          type="button"
          onClick={onForgot}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
            color: isDark ? "#a7f3d0" : "#059669",
            textDecoration: "underline",
            fontFamily: "'Inter', sans-serif",
            transition: "opacity 0.2s ease",
          }}
        >
          Forgot password?
        </button>
      </div>
    </form>
  );
}