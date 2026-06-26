"use client";
import React, { useState, useEffect } from "react";
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
        <span style={{ fontWeight:800, fontSize: titleSize, color:t.text }}>Company Overview</span>
       <span onClick={onViewAll} style={{ fontSize: viewAllSize, color:t.accent, cursor:"pointer", fontWeight:800, display:"flex", alignItems:"center", gap:"6px" }}>
  View All <svg width={isSmall ? "12" : "14"} height={isSmall ? "12" : "14"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </span>
      </div>
      {loading ? (
        <div style={{ padding:"30px", textAlign:"center", color:t.textFaint, fontSize: bodyFont }}>Loading...</div>
      ) : error ? (
        <div style={{ padding:"30px", textAlign:"center", color:t.textFaint, fontSize: bodyFont }}>{error}</div>
      ) : isMobile ? (
        /* ─── Card layout for small screens ─── */
        <div style={{ padding:"10px" }}>
          {companies.length === 0 && (
            <div style={{ padding:"20px", textAlign:"center", color:t.textFaint, fontSize: bodyFont }}>No companies found</div>
          )}
          {companies.map((co, i) => {
            const s = ST[co.status] ?? ST["Inactive"];
            return (
              <div
                key={co.id}
                onClick={() => onCompanyClick?.(co)}
                style={{
                  padding:"12px 14px",
                  borderRadius:"10px",
                  border:`1px solid ${t.border}`,
                  background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                  marginBottom: i < companies.length - 1 ? "8px" : 0,
                  cursor:"pointer",
                  transition:"background 0.12s",
                }}
              >
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
                  <div style={{ width:"30px", height:"30px", borderRadius:"8px", background:co.col, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:"0.65rem", color:"#fff", flexShrink:0 }}>{co.ini}</div>
                  <span style={{ fontWeight:800, color:t.textSub, fontSize:"0.85rem" }}>{co.name}</span>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", alignItems:"center" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:"4px", padding:"3px 8px", borderRadius:"14px", fontSize:"0.7rem", fontWeight:700, background:s.bg, color:s.color, border:"1px solid rgba(16,185,129,0.18)" }}>
                    <span style={{ width:"4px", height:"4px", borderRadius:"50%", background:s.dot }} />{co.status}
                  </span>
                  <span style={{ fontSize:"0.7rem", color:t.textMuted, background:t.surface2, padding:"3px 8px", borderRadius:"6px", border:`1px solid ${t.border}`, fontWeight:700 }}>{co.plan}</span>
                  <span style={{ fontSize:"0.7rem", color:t.textSub, fontWeight:800, marginLeft:"auto" }}>👥 {co.users}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── Table layout for larger screens ─── */
        <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
          <table style={{ width:"100%", minWidth: isSmall ? "440px" : "auto", tableLayout:"fixed", borderCollapse:"collapse", fontSize: bodyFont }}>
            <thead>
              <tr style={{ background:t.tableHead }}>
                {["COMPANY NAME","STATUS","PLAN","USERS"].map(h => (
                  <th key={h} style={{ padding: cellPadVal, textAlign:"left", fontSize: thFontSize, color:t.textFaint, letterSpacing:"0.08em", fontWeight:800, borderBottom:`2px solid ${t.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companies.map((co, i) => <Row key={co.id} co={co} last={i === companies.length - 1} t={t} cellPad={cellPadVal} avatarSize={avatarSize} avatarFont={avatarFont} nameFont={nameFont} badgeFont={badgeFont} badgePad={badgePad} onCompanyClick={onCompanyClick} />)}
              {companies.length === 0 && (
                <tr><td colSpan={4} style={{ padding:"26px", textAlign:"center", color:t.textFaint, fontSize: bodyFont }}>No companies found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ co, last, t, cellPad, avatarSize, avatarFont, nameFont, badgeFont, badgePad, onCompanyClick }: {
  co: Company; last: boolean; t: Record<string, string>;
  cellPad: string; avatarSize: number; avatarFont: string; nameFont: string; badgeFont: string; badgePad: string;
  onCompanyClick?: (company: Company) => void;
}) {
  const [hov, setHov] = useState(false);
  const s = ST[co.status] ?? ST["Inactive"];
  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => onCompanyClick?.(co)}
      style={{ borderBottom:last?"none":`1px solid ${t.border}`, background:hov?t.rowHover:"transparent", transition:"background 0.12s", cursor:"pointer" }}>
      <td style={{ padding:cellPad }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ width:`${avatarSize}px`, height:`${avatarSize}px`, borderRadius:"10px", background:co.col, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize: avatarFont, color:"#fff", flexShrink:0 }}>{co.ini}</div>
          <span style={{ fontWeight:800, color:t.textSub, fontSize: nameFont }}>{co.name}</span>
        </div>
      </td>
      <td style={{ padding:cellPad }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:"5px", padding: badgePad, borderRadius:"20px", fontSize: badgeFont, fontWeight:800, background:s.bg, color:s.color, border:"1px solid rgba(16,185,129,0.18)" }}>
          <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:s.dot }} />{co.status}
        </span>
      </td>
      <td style={{ padding:cellPad }}>
        <span style={{ fontSize: badgeFont, color:t.textMuted, background:t.surface2, padding: badgePad, borderRadius:"8px", border:`1px solid ${t.border}`, fontWeight:700 }}>{co.plan}</span>
      </td>
      <td style={{ padding:cellPad, color:t.textSub, fontWeight:800, fontSize: nameFont }}>{co.users}</td>
    </tr>
  );
}
