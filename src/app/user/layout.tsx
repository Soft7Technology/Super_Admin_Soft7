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
  const [activeNav, setActiveNav] = useState("Dashboard");

  const [isMobile, setIsMobile] = useState(false);

React.useEffect(() => {
  const check = () => setIsMobile(window.innerWidth <= 768);
  check();
  window.addEventListener("resize", check);
  return () => window.removeEventListener("resize", check);
}, []);

  // Update activeNav when pathname changes
  useEffect(() => {
    setActiveNav(getNavFromPath(pathname));
  }, [pathname]);
  const { isDark } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const t = isDark ? tokens.dark : tokens.light;
  const titles: Record<string,string> = {
    "Dashboard":"Dashboard","Manage Companies":"Manage Companies",
    "All User":"All Users","Subscription":"Subscription",
    "Audit Logs":"Audit Logs","System":"System",
    "Profile":"Profile","Support Tickets":"Support Tickets",
  };
 return (
  <div
    data-theme={isDark ? "dark" : "light"}
    style={{ minHeight: "100vh", background: t.bg }}
  >

    {/* ✅ DESKTOP SIDEBAR */}
    {!isMobile && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "250px",
      height: "100vh"
    }}
  >
    <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
  </div>
)}

    {/* ✅ MOBILE SIDEBAR */}
    {isMobile && (
      <>
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 100
            }}
          />
        )}

        <div
          style={{
            position: "fixed",
            top: 0,
            left: sidebarOpen ? "0" : "-250px",
            width: "250px",
            height: "100vh",
            zIndex: 200,
            transition: "left 0.3s ease"
          }}
        >
          <Sidebar
            activeItem={activeNav}
            onNavigate={(val) => {
              setActiveNav(val);
              setSidebarOpen(false);
            }}
          />
        </div>
      </>
    )}

    {/* ✅ MAIN CONTENT */}
    <div
      style={{
        marginLeft: isMobile ? "0px" : "250px", // only for desktop
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Topbar
        title={titles[activeNav] ?? activeNav}
        onMenuClick={isMobile ? () => setSidebarOpen(true) : undefined}
      />

      {/* THIS fixes scroll issue */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {children}
      </div>
    </div>
  </div>
);
}