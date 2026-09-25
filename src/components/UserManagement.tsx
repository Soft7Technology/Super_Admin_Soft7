"use client";
import React, { useState, useEffect } from "react";
import { useTheme, tokens } from "../context/ThemeContext";
import { useRouter } from "next/navigation";

interface DbUser {
  id:     string;
  un:     string;
  role:   string;
  status: string;
  av:     string;
  col:    string;
}

const RS: Record<string, { bg: string; color: string }> = {
  ADMIN:   { bg: "rgba(16,185,129,0.14)", color: "#059669" },
  Admin:   { bg: "rgba(16,185,129,0.14)", color: "#059669" },
  Manager: { bg: "rgba(251,191,36,0.14)", color: "#d97706" },
  USER:    { bg: "rgba(148,163,184,0.14)", color: "#475569" },
  User:    { bg: "rgba(148,163,184,0.14)", color: "#475569" },
};

const SS: Record<string, { bg: string; color: string; dot: string }> = {
  ACTIVE:    { bg: "rgba(16,185,129,0.14)", color: "#059669", dot: "#10b981" },
  Active:    { bg: "rgba(16,185,129,0.14)", color: "#059669", dot: "#10b981" },
  INACTIVE:  { bg: "rgba(148,163,184,0.14)", color: "#475569", dot: "#94a3b8" },
  Inactive:  { bg: "rgba(148,163,184,0.14)", color: "#475569", dot: "#94a3b8" },
  PENDING:   { bg: "rgba(251,191,36,0.14)", color: "#d97706", dot: "#fbbf24" },
  Pending:   { bg: "rgba(251,191,36,0.14)", color: "#d97706", dot: "#fbbf24" },
  SUSPENDED: { bg: "rgba(239,68,68,0.12)",  color: "#dc2626", dot: "#f87171" },
  Suspended: { bg: "rgba(239,68,68,0.12)",  color: "#dc2626", dot: "#f87171" },
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
  const t = isDark ? tokens.dark : tokens.light;
  const router = useRouter();
  const width = useWindowWidth();
  const isMobile  = width <= 640;
  const isSmall   = width <= 1000;
  const isMedium  = width <= 1300;

  // Selected user for inline preview drawer
  const [previewUser, setPreviewUser] = useState<DbUser | null>(null);
  const [copied, setCopied] = useState(false);

  // Responsive text sizes
  const titleSize   = isSmall ? "0.92rem" : isMedium ? "1rem"   : "1.18rem";
  const viewAllSize = isSmall ? "0.78rem" : isMedium ? "0.85rem" : "0.95rem";
  const headerPad   = isSmall ? "14px 16px 12px" : isMedium ? "18px 20px 16px" : "24px 26px 20px";
  const thFontSize  = isSmall ? "0.65rem" : isMedium ? "0.7rem" : "0.75rem";
  const bodyFont    = isSmall ? "0.78rem" : isMedium ? "0.84rem" : "0.9rem";
  const badgeFont   = isSmall ? "0.68rem" : isMedium ? "0.72rem" : "0.78rem";
  const badgePad    = isSmall ? "3px 8px"  : isMedium ? "4px 10px" : "6px 12px";
  const cellPadVal  = isSmall ? "10px 12px" : isMedium ? "14px 18px" : "18px 24px";
  const avatarSize  = isSmall ? 28 : isMedium ? 32 : 38;
  const avatarFont  = isSmall ? "0.6rem" : isMedium ? "0.65rem" : "0.75rem";
  const nameFont    = isSmall ? "0.78rem" : isMedium ? "0.84rem" : "0.9rem";

  const handleRowClick = (user: DbUser) => {
    if (onUserClick) {
      onUserClick(user);
    } else {
      setPreviewUser(user);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div
        style={{
          background: t.surface,
          border: isDark ? `1px solid ${t.border}` : `1px solid ${t.border}`,
          borderRadius: isSmall ? "12px" : "16px",
          overflow: "hidden",
          boxShadow: isDark
            ? "0 4px 20px rgba(0,0,0,0.3)"
            : "0 2px 10px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)",
          transition: "background 0.3s, border-color 0.3s",
        }}
      >
        <div
          style={{
            padding: headerPad,
            borderBottom: `1px solid ${t.border}`,
            background: isDark ? "transparent" : t.surface2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontWeight: 800, fontSize: titleSize, color: t.text }}>
            {title}
          </span>
          {showViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
                fontSize: viewAllSize,
                color: t.accent,
                cursor: "pointer",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              View All
              <svg
                width={isSmall ? "12" : "14"}
                height={isSmall ? "12" : "14"}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center", color: t.textFaint, fontSize: bodyFont }}>
            Loading users...
          </div>
        ) : error ? (
          <div style={{ padding: "30px", textAlign: "center", color: t.textFaint, fontSize: bodyFont }}>
            {error}
          </div>
        ) : isMobile ? (
          /* ─── Card layout for small screens ─── */
          <div style={{ padding: "12px" }}>
            {users.length === 0 && (
              <div style={{ padding: "20px", textAlign: "center", color: t.textFaint, fontSize: bodyFont }}>
                No users found
              </div>
            )}
            {users.map((u, i) => {
              const rs = RS[u.role] ?? { bg: "rgba(148,163,184,0.14)", color: "#475569" };
              const ss = SS[u.status] ?? { bg: "rgba(148,163,184,0.14)", color: "#475569", dot: "#94a3b8" };
              return (
                <div
                  key={u.id}
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    border: `1px solid ${t.border}`,
                    background: isDark ? "rgba(255,255,255,0.02)" : "#ffffff",
                    marginBottom: i < users.length - 1 ? "10px" : 0,
                    boxShadow: isDark ? "none" : "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: u.col,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 900,
                          fontSize: "0.7rem",
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        {u.av}
                      </div>
                      <span style={{ fontWeight: 800, color: t.textSub, fontSize: "0.88rem" }}>@{u.un}</span>
                    </div>

                    {/* Mobile Quick Preview Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewUser(u)}
                      aria-label="Preview user"
                      style={{
                        padding: "5px 10px",
                        borderRadius: "6px",
                        border: `1px solid ${t.border}`,
                        background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
                        color: t.accent,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Preview
                    </button>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", background: rs.bg, color: rs.color, border: `1px solid ${rs.color}30` }}>
                      {u.role}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.7rem", fontWeight: 700, padding: "3px 8px", borderRadius: "14px", background: ss.bg, color: ss.color, border: `1px solid ${ss.color}30` }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: ss.dot }} />
                      {u.status}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: t.textMuted, marginLeft: "auto", fontWeight: 600 }}>
                      ID: {u.id}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ─── Table layout for larger screens ─── */
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", minWidth: isSmall ? "420px" : "auto", borderCollapse: "collapse", fontSize: bodyFont }}>
              <thead>
                <tr style={{ background: t.tableHead, borderBottom: `1px solid ${t.border}` }}>
                  {["USERNAME", "ROLE", "STATUS", "ACTION"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: cellPadVal,
                        textAlign: h === "ACTION" ? "right" : "left",
                        fontSize: thFontSize,
                        color: t.textFaint,
                        letterSpacing: "0.08em",
                        fontWeight: 800,
                        borderBottom: `1px solid ${t.border}`,
                      }}
                    >
                      {h}
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
                    t={t}
                    isDark={isDark}
                    cellPad={cellPadVal}
                    avatarSize={avatarSize}
                    avatarFont={avatarFont}
                    nameFont={nameFont}
                    badgeFont={badgeFont}
                    badgePad={badgePad}
                    onUserClick={() => handleRowClick(u)}
                    onPreview={() => setPreviewUser(u)}
                  />
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: "26px", textAlign: "center", color: t.textFaint, fontSize: bodyFont }}>
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Slide-out User Profile Preview Drawer ─── */}
      {previewUser && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="User Profile Preview Drawer"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: "flex",
            justifyContent: "flex-end",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(3px)",
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={() => setPreviewUser(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: isMobile ? "100%" : "420px",
              maxWidth: "100%",
              height: "100%",
              background: isDark ? "#0d1117" : "#ffffff",
              borderLeft: `1px solid ${t.border}`,
              display: "flex",
              flexDirection: "column",
              boxShadow: "-8px 0 30px rgba(0,0,0,0.35)",
              animation: "slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              overflowY: "auto",
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: `1px solid ${t.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc",
              }}
            >
              <div>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: t.accent }}>
                  Quick Preview
                </span>
                <h3 style={{ margin: "4px 0 0", fontSize: "1.1rem", fontWeight: 800, color: t.text }}>
                  User Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewUser(null)}
                aria-label="Close drawer"
                style={{
                  border: `1px solid ${t.border}`,
                  background: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
                  color: t.text,
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  fontWeight: 600,
                }}
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* User Identity */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", borderRadius: "12px", border: `1px solid ${t.border}` }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "14px",
                    background: previewUser.col,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: "1.2rem",
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  {previewUser.av}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: t.text }}>
                    @{previewUser.un}
                  </h4>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        background: (SS[previewUser.status] ?? SS["Inactive"]).bg,
                        color: (SS[previewUser.status] ?? SS["Inactive"]).color,
                        border: `1px solid ${(SS[previewUser.status] ?? SS["Inactive"]).color}30`,
                      }}
                    >
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: (SS[previewUser.status] ?? SS["Inactive"]).dot }} />
                      {previewUser.status}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: t.textMuted, fontWeight: 600 }}>
                      ID: {previewUser.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Details Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ padding: "14px", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc", border: `1px solid ${t.border}` }}>
                  <span style={{ fontSize: "0.7rem", color: t.textFaint, fontWeight: 700, textTransform: "uppercase" }}>
                    Assigned Role
                  </span>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: t.text, marginTop: "4px" }}>
                    {previewUser.role}
                  </div>
                </div>

                <div style={{ padding: "14px", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc", border: `1px solid ${t.border}` }}>
                  <span style={{ fontSize: "0.7rem", color: t.textFaint, fontWeight: 700, textTransform: "uppercase" }}>
                    Account Status
                  </span>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: "#10b981", marginTop: "4px" }}>
                    {previewUser.status}
                  </div>
                </div>
              </div>

              {/* Supported Actions */}
              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUser(null);
                    router.push(`/user/dashboard/users/${previewUser.id}`);
                  }}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#10b981",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                  }}
                >
                  View Full User Details
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPreviewUser(null);
                    router.push("/user/all-user");
                  }}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: `1px solid ${t.border}`,
                    background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
                    color: t.text,
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  Manage in All Users Directory
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyId(previewUser.id)}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: `1px dashed ${t.border}`,
                    background: "transparent",
                    color: t.textMuted,
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  {copied ? "✓ Copied ID to Clipboard" : `Copy User ID: ${previewUser.id}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Row({
  u,
  last,
  t,
  isDark,
  cellPad,
  avatarSize,
  avatarFont,
  nameFont,
  badgeFont,
  badgePad,
  onUserClick,
  onPreview,
}: {
  u: DbUser;
  last: boolean;
  t: Record<string, string>;
  isDark: boolean;
  cellPad: string;
  avatarSize: number;
  avatarFont: string;
  nameFont: string;
  badgeFont: string;
  badgePad: string;
  onUserClick: () => void;
  onPreview: () => void;
}) {
  const [hov, setHov] = useState(false);
  const rs = RS[u.role] ?? { bg: "rgba(148,163,184,0.14)", color: "#475569" };
  const ss = SS[u.status] ?? { bg: "rgba(148,163,184,0.14)", color: "#475569", dot: "#94a3b8" };

  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderBottom: last ? "none" : `1px solid ${t.border}`,
        background: hov ? (isDark ? "rgba(16,185,129,0.06)" : "#f8fafc") : "transparent",
        transition: "background 0.12s",
      }}
    >
      <td style={{ padding: cellPad, cursor: "pointer" }} onClick={onUserClick}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: `${avatarSize}px`,
              height: `${avatarSize}px`,
              borderRadius: "10px",
              background: u.col,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: avatarFont,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {u.av}
          </div>
          <span style={{ fontWeight: 800, color: t.textSub, fontSize: nameFont }}>
            @{u.un}
          </span>
        </div>
      </td>
      <td style={{ padding: cellPad, cursor: "pointer" }} onClick={onUserClick}>
        <span
          style={{
            fontSize: badgeFont,
            fontWeight: 800,
            padding: badgePad,
            borderRadius: "8px",
            background: rs.bg,
            color: rs.color,
            border: `1px solid ${rs.color}30`,
          }}
        >
          {u.role}
        </span>
      </td>
      <td style={{ padding: cellPad, cursor: "pointer" }} onClick={onUserClick}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: badgeFont,
            fontWeight: 800,
            padding: badgePad,
            borderRadius: "20px",
            background: ss.bg,
            color: ss.color,
            border: `1px solid ${ss.color}30`,
          }}
        >
          <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: (ss as { dot?: string }).dot ?? "#94a3b8" }} />
          {u.status}
        </span>
      </td>
      {/* Inline Quick Action Button */}
      <td style={{ padding: cellPad, textAlign: "right" }}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          title="Quick preview user"
          style={{
            border: `1px solid ${t.border}`,
            background: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
            color: t.accent,
            padding: "5px 9px",
            borderRadius: "7px",
            fontSize: "0.74rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            transition: "all 0.15s ease",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Preview
        </button>
      </td>
    </tr>
  );
}
