import React from "react";

interface KPIProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

export function KPI({ label, value, icon, color }: KPIProps) {
  return (
    <div className="au-kpi-card">
      <div className="au-kpi-card__left">
        <div className="au-kpi-card__icon" style={{ background: `${color}18`, color }}>
          {icon}
        </div>
        <div className="au-kpi-card__info">
          <span className="au-kpi-card__label">{label}</span>
          <div className="au-kpi-card__value">{value}</div>
        </div>
      </div>
    </div>
  );
}
