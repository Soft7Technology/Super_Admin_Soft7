"use client";
import React, { useState } from "react";
import { useTheme, tokens } from "../context/ThemeContext";

interface Company {
  id:     string;
  name:   string;
  ini:    string;
  col:    string;
  status: string;
  plan:   string;
  users:  number;
}

const ST: Record<string, { bg: string; color: string; dot: string }> = {
  Active:   { bg:"rgba(34,197,94,0.12)",  color:"#16a34a", dot:"#4ade80" },
  Inactive: { bg:"rgba(148,163,184,0.1)", color:"#64748b", dot:"#94a3b8" },
  Trial:    { bg:"rgba(251,191,36,0.12)", color:"#d97706", dot:"#fbbf24" },
  Suspended:{ bg:"rgba(239,68,68,0.10)",  color:"#dc2626", dot:"#f87171" },
};

export default function CompanyOverview({
  companies = [],
  loading = false,
  error = null,
  title = "Company Overview",
  showViewAll = true,
  onCompanyClick,
}: {
  companies?: Company[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  showViewAll?: boolean;
  onCompanyClick?: (company: Company) => void;
}) {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;

  return (
    <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:"14px", overflow:"hidden", transition:"background 0.3s,border-color 0.3s" }}>
      <div style={{ padding:"18px 20px 14px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontWeight:700, fontSize:"0.95rem", color:t.text }}>{title}</span>
        {showViewAll && (
          <span style={{ fontSize:"0.8rem", color:t.accent, cursor:"pointer", fontWeight:600, display:"flex", alignItems:"center", gap:"4px" }}>
            View All <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </span>
        )}
      </div>
      {loading ? (
        <div style={{ padding:"24px", textAlign:"center", color:t.textFaint, fontSize:"0.85rem" }}>Loading...</div>
      ) : error ? (
        <div style={{ padding:"24px", textAlign:"center", color:t.textFaint, fontSize:"0.85rem" }}>{error}</div>
      ) : (
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.85rem" }}>
          <thead>
            <tr style={{ background:t.tableHead }}>
              {["COMPANY NAME","STATUS","PLAN","USERS"].map(h => (
                <th key={h} style={{ padding:"10px 20px", textAlign:"left", fontSize:"0.68rem", color:t.textFaint, letterSpacing:"0.08em", fontWeight:700, borderBottom:`1px solid ${t.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {companies.map((co, i) => <Row key={co.id} co={co} last={i === companies.length - 1} t={t} onCompanyClick={onCompanyClick} />)}
            {companies.length === 0 && (
              <tr><td colSpan={4} style={{ padding:"20px", textAlign:"center", color:t.textFaint, fontSize:"0.85rem" }}>No companies found</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Row({ co, last, t, onCompanyClick }: { co: Company; last: boolean; t: Record<string, string>; onCompanyClick?: (company: Company) => void }) {
  const [hov, setHov] = useState(false);
  const s = ST[co.status] ?? ST["Inactive"];
  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ borderBottom:last?"none":`1px solid ${t.border}`, background:hov?t.rowHover:"transparent", transition:"background 0.12s" }}>
      <td style={{ padding:"13px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ width:"30px", height:"30px", borderRadius:"8px", background:co.col, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:"0.68rem", color:"#fff", flexShrink:0 }}>{co.ini}</div>
          {onCompanyClick ? (
            <button
              onClick={() => onCompanyClick(co)}
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
                margin: 0,
                color: t.accent,
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {co.name}
            </button>
          ) : (
            <span style={{ fontWeight:600, color:t.textSub }}>{co.name}</span>
          )}
        </div>
      </td>
      <td style={{ padding:"13px 20px" }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"4px 10px", borderRadius:"20px", fontSize:"0.75rem", fontWeight:600, background:s.bg, color:s.color }}>
          <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:s.dot }} />{co.status}
        </span>
      </td>
      <td style={{ padding:"13px 20px" }}>
        <span style={{ fontSize:"0.78rem", color:t.textMuted, background:t.surface2, padding:"3px 10px", borderRadius:"6px", border:`1px solid ${t.border}` }}>{co.plan}</span>
      </td>
      <td style={{ padding:"13px 20px", color:t.textSub, fontWeight:500 }}>{co.users}</td>
    </tr>
  );
}
