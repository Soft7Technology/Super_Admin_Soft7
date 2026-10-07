"use client";
import React from "react";
import { useTheme, tokens } from "../../context/ThemeContext";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, ChevronRight } from "lucide-react";

const SEV: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  success: { bg: "rgba(47,179,68,0.12)", color: "#2fb344", icon: <CheckCircle2 size={15} /> },
  warn:    { bg: "rgba(245,159,0,0.12)", color: "#f59f00", icon: <AlertTriangle size={15} /> },
  danger:  { bg: "rgba(214,57,57,0.12)", color: "#d63939", icon: <AlertCircle size={15} /> },
  info:    { bg: "rgba(8, 127, 91,0.12)", color: "#087f5b", icon: <Info size={15} /> },
};

const LOGS = [
  { id: "1", msg: "New company SkyLine Inc registered", actor: "Super Admin", time: "2 mins ago", sev: "success" },
  { id: "2", msg: "Subscription plan changed for Vertex Co", actor: "Admin", time: "15 mins ago", sev: "warn" },
  { id: "3", msg: "User Anya Patel role updated to Admin", actor: "Super Admin", time: "1 hr ago", sev: "info" },
  { id: "4", msg: "Failed login attempt from unknown IP", actor: "System", time: "3 hrs ago", sev: "danger" },
  { id: "5", msg: "Bulk export of user data completed", actor: "Admin", time: "6 hrs ago", sev: "success" },
];

export default function AuditLogs() {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "10px", overflow: "hidden", transition: "background 0.3s,border-color 0.3s" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700, fontSize: "0.95rem", color: t.text }}>Audit Logs</span>
        <span style={{ fontSize: "0.8rem", color: t.accent, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
          View All <ChevronRight size={13} strokeWidth={2.5} />
        </span>
      </div>
      <div>
        {LOGS.map((log, i) => {
          const s = SEV[log.sev];
          return (
            <div key={log.id} style={{ padding: "12px 20px", display: "flex", alignItems: "flex-start", gap: "12px", borderBottom: i < LOGS.length - 1 ? `1px solid ${t.border}` : "none" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0, marginTop: "1px" }}>
                {s.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.85rem", color: t.textSub, fontWeight: 500, lineHeight: 1.4 }}>{log.msg}</div>
                <div style={{ fontSize: "0.72rem", color: t.textFaint, marginTop: "3px" }}>{log.time} · {log.actor}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
