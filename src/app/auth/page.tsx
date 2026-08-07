/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { axiosInstance } from "@/lib/axiosInstance";
import toast from "react-hot-toast";

import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { ForgotPasswordModal } from "./components/ForgotPasswordModal";
import type { Theme } from "./types/auth.types";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const AUTH_BASE = "/v1/auth";

const getExternalHeaders = (includeAuth = false) => {
  let token =
    typeof window !== "undefined"
      ? localStorage.getItem("console_access_token")
      : null;

  if (token && token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
  }

  return {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(includeAuth && token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ─── Responsive hook ──────────────────────────────────────────────────────────
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query);
      if (media.matches !== matches) setMatches(media.matches);
      const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, [matches, query]);
  return matches;
};

// ─── Mask helpers ─────────────────────────────────────────────────────────────
function maskEmail(email: string) {
  const str = String(email ?? "");
  if (!str || !str.includes("@")) return str;
  const [name, domain] = str.split("@");
  if (name.length <= 2) return `**@${domain}`;
  return `${name.slice(0, 2)}${"*".repeat(Math.max(0, name.length - 2))}@${domain}`;
}

function maskPhone(phone: string) {
  const str = String(phone ?? "");
  if (!str || str.length < 4) return "*".repeat(Math.max(0, str.length));
  return `${"*".repeat(Math.max(0, str.length - 4))}${str.slice(-4)}`;
}

