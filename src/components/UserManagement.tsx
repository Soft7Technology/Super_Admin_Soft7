"use client";
import React, { useState } from "react";
import { useTheme, tokens } from "../context/ThemeContext";

const RS: Record<string,{bg:string;color:string}> = {
  Admin:   {bg:"rgba(59,91,219,0.15)", color:"#4dabf7"},
  Manager: {bg:"rgba(251,191,36,0.12)",color:"#fbbf24"},
  User:    {bg:"rgba(148,163,184,0.1)",color:"#94a3b8"},
};
const SS: Record<string,{bg:string;color:string;dot:string}> = {
  Active:    {bg:"rgba(34,197,94,0.12)", color:"#16a34a",dot:"#4ade80"},
  Inactive:  {bg:"rgba(148,163,184,0.1)",color:"#64748b",dot:"#94a3b8"},
  Suspended: {bg:"rgba(239,68,68,0.10)", color:"#dc2626",dot:"#f87171"},
};
const USERS = [
  {id:"1",un:"james_doe",  role:"Admin",   status:"Active",    av:"JD",col:"linear-gradient(135deg,#3b5bdb,#6741d9)"},
  {id:"2",un:"sara_rivera",role:"Manager", status:"Active",    av:"SR",col:"linear-gradient(135deg,#0ca678,#2f9e44)"},
  {id:"3",un:"tom_king",   role:"User",    status:"Inactive",  av:"TK",col:"linear-gradient(135deg,#f59f00,#e67700)"},
  {id:"4",un:"anya_patel", role:"Admin",   status:"Active",    av:"AP",col:"linear-gradient(135deg,#6741d9,#862e9c)"},
  {id:"5",un:"mike_loren", role:"User",    status:"Suspended", av:"ML",col:"linear-gradient(135deg,#e03131,#c92a2a)"},
];

export default function UserManagement() {
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
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.85rem" }}>
        <thead>
          <tr style={{ background:t.tableHead }}>
            {["USERNAME","ROLE","STATUS"].map(h=>(
              <th key={h} style={{ padding:"10px 20px", textAlign:"left", fontSize:"0.68rem", color:t.textFaint, letterSpacing:"0.08em", fontWeight:700, borderBottom:`1px solid ${t.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {USERS.map((u,i) => <Row key={u.id} u={u} last={i===USERS.length-1} t={t} />)}
        </tbody>
      </table>
    </div>
  );
}

function Row({ u, last, t }: any) {
  const [hov, setHov] = useState(false);
  const rs = RS[u.role]; const ss = SS[u.status];
  return (
    <tr onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
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
          <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:ss.dot }} />{u.status}
        </span>
      </td>
    </tr>
  );
}
