"use client";

import React, { useState } from "react";

interface TopbarProps {
  title?: string;
  adminName?: string;
  onSearch?: (query: string) => void;
}

const Topbar: React.FC<TopbarProps> = ({
  title = "Dashboard",
  adminName = "Admin",
  onSearch,
}) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header
      style={{
        height: "62px",
        background: "#111318",
        borderBottom: "1px solid #1f2535",
        display: "flex",
        alignItems: "center",
        padding: "0 28px",
        gap: "16px",
        position: "sticky",
        top: 0,
        zIndex: 50,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Page Title */}
      <div
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize: "1rem",
          color: "#e8eaf0",
          flexShrink: 0,
        }}
      >
        {title}
      </div>

      {/* Search Bar */}
      <div
        style={{
          flex: 1,
          maxWidth: "380px",
          background: "#181c24",
          border: `1px solid ${searchFocused ? "#4f8ef7" : "#1f2535"}`,
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "0 14px",
          height: "38px",
          transition: "border 0.18s",
        }}
      >
        <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>🔍</span>
        <input
          type="text"
          placeholder="Search campaigns, users..."
          onChange={(e) => onSearch?.(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            background: "none",
            border: "none",
            outline: "none",
            color: "#e8eaf0",
            fontSize: "0.875rem",
            fontFamily: "'DM Sans', sans-serif",
            width: "100%",
          }}
        />
      </div>

      {/* Right Section */}
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <NotifButton icon="🔔" hasDot />
        <NotifButton icon="📬" />

        {/* Avatar + Dropdown */}
        <div style={{ position: "relative" }}>
          <div
            onClick={() => setShowDropdown((p) => !p)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              padding: "4px 10px 4px 4px",
              borderRadius: "10px",
              background: "#181c24",
              border: "1px solid #1f2535",
              transition: "border 0.18s",
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "7px",
                background: "linear-gradient(135deg,#4f8ef7,#7b61ff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "0.75rem",
                color: "#fff",
              }}
            >
              SA
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#e8eaf0",
                  lineHeight: 1.2,
                }}
              >
                {adminName}
              </span>
              <span
                style={{
                  fontSize: "0.65rem",
                  color: "#4f8ef7",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                Super Admin
              </span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "#6b7280", marginLeft: "4px" }}>
              ▾
            </span>
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                background: "#181c24",
                border: "1px solid #1f2535",
                borderRadius: "10px",
                minWidth: "160px",
                overflow: "hidden",
                zIndex: 200,
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              {[
                { icon: "👤", label: "Profile" },
                { icon: "⚙️", label: "Settings" },
                { icon: "🚪", label: "Logout" },
              ].map((item, i, arr) => (
                <DropdownItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  isLast={i === arr.length - 1}
                  isDanger={item.label === "Logout"}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

/* ── Notification icon button ── */
const NotifButton: React.FC<{ icon: string; hasDot?: boolean }> = ({
  icon,
  hasDot,
}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "8px",
        background: "#181c24",
        border: `1px solid ${hovered ? "#4f8ef7" : "#1f2535"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: hovered ? "#4f8ef7" : "#6b7280",
        fontSize: "1rem",
        position: "relative",
        transition: "all 0.18s",
      }}
    >
      {icon}
      {hasDot && (
        <span
          style={{
            position: "absolute",
            top: "7px",
            right: "7px",
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: "#f74f6a",
            border: "1.5px solid #111318",
          }}
        />
      )}
    </div>
  );
};

/* ── Dropdown menu item ── */
const DropdownItem: React.FC<{
  icon: string;
  label: string;
  isLast: boolean;
  isDanger?: boolean;
}> = ({ icon, label, isLast, isDanger }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "0.82rem",
        color: isDanger ? "#f74f6a" : "#e8eaf0",
        cursor: "pointer",
        borderBottom: isLast ? "none" : "1px solid #1f2535",
        background: hovered ? "rgba(79,142,247,0.06)" : "transparent",
        transition: "background 0.15s",
      }}
    >
      <span>{icon}</span>
      {label}
    </div>
  );
};

export default Topbar;
