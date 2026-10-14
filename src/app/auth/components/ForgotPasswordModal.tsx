"use client";
import { Fragment, useState } from "react";
import type { Theme } from "../types/auth.types";
import type { useForgotPassword } from "../hooks/useForgotPassword";
import {
  Check, Lock, Eye, EyeOff, Mail, Phone,
  ArrowRight, RefreshCw, ShieldCheck, KeyRound,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { cn } from "@/lib/utils";

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
}: ForgotProps) {
  const [showNewPw, setShowNewPw]   = useState(false);
  const [showConfPw, setShowConfPw] = useState(false);

  const current = STEP_META[step]?.index ?? 1;

  /* ── Step icon ── */
  const StepIcon = { request: Mail, verify: ShieldCheck, reset: KeyRound }[step] ?? Mail;

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

  const toggle = (shown: boolean, set: (fn: (p: boolean) => boolean) => void) => (
    <button
      type="button"
      onClick={() => set((p) => !p)}
      aria-label={shown ? "Hide password" : "Show password"}
      className="pointer-events-auto flex items-center text-muted-foreground hover:text-secondary-foreground"
    >
      {shown ? <Eye size={15} /> : <EyeOff size={15} />}
    </button>
  );

  return (
    <Modal isOpen onClose={onClose} size="sm" title={stepTitle} description={stepDesc}>
      {/* Step indicator */}
      <ol className="mb-6 flex items-center gap-1.5" aria-label="Progress">
        {(["request", "verify", "reset"] as const).map((s, i) => {
          const done = current > i + 1;
          const active = current === i + 1;
          return (
            <Fragment key={s}>
              <li
                aria-current={active ? "step" : undefined}
                title={STEP_META[s].label}
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-semibold transition-colors",
                  done || active ? "bg-primary text-primary-foreground" : "border border-border bg-surface-muted text-muted-foreground",
                  active && "ring-4 ring-primary-ring",
                )}
              >
                {done ? <Check size={13} strokeWidth={2.5} /> : i + 1}
              </li>
              {i < 2 && (
                <li aria-hidden className={cn("h-0.5 flex-1 rounded-full transition-colors", done ? "bg-primary" : "bg-border")} />
              )}
            </Fragment>
          );
        })}
      </ol>

      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-lighter text-primary-text">
        <StepIcon size={20} />
      </span>

      {/* ── STEP 1: Request ── */}
      {step === "request" && (
        <div className="space-y-4">
          <SegmentedControl<"email" | "whatsapp">
            aria-label="Send code via"
            className="w-full [&>*]:flex-1"
            value={channel}
            onChange={setChannel}
            options={[
              { value: "email", label: "Email" },
              { value: "whatsapp", label: "WhatsApp" },
            ]}
          />

          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={isEditing ? email : maskEmail(email)}
            disabled={!isEditing}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail size={15} />}
            error={emailError || undefined}
          />

          {channel === "whatsapp" && (
            <Input
              label="WhatsApp number"
              type="tel"
              placeholder="+91 98765 43210"
              value={isEditing ? phone : maskPhone(phone)}
              disabled={!isEditing}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone size={15} />}
            />
          )}

          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 text-[0.8125rem] font-semibold text-primary-text hover:underline"
            >
              Edit details <ArrowRight size={13} />
            </button>
          )}

          <Button size="lg" className="w-full" onClick={sendOtp} isLoading={loading} rightIcon={loading ? undefined : <ArrowRight size={16} strokeWidth={2.5} />}>
            Send verification code
          </Button>
        </div>
      )}

      {/* ── STEP 2: Verify OTP ── */}
      {step === "verify" && (
        <div className="space-y-4">
          <Input
            label="6-digit code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
              setOtpError("");
            }}
            size="lg"
            className="text-center text-xl font-semibold tracking-[0.5em]"
            error={otpError || undefined}
          />

          <div className="flex items-center justify-between text-[0.8125rem]">
            <span className="text-muted-foreground">
              {timer > 0 ? `Resend in ${timer}s` : "Didn't receive a code?"}
            </span>
            {timer === 0 && (
              <button
                type="button"
                onClick={resendOtp}
                className="flex items-center gap-1.5 font-semibold text-primary-text hover:underline"
              >
                <RefreshCw size={13} />
                Resend
              </button>
            )}
          </div>

          <Button size="lg" className="w-full" onClick={verifyOtp} isLoading={loading} rightIcon={loading ? undefined : <ArrowRight size={16} strokeWidth={2.5} />}>
            Verify code
          </Button>
        </div>
      )}

      {/* ── STEP 3: Reset password ── */}
      {step === "reset" && (
        <div className="space-y-4">
          <Input
            label="New password"
            type={showNewPw ? "text" : "password"}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={<Lock size={15} />}
            rightIcon={toggle(showNewPw, setShowNewPw)}
            aria-invalid={passwordError ? true : undefined}
          />

          <Input
            label="Confirm password"
            type={showConfPw ? "text" : "password"}
            placeholder="Repeat password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock size={15} />}
            rightIcon={toggle(showConfPw, setShowConfPw)}
            error={passwordError || undefined}
          />

          {/* Password strength hint */}
          {newPassword && <PasswordStrengthBar password={newPassword} />}

          <Button size="lg" className="w-full" onClick={resetPassword} isLoading={loading} rightIcon={loading ? undefined : <ArrowRight size={16} strokeWidth={2.5} />}>
            Set new password
          </Button>
        </div>
      )}
    </Modal>
  );
}

/* ── Password strength bar ── */
function PasswordStrengthBar({ password }: { password: string }) {
  const score = (() => {
    let s = 0;
    if (password.length >= 8)  s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const labels = ["Weak", "Fair", "Good", "Strong"];
  const bars = ["bg-error", "bg-warning", "bg-primary", "bg-success"];
  const texts = ["text-error", "text-warning", "text-primary-text", "text-success"];

  return (
    <div>
      <div className="mb-1 flex gap-1" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i < score ? bars[score - 1] : "bg-surface-muted")} />
        ))}
      </div>
      {score > 0 && <span className={cn("text-[0.6875rem] font-semibold", texts[score - 1])}>{labels[score - 1]}</span>}
    </div>
  );
}
