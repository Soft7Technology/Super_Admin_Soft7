"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";   // ← ADD
import { useTheme, tokens } from "../context/ThemeContext";

const NAV = [
  { icon:"⊞",  label:"Dashboard",        route:"/user/dashboard",         bg:"#3b5bdb" },
  { icon:"🏢", label:"Manage Companies",  route:"/user/manage-companies",  bg:"#1971c2" },
  { icon:"👥", label:"All User",          route:"/user/all-user",          bg:"#0ca678" },
  { icon:"💳", label:"Subscription",      route:"/user/subscription",      bg:"#6741d9" },
  { icon:"📋", label:"Audit Logs",        route:"/user/audit-logs",        bg:"#862e9c" },
  { icon:"⚙️", label:"System",            route:"/user/system",            bg:"#495057" },
  { icon:"👤", label:"Profile",           route:"/user/profile",           bg:"#1864ab" },
  { icon:"🎫", label:"Support Tickets",   route:"/user/support-tickets",   bg:"#c92a2a" },
];

export default function Sidebar({
  activeItem,
  onNavigate,
}: {
  activeItem?: string;
  onNavigate?: (l: string) => void;
}) {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const router   = useRouter();
  const pathname = usePathname();  

 
  const currentActive =
  NAV.find(n => pathname?.includes(n.route))?.label ?? "Dashboard";

  const handleNav = (item: typeof NAV[0]) => {
    onNavigate?.(item.label);
    router.push(item.route);       
  };

  return (
    <aside style={{
  width:"250px",
  height:"100vh",
  background:t.surface,
  borderRight:`1px solid ${t.border}`,
  display:"flex",
  flexDirection:"column",
}}>

      {/* Logo */}
      <div style={{ padding:"20px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:"12px" }}>
        <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:"linear-gradient(135deg,#3b5bdb,#6741d9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", color: "#ffffff" , boxShadow:"0 4px 14px rgba(59,91,219,0.35)", flexShrink:0 }}>🛡</div>
        <div>
          <div style={{ fontWeight:800, fontSize:"1rem", color:t.text, letterSpacing:"-0.02em", transition:"color 0.3s" }}>
            Super<span style={{ color:t.accent }}>Admin</span>
          </div>
          <div style={{ fontSize:"0.65rem", color:t.textFaint, marginTop:"2px", transition:"color 0.3s" }}>Management Portal</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, overflowY:"auto", padding:"12px 10px" }}>
        {NAV.map(item => (
          <NavItem
            key={item.label}
            item={item}
            active={item.label === currentActive}
            onClick={() => handleNav(item)}
            t={t}
            isDark={isDark}
          />
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding:"14px 20px", borderTop:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", transition:"border-color 0.3s" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
          <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 6px #4ade80" }} />
          <span style={{ fontSize:"0.72rem", color:t.textFaint }}>System Online</span>
        </div>
        <span style={{ fontSize:"0.72rem", color:t.textFaint }}>© 2026 Soft7</span>
      </div>
    </aside>
  );
}

function NavItem({ item, active, onClick, t, isDark }: any) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:"flex", alignItems:"center", gap:"12px",
        padding:"9px 12px", marginBottom:"2px", borderRadius:"9px",
        cursor:"pointer", userSelect:"none", transition:"all 0.15s",
        color:  active ? (isDark ? "#fff" : "#0f172a") : hov ? t.textSub : t.textMuted,
        fontWeight: active ? 600 : 400, fontSize:"0.875rem",
        background: active ? t.navActive : hov ? t.navHover : "transparent",
        borderLeft: `3px solid ${active ? t.accent : "transparent"}`,
      }}
    >
      <div style={{
        width:"30px", height:"30px", borderRadius:"8px",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:"0.85rem", flexShrink:0, transition:"background 0.15s",
        background: active ? item.bg : t.iconBox,
        boxShadow: active ? `0 2px 10px ${item.bg}66` : "none",
      }}>
        {item.icon}
      </div>
      <span style={{ flex:1 }}>{item.label}</span>
      {item.badge && (
        <span style={{ background:"#1971c2", color:"#fff", fontSize:"0.62rem", padding:"2px 7px", borderRadius:"20px", fontWeight:700 }}>
          {item.badge}
        </span>
      )}
      {active && (
        <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:t.accent, boxShadow:`0 0 6px ${t.accent}` }} />
      )}
    </div>
  );
}