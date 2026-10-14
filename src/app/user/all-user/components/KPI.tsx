import type { ReactNode } from "react";
import KpiCard from "@/components/admin/KpiCard";
import type { KpiTone } from "@/components/admin/KpiCard";

interface KPIProps {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: KpiTone;
}

export function KPI({ label, value, icon, tone }: KPIProps) {
  return <KpiCard label={label} value={value} icon={icon} tone={tone} />;
}
