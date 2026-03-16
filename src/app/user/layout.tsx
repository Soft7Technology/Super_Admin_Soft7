"use client";
import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { useTheme, tokens } from "../../context/ThemeContext";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [activeNav, setActiveNav] = useState("Dashboard");
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