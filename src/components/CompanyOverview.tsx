"use client";
import React, { useState, useEffect } from "react";
import { useTheme, tokens } from "../context/ThemeContext";
import { Users } from "lucide-react";
import Spinner from "./ui/Spinner";
import ProfileAvatar from "./ProfileAvatar";

interface Company {
  id:     string;
  name:   string;
  ini:    string;
  col:    string;
  status: string;
  plan:   string;
  users:  number;
}

const ST: Record<string, { color: string; dot: string }> = {
  Active:    { color: "#10b981", dot: "#10b981" },
  Inactive:  { color: "#64748b", dot: "#94a3b8" },
  Trial:     { color: "#d97706", dot: "#f59e0b" },
  Suspended: { color: "#dc2626", dot: "#ef4444" },
};

function useWindowWidth() {
  const [width, setWidth] = useState<number>(1024);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return width;
}

export default function CompanyOverview({
  companies = [],
  loading = false,
  error = null,
  title = "Company Overview",
  showViewAll = true,
  onCompanyClick,
  onViewAll,
}: {
  companies?: Company[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  showViewAll?: boolean;
  onCompanyClick?: (company: Company) => void;
  onViewAll?: () => void;
}) {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const width = useWindowWidth();
  const isMobile  = width <= 640;
  const isSmall   = width <= 1000;
  const isMedium  = width <= 1300;

  // Responsive typography
  const titleSize   = isSmall ? "0.92rem" : isMedium ? "1rem"   : "1.05rem";
  const viewAllSize = isSmall ? "0.78rem" : isMedium ? "0.82rem" : "0.88rem";
  const headerPad   = isSmall ? "14px 16px 12px" : "16px 20px";
  const thFontSize  = isSmall ? "0.68rem" : "0.72rem";
  const bodyFont    = isSmall ? "0.78rem" : isMedium ? "0.84rem" : "0.875rem";
  const badgeFont   = isSmall ? "0.72rem" : "0.78rem";
  const cellPadVal  = isSmall ? "10px 14px" : "12px 18px";
  const avatarSize  = isSmall ? 28 : 32;
  const avatarFont  = isSmall ? "0.65rem" : "0.7rem";
  const nameFont    = isSmall ? "0.8rem" : "0.85rem";

  return (
    <div
      style={{
        background: "var(--crm-card-bg, #ffffff)",
        border: "1px solid var(--crm-border, #e2e8f0)",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "var(--crm-shadow, 0 1px 3px rgba(0,0,0,0.04))",
        transition: "background 0.2s, border-color 0.2s",
        minWidth: 0,
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* ─── Card Header ─── */}
      <div
        style={{
          padding: headerPad,
          borderBottom: "1px solid var(--crm-border, #e2e8f0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: titleSize,
            color: "var(--crm-title, #0f172a)",
          }}
        >
          {title}
        </span>
        {showViewAll && (
          <span
            onClick={onViewAll}
            style={{
              fontSize: viewAllSize,
              color: "var(--crm-primary, #087f5b)",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            View All{" "}
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        )}
      </div>

      {loading ? (
        <Spinner variant="center" size="md" color="primary" text="Loading companies..." />
      ) : error ? (
        <div style={{ padding: "30px", textAlign: "center", color: "var(--crm-muted, #94a3b8)", fontSize: bodyFont }}>
          {error}
        </div>
      ) : isMobile ? (
        /* ─── Card layout for small screens ─── */
        <div style={{ padding: "10px" }}>
          {companies.length === 0 && (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--crm-muted, #94a3b8)", fontSize: bodyFont }}>
              No companies found
            </div>
          )}
          {companies.map((co, i) => {
            const s = ST[co.status] ?? ST["Inactive"];
            return (
              <div
                key={co.id}
                onClick={() => onCompanyClick?.(co)}
                style={{
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--crm-border, #e2e8f0)",
                  background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                  marginBottom: i < companies.length - 1 ? "8px" : 0,
                  cursor: "pointer",
                  transition: "background 0.12s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", minWidth: 0 }}>
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "6px",
                      background: co.col,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "0.65rem",
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {co.ini}
                  </div>
                  <span
                    style={{
                      fontWeight: 600,
                      color: "var(--crm-title, #0f172a)",
                      fontSize: "0.85rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      minWidth: 0,
                    }}
                    title={co.name}
                  >
                    {co.name}
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: s.color,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
                    {co.status}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--crm-muted, #64748b)", fontWeight: 500, whiteSpace: "nowrap" }}>
                    {co.plan}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--crm-title, #0f172a)", fontWeight: 600, marginLeft: "auto", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Users size={13} style={{ color: "var(--crm-muted, #64748b)" }} />
                    {co.users}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── Table layout for larger screens ─── */
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ width: "100%", minWidth: isSmall ? "480px" : "auto", tableLayout: "fixed", borderCollapse: "collapse", fontSize: bodyFont }}>
            <thead>
              <tr style={{ background: "transparent" }}>
                {[
                  { label: "COMPANY NAME", width: "42%" },
                  { label: "STATUS", width: "24%" },
                  { label: "PLAN", width: "18%" },
                  { label: "USERS", width: "16%" },
                ].map(h => (
                  <th
                    key={h.label}
                    style={{
                      width: h.width,
                      padding: cellPadVal,
                      textAlign: "left",
                      fontSize: thFontSize,
                      color: "var(--crm-subheader, #64748b)",
                      letterSpacing: "0.04em",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      borderBottom: "1px solid var(--crm-border, #e2e8f0)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companies.map((co, i) => (
                <Row
                  key={co.id}
                  co={co}
                  last={i === companies.length - 1}
                  cellPad={cellPadVal}
                  avatarSize={avatarSize}
                  avatarFont={avatarFont}
                  nameFont={nameFont}
                  badgeFont={badgeFont}
                  onCompanyClick={onCompanyClick}
                />
              ))}
              {companies.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: "26px", textAlign: "center", color: "var(--crm-muted, #94a3b8)", fontSize: bodyFont }}>
                    No companies found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({
  co,
  last,
  cellPad,
  avatarSize,
  avatarFont,
  nameFont,
  badgeFont,
  onCompanyClick,
}: {
  co: Company;
  last: boolean;
  cellPad: string;
  avatarSize: number;
  avatarFont: string;
  nameFont: string;
  badgeFont: string;
  onCompanyClick?: (company: Company) => void;
}) {
  const [hov, setHov] = useState(false);
  const s = ST[co.status] ?? ST["Inactive"];

  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onCompanyClick?.(co)}
      style={{
        borderBottom: last ? "none" : "1px solid var(--crm-border, #e2e8f0)",
        background: hov ? "var(--crm-card-hover, rgba(0,0,0,0.02))" : "transparent",
        transition: "background 0.12s",
        cursor: "pointer",
      }}
    >
      {/* Company Name + Avatar */}
      <td style={{ padding: cellPad, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <ProfileAvatar name={co.name} initials={co.ini} size={avatarSize} fontSize={avatarFont} />
          <span
            style={{
              fontWeight: 600,
              color: "var(--crm-title, #0f172a)",
              fontSize: nameFont,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              minWidth: 0,
            }}
            title={co.name}
          >
            {co.name}
          </span>
        </div>
      </td>

      {/* Status: clean dot + text (no capsule box) */}
      <td style={{ padding: cellPad, whiteSpace: "nowrap" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: badgeFont,
            fontWeight: 600,
            color: s.color,
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: s.dot,
              flexShrink: 0,
            }}
          />
          {co.status}
        </span>
      </td>

      {/* Plan: plain text without border box */}
      <td style={{ padding: cellPad, whiteSpace: "nowrap" }}>
        <span
          style={{
            fontSize: badgeFont,
            color: "var(--crm-muted, #64748b)",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {co.plan}
        </span>
      </td>

      {/* Users */}
      <td
        style={{
          padding: cellPad,
          color: "var(--crm-title, #0f172a)",
          fontWeight: 600,
          fontSize: nameFont,
          whiteSpace: "nowrap",
        }}
      >
        {co.users}
      </td>
    </tr>
  );
}
