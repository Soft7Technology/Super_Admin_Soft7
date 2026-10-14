"use client";

import type { ReactNode } from "react";

interface AuthShellProps {
  icon: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  footnote?: ReactNode;
  children: ReactNode;
}

/** Centered auth card — the same frame WA_Admin's admin login uses. */
export function AuthShell({ icon, title, subtitle, footnote, children }: AuthShellProps) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-sm">{icon}</div>
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-secondary-foreground">{subtitle}</p>}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg sm:p-8">{children}</div>

        {footnote && <p className="text-center text-xs text-muted-foreground">{footnote}</p>}
      </div>
    </div>
  );
}
