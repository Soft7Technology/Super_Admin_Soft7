interface KPIProps {
  label: string;
  value: string;
  icon: string;
  color: string;
}

export function KPI({ label, value, icon, color }: KPIProps) {
  return (
    <div className="au-kpi-card">
      <div className="au-kpi-card__orb" style={{ background: `${color}18` }} />
      <div className="au-kpi-card__top">
        <span className="au-kpi-card__label">{label}</span>
        <div className="au-kpi-card__icon" style={{ background: `${color}18`, color }}>
          {icon}
        </div>
      </div>
      <div className="au-kpi-card__value">{value}</div>
      <div className="au-kpi-card__bar" style={{ background: `${color}40` }}>
        <div className="au-kpi-card__bar-fill" style={{ background: color }} />
      </div>
    </div>
  );
}
