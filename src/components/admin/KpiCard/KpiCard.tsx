import { KeyboardEvent, ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Skeleton from "@/components/ui/Skeleton";
import styles from "./KpiCard.module.css";

export type KpiTone = "primary" | "success" | "warning" | "error" | "info";

export interface KpiTrend {
  /** Display value, e.g. "12%" */
  value: string;
  direction: "up" | "down";
  /** Comparison label, e.g. "vs last month" */
  label?: string;
}

export interface KpiCardProps {
  label: ReactNode;
  value: ReactNode;
  icon: ReactNode;
  /** Secondary line under the value (shown when there is no trend) */
  hint?: ReactNode;
  trend?: KpiTrend | null;
  /** Optional 0–100 meter */
  meter?: { value: number; label: string };
  tone?: KpiTone;
  onClick?: () => void;
  className?: string;
}

/** Headline number tile — same design as WA_DASHBOARD's KpiCard. */
export function KpiCard({ label, value, icon, hint, trend, meter, tone = "primary", onClick, className }: KpiCardProps) {
  const interactiveProps = onClick
    ? {
        role: "button",
        tabIndex: 0,
        onClick,
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        },
      }
    : {};

  return (
    <div className={cn(styles.card, styles[`tone-${tone}`], onClick && styles.interactive, className)} {...interactiveProps}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        <span className={styles.icon} aria-hidden>
          {icon}
        </span>
      </div>
      <p className={styles.value}>{value}</p>
      {meter && (
        <span
          className={styles.meter}
          role="meter"
          aria-label={meter.label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={meter.value}
        >
          <span className={styles.meterFill} style={{ width: `${Math.max(meter.value, meter.value > 0 ? 2 : 0)}%` }} />
        </span>
      )}
      {(trend || hint) && (
        <div className={styles.footer}>
          {trend ? (
            <>
              <span className={cn(styles.trend, trend.direction === "up" ? styles.up : styles.down)}>
                {trend.direction === "up" ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {trend.value}
              </span>
              {trend.label && <span>{trend.label}</span>}
            </>
          ) : (
            hint
          )}
        </div>
      )}
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <div className={styles.top}>
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-9 w-9" />
      </div>
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

export default KpiCard;
