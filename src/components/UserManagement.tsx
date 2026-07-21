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
  ADMIN:   { bg:"rgba(16,185,129,0.14)", color:"#059669" },
  Admin:   { bg:"rgba(16,185,129,0.14)", color:"#059669" },
  Manager: { bg:"rgba(251,191,36,0.12)", color:"#fbbf24" },
  USER:    { bg:"rgba(148,163,184,0.1)", color:"#94a3b8" },
  User:    { bg:"rgba(148,163,184,0.1)", color:"#94a3b8" },
};
const SS: Record<string, { bg: string; color: string; dot: string }> = {
  ACTIVE:    { bg:"rgba(16,185,129,0.14)", color:"#059669", dot:"#10b981" },
  Active:    { bg:"rgba(16,185,129,0.14)", color:"#059669", dot:"#10b981" },
  INACTIVE:  { bg:"rgba(148,163,184,0.1)", color:"#64748b", dot:"#94a3b8" },
  Inactive:  { bg:"rgba(148,163,184,0.1)", color:"#64748b", dot:"#94a3b8" },
  PENDING:   { bg:"rgba(251,191,36,0.12)", color:"#d97706", dot:"#fbbf24" },
  SUSPENDED: { bg:"rgba(239,68,68,0.10)",  color:"#dc2626", dot:"#f87171" },
  Suspended: { bg:"rgba(239,68,68,0.10)",  color:"#dc2626", dot:"#f87171" },
};

const AVATAR_PALETTE = [
  "linear-gradient(135deg,#10b981,#14b8a6)",
  "linear-gradient(135deg,#059669,#0d9488)",
  "linear-gradient(135deg,#34d399,#10b981)",
  "linear-gradient(135deg,#0f766e,#14b8a6)",
  "linear-gradient(135deg,#10b981,#059669)",
  "linear-gradient(135deg,#14b8a6,#0d9488)",
];

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
  const width = useWindowWidth();
  const isMobile  = width <= 640;
  const isSmall   = width <= 1000;
  const isMedium  = width <= 1300;

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

  return (
    <div style={{ background:t.surface, border:`2px solid ${t.border}`, borderRadius: isSmall ? "12px" : "16px", overflow:"hidden", boxShadow:"0 8px 24px rgba(16,185,129,0.08)", transition:"background 0.3s,border-color 0.3s" }}>
      <div style={{ padding: headerPad, borderBottom:`2px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontWeight:800, fontSize: titleSize, color:t.text }}>User Management</span>
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
        <div style={{ padding:"30px", textAlign:"center", color:t.textFaint, fontSize: bodyFont }}>Loading...</div>
      ) : error ? (
        <div style={{ padding:"30px", textAlign:"center", color:t.textFaint, fontSize: bodyFont }}>{error}</div>
      ) : isMobile ? (
        /* ─── Card layout for small screens ─── */
        <div style={{ padding:"10px" }}>
          {users.length === 0 && (
            <div style={{ padding:"20px", textAlign:"center", color:t.textFaint, fontSize: bodyFont }}>No users found</div>
          )}
          {users.map((u, i) => {
            const rs = RS[u.role]   ?? { bg:"rgba(148,163,184,0.1)", color:"#94a3b8" };
            const ss = SS[u.status] ?? { bg:"rgba(148,163,184,0.1)", color:"#64748b", dot:"#94a3b8" };
            return (
              <div
                key={u.id}
                onClick={() => onUserClick?.(u)}
                style={{
                  padding:"12px 14px",
                  borderRadius:"10px",
                  border:`1px solid ${t.border}`,
                  background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                  marginBottom: i < users.length - 1 ? "8px" : 0,
                  cursor:"pointer",
                  transition:"background 0.12s",
                }}
              >
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
                  <div style={{ width:"30px", height:"30px", borderRadius:"8px", background:u.col, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:"0.65rem", color:"#fff", flexShrink:0 }}>{u.av}</div>
                  <span style={{ fontWeight:800, color:t.textSub, fontSize:"0.85rem" }}>@{u.un}</span>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", alignItems:"center" }}>
                  <span style={{ fontSize:"0.7rem", fontWeight:700, padding:"3px 8px", borderRadius:"6px", background:rs.bg, color:rs.color, border:"1px solid rgba(16,185,129,0.18)" }}>{u.role}</span>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:"4px", fontSize:"0.7rem", fontWeight:700, padding:"3px 8px", borderRadius:"14px", background:ss.bg, color:ss.color, border:"1px solid rgba(16,185,129,0.18)" }}>
                    <span style={{ width:"4px", height:"4px", borderRadius:"50%", background:ss.dot }} />{u.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── Table layout for larger screens ─── */
        <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
          <table style={{ width:"100%", minWidth: isSmall ? "380px" : "auto", borderCollapse:"collapse", fontSize: bodyFont }}>
            <thead>
              <tr style={{ background:t.tableHead }}>
                {["USERNAME","ROLE","STATUS"].map(h => (
                  <th key={h} style={{ padding: cellPadVal, textAlign:"left", fontSize: thFontSize, color:t.textFaint, letterSpacing:"0.08em", fontWeight:800, borderBottom:`2px solid ${t.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => <Row key={u.id} u={u} last={i === users.length - 1} t={t} cellPad={cellPadVal} avatarSize={avatarSize} avatarFont={avatarFont} nameFont={nameFont} badgeFont={badgeFont} badgePad={badgePad} onUserClick={onUserClick} />)}
              {users.length === 0 && (
                <tr><td colSpan={3} style={{ padding:"26px", textAlign:"center", color:t.textFaint, fontSize: bodyFont }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ u, last, t, cellPad, avatarSize, avatarFont, nameFont, badgeFont, badgePad, onUserClick }: {
  u: DbUser; last: boolean; t: Record<string, string>;
  cellPad: string; avatarSize: number; avatarFont: string; nameFont: string; badgeFont: string; badgePad: string;
  onUserClick?: (user: DbUser) => void;
}) {
  const [hov, setHov] = useState(false);
  const rs = RS[u.role]   ?? { bg:"rgba(148,163,184,0.1)", color:"#94a3b8" };
  const ss = SS[u.status] ?? { bg:"rgba(148,163,184,0.1)", color:"#64748b", dot:"#94a3b8" };
  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => onUserClick?.(u)}
      style={{ borderBottom:last?"none":`1px solid ${t.border}`, background:hov?t.rowHover:"transparent", transition:"background 0.12s", cursor:"pointer" }}>
      <td style={{ padding:cellPad }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ width:`${avatarSize}px`, height:`${avatarSize}px`, borderRadius:"10px", background:u.col, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize: avatarFont, color:"#fff", flexShrink:0 }}>{u.av}</div>
          <span style={{ fontWeight:800, color:t.textSub, fontSize: nameFont }}>@{u.un}</span>
        </div>
      </td>
      <td style={{ padding:cellPad }}>
        <span style={{ fontSize: badgeFont, fontWeight:800, padding: badgePad, borderRadius:"8px", background:rs.bg, color:rs.color, border:"1px solid rgba(16,185,129,0.18)" }}>{u.role}</span>
      </td>
      <td style={{ padding:cellPad }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:"5px", fontSize: badgeFont, fontWeight:800, padding: badgePad, borderRadius:"20px", background:ss.bg, color:ss.color, border:"1px solid rgba(16,185,129,0.18)" }}>
          <span style={{ width:"4px", height:"4px", borderRadius:"50%", background:(ss as { dot?: string }).dot ?? "#94a3b8" }} />{u.status}
        </span>
      </td>
    </tr>
  );
}
