"use client";
import React from "react";
import { useTheme, tokens } from "../context/ThemeContext";

interface LogEntry {
  id:    string;
  msg:   string;
  actor: string;
  time:  string;
  sev:   string;
}

const SEV: Record<string, { bg: string; color: string; icon: string }> = {
  success: { bg:"rgba(16,185,129,0.14)", color:"#059669", icon:"v" },
  warn:    { bg:"rgba(251,191,36,0.1)",  color:"#d97706", icon:"!" },
  danger:  { bg:"rgba(239,68,68,0.1)",   color:"#dc2626", icon:"x" },
  info:    { bg:"rgba(16,185,129,0.12)", color:"#10b981", icon:"i" },
};

export default function AuditLogs({
  logs = [],
  loading = false,
  error = null,
}: {
  logs?: LogEntry[];
  loading?: boolean;
  error?: string | null;
}) {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;

  return (
    <div style={{ background:t.surface, border:`2px solid ${t.border}`, borderRadius:"16px", overflow:"hidden", boxShadow:"0 8px 24px rgba(16,185,129,0.08)", transition:"background 0.3s,border-color 0.3s" }}>
      <div style={{ padding:"24px 26px 20px", borderBottom:`2px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontWeight:800, fontSize:"1.18rem", color:t.text }}>Activity Logs</span>
        <span style={{ fontSize:"0.95rem", color:t.accent, cursor:"pointer", fontWeight:800, display:"flex", alignItems:"center", gap:"6px" }}>
          View All <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </span>
      </div>
      {loading ? (
        <div style={{ padding:"30px", textAlign:"center", color:t.textFaint, fontSize:"1rem" }}>Loading activity...</div>
      ) : error ? (
        <div style={{ padding:"30px", textAlign:"center", color:t.textFaint, fontSize:"1rem" }}>{error}</div>
      ) : (
        <div>
          {logs.map((log, i) => {
            const s = SEV[log.sev] ?? SEV["info"];
            return (
              <div key={log.id} style={{ padding:"17px 24px", display:"flex", alignItems:"flex-start", gap:"14px", borderBottom:i < logs.length - 1 ? `1px solid ${t.border}` : "none" }}>
                <div style={{ width:"36px", height:"36px", borderRadius:"10px", background:s.bg, border:"1px solid rgba(16,185,129,0.18)", display:"flex", alignItems:"center", justifyContent:"center", color:s.color, fontSize:"0.9rem", fontWeight:900, flexShrink:0, marginTop:"1px" }}>{s.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"1rem", color:t.textSub, fontWeight:700, lineHeight:1.45 }}>{log.msg}</div>
                  <div style={{ fontSize:"0.84rem", color:t.textFaint, marginTop:"5px", fontWeight:600 }}>{log.time} · {log.actor}</div>
                </div>
              </div>
            );
          })}
          {logs.length === 0 && (
            <div style={{ padding:"30px", textAlign:"center", color:t.textFaint, fontSize:"1rem" }}>No activity found</div>
          )}
        </div>
      )}
    </div>
  );
}
