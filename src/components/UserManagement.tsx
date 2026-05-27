"use client";
import React, { useState } from "react";
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

export default function UserManagement({
  users = [],
  loading = false,
  error = null,
  title = "User Management",
  showViewAll = true,
  onUserClick,
}: {
  users?: DbUser[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  showViewAll?: boolean;
  onUserClick?: (user: DbUser) => void;
}) {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const router = useRouter();

  return (
    <div style={{ background:t.surface, border:`2px solid ${t.border}`, borderRadius:"16px", overflow:"hidden", boxShadow:"0 8px 24px rgba(16,185,129,0.08)", transition:"background 0.3s,border-color 0.3s" }}>
      <div style={{ padding:"24px 26px 20px", borderBottom:`2px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontWeight:800, fontSize:"1.18rem", color:t.text }}>User Management</span>
        <button
  onClick={() => router.push("/user/all-user")}
  style={{
    fontSize: "0.95rem",
    color: t.accent,
    cursor: "pointer",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    border: "none",
    background: "transparent",
  }}
>
  View All
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
</button>
      </div>
      {loading ? (
        <div style={{ padding:"30px", textAlign:"center", color:t.textFaint, fontSize:"1rem" }}>Loading...</div>
      ) : error ? (
        <div style={{ padding:"30px", textAlign:"center", color:t.textFaint, fontSize:"1rem" }}>{error}</div>
      ) : (
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"1rem" }}>
          <thead>
            <tr style={{ background:t.tableHead }}>
              {["USERNAME","ROLE","STATUS"].map(h => (
                <th key={h} style={{ padding:"15px 24px", textAlign:"left", fontSize:"0.78rem", color:t.textFaint, letterSpacing:"0.08em", fontWeight:800, borderBottom:`2px solid ${t.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => <Row key={u.id} u={u} last={i === users.length - 1} t={t} onUserClick={onUserClick} />)}
            {users.length === 0 && (
              <tr><td colSpan={3} style={{ padding:"26px", textAlign:"center", color:t.textFaint, fontSize:"1rem" }}>No users found</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Row({ u, last, t, onUserClick }: { u: DbUser; last: boolean; t: Record<string, string>; onUserClick?: (user: DbUser) => void }) {
  const [hov, setHov] = useState(false);
  const rs = RS[u.role]   ?? { bg:"rgba(148,163,184,0.1)", color:"#94a3b8" };
  const ss = SS[u.status] ?? { bg:"rgba(148,163,184,0.1)", color:"#64748b", dot:"#94a3b8" };
  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ borderBottom:last?"none":`1px solid ${t.border}`, background:hov?t.rowHover:"transparent", transition:"background 0.12s", cursor:"pointer" }}>
      <td style={{ padding:"18px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"13px" }}>
          <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:u.col, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:"0.8rem", color:"#fff", flexShrink:0 }}>{u.av}</div>
          <span style={{ fontWeight:800, color:t.textSub }}>@{u.un}</span>
        </div>
      </td>
      <td style={{ padding:"18px 24px" }}>
        <span style={{ fontSize:"0.88rem", fontWeight:800, padding:"6px 12px", borderRadius:"8px", background:rs.bg, color:rs.color, border:"1px solid rgba(16,185,129,0.18)" }}>{u.role}</span>
      </td>
      <td style={{ padding:"18px 24px" }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:"7px", fontSize:"0.88rem", fontWeight:800, padding:"6px 12px", borderRadius:"20px", background:ss.bg, color:ss.color, border:"1px solid rgba(16,185,129,0.18)" }}>
          <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:(ss as { dot?: string }).dot ?? "#94a3b8" }} />{u.status}
        </span>
      </td>
    </tr>
  );
}
