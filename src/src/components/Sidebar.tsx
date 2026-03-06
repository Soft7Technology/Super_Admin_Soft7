"use client";

import React, { useState } from "react";

interface NavItem {
  icon: string;
  label: string;
  badge?: number;
}

interface SidebarProps {
  activeItem?: string;
  onNavigate?: (label: string) => void;
}

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { icon: "🏠", label: "Dashboard" },
      { icon: "🏢", label: "Manage Companies", badge: 12 },
      { icon: "📹", label: "All Videos" },
    ],
  },
  {
    label: "Admin",
    items: [
      { icon: "💳", label: "Subscription" },
      { icon: "📋", label: "Audit Logs" },
    ],
  },
  {
    label: "Config",
    items: [
      { icon: "⚙️", label: "System" },
      { icon: "📊", label: "Sub Statistics" },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  activeItem = "Dashboard",
  onNavigate,
}) => {
  return (
    <aside
      style={{
        width: "220px",
        background: "#111318",
        borderRight: "1px solid #1f2535",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 100,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "22px 20px 18px",
          borderBottom: "1px solid #1f2535",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: "1.1rem",
        }}
      >
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: "#4f8ef7",
            boxShadow: "0 0 8px #4f8ef7",
            flexShrink: 0,
          }}
        />
        <span style={{ color: "#e8eaf0" }}>
          Super<span style={{ color: "#4f8ef7" }}>Admin</span>
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {/* Section label */}
            <div
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.12em",
                color: "#6b7280",
                padding: "14px 20px 6px",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {section.label}
            </div>

            {/* Items */}
            {section.items.map((item) => (
              <NavItemRow
                key={item.label}
                item={item}
                isActive={item.label === activeItem}
                onClick={() => onNavigate?.(item.label)}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid #1f2535",
          fontSize: "0.78rem",
          color: "#6b7280",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#38d9a9",
              boxShadow: "0 0 5px #38d9a9",
            }}
          />
          System Online · v2.4.1
        </div>
      </div>
    </aside>
  );
};

const NavItemRow: React.FC<{
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 20px",
        color: isActive ? "#4f8ef7" : hovered ? "#e8eaf0" : "#6b7280",
        fontSize: "0.875rem",
        fontWeight: 500,
        cursor: "pointer",
        borderLeft: `3px solid ${isActive ? "#4f8ef7" : "transparent"}`,
        background: isActive
          ? "rgba(79,142,247,0.09)"
          : hovered
          ? "rgba(79,142,247,0.05)"
          : "transparent",
        transition: "all 0.18s",
        userSelect: "none",
      }}
    >
      <span style={{ fontSize: "1.05rem", width: "20px", textAlign: "center" }}>
        {item.icon}
      </span>
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.badge && (
        <span
          style={{
            background: "#4f8ef7",
            color: "#fff",
            fontSize: "0.65rem",
            padding: "2px 7px",
            borderRadius: "20px",
            fontWeight: 700,
          }}
        >
          {item.badge}
        </span>
      )}
    </div>
  );
};

export default Sidebar;
