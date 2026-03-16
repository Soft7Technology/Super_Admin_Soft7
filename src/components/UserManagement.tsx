"use client";
import React, { useState } from "react";
import { useTheme, tokens } from "../context/ThemeContext";

interface DbUser {
  id:     string;
  un:     string;
  role:   string;
  status: string;
  av:     string;
  col:    string;
}

const RS: Record<string, { bg: string; color: string }> = {
  ADMIN:   { bg:"rgba(59,91,219,0.15)",  color:"#4dabf7" },
  Admin:   { bg:"rgba(59,91,219,0.15)",  color:"#4dabf7" },
  Manager: { bg:"rgba(251,191,36,0.12)", color:"#fbbf24" },
  USER:    { bg:"rgba(148,163,184,0.1)", color:"#94a3b8" },
  User:    { bg:"rgba(148,163,184,0.1)", color:"#94a3b8" },
};
const SS: Record<string, { bg: string; color: string; dot: string }> = {
  ACTIVE:    { bg:"rgba(34,197,94,0.12)",  color:"#16a34a", dot:"#4ade80" },
  Active:    { bg:"rgba(34,197,94,0.12)",  color:"#16a34a", dot:"#4ade80" },
  INACTIVE:  { bg:"rgba(148,163,184,0.1)", color:"#64748b", dot:"#94a3b8" },
  Inactive:  { bg:"rgba(148,163,184,0.1)", color:"#64748b", dot:"#94a3b8" },
  PENDING:   { bg:"rgba(251,191,36,0.12)", color:"#d97706", dot:"#fbbf24" },
  SUSPENDED: { bg:"rgba(239,68,68,0.10)",  color:"#dc2626", dot:"#f87171" },
  Suspended: { bg:"rgba(239,68,68,0.10)",  color:"#dc2626", dot:"#f87171" },
};

const AVATAR_PALETTE = [
  "linear-gradient(135deg,#3b5bdb,#6741d9)",
  "linear-gradient(135deg,#0ca678,#2f9e44)",
  "linear-gradient(135deg,#f59f00,#e67700)",
  "linear-gradient(135deg,#6741d9,#862e9c)",
  "linear-gradient(135deg,#e03131,#c92a2a)",
  "linear-gradient(135deg,#1971c2,#1c7ed6)",
];

export default function UserManagement({
  users = [],
  loading = false,
  error = null,
}: {
  users?: DbUser[];
  loading?: boolean;
  error?: string | null;
}) {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;

  return (
    <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:"14px", overflow:"hidden", transition:"background 0.3s,border-color 0.3s" }}>
      <div style={{ padding:"18px 20px 14px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontWeight:700, fontSize:"0.95rem", color:t.text }}>User Management</span>
        <span style={{ fontSize:"0.8rem", color:t.accent, cursor:"pointer", fontWeight:600, display:"flex", alignItems:"center", gap:"4px" }}>
          View All <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </span>
      </div>
      {loading ? (
        <div style={{ padding:"24px", textAlign:"center", color:t.textFaint, fontSize:"0.85rem" }}>Loading...</div>
      ) : error ? (
        <div style={{ padding:"24px", textAlign:"center", color:t.textFaint, fontSize:"0.85rem" }}>{error}</div>
      ) : (
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.85rem" }}>
          <thead>
            <tr style={{ background:t.tableHead }}>
              {["USERNAME","ROLE","STATUS"].map(h => (
                <th key={h} style={{ padding:"10px 20px", textAlign:"left", fontSize:"0.68rem", color:t.textFaint, letterSpacing:"0.08em", fontWeight:700, borderBottom:`1px solid ${t.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => <Row key={u.id} u={u} last={i === users.length - 1} t={t} />)}
            {users.length === 0 && (
              <tr><td colSpan={3} style={{ padding:"20px", textAlign:"center", color:t.textFaint, fontSize:"0.85rem" }}>No users found</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Row({ u, last, t }: { u: DbUser; last: boolean; t: Record<string, string> }) {
  const [hov, setHov] = useState(false);
  const rs = RS[u.role]   ?? { bg:"rgba(148,163,184,0.1)", color:"#94a3b8" };
  const ss = SS[u.status] ?? { bg:"rgba(148,163,184,0.1)", color:"#64748b", dot:"#94a3b8" };
  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ borderBottom:last?"none":`1px solid ${t.border}`, background:hov?t.rowHover:"transparent", transition:"background 0.12s", cursor:"pointer" }}>
      <td style={{ padding:"12px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ width:"30px", height:"30px", borderRadius:"8px", background:u.col, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:"0.68rem", color:"#fff", flexShrink:0 }}>{u.av}</div>
          <span style={{ fontWeight:500, color:t.textSub }}>@{u.un}</span>
        </div>
      </td>
      <td style={{ padding:"12px 20px" }}>
        <span style={{ fontSize:"0.75rem", fontWeight:600, padding:"3px 10px", borderRadius:"6px", background:rs.bg, color:rs.color }}>{u.role}</span>
      </td>
      <td style={{ padding:"12px 20px" }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:"5px", fontSize:"0.75rem", fontWeight:600, padding:"3px 10px", borderRadius:"20px", background:ss.bg, color:ss.color }}>
          <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:(ss as { dot?: string }).dot ?? "#94a3b8" }} />{u.status}
        </span>
      </td>
    </tr>
  );
}
