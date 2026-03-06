"use client";
import React, { useState } from "react";
import { useTheme, tokens } from "../context/ThemeContext";

export default function Topbar({ title="Dashboard", adminName="Admin" }: { title?:string; adminName?:string }) {
  const { isDark, toggleTheme } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const [sf, setSf] = useState(false);
  const [dd, setDd] = useState(false);

  return (
    <header style={{ height:"64px", background:t.surface, borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", padding:"0 24px", gap:"16px", position:"sticky", top:0, zIndex:50, transition:"background 0.3s,border-color 0.3s" }}>
      <div style={{ fontWeight:700, fontSize:"1.05rem", color:t.text, minWidth:"120px", flexShrink:0, transition:"color 0.3s" }}>{title}</div>

      {/* Search */}
      <div style={{ flex:1, maxWidth:"420px", background:t.inputBg, border:`1px solid ${sf?t.accent:t.border}`, borderRadius:"10px", display:"flex", alignItems:"center", gap:"10px", padding:"0 14px", height:"40px", transition:"all 0.2s", boxShadow:sf?`0 0 0 3px ${t.accentBg}`:"none" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.textFaint} strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" placeholder="Search users, campaigns, leads..." onFocus={()=>setSf(true)} onBlur={()=>setSf(false)}
          style={{ background:"none", border:"none", outline:"none", color:t.textSub, fontSize:"0.875rem", fontFamily:"inherit", width:"100%" }} />
      </div>

      <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"8px" }}>
        {/* Theme toggle button */}
        <button onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{ width:"40px", height:"40px", borderRadius:"10px", background:t.iconBox, border:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.2s" }}>
          {isDark
            ? /* Sun */ <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            : /* Moon */ <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6741d9" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>

        {/* Bell */}
        <div style={{ position:"relative" }}>
          <div style={{ width:"36px", height:"36px", borderRadius:"8px", background:t.iconBox, border:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:t.textMuted }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>
          <span style={{ position:"absolute", top:"7px", right:"7px", width:"7px", height:"7px", borderRadius:"50%", background:"#f03e3e", border:`2px solid ${t.surface}` }} />
        </div>

        <div style={{ width:"1px", height:"24px", background:t.border }} />

        {/* Avatar */}
        <div style={{ position:"relative" }}>
          <div onClick={()=>setDd(p=>!p)} style={{ display:"flex", alignItems:"center", gap:"10px", cursor:"pointer", padding:"5px 10px 5px 5px", borderRadius:"10px", background:t.iconBox, border:`1px solid ${t.border}`, transition:"all 0.15s" }}>
            <div style={{ width:"32px", height:"32px", borderRadius:"8px", background:"linear-gradient(135deg,#3b5bdb,#6741d9)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:"0.78rem", color:"#fff" }}>
              {adminName.slice(0,2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize:"0.82rem", fontWeight:600, color:t.text, lineHeight:1.2, transition:"color 0.3s" }}>{adminName}</div>
              <div style={{ fontSize:"0.65rem", color:t.accent, fontWeight:600 }}>Administrator</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.textFaint} strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          {dd && (
            <div style={{ position:"absolute", top:"calc(100%+8px)", right:0, background:t.surface, border:`1px solid ${t.border}`, borderRadius:"12px", minWidth:"175px", overflow:"hidden", zIndex:200, boxShadow:`0 12px 40px ${t.shadow}`, marginTop:"8px" }}>
              {[{icon:"👤",label:"Profile"},{icon:"⚙️",label:"Settings"},{icon:"🚪",label:"Logout",red:true}].map((item,i,arr)=>(
                <div key={item.label} style={{ padding:"10px 16px", display:"flex", alignItems:"center", gap:"10px", fontSize:"0.85rem", color: item.red?"#f03e3e":t.textSub, cursor:"pointer", borderBottom:i<arr.length-1?`1px solid ${t.border}`:"none" }}>
                  {item.icon} {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
