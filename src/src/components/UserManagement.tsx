"use client";

import React, { useState } from "react";
import { UserRecord, RoleType } from "../types";

const ROLE_STYLES: Record<RoleType, { bg: string; color: string }> = {
  Admin: { bg: "rgba(79,142,247,0.12)", color: "#4f8ef7" },
  Manager: { bg: "rgba(247,147,79,0.12)", color: "#f7934f" },
  User: { bg: "rgba(107,114,128,0.12)", color: "#6b7280" },
};

const DEFAULT_USERS: UserRecord[] = [
  { id: "1", name: "James Doe", email: "james@acmecorp.com", company: "Acme Corp", initials: "JD", color: "linear-gradient(135deg,#4f8ef7,#7b61ff)", role: "Admin" },
  { id: "2", name: "Sara Rivera", email: "sara@nexus.io", company: "Nexus Ltd", initials: "SR", color: "linear-gradient(135deg,#38d9a9,#4ade80)", role: "Manager" },
  { id: "3", name: "Tom King", email: "tom@skyline.co", company: "SkyLine Inc", initials: "TK", color: "linear-gradient(135deg,#f7934f,#fbbf24)", role: "User" },
  { id: "4", name: "Anya Patel", email: "anya@zenith.com", company: "Zenith Group", initials: "AP", color: "linear-gradient(135deg,#a78bfa,#60a5fa)", role: "Admin" },
  { id: "5", name: "Mike Loren", email: "mike@vertex.co", company: "Vertex Co", initials: "ML", color: "linear-gradient(135deg,#f74f6a,#fb923c)", role: "User" },
];

interface UserManagementProps {
  users?: UserRecord[];
  onViewAll?: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({
  users = DEFAULT_USERS,
  onViewAll,
}) => {
  return (
    <div
      style={{
        background: "#111318",
        border: "1px solid #1f2535",
        borderRadius: "14px",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 22px 14px",
          borderBottom: "1px solid #1f2535",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "#e8eaf0",
          }}
        >
          User Management
        </span>
        <span
          onClick={onViewAll}
          style={{
            fontSize: "0.75rem",
            color: "#4f8ef7",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          View All →
        </span>
      </div>

      {/* User list */}
      <div style={{ padding: "6px 0" }}>
        {users.map((user, i) => (
          <UserRow key={user.id} user={user} isLast={i === users.length - 1} />
        ))}
      </div>
    </div>
  );
};

const UserRow: React.FC<{ user: UserRecord; isLast: boolean }> = ({
  user,
  isLast,
}) => {
  const [hovered, setHovered] = useState(false);
  const rs = ROLE_STYLES[user.role];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "11px 22px",
        display: "flex",
        alignItems: "center",
        gap: "13px",
        borderBottom: isLast ? "none" : "1px solid rgba(31,37,53,0.5)",
        background: hovered ? "rgba(79,142,247,0.04)" : "transparent",
        transition: "background 0.15s",
        cursor: "pointer",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "8px",
          background: user.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: "0.75rem",
          color: "#fff",
          flexShrink: 0,
          fontFamily: "'Syne', sans-serif",
        }}
      >
        {user.initials}
      </div>

      {/* Name + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#e8eaf0",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {user.name}
        </div>
        <div
          style={{
            fontSize: "0.72rem",
            color: "#6b7280",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {user.email} · {user.company}
        </div>
      </div>

      {/* Role badge */}
      <span
        style={{
          fontSize: "0.68rem",
          padding: "3px 9px",
          borderRadius: "6px",
          fontWeight: 700,
          letterSpacing: "0.04em",
          background: rs.bg,
          color: rs.color,
          flexShrink: 0,
        }}
      >
        {user.role}
      </span>
    </div>
  );
};

export default UserManagement;
