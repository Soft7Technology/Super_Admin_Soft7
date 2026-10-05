import React from "react";

export interface MobileCardRow {
  label: string;
  value: React.ReactNode;
}

export interface MobileCardProps {
  headerLeft: React.ReactNode;
  headerRight?: React.ReactNode;
  rows?: MobileCardRow[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Universal Mobile Cards Container
 * Automatically hidden on desktop (>768px) and rendered as a flex column on mobile (<=768px).
 */
export function MobileCardsContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`app-mobile-cards ${className}`}>{children}</div>;
}

/**
 * Universal Mobile Card Component
 * Conforms to the portal's standard card architecture with header, detail rows, and actions.
 */
export function MobileCard({
  headerLeft,
  headerRight,
  rows,
  actions,
  children,
  className = "",
  onClick,
}: MobileCardProps) {
  return (
    <div
      className={`app-card ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {(headerLeft || headerRight) && (
        <div className="app-card__header">
          <div className="app-card__identity">{headerLeft}</div>
          {headerRight && <div className="app-card__status">{headerRight}</div>}
        </div>
      )}

      {rows && rows.length > 0 && (
        <div className="app-card__details">
          {rows.map((row, idx) => (
            <div key={idx} className="app-card__row">
              <span className="app-card__label">{row.label}</span>
              <span className="app-card__val">{row.value}</span>
            </div>
          ))}
        </div>
      )}

      {children}

      {actions && <div className="app-card__actions">{actions}</div>}
    </div>
  );
}

export default MobileCard;
