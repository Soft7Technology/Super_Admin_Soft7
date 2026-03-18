"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { useTheme, tokens } from "../../context/ThemeContext";
import { useRedirectOnRefresh } from "../../hooks/useRedirectOnRefresh";

const pathMappings: Record<string, string> = {
  "/user/dashboard": "Dashboard",
  "/user/manage-companies": "Manage Companies",
  "/user/all-user": "All User",
  "/user/subscription": "Subscription",
  "/user/audit-logs": "Audit Logs",
  "/user/system": "System",
  "/user/profile": "Profile",
  "/user/support-tickets": "Support Tickets",
};

function getNavFromPath(pathname: string | null): string {
  if (!pathname) return "Dashboard";
  for (const [path, navName] of Object.entries(pathMappings)) {
    if (pathname.startsWith(path)) {
      return navName;
    }
  }
  return "Dashboard";
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [activeNav, setActiveNav] = useState(() => getNavFromPath(pathname));
  useRedirectOnRefresh();

  // Update activeNav when pathname changes
  useEffect(() => {
    setActiveNav(getNavFromPath(pathname));
  }, [pathname]);
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const titles: Record<string,string> = {
    "Dashboard":"Dashboard","Manage Companies":"Manage Companies",
    "All User":"All Users","Subscription":"Subscription",
    "Audit Logs":"Audit Logs","System":"System",
    "Profile":"Profile","Support Tickets":"Support Tickets",
  };
  return (
    // ✅ FIX: added data-theme here — this makes ALL CSS [data-theme="light"] selectors work
    <div
      data-theme={isDark ? "dark" : "light"}
      style={{ display:"flex", minHeight:"100vh", background:t.bg, transition:"background 0.3s ease" }}
    >
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      <div style={{ marginLeft:"250px", flex:1, display:"flex", flexDirection:"column", minHeight:"100vh" }}>
        <Topbar title={titles[activeNav] ?? activeNav} />
        <main style={{ flex:1, background:t.bg, transition:"background 0.3s ease" }}>{children}</main>
      </div>
    </div>
  );
}