// ─── View types ───────────────────────────────────────────────────────────────
type AuthView = "login" | "register";
type ForgotStep = "request" | "verify" | "reset";

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AuthPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const isMobile = useMediaQuery("(max-width: 768px)");
  const theme: Theme = "light"; // swap to "dark" or wire to a toggle if needed

  // ── View ──
  const [authView, setAuthView] = useState<AuthView>("login");

  // ── Login errors ──
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  // Pre-populate error if middleware redirected here with ?error=access_denied
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error") === "access_denied") {
        setLoginErrors({ general: "Access denied. Only Super Admins are allowed." });
      }
    }
  }, []);

  // ── Register errors ──
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});

  // ── Forgot-password state ──
  const [isForgotActive, setIsForgotActive] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>("request");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotChannel, setForgotChannel] = useState<"email" | "whatsapp">("email");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [timer, setTimer] = useState(0);
  const [isEditing, setIsEditing] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // ── Timer countdown ──
  useEffect(() => {
    if (timer > 0) {
      const id = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(id);
    }
  }, [timer]);

  // ── Login mutation ──
  const loginMutation = useMutation({
    mutationFn: async ({
      identifier,
      password,
    }: {
      identifier: string;
      password: string;
    }) => {
      try {
        const hostname = typeof window !== "undefined" ? window.location.hostname : "";
        const { data } = await axiosInstance.post(
          `${AUTH_BASE}/login`,
          { identifier, password, hostname, domain_name: hostname },
          { headers: getExternalHeaders(), withCredentials: false }
        );
        return data;
      } catch (error: any) {
        const status = error?.response?.status;
        const message = String(
          error?.response?.data?.message ?? error?.response?.data?.error ?? ""
        ).toLowerCase();
        const canTryLocal =
          status === 401 &&
          identifier.includes("@") &&
          (message.includes("invalid") || message.includes("credential"));

        if (!canTryLocal) throw error;

        const { data } = await axios.post("/api/auth/login", {
          email: identifier,
          password,
        });
        return data;
      }
    },
    onMutate: () => setLoginErrors({}),
    onError: (error: any) => {
      const data = error?.response?.data;
      if (data?.fieldErrors) {
        setLoginErrors(data.fieldErrors);
      } else {
        setLoginErrors({ general: data?.error || data?.message || "Login failed" });
      }
    },
    onSuccess: (data) => {
      const token =
        data?.token ??
        data?.accessToken ??
        data?.access_token ??
        data?.data?.token ??
        data?.data?.accessToken ??
        data?.data?.access_token;

      if (!token) {
        setLoginErrors({ general: data?.message || "Login succeeded but no token was returned" });
        return;
      }

      // ── Role check: only Super Admins may access this panel ──────────────
      try {
        const base64 = token.split(".")[1];
        const payload = JSON.parse(atob(base64.replace(/-/g, "+").replace(/_/g, "/")));
        const role = String(payload?.role ?? "").toLowerCase().trim();
        const allowed = ["super admin", "superadmin", "super_admin", "admin"];
        if (!allowed.includes(role)) {
          setLoginErrors({ general: "Access denied. Only Super Admins are allowed." });
          return;
        }
      } catch {
        // If we can't decode the token, block access to be safe
        setLoginErrors({ general: "Invalid token. Please try again." });
        return;
      }
      // ─────────────────────────────────────────────────────────────────────

      localStorage.setItem("console_access_token", token);
      document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;

      const rawCreditBalance = data?.data?.data?.credit_balance ?? data?.data?.company?.credit_balance;
      const creditBalance = rawCreditBalance === null || rawCreditBalance === undefined ? "0" : rawCreditBalance;
      localStorage.setItem("credit_balance", String(creditBalance));

      if (data?.success !== false) {
        router.replace("/user/dashboard");
        queryClient.invalidateQueries({ queryKey: ["user-role"] });
        toast.success("Logged in successfully");
      } else {
        setLoginErrors({ general: data?.message || "Login failed" });
      }
    },
  });

  // ── Register mutation ──
  const registerMutation = useMutation({
    mutationFn: async ({
      name,
      email,
      phone,
      password,
      countryCode,
    }: {
      name: string;
      email: string;
      phone: string;
      password: string;
      countryCode: string;
    }) => {
      const { data } = await axiosInstance.post(
        `${AUTH_BASE}/registration`,
        { name, email, phone, password, countryCode },
        { headers: getExternalHeaders(), withCredentials: false }
      );
      return data;
    },
    onMutate: (variables) => {
      setRegisterErrors({});
      const passwordValid =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
          variables.password
        );
      if (!passwordValid) {
        setRegisterErrors({
          password:
            "Password must be 8+ chars, include uppercase, lowercase, number, and special character",
        });
        throw new Error("Invalid password");
      }
    },
    onError: (error: any) => {
      const data = error?.response?.data;
      if (data?.fieldErrors) {
        setRegisterErrors(data.fieldErrors);
      } else {
        setRegisterErrors({ general: data?.error ?? data?.message });
      }
    },
    onSuccess: () => {
      toast.success("Registered successfully! Please login.");
      setAuthView("login");
      setRegisterErrors({});
    },
  });

  // ── Login handler ──
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const rawIdentifier = String(form.get("identifier") || "").trim();
    const identifier = rawIdentifier.includes("@")
      ? rawIdentifier.toLowerCase()
      : rawIdentifier.replace(/\s+/g, "");
    const password = String(form.get("password") || "").trim();

    if (!identifier || !password) {
      setLoginErrors({
        ...(!identifier ? { identifier: "Email or phone is required" } : {}),
        ...(!password ? { password: "Password is required" } : {}),
      });
      return;
    }
    loginMutation.mutate({ identifier, password });
  };

  // ── Register handler ──
  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const countryCode = form.get("countryCode") as string;
    const phone = form.get("phone") as string;
    const password = form.get("password") as string;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setRegisterErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }));
      return;
    }
    registerMutation.mutate({ name, email, countryCode, phone, password });
  };

  // ── Forgot: send OTP ──
  const handleSendOtp = async () => {
    setEmailError("");

    if (!forgotEmail.trim()) {
      toast.error("Please enter your email");
      setEmailError("Email is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      toast.error("Please enter a valid email address");
      setEmailError("Invalid email format");
      return;
    }
    if (forgotChannel === "whatsapp" && !forgotPhone) {
      toast.error("Please enter your phone number");
      return;
    }

    setForgotLoading(true);
    try {
      await axiosInstance.post(
        `${AUTH_BASE}/send-otp`,
        { email: forgotEmail, phone: forgotPhone, channel: forgotChannel },
        { headers: getExternalHeaders(), withCredentials: false }
      );
      setForgotStep("verify");
      setTimer(60);
      setIsEditing(false);
      toast.success(
        `OTP sent to ${forgotChannel === "email" ? maskEmail(forgotEmail) : maskPhone(forgotPhone)}`
      );
    } catch (error: any) {
      const msg = error?.response?.data?.error ?? error?.response?.data?.message;
      if (error?.response?.status === 404) {
        toast.error("No account found with this email");
        setEmailError("Email not registered");
      } else if (msg) {
        toast.error(msg);
        setEmailError(msg);
      } else {
        toast.error("Failed to send OTP");
        setEmailError("Failed to send OTP");
      }
    } finally {
      setForgotLoading(false);
    }
  };

  // ── Forgot: verify OTP ──
  const handleVerifyOtp = async () => {
    setOtpError("");

    if (!otp.trim()) { toast.error("Please enter OTP"); setOtpError("OTP is required"); return; }
    if (otp.length !== 6) { toast.error("OTP must be 6 digits"); setOtpError("OTP must be 6 digits"); return; }
    if (!/^\d+$/.test(otp)) { toast.error("OTP must contain only numbers"); setOtpError("OTP must contain only numbers"); return; }

    setForgotLoading(true);
    try {
      const { data } = await axiosInstance.post(
        `${AUTH_BASE}/verify-otp`,
        { email: forgotEmail, otp },
        { headers: getExternalHeaders(), withCredentials: false }
      );
      toast.success(data?.message || "OTP verified successfully");
      setForgotStep("reset");
    } catch (error: any) {
      const msg = error?.response?.data?.error ?? error?.response?.data?.message;
      setOtpError(msg || "Invalid OTP. Please try again.");
      toast.error(msg || "Invalid OTP. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  // ── Forgot: reset password ──
  const handleResetPassword = async () => {
    setPasswordError("");

    if (!newPassword.trim()) { setPasswordError("Password is required"); return; }
    if (newPassword !== confirmPassword) { setPasswordError("Passwords do not match"); return; }
    const valid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/.test(newPassword);
    if (!valid) {
      setPasswordError("Password must be 8+ chars with uppercase, lowercase, and special character");
      return;
    }

    setForgotLoading(true);
    try {
      await axiosInstance.post(
        `${AUTH_BASE}/reset-password`,
        { email: forgotEmail, password: newPassword },
        { headers: getExternalHeaders(), withCredentials: false }
      );
      toast.success("Password updated successfully");
      // Reset all forgot state
      setIsForgotActive(false);
      setForgotStep("request");
      setForgotEmail("");
      setForgotPhone("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
      setIsEditing(true);
    } catch (error: any) {
      const msg =
        error?.response?.data?.error ??
        error?.response?.data?.message ??
        "Failed to reset password";
      toast.error(msg);
      setPasswordError(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    await handleSendOtp();
  };

  const handleCloseForgot = () => {
    setIsForgotActive(false);
    setForgotStep("request");
    setIsEditing(true);
    setEmailError("");
    setOtpError("");
    setPasswordError("");
  };

  // ── Render ──
  return (
    <>
      {authView === "login" ? (
        <LoginForm
          onSubmit={handleLogin}
          errors={loginErrors}
          setErrors={setLoginErrors}
          isPending={loginMutation.isPending}
          onForgot={() => setIsForgotActive(true)}
          onRegister={() => setAuthView("register")}
          theme={theme}
          isMobile={isMobile}
        />
      ) : (
        <RegisterForm
          onSubmit={handleRegister}
          errors={registerErrors}
          setErrors={setRegisterErrors}
          isPending={registerMutation.isPending}
          onLogin={() => setAuthView("login")}
          theme={theme}
          isMobile={isMobile}
        />
      )}

      {isForgotActive && (
        <ForgotPasswordModal
          channel={forgotChannel}
          setChannel={setForgotChannel}
          otp={otp}
          setOtp={setOtp}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          timer={timer}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          otpError={otpError}
          setOtpError={setOtpError}
          loading={forgotLoading}
          sendOtp={handleSendOtp}
          verifyOtp={handleVerifyOtp}
          resetPassword={handleResetPassword}
          resendOtp={handleResendOtp}
          maskEmail={maskEmail}
          maskPhone={maskPhone}
          onClose={handleCloseForgot}
          theme={theme}
          isMobile={isMobile}
          step={forgotStep}
          setStep={setForgotStep}
          email={forgotEmail}
          setEmail={setForgotEmail}
          phone={forgotPhone}
          setPhone={setForgotPhone}
          emailError={emailError}
          setEmailError={setEmailError}
          passwordError={passwordError}
          setPasswordError={setPasswordError}
        />
      )}
    </>
  );
}