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
  "/user/permissions": "Permissions",
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
  const [desktopSidebarWidth, setDesktopSidebarWidth] = useState(260);
  const mobileSidebarWidth = 260;
  const t = isDark ? tokens.dark : tokens.light;

  const titles: Record<string, string> = {
    Dashboard: "Dashboard",
    "Manage Companies": "Manage Companies",
    "All User": "All Users",
    Subscription: "Subscription",
    "Audit Logs": "Audit Logs",
    System: "System",
    Profile: "Profile",
    "Support Tickets": "Support Tickets",
    Permissions: "Permissions",
  };

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      className={isDark ? "dark" : "light"}
      style={{ minHeight: "100vh", background: "var(--crm-bg, var(--bg, #f4f6fa))" }}
    >

      {/* ✅ DESKTOP SIDEBAR */}
      {!isMobile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: `${desktopSidebarWidth}px`,
            height: "100vh",
            zIndex: 80,
            overflow: "hidden",
          }}
        >
          <Sidebar
            activeItem={activeNav}
            onNavigate={setActiveNav}
            onWidthChange={setDesktopSidebarWidth}
          />
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
                zIndex: 100,
              }}
            />
          )}

          <div
            style={{
              position: "fixed",
              top: 0,
              left: sidebarOpen ? "0" : `-${mobileSidebarWidth}px`,
              width: `${mobileSidebarWidth}px`,
              height: "100vh",
              zIndex: 200,
              transition: "left 0.3s ease",
            }}
          >
            <Sidebar
              activeItem={activeNav}
              onNavigate={(val) => {
                setActiveNav(val);
                setSidebarOpen(false);
              }}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* ✅ MAIN CONTENT */}
      <div
        className="user-main-layout"
        style={{
          marginLeft: isMobile ? "0px" : `${desktopSidebarWidth}px`,
          height: "100vh",
          maxHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          width: isMobile ? "100%" : `calc(100% - ${desktopSidebarWidth}px)`,
          maxWidth: "100%",
          minWidth: 0,
          boxSizing: "border-box",
          overflow: "hidden",
          transition: "margin-left 220ms ease, width 220ms ease",
        }}
      >
        <Topbar
          title={titles[activeNav] ?? activeNav}
          onMenuClick={isMobile ? () => setSidebarOpen(true) : undefined}
        />

        {/* Scrollable page body */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            width: "100%",
            maxWidth: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            boxSizing: "border-box",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
