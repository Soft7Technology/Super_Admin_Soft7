"use client";
import React from "react";
import { useTheme, tokens } from "../../context/ThemeContext";

const SEV: Record<string,{bg:string;color:string;icon:string}> = {
  success:{bg:"rgba(34,197,94,0.1)", color:"#16a34a",icon:"✓"},
  warn:   {bg:"rgba(251,191,36,0.1)",color:"#d97706", icon:"!"},
  danger: {bg:"rgba(239,68,68,0.1)", color:"#dc2626", icon:"✕"},
  info:   {bg:"rgba(59,130,246,0.1)",color:"#2563eb", icon:"i"},
};
const LOGS = [
  {id:"1",msg:"New company SkyLine Inc registered",      actor:"Super Admin",time:"2 mins ago", sev:"success"},
  {id:"2",msg:"Subscription plan changed for Vertex Co", actor:"Admin",      time:"15 mins ago",sev:"warn"},
  {id:"3",msg:"User Anya Patel role updated to Admin",   actor:"Super Admin",time:"1 hr ago",   sev:"info"},
  {id:"4",msg:"Failed login attempt from unknown IP",    actor:"System",     time:"3 hrs ago",  sev:"danger"},
  {id:"5",msg:"Bulk export of user data completed",      actor:"Admin",      time:"6 hrs ago",  sev:"success"},
];

export default function AuditLogs() {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  return (
    <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:"14px", overflow:"hidden", transition:"background 0.3s,border-color 0.3s" }}>
      <div style={{ padding:"18px 20px 14px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontWeight:700, fontSize:"0.95rem", color:t.text }}>Activity Logs</span>
        <span style={{ fontSize:"0.8rem", color:t.accent, cursor:"pointer", fontWeight:600, display:"flex", alignItems:"center", gap:"4px" }}>
          View All <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </span>
      </div>
      <div>
        {LOGS.map((log,i) => {
          const s = SEV[log.sev];
          return (
            <div key={log.id} style={{ padding:"12px 20px", display:"flex", alignItems:"flex-start", gap:"12px", borderBottom:i<LOGS.length-1?`1px solid ${t.border}`:"none" }}>
              <div style={{ width:"28px", height:"28px", borderRadius:"8px", background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", color:s.color, fontSize:"0.78rem", fontWeight:800, flexShrink:0, marginTop:"1px" }}>{s.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"0.85rem", color:t.textSub, fontWeight:500, lineHeight:1.4 }}>{log.msg}</div>
                <div style={{ fontSize:"0.72rem", color:t.textFaint, marginTop:"3px" }}>{log.time} · {log.actor}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
