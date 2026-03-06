"use client";

import React from "react";
import { AuditLog, AuditSeverity } from "../types";

const SEVERITY_CONFIG: Record<AuditSeverity, { bg: string; icon: string }> = {
  info: { bg: "rgba(79,142,247,0.12)", icon: "🔵" },
  warn: { bg: "rgba(247,147,79,0.12)", icon: "⚠️" },
  danger: { bg: "rgba(247,79,106,0.10)", icon: "🚫" },
  success: { bg: "rgba(56,217,169,0.10)", icon: "✅" },
};

const DEFAULT_LOGS: AuditLog[] = [
  { id: "1", message: "New company SkyLine Inc registered successfully", actor: "Super Admin", time: "2 mins ago", severity: "success" },
  { id: "2", message: "Subscription plan changed for Vertex Co", actor: "Admin", time: "15 mins ago", severity: "warn" },
  { id: "3", message: "User Anya Patel role updated to Admin", actor: "Super Admin", time: "1 hr ago", severity: "info" },
  { id: "4", message: "Failed login attempt from unknown IP", actor: "System", time: "3 hrs ago", severity: "danger" },
  { id: "5", message: "Bulk export of user data completed", actor: "Admin", time: "6 hrs ago", severity: "success" },
];

interface AuditLogsProps {
  logs?: AuditLog[];
  onViewAll?: () => void;
}

const AuditLogs: React.FC<AuditLogsProps> = ({
  logs = DEFAULT_LOGS,
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
          Audit Logs
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

      {/* Log entries */}
      <div style={{ padding: "6px 0" }}>
        {logs.map((log, i) => (
          <AuditRow key={log.id} log={log} isLast={i === logs.length - 1} />
        ))}
      </div>
    </div>
  );
};

const AuditRow: React.FC<{ log: AuditLog; isLast: boolean }> = ({
  log,
  isLast,
}) => {
  const s = SEVERITY_CONFIG[log.severity];

  return (
    <div
      style={{
        padding: "11px 22px",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        borderBottom: isLast ? "none" : "1px solid rgba(31,37,53,0.5)",
      }}
    >
      {/* Severity icon */}
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "7px",
          background: s.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.85rem",
          flexShrink: 0,
          marginTop: "1px",
        }}
      >
        {s.icon}
      </div>

      {/* Message + meta */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "0.82rem",
            color: "#e8eaf0",
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          {log.message}
        </div>
        <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "2px" }}>
          {log.time} · {log.actor}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
