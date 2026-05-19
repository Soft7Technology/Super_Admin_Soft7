// src/app/auth/hooks/useForgotPassword.ts
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { axiosInstance } from "@/lib/axiosInstance";
import { AUTH_BASE, type ForgotStep } from "../types/auth.types";

function maskEmail(email: string) {
  const str = String(email ?? "");
  if (!str || !str.includes("@")) return str;
  const [name, domain] = str.split("@");
  if (name.length <= 2) return `**@${domain}`;
  const visible = name.slice(0, 2);
  const hidden = "*".repeat(Math.max(0, name.length - 2));
  return `${visible}${hidden}@${domain}`;
}

function maskPhone(phone: string) {
  const str = String(phone ?? "");
  if (!str || str.length < 4) return "*".repeat(Math.max(0, str.length));
  const visible = str.slice(-4);
  const hidden = "*".repeat(Math.max(0, str.length - 4));
  return `${hidden}${visible}`;
}

function getHeaders() {
  return {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
}

export function useForgotPassword(onClose?: () => void) {
  const [step, setStep] = useState<ForgotStep>("request");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<"email" | "whatsapp">("email");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [timer, setTimer] = useState(0);
  const [isEditing, setIsEditing] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const startTimer = () => {
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const sendOtp = async () => {
    setEmailError("");

    if (!email || email.trim() === "") {
      toast.error("Please enter your email");
      setEmailError("Email is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      setEmailError("Invalid email format");
      return;
    }
    if (channel === "whatsapp" && !phone) {
      toast.error("Please enter your phone number");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(
        `${AUTH_BASE}/send-otp`,
        { email, phone, channel },
        { headers: getHeaders(), withCredentials: false }
      );
      setStep("verify");
      startTimer();
      setIsEditing(false);
      setEmailError("");
      toast.success(
        `OTP sent to ${channel === "email" ? maskEmail(email) : maskPhone(phone)}`
      );
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error ?? error?.response?.data?.message;
      if (error?.response?.status === 404) {
        toast.error("No account found with this email");
        setEmailError("Email not registered");
      } else if (errorMsg) {
        toast.error(errorMsg);
        setEmailError(errorMsg);
      } else {
        toast.error("Failed to send OTP");
        setEmailError("Failed to send OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setOtpError(false);
    if (!otp || otp.trim() === "") {
      toast.error("Please enter OTP");
      setOtpError(true);
      return;
    }
    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits");
      setOtpError(true);
      return;
    }
    if (!/^\d+$/.test(otp)) {
      toast.error("OTP must contain only numbers");
      setOtpError(true);
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosInstance.post(
        `${AUTH_BASE}/verify-otp`,
        { email, otp },
        { headers: getHeaders(), withCredentials: false }
      );
      toast.success(data?.message || "OTP verified successfully");
      setOtpError(false);
      setStep("reset");
    } catch (error: any) {
      setOtpError(true);
      const errorMessage =
        error?.response?.data?.error ?? error?.response?.data?.message;
      if (errorMessage) toast.error(errorMessage);
      else if (error?.response?.status === 400) toast.error("Invalid OTP. Please try again.");
      else if (error?.response?.status === 500) toast.error("Server error. Please try again later.");
      else toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      setPasswordError("Passwords do not match");
      return;
    }
    if (!newPassword || newPassword.trim() === "") {
      toast.error("Please enter a password");
      setPasswordError("Password is required");
      return;
    }
    const passwordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/.test(newPassword);
    if (!passwordValid) {
      toast.error("Password must be 8+ chars, include upper, lower, and special character");
      setPasswordError("Password must be 8+ chars with uppercase, lowercase, and special character");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(
        `${AUTH_BASE}/reset-password`,
        { email, password: newPassword },
        { headers: getHeaders(), withCredentials: false }
      );
      toast.success("Password updated successfully");
      // Reset all state
      setStep("request");
      setEmail("");
      setPhone("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
      setIsEditing(true);
      onClose?.();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error ??
        error?.response?.data?.message ??
        "Failed to reset password";
      toast.error(errorMsg);
      setPasswordError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (timer > 0) return;
    await sendOtp();
  };

  return {
    step,
    setStep,
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
    setEmailError,
    otpError,
    setOtpError,
    passwordError,
    setPasswordError,
    loading,
    sendOtp,
    verifyOtp,
    resetPassword,
    resendOtp,
    maskEmail,
    maskPhone,
  };
}
