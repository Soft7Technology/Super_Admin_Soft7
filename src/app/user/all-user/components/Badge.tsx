import { STATUS_CSS } from "../types";

interface BadgeProps {
  status: string;
}

export function Badge({ status }: BadgeProps) {
  const label = status[0] + status.slice(1).toLowerCase();
  return (
    <span className={`au-badge ${STATUS_CSS[status] ?? "au-badge--inactive"}`}>
      <span className="au-badge__dot" />
      {label}
    </span>
  );
}
