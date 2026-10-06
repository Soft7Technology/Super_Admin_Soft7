"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import Spinner from "./ui/Spinner";

export interface DbUser {
  id:     string;
  un:     string;
  role:   string;
  status: string;
  av:     string;
  col:    string;
}

const SS: Record<string, { color: string; dot: string }> = {
  ACTIVE:    { color: "#10b981", dot: "#10b981" },
  Active:    { color: "#10b981", dot: "#10b981" },
  INACTIVE:  { color: "#64748b", dot: "#94a3b8" },
  Inactive:  { color: "#64748b", dot: "#94a3b8" },
  PENDING:   { color: "#d97706", dot: "#f59e0b" },
  Pending:   { color: "#d97706", dot: "#f59e0b" },
  SUSPENDED: { color: "#dc2626", dot: "#ef4444" },
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

export default function UserManagement({
  users = [],
  loading = false,
  error = null,
  title = "User Management",
  showViewAll = true,
  onUserClick,
  onViewAll,
}: {
  users?: DbUser[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  showViewAll?: boolean;
  onUserClick?: (user: DbUser) => void;
  onViewAll?: () => void;
}) {
  const { isDark } = useTheme();
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
              color: "var(--crm-primary, #206bc4)",
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
        <Spinner variant="center" size="md" color="primary" text="Loading users..." />
      ) : error ? (
        <div style={{ padding: "30px", textAlign: "center", color: "var(--crm-muted, #94a3b8)", fontSize: bodyFont }}>
          {error}
        </div>
      ) : isMobile ? (
        /* ─── Card layout for small screens ─── */
        <div style={{ padding: "10px" }}>
          {users.length === 0 && (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--crm-muted, #94a3b8)", fontSize: bodyFont }}>
              No users found
            </div>
          )}
          {users.map((u, i) => {
            const ss = SS[u.status] ?? { color: "#64748b", dot: "#94a3b8" };
            return (
              <div
                key={u.id}
                onClick={() => onUserClick?.(u)}
                style={{
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--crm-border, #e2e8f0)",
                  background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                  marginBottom: i < users.length - 1 ? "8px" : 0,
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
                      background: u.col,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "0.65rem",
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {u.av}
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
                    title={`@${u.un}`}
                  >
                    @{u.un}
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--crm-muted, #64748b)", fontWeight: 500, whiteSpace: "nowrap" }}>
                    {u.role}
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: ss.color,
                      marginLeft: "auto",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: ss.dot, flexShrink: 0 }} />
                    {u.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── Table layout for larger screens ─── */
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ width: "100%", minWidth: isSmall ? "380px" : "auto", tableLayout: "fixed", borderCollapse: "collapse", fontSize: bodyFont }}>
            <thead>
              <tr style={{ background: "transparent" }}>
                {[
                  { label: "USERNAME", width: "52%" },
                  { label: "ROLE", width: "24%" },
                  { label: "STATUS", width: "24%" },
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
              {users.map((u, i) => (
                <Row
                  key={u.id}
                  u={u}
                  last={i === users.length - 1}
                  cellPad={cellPadVal}
                  avatarSize={avatarSize}
                  avatarFont={avatarFont}
                  nameFont={nameFont}
                  badgeFont={badgeFont}
                  onUserClick={onUserClick}
                />
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: "26px", textAlign: "center", color: "var(--crm-muted, #94a3b8)", fontSize: bodyFont }}>
                    No users found
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
  u,
  last,
  cellPad,
  avatarSize,
  avatarFont,
  nameFont,
  badgeFont,
  onUserClick,
}: {
  u: DbUser;
  last: boolean;
  cellPad: string;
  avatarSize: number;
  avatarFont: string;
  nameFont: string;
  badgeFont: string;
  onUserClick?: (user: DbUser) => void;
}) {
  const [hov, setHov] = useState(false);
  const ss = SS[u.status] ?? { color: "#64748b", dot: "#94a3b8" };

  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onUserClick?.(u)}
      style={{
        borderBottom: last ? "none" : "1px solid var(--crm-border, #e2e8f0)",
        background: hov ? "var(--crm-card-hover, rgba(0,0,0,0.02))" : "transparent",
        transition: "background 0.12s",
        cursor: "pointer",
      }}
    >
      {/* Username + Avatar */}
      <td style={{ padding: cellPad, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <div
            style={{
              width: `${avatarSize}px`,
              height: `${avatarSize}px`,
              borderRadius: "6px",
              background: u.col,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: avatarFont,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {u.av}
          </div>
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
            title={`@${u.un}`}
          >
            @{u.un}
          </span>
        </div>
      </td>

      {/* Role */}
      <td style={{ padding: cellPad, whiteSpace: "nowrap" }}>
        <span
          style={{
            fontSize: badgeFont,
            color: "var(--crm-muted, #64748b)",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {u.role}
        </span>
      </td>

      {/* Status: dot + text */}
      <td style={{ padding: cellPad, whiteSpace: "nowrap" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: badgeFont,
            fontWeight: 600,
            color: ss.color,
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: ss.dot,
              flexShrink: 0,
            }}
          />
          {u.status}
        </span>
      </td>
    </tr>
  );
}
