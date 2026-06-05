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
  Active:   { bg:"rgba(16,185,129,0.14)", color:"#059669", dot:"#10b981" },
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

  return (
    <div style={{ background:t.surface, border:`2px solid ${t.border}`, borderRadius:"16px", overflow:"hidden", boxShadow:"0 8px 24px rgba(16,185,129,0.08)", transition:"background 0.3s,border-color 0.3s", width:"100%", minWidth:0 }}>
      <div style={{ padding:"24px 26px 20px", borderBottom:`2px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:"14px", flexWrap:"wrap" }}>
        <span style={{ fontWeight:800, fontSize:"1.18rem", color:t.text }}>Company Overview</span>
<span
  onClick={onViewAll}
  style={{
    fontSize:"0.95rem",
    color:t.accent,
    cursor:"pointer",
    fontWeight:800,
    display:"flex",
    alignItems:"center",
    gap:"6px"
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
    <polyline points="9 18 15 12 9 6"/>
  </svg>
</span>
      </div>
      {loading ? (
        <div style={{ padding:"30px", textAlign:"center", color:t.textFaint, fontSize:"1rem" }}>Loading...</div>
      ) : error ? (
        <div style={{ padding:"30px", textAlign:"center", color:t.textFaint, fontSize:"1rem" }}>{error}</div>
      ) : (
        <div style={{ width:"100%", overflowX:"auto" }}>
          <table style={{ width:"100%", minWidth:"620px", tableLayout:"fixed", borderCollapse:"collapse", fontSize:"1rem" }}>
            <thead>
              <tr style={{ background:t.tableHead }}>
                {["COMPANY NAME","STATUS","PLAN","USERS"].map(h => (
                  <th key={h} style={{ padding:"15px 24px", textAlign:"left", fontSize:"0.78rem", color:t.textFaint, letterSpacing:"0.08em", fontWeight:800, borderBottom:`2px solid ${t.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companies.map((co, i) => <Row key={co.id} co={co} last={i === companies.length - 1} t={t} onCompanyClick={onCompanyClick} />)}
              {companies.length === 0 && (
                <tr><td colSpan={4} style={{ padding:"26px", textAlign:"center", color:t.textFaint, fontSize:"1rem" }}>No companies found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ co, last, t, onCompanyClick }: { co: Company; last: boolean; t: Record<string, string>; onCompanyClick?: (company: Company) => void }) {
  const [hov, setHov] = useState(false);
  const s = ST[co.status] ?? ST["Inactive"];
  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ borderBottom:last?"none":`1px solid ${t.border}`, background:hov?t.rowHover:"transparent", transition:"background 0.12s", cursor:"pointer" }}>
      <td style={{ padding:"18px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"13px" }}>
          <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:co.col, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:"0.8rem", color:"#fff", flexShrink:0 }}>{co.ini}</div>
          <span style={{ fontWeight:800, color:t.textSub, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{co.name}</span>
        </div>
      </td>
      <td style={{ padding:"18px 24px" }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:"7px", padding:"6px 12px", borderRadius:"20px", fontSize:"0.88rem", fontWeight:800, background:s.bg, color:s.color, border:"1px solid rgba(16,185,129,0.18)" }}>
          <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:s.dot }} />{co.status}
        </span>
      </td>
      <td style={{ padding:"18px 24px" }}>
        <span style={{ fontSize:"0.9rem", color:t.textMuted, background:t.surface2, padding:"6px 12px", borderRadius:"8px", border:`1px solid ${t.border}`, fontWeight:700 }}>{co.plan}</span>
      </td>
      <td style={{ padding:"18px 24px", color:t.textSub, fontWeight:800 }}>{co.users}</td>
    </tr>
  );
}
