"use client";
import React from "react";
import { Toaster } from "react-hot-toast";
import { AppShell } from "@/components/shell";

// Toasts read tokens directly, so they follow light/dark and the brand color.
const toastOptions = {
  duration: 4000,
  style: {
    background: "var(--color-surface-raised)",
    color: "var(--color-text)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--elevation-lg)",
    padding: "12px 18px",
    fontSize: "0.875rem",
    fontWeight: 500,
  },
  success: {
    icon: null,
    style: { borderColor: "var(--color-success-border)" },
  },
  error: {
    iconTheme: { primary: "var(--color-error)", secondary: "var(--color-surface)" },
  },
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster position="top-center" containerStyle={{ top: 20 }} toastOptions={toastOptions} />
      <AppShell>{children}</AppShell>
    </>
  );
}
