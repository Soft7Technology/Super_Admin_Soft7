import { STATUS_CSS } from "../types";

interface BadgeProps {
  status: string;
}

export function Badge({ status }: BadgeProps) {
  const safeStatus = status || "INACTIVE";
  const label = safeStatus ? safeStatus[0].toUpperCase() + safeStatus.slice(1).toLowerCase() : "Inactive";
  return (
    <span className={`au-badge ${STATUS_CSS[safeStatus] ?? "au-badge--inactive"}`}>
      <span className="au-badge__dot" />
      {label}
    </span>
  );
}
