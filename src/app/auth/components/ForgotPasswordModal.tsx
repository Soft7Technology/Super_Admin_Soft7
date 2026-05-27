"use client";
import React, { useState } from "react";
import type { Theme } from "../types/auth.types";
import type { useForgotPassword } from "../hooks/useForgotPassword";
import {
  X, Lock, Eye, EyeOff, Mail, Phone,
  ArrowRight, RefreshCw, ShieldCheck, KeyRound,
} from "lucide-react";

type ForgotProps = ReturnType<typeof useForgotPassword> & {
  onClose: () => void;
  theme: Theme;
  isMobile: boolean;
};

const STEP_META = {
  request: { index: 1, label: "Verify identity" },
  verify:  { index: 2, label: "Enter OTP" },
  reset:   { index: 3, label: "New password" },
};

export function ForgotPasswordModal({
  step,
  email, setEmail,
  phone, setPhone,
  channel, setChannel,
  otp, setOtp,
  newPassword, setNewPassword,
  confirmPassword, setConfirmPassword,
  timer,
  isEditing, setIsEditing,
  emailError, otpError, setOtpError, passwordError,
  loading,
  sendOtp, verifyOtp, resetPassword, resendOtp,
  maskEmail, maskPhone,
  onClose,
  theme,
  isMobile,
}: ForgotProps) {
  const [showNewPw, setShowNewPw]   = useState(false);
  const [showConfPw, setShowConfPw] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const isDark = theme === "dark";

  /* ── Field style helper ── */
  const fieldStyle = (name: string, hasError?: boolean): React.CSSProperties => ({
    width: "100%",
    height: "48px",
    background: isDark ? "rgba(255,255,255,0.05)" : "#f8fffe",
    border: `1.5px solid ${
      hasError
        ? "#ef4444"
        : focusedField === name
        ? "#10b981"
        : isDark
        ? "rgba(255,255,255,0.10)"
        : "#d1fae5"
    }`,
    borderRadius: "12px",
    color: isDark ? "#ecfdf5" : "#064e3b",
    padding: "0 46px 0 14px",
    fontSize: "14px",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "none",
  });

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: isDark ? "rgba(167,243,208,0.7)" : "#047857",
    marginBottom: "7px",
    letterSpacing: "0.2px",
  };

  const iconColor = isDark ? "rgba(167,243,208,0.5)" : "#6ee7b7";

  const primaryBtn: React.CSSProperties = {
    width: "100%",
    height: "50px",
    borderRadius: "14px",
    border: "none",
    cursor: loading ? "not-allowed" : "pointer",
    background: loading
      ? "rgba(16,185,129,0.40)"
      : "linear-gradient(135deg,#10b981,#059669)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: loading ? "none" : "0 8px 24px rgba(16,185,129,0.35)",
    transition: "all 0.2s ease",
  };

  /* ── Step indicator ── */
  const StepIndicator = () => (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "28px" }}>
      {(["request", "verify", "reset"] as const).map((s, i) => {
        const current = STEP_META[step]?.index ?? 1;
        const done = current > i + 1;
        const active = current === i + 1;
        return (
          <React.Fragment key={s}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: done
                ? "#10b981"
                : active
                ? "linear-gradient(135deg,#10b981,#059669)"
                : isDark ? "rgba(255,255,255,0.07)" : "#e8fdf5",
              border: active
                ? "none"
                : done
                ? "none"
                : `1.5px solid ${isDark ? "rgba(255,255,255,0.12)" : "#d1fae5"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: active ? "0 4px 12px rgba(16,185,129,0.35)" : "none",
              transition: "all 0.3s ease",
            }}>
              {done ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <span style={{
                  fontSize: "11px", fontWeight: 700,
                  color: active ? "#fff" : isDark ? "rgba(167,243,208,0.4)" : "#6ee7b7",
                }}>
                  {i + 1}
                </span>
              )}
            </div>
            {i < 2 && (
              <div style={{
                flex: 1, height: "1.5px",
                background: done
                  ? "#10b981"
                  : isDark ? "rgba(255,255,255,0.08)" : "#d1fae5",
                transition: "background 0.4s ease",
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  /* ── Step icon ── */
  const stepIcon = {
    request: <Mail size={22} color="#10b981" />,
    verify:  <ShieldCheck size={22} color="#10b981" />,
    reset:   <KeyRound size={22} color="#10b981" />,
  }[step] ?? <Mail size={22} color="#10b981" />;

  const stepTitle = {
    request: "Reset your password",
    verify:  "Enter verification code",
    reset:   "Create new password",
  }[step] ?? "Reset your password";

  const stepDesc = {
    request: "We'll send a one-time code to verify it's you.",
    verify:  `Code sent to ${channel === "email" ? maskEmail(email) : maskPhone(phone)}`,
    reset:   "Choose a strong password for your account.",
  }[step] ?? "";

  /* ── Overlay wrapper ── */
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(14px)",
        padding: isMobile ? "16px" : "0",
        fontFamily: "'DM Sans', sans-serif",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: isMobile ? "100%" : "440px",
          maxWidth: "440px",
          background: isDark ? "rgba(8,20,15,0.97)" : "#ffffff",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: isDark
            ? "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(16,185,129,0.14)"
            : "0 32px 80px rgba(16,185,129,0.16), 0 0 0 1px rgba(16,185,129,0.12)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top emerald accent bar ── */}
        <div style={{
          height: "4px",
          background: "linear-gradient(90deg,#10b981,#34d399,#6ee7b7)",
        }} />

        {/* ── Modal body ── */}
        <div style={{ padding: isMobile ? "28px 24px 32px" : "32px 36px 36px" }}>

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: "20px", right: "20px",
              background: isDark ? "rgba(255,255,255,0.07)" : "#f0fdf9",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #d1fae5",
              borderRadius: "8px",
              width: "30px", height: "30px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              color: isDark ? "rgba(167,243,208,0.7)" : "#6ee7b7",
            }}
          >
            <X size={15} />
          </button>

          {/* Step indicator */}
          <StepIndicator />

          {/* Step icon + title */}
          <div style={{
            width: "48px", height: "48px", borderRadius: "14px",
            background: isDark ? "rgba(16,185,129,0.12)" : "#ecfdf5",
            border: isDark ? "1px solid rgba(16,185,129,0.2)" : "1px solid #a7f3d0",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "16px",
          }}>
            {stepIcon}
          </div>

          <h2 style={{
            fontSize: "20px", fontWeight: 800,
            color: isDark ? "#ecfdf5" : "#022c22",
            letterSpacing: "-0.5px", marginBottom: "5px",
          }}>
            {stepTitle}
          </h2>
          <p style={{
            fontSize: "13px",
            color: isDark ? "rgba(167,243,208,0.55)" : "#6ee7b7",
            marginBottom: "28px", lineHeight: 1.5,
          }}>
            {stepDesc}
          </p>

          {/* ── STEP 1: Request ── */}
          {step === "request" && (
            <>
              {/* Channel toggle */}
              <div style={{
                display: "flex", gap: "8px", marginBottom: "20px",
                background: isDark ? "rgba(255,255,255,0.04)" : "#f0fdf9",
                padding: "4px", borderRadius: "12px",
                border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #d1fae5",
              }}>
                {(["email", "whatsapp"] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChannel(ch)}
                    style={{
                      flex: 1, height: "36px", borderRadius: "9px",
                      cursor: "pointer",
                      border: "none",
                      background: channel === ch
                        ? "linear-gradient(135deg,#10b981,#059669)"
                        : "transparent",
                      color: channel === ch
                        ? "#fff"
                        : isDark ? "rgba(167,243,208,0.5)" : "#6ee7b7",
                      fontSize: "13px", fontWeight: 700,
                      fontFamily: "'DM Sans', sans-serif",
                      boxShadow: channel === ch ? "0 4px 10px rgba(16,185,129,0.28)" : "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {ch === "whatsapp" ? "WhatsApp" : "Email"}
                  </button>
                ))}
              </div>

              {/* Email */}
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Email address</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={isEditing ? email : maskEmail(email)}
                    disabled={!isEditing}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      ...fieldStyle("email", !!emailError),
                      opacity: isEditing ? 1 : 0.65,
                    }}
                  />
                  <Mail size={15} style={{
                    position: "absolute", right: "14px", top: "50%",
                    transform: "translateY(-50%)", color: iconColor, pointerEvents: "none",
                  }} />
                </div>
                {emailError && (
                  <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px" }}>{emailError}</p>
                )}
              </div>

              {/* Phone (WhatsApp) */}
              {channel === "whatsapp" && (
                <div style={{ marginBottom: "16px" }}>
                  <label style={labelStyle}>WhatsApp number</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={isEditing ? phone : maskPhone(phone)}
                      disabled={!isEditing}
                      onChange={(e) => setPhone(e.target.value)}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField(null)}
                      style={{
                        ...fieldStyle("phone"),
                        opacity: isEditing ? 1 : 0.65,
                      }}
                    />
                    <Phone size={15} style={{
                      position: "absolute", right: "14px", top: "50%",
                      transform: "translateY(-50%)", color: iconColor, pointerEvents: "none",
                    }} />
                  </div>
                </div>
              )}

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: "13px", color: isDark ? "#34d399" : "#059669",
                    fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                    marginBottom: "16px", padding: 0, display: "block",
                  }}
                >
                  Edit details →
                </button>
              )}

              <button onClick={sendOtp} disabled={loading} style={primaryBtn}>
                {loading ? <Spinner /> : <><span>Send verification code</span><ArrowRight size={16} strokeWidth={2.5} /></>}
              </button>
            </>
          )}

          {/* ── STEP 2: Verify OTP ── */}
          {step === "verify" && (
            <>
              {/* OTP input */}
              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>6-digit code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setOtpError("");
                  }}
                  onFocus={() => setFocusedField("otp")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...fieldStyle("otp", !!otpError),
                    fontSize: "20px",
                    fontWeight: 700,
                    letterSpacing: "8px",
                    textAlign: "center",
                    padding: "0 14px",
                    height: "56px",
                  }}
                />
                {otpError && (
                  <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px" }}>{otpError}</p>
                )}
              </div>

              {/* Resend */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: "24px",
              }}>
                <span style={{ fontSize: "13px", color: isDark ? "rgba(167,243,208,0.45)" : "#a7f3d0" }}>
                  {timer > 0 ? `Resend in ${timer}s` : "Didn't receive a code?"}
                </span>
                {timer === 0 && (
                  <button
                    type="button"
                    onClick={resendOtp}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: "13px", color: isDark ? "#34d399" : "#059669",
                      fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                      display: "flex", alignItems: "center", gap: "5px",
                    }}
                  >
                    <RefreshCw size={13} />
                    Resend
                  </button>
                )}
              </div>

              <button onClick={verifyOtp} disabled={loading} style={primaryBtn}>
                {loading ? <Spinner /> : <><span>Verify code</span><ArrowRight size={16} strokeWidth={2.5} /></>}
              </button>
            </>
          )}

          {/* ── STEP 3: Reset password ── */}
          {step === "reset" && (
            <>
              {/* New password */}
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>New password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showNewPw ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={() => setFocusedField("newpw")}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...fieldStyle("newpw", !!passwordError), paddingRight: "76px" }}
                  />
                  <div style={{
                    position: "absolute", right: "12px", top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex", gap: "8px", alignItems: "center",
                  }}>
                    <Lock size={15} style={{ color: iconColor }} />
                    <button
                      type="button"
                      onClick={() => setShowNewPw((p) => !p)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex", color: isDark ? "#6ee7b7" : "#059669" }}
                    >
                      {showNewPw ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Confirm password */}
              <div style={{ marginBottom: "8px" }}>
                <label style={labelStyle}>Confirm password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfPw ? "text" : "password"}
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField("confpw")}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...fieldStyle("confpw", !!passwordError), paddingRight: "76px" }}
                  />
                  <div style={{
                    position: "absolute", right: "12px", top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex", gap: "8px", alignItems: "center",
                  }}>
                    <Lock size={15} style={{ color: iconColor }} />
                    <button
                      type="button"
                      onClick={() => setShowConfPw((p) => !p)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex", color: isDark ? "#6ee7b7" : "#059669" }}
                    >
                      {showConfPw ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                  </div>
                </div>
                {passwordError && (
                  <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px" }}>{passwordError}</p>
                )}
              </div>

              {/* Password strength hint */}
              {newPassword && (
                <div style={{ marginBottom: "22px" }}>
                  <PasswordStrengthBar password={newPassword} isDark={isDark} />
                </div>
              )}

              <button onClick={resetPassword} disabled={loading} style={{ ...primaryBtn, marginTop: "8px" }}>
                {loading ? <Spinner /> : <><span>Set new password</span><ArrowRight size={16} strokeWidth={2.5} /></>}
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  );
}

/* ── Spinner ── */
function Spinner() {
  return (
    <span style={{
      width: "18px", height: "18px",
      border: "2px solid rgba(255,255,255,0.3)",
      borderTopColor: "#fff", borderRadius: "50%",
      display: "inline-block",
      animation: "fpSpin 0.7s linear infinite",
    }}>
      <style>{`@keyframes fpSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}

/* ── Password strength bar ── */
function PasswordStrengthBar({ password, isDark }: { password: string; isDark: boolean }) {
  const score = (() => {
    let s = 0;
    if (password.length >= 8)  s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = ["#ef4444", "#f59e0b", "#10b981", "#059669"];

  return (
    <div>
      <div style={{ display: "flex", gap: "4px", marginBottom: "5px" }}>
        {[0,1,2,3].map((i) => (
          <div key={i} style={{
            flex: 1, height: "3px", borderRadius: "2px",
            background: i < score ? colors[score - 1] : isDark ? "rgba(255,255,255,0.08)" : "#d1fae5",
            transition: "background 0.3s ease",
          }} />
        ))}
      </div>
      {score > 0 && (
        <span style={{ fontSize: "11px", fontWeight: 700, color: colors[score - 1] }}>
          {labels[score - 1]}
        </span>
      )}
    </div>
  );
}