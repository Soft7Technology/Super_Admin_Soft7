"use client";
import React, { useState } from "react";
import { useTheme, tokens } from "../context/ThemeContext";

const ST: Record<string,{bg:string;color:string;dot:string}> = {
  Active:   {bg:"rgba(34,197,94,0.12)",  color:"#16a34a", dot:"#4ade80"},
  Inactive: {bg:"rgba(148,163,184,0.1)", color:"#64748b", dot:"#94a3b8"},
  Trial:    {bg:"rgba(251,191,36,0.12)", color:"#d97706", dot:"#fbbf24"},
};
const DATA = [
  {id:"1",name:"Acme Corp",   ini:"AC",col:"linear-gradient(135deg,#3b5bdb,#6741d9)",status:"Active",  plan:"Enterprise",users:320},
  {id:"2",name:"Nexus Ltd",   ini:"NX",col:"linear-gradient(135deg,#0ca678,#2f9e44)",status:"Active",  plan:"Pro",       users:148},
  {id:"3",name:"SkyLine Inc", ini:"SK",col:"linear-gradient(135deg,#f59f00,#e67700)",status:"Trial",   plan:"Starter",   users:42 },
  {id:"4",name:"Vertex Co",   ini:"VT",col:"linear-gradient(135deg,#e03131,#c92a2a)",status:"Inactive",plan:"Basic",     users:87 },
  {id:"5",name:"Zenith Group",ini:"ZN",col:"linear-gradient(135deg,#6741d9,#862e9c)",status:"Active",  plan:"Enterprise",users:510},
];

export default function CompanyOverview() {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  return (
    <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:"14px", overflow:"hidden", transition:"background 0.3s,border-color 0.3s" }}>
      <div style={{ padding:"18px 20px 14px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontWeight:700, fontSize:"0.95rem", color:t.text }}>Company Overview</span>
        <span style={{ fontSize:"0.8rem", color:t.accent, cursor:"pointer", fontWeight:600, display:"flex", alignItems:"center", gap:"4px" }}>
          View All <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </span>
      </div>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.85rem" }}>
        <thead>
          <tr style={{ background:t.tableHead }}>
            {["COMPANY NAME","STATUS","PLAN","USERS"].map(h=>(
              <th key={h} style={{ padding:"10px 20px", textAlign:"left", fontSize:"0.68rem", color:t.textFaint, letterSpacing:"0.08em", fontWeight:700, borderBottom:`1px solid ${t.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DATA.map((co,i) => <Row key={co.id} co={co} last={i===DATA.length-1} t={t} />)}
        </tbody>
      </table>
    </div>
  );
}

function Row({ co, last, t }: any) {
  const [hov, setHov] = useState(false);
  const s = ST[co.status];
  return (
    <tr onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ borderBottom:last?"none":`1px solid ${t.border}`, background:hov?t.rowHover:"transparent", transition:"background 0.12s", cursor:"pointer" }}>
      <td style={{ padding:"13px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ width:"30px", height:"30px", borderRadius:"8px", background:co.col, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:"0.68rem", color:"#fff", flexShrink:0 }}>{co.ini}</div>
          <span style={{ fontWeight:600, color:t.textSub }}>{co.name}</span>
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
