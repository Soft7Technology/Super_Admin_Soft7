"use client";
import React, { useState } from "react";
import type { Theme } from "../types/auth.types";
import type { useForgotPassword } from "../hooks/useForgotPassword";
import {
  X,
  Lock,
  Eye,
  EyeOff,
  Mail,
  Phone,
} from "lucide-react";


type ForgotProps = ReturnType<typeof useForgotPassword> & {
  onClose: () => void;
  theme: Theme;
  isMobile: boolean;
};

export function ForgotPasswordModal({
  step,
  email,
  setEmail,
  phone,
  setPhone,
  channel,
  setChannel,
  otp,
  setOtp,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  timer,
  isEditing,
  setIsEditing,
  emailError,
  otpError,
  setOtpError,
  passwordError,
  loading,
  sendOtp,
  verifyOtp,
  resetPassword,
  resendOtp,
  maskEmail,
  maskPhone,
  onClose,
  theme,
  isMobile,
}: ForgotProps) {
  const [showNewPw, setShowNewPw] = useState(false);

  const isDark = theme === "dark";

  const overlay: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 9998,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    background: "rgba(0,0,0,0.72)",

    backdropFilter: "blur(12px)",

    padding: isMobile ? "16px" : "0",
  };

  const card: React.CSSProperties = {
    width: isMobile ? "100%" : "420px",
    maxWidth: "420px",

    borderRadius: "22px",

    padding: isMobile
      ? "28px 24px"
      : "36px 32px",

    background: isDark
      ? "rgba(5,15,12,0.96)"
      : "#ffffff",

    border: isDark
      ? "1px solid rgba(16,185,129,0.18)"
      : "1px solid rgba(16,185,129,0.12)",

    boxShadow: isDark
      ? "0 24px 64px rgba(0,0,0,0.7)"
      : "0 24px 64px rgba(16,185,129,0.14)",

    position: "relative",

    backdropFilter: "blur(18px)",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "50px",

    background: isDark
      ? "rgba(3,18,14,0.95)"
      : "rgba(5,150,105,0.06)",

    border: isDark
      ? "1.5px solid rgba(16,185,129,0.55)"
      : "1.5px solid rgba(5,150,105,0.3)",

    borderRadius: "14px",

    color: isDark
      ? "#ecfdf5"
      : "#052e26",

    padding: "0 16px",

    fontSize: "15px",

    outline: "none",

    fontFamily: "'Inter', sans-serif",

    transition:
      "all 0.3s cubic-bezier(0.4,0,0.2,1)",

    boxShadow: isDark
      ? "inset 0 1px 2px rgba(0,0,0,0.5)"
      : "inset 0 1px 2px rgba(16,185,129,0.08)",
  };

  const btnPrimary: React.CSSProperties = {
    width: "100%",
    height: "50px",

    borderRadius: "14px",

    border: "none",

    cursor: loading
      ? "not-allowed"
      : "pointer",

    background: loading
      ? "rgba(16,185,129,0.4)"
      : "linear-gradient(135deg,#10b981,#059669)",

    color: "#fff",

    fontSize: "15px",

    fontWeight: 700,

    fontFamily: "'Inter', sans-serif",

    boxShadow: loading
      ? "none"
      : "0 10px 28px rgba(16,185,129,0.35)",

    transition:
      "all 0.3s cubic-bezier(0.4,0,0.2,1)",
  };

  const label: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 700,

    letterSpacing: "0.4px",

    color: isDark
      ? "rgba(167,243,208,0.85)"
      : "rgba(5,150,105,0.75)",

    marginBottom: "6px",

    display: "block",

    textTransform: "uppercase",
  };

  const heading: React.CSSProperties = {
    fontSize: "22px",

    fontWeight: 700,

    marginBottom: "24px",

    textAlign: "center",

    color: isDark
      ? "#ecfdf5"
      : "#052e26",
  };

  const iconColor = isDark
    ? "rgba(167,243,208,0.7)"
    : "rgba(5,150,105,0.55)";

  return (
    <div
      style={overlay}
      onClick={onClose}
    >
      <div
        style={card}
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",

            background: "none",

            border: "none",

            cursor: "pointer",

            color: isDark
              ? "rgba(167,243,208,0.7)"
              : "rgba(5,150,105,0.6)",

            display: "flex",
          }}
        >
          <X size={20} />
        </button>

        {/* STEP 1 */}
        {step === "request" && (
          <>
            <h2 style={heading}>
              Reset Password
            </h2>

            {/* Toggle */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              {(
                [
                  "email",
                  "whatsapp",
                ] as const
              ).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() =>
                    setChannel(ch)
                  }
                  style={{
                    flex: 1,

                    height: "42px",

                    borderRadius: "12px",

                    cursor: "pointer",

                    border:
                      channel === ch
                        ? "1.5px solid #10b981"
                        : `1.5px solid ${
                            isDark
                              ? "rgba(16,185,129,0.35)"
                              : "rgba(5,150,105,0.25)"
                          }`,

                    background:
                      channel === ch
                        ? isDark
                          ? "rgba(16,185,129,0.18)"
                          : "rgba(16,185,129,0.08)"
                        : "transparent",

                    color:
                      channel === ch
                        ? isDark
                          ? "#a7f3d0"
                          : "#059669"
                        : isDark
                          ? "rgba(167,243,208,0.5)"
                          : "rgba(5,150,105,0.5)",

                    fontSize: "13px",

                    fontWeight: 700,

                    fontFamily:
                      "'Inter', sans-serif",

                    transition:
                      "all 0.3s cubic-bezier(0.4,0,0.2,1)",

                    textTransform:
                      "capitalize",
                  }}
                >
                  {ch ===
                  "whatsapp"
                    ? "WhatsApp"
                    : "Email"}
                </button>
              ))}
            </div>

            {/* Email */}
            <div
              style={{
                marginBottom: "16px",
              }}
            >
              <label style={label}>
                Email address
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={
                    isEditing
                      ? email
                      : maskEmail(
                          email
                        )
                  }
                  disabled={!isEditing}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  style={{
                    ...inputStyle,

                    paddingRight:
                      "42px",

                    borderColor:
                      emailError
                        ? "#ef4444"
                        : isDark
                          ? "rgba(16,185,129,0.55)"
                          : "rgba(5,150,105,0.3)",

                    opacity:
                      isEditing
                        ? 1
                        : 0.7,
                  }}
                />

                <Mail
                  size={16}
                  style={{
                    position:
                      "absolute",

                    right: "14px",

                    top: "50%",

                    transform:
                      "translateY(-50%)",

                    color:
                      iconColor,

                    pointerEvents:
                      "none",
                  }}
                />
              </div>

              {emailError && (
                <p
                  style={{
                    color:
                      "#ef4444",

                    fontSize:
                      "12px",

                    marginTop:
                      "6px",
                  }}
                >
                  {emailError}
                </p>
              )}
            </div>

            {/* Phone */}
            {channel ===
              "whatsapp" && (
              <div
                style={{
                  marginBottom:
                    "16px",
                }}
              >
                <label
                  style={label}
                >
                  WhatsApp
                  number
                </label>

                <div
                  style={{
                    position:
                      "relative",
                  }}
                >
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={
                      isEditing
                        ? phone
                        : maskPhone(
                            phone
                          )
                    }
                    disabled={
                      !isEditing
                    }
                    onChange={(e) =>
                      setPhone(
                        e.target
                          .value
                      )
                    }
                    style={{
                      ...inputStyle,

                      paddingRight:
                        "42px",
                    }}
                  />

                  <Phone
                    size={16}
                    style={{
                      position:
                        "absolute",

                      right:
                        "14px",

                      top: "50%",

                      transform:
                        "translateY(-50%)",

                      color:
                        iconColor,

                      pointerEvents:
                        "none",
                    }}
                  />
                </div>
              </div>
            )}

            {!isEditing && (
              <button
                type="button"
                onClick={() =>
                  setIsEditing(
                    true
                  )
                }
                style={{
                  background:
                    "none",

                  border: "none",

                  cursor:
                    "pointer",

                  fontSize:
                    "12px",

                  color:
                    isDark
                      ? "#a7f3d0"
                      : "#059669",

                  textDecoration:
                    "underline",

                  marginBottom:
                    "12px",

                  fontFamily:
                    "'Inter', sans-serif",
                }}
              >
                Edit details
              </button>
            )}

            <button
              onClick={sendOtp}
              disabled={loading}
              style={btnPrimary}
            >
              {loading
                ? "Sending…"
                : "Send OTP"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}