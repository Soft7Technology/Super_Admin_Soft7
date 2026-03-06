"use client";

import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeNav, setActiveNav] = useState("Dashboard");

  const PAGE_TITLES: Record<string, string> = {
    Dashboard: "Dashboard",
    "Manage Companies": "Manage Companies",
    "All Videos": "All Videos",
    Subscription: "Subscription",
    "Audit Logs": "Audit Logs",
    System: "System",
    "Sub Statistics": "Sub Statistics",
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0a0c10",
        color: "#e8eaf0",
      }}
    >
      {/* Sidebar — fixed left */}
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />

      {/* Main area — offset by sidebar width */}
      <div
        style={{
          marginLeft: "220px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Sticky top bar */}
        <Topbar title={PAGE_TITLES[activeNav] ?? activeNav} />

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto" }}>{children}</main>
      </div>
    </div>
  );
}
