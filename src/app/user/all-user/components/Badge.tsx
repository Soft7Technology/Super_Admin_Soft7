import KitBadge from "@/components/ui/Badge";
import { statusVariant } from "../types";

interface BadgeProps {
  status: string;
}

export function Badge({ status }: BadgeProps) {
  const label = status[0] + status.slice(1).toLowerCase();
  return (
    <KitBadge variant={statusVariant(status)} dot>
      {label}
    </KitBadge>
  );
}
