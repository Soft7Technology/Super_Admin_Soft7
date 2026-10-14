/* eslint-disable @next/next/no-img-element */
"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import styles from "./Avatar.module.css";

export interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  tone?: "brand" | "neutral";
  status?: "online" | "away" | "offline";
  /** Rendered instead of initials (e.g. a user icon for unnamed contacts) */
  fallback?: ReactNode;
  className?: string;
}

export function getInitials(name?: string | null): string {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({
  name,
  src,
  size = "md",
  tone = "brand",
  status,
  fallback,
  className,
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = !!src && !failed;

  return (
    <span
      className={cn(styles.avatar, styles[size], !showImage && styles[tone], className)}
      role="img"
      aria-label={name || "Avatar"}
    >
      {showImage ? (
        <img src={src!} alt="" className={styles.image} onError={() => setFailed(true)} />
      ) : (
        fallback ?? getInitials(name)
      )}
      {status && <span className={cn(styles.status, styles[status])} aria-hidden />}
    </span>
  );
}

export { Avatar };
