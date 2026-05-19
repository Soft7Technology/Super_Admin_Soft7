"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme, tokens } from "../context/ThemeContext";
import Logo from "./Logo";

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

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 84;

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
  const [expanded, setExpanded] = useState(true);

  const width = expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("admin_sidebar_expanded");
      if (saved !== null) {
        setExpanded(saved === "true");
      }
    } catch {}
  }, []);

  const currentActive =
    NAV.find(n => pathname?.includes(n.route))?.label ?? "Dashboard";

  const handleNav = (item: typeof NAV[0]) => {
    onNavigate?.(item.label);
    router.push(item.route);       
  };

  const toggleExpanded = () => {
    setExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("admin_sidebar_expanded", String(next));
      } catch {}
      return next;
    });
  };

  return (
    <aside style={{
      width,
      minWidth: width,
      height: "100vh",
      background: t.surface,
      borderRight: `1px solid ${t.border}`,
      display: "flex",
      flexDirection: "column",
      transition: "width 220ms ease",
      position: "relative",
    }}>

      {/* Logo + toggle */}
      <div style={{
        padding: "18px 16px",
        borderBottom: `1px solid ${t.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
      }}>
        <button
          type="button"
          onClick={toggleExpanded}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "none",
            background: "transparent",
            padding: 0,
            margin: 0,
            color: t.text,
            cursor: "pointer",
            flex: 1,
            justifyContent: expanded ? "flex-start" : "center",
          }}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <Logo size={42} />
          {expanded && (
            <div style={{ display: "grid", gap: "4px", minWidth: 0 }}>
              <span style={{ fontWeight: 800, fontSize: "1rem", color: t.text, letterSpacing: "-0.02em" }}>
                Soft7
              </span>
              <span style={{ fontSize: "0.65rem", color: t.textMuted }}>
                Super Admin
              </span>
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={toggleExpanded}
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "999px",
            border: `1px solid ${t.border}`,
            background: t.surface,
            color: t.text,
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
          }}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? "‹" : ">"}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, overflowY:"auto", padding:"16px 8px" }}>
        {NAV.map(item => (
          <NavItem
            key={item.label}
            item={item}
            active={item.label === currentActive}
            expanded={expanded}
            onClick={() => handleNav(item)}
            t={t}
            isDark={isDark}
          />
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding:"14px 16px", borderTop:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent: expanded ? "space-between" : "center", transition:"border-color 0.3s" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
          <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 6px #4ade80" }} />
          {expanded && <span style={{ fontSize:"0.72rem", color:t.textFaint }}>System Online</span>}
        </div>
        {expanded ? (
          <span style={{ fontSize:"0.72rem", color:t.textFaint }}>© 2026 Soft7</span>
        ) : null}
      </div>
    </aside>
  );
}

function NavItem({ item, active, expanded, onClick, t, isDark }: any) {
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
        color:  active ? (isDark ? "#fff" : "#0f172a") : hov ? t.textSub  : (isDark ? "#d1d5db" : t.textMuted),
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
      {expanded && <span style={{ flex:1 }}>{item.label}</span>}
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