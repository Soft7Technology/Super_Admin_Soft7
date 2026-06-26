"use client";
import React, { useEffect, useState } from "react";
import { useTheme, tokens } from "../../../context/ThemeContext";

interface LogEntry {
  id: string;
  msg: string;
  actor: string;
  time: string;
  sev: string;
  dayGroup: string;
}

const SEV: Record<string, { bg: string; color: string; icon: string }> = {
  success: { bg: "rgba(16,185,129,0.14)", color: "#059669", icon: "v" },
  warn: { bg: "rgba(251,191,36,0.1)", color: "#d97706", icon: "!" },
  danger: { bg: "rgba(239,68,68,0.1)", color: "#dc2626", icon: "x" },
  info: { bg: "rgba(16,185,129,0.12)", color: "#10b981", icon: "i" },
};

function useWindowWidth() {
  const [width, setWidth] = useState<number>(1024);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return width;
}

function getInitials(name: string) {
  if (!name) return "U";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

const DUMMY_ACTIVITIES: LogEntry[] = [
  // Today
  { id: "1", msg: "New campaign launched successfully", actor: "Sarah Johnson", time: "2 hours ago", sev: "info", dayGroup: "Today" },
  { id: "2", msg: "Company subscription upgraded to Enterprise", actor: "Michael Chen", time: "4 hours ago", sev: "success", dayGroup: "Today" },
  { id: "3", msg: "User access permissions updated", actor: "Emily Davis", time: "6 hours ago", sev: "warning", dayGroup: "Today" },
  // Yesterday
  { id: "4", msg: "Monthly analytics report generated", actor: "System", time: "May 23, 10:00 AM", sev: "info", dayGroup: "Yesterday" },
  { id: "5", msg: "API usage threshold reached", actor: "Monitoring Service", time: "May 23, 08:30 AM", sev: "warning", dayGroup: "Yesterday" },
  { id: "6", msg: "New API Key generated for frontend", actor: "James Wilson", time: "May 23, 07:15 AM", sev: "info", dayGroup: "Yesterday" },
  // 2 Days Ago
  { id: "7", msg: "Security audit completed", actor: "System", time: "May 22, 02:00 PM", sev: "success", dayGroup: "May 22, 2026" },
  { id: "8", msg: "Database backup finished successfully", actor: "System", time: "May 22, 01:00 AM", sev: "info", dayGroup: "May 22, 2026" },
  // 3 Days Ago
  { id: "9", msg: "Platform downtime for maintenance", actor: "Admin Team", time: "May 21, 11:30 PM", sev: "danger", dayGroup: "May 21, 2026" },
  { id: "10", msg: "Updated privacy policy published", actor: "Legal Team", time: "May 21, 04:00 PM", sev: "info", dayGroup: "May 21, 2026" },
  { id: "11", msg: "Resolved critical bug in billing system", actor: "DevOps", time: "May 21, 10:00 AM", sev: "success", dayGroup: "May 21, 2026" },
];

export default function AllActivityPage() {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const width = useWindowWidth();
  const isMobile = width <= 768;
  const isSmall = width <= 1000;
  const isMedium = width <= 1300;

  const msgFont = isSmall ? "0.85rem" : isMedium ? "0.95rem" : "1.05rem";
  const metaFont = isSmall ? "0.75rem" : isMedium ? "0.82rem" : "0.88rem";
  const avatarSize = isSmall ? 36 : isMedium ? 42 : 48;
  const dotSize = isSmall ? 12 : 14;

  const themeGreen = "#10b981";

  // Group the dummy data by dayGroup
  const groupsObj = DUMMY_ACTIVITIES.reduce((acc, log) => {
    if (!acc[log.dayGroup]) {
      acc[log.dayGroup] = [];
    }
    acc[log.dayGroup].push(log);
    return acc;
  }, {} as Record<string, LogEntry[]>);

  const groups = Object.keys(groupsObj).map(key => ({
    title: key,
    items: groupsObj[key],
  }));

  return (
    <div
      style={{
        padding: isMobile ? "16px" : isSmall ? "24px 22px 36px" : isMedium ? "28px 30px 44px" : "36px 38px 56px",
        background: t.bg,
        minHeight: "100%",
        transition: "background 0.3s ease",
      }}
    >
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontWeight: 800,
            fontSize: isMobile ? "1.35rem" : isSmall ? "1.45rem" : isMedium ? "1.65rem" : "2rem",
            color: t.text,
            margin: 0,
            letterSpacing: "-0.025em",
            transition: "color 0.3s",
          }}
        >
          All Activity
        </h1>
        <p
          style={{
            fontSize: isSmall ? "0.8rem" : isMedium ? "0.85rem" : "0.95rem",
            color: isDark ? t.textMuted : "#64748b",
            margin: isSmall ? "4px 0 0" : "7px 0 0",
            transition: "color 0.3s",
          }}
        >
          A complete timeline of all events across the platform.
        </p>
      </div>

      <div
        style={{
          background: isDark ? "rgba(15,17,32,0.85)" : "#ffffff",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
          borderRadius: isSmall ? "12px" : "16px",
          padding: isSmall ? "20px" : "32px",
          boxShadow: isDark ? "0 2px 10px rgba(0,0,0,0.22)" : "0 1px 8px rgba(0,0,0,0.06)",
        }}
      >
        {groups.map((group, groupIdx) => (
          <div key={group.title} style={{ marginBottom: groupIdx === groups.length - 1 ? "0" : "32px" }}>
            <h2
              style={{
                fontSize: isSmall ? "1rem" : "1.15rem",
                fontWeight: 800,
                color: t.text,
                marginBottom: "20px",
                marginTop: "0",
                letterSpacing: "-0.02em",
              }}
            >
              {group.title}
            </h2>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {group.items.map((log, i) => {
                const isLastInGroup = i === group.items.length - 1;
                const isLastOverall = groupIdx === groups.length - 1 && isLastInGroup;
                const s = SEV[log.sev] ?? SEV["info"];

                return (
                  <div key={log.id} style={{ position: "relative", paddingLeft: isSmall ? "32px" : "40px", paddingBottom: isLastInGroup ? "0" : "28px" }}>
                    {/* Vertical Line */}
                    {!isLastOverall && (
                      <div
                        style={{
                          position: "absolute",
                          left: isSmall ? "5px" : "6px",
                          top: `${dotSize + 6}px`,
                          bottom: isLastInGroup ? "-32px" : "-6px",
                          width: "2px",
                          background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                          zIndex: 1,
                        }}
                      />
                    )}

                    {/* Dot */}
                    <div
                      style={{
                        position: "absolute",
                        left: "0",
                        top: "6px",
                        width: `${dotSize}px`,
                        height: `${dotSize}px`,
                        borderRadius: "50%",
                        background: themeGreen,
                        border: `2px solid ${isDark ? "rgba(15,17,32,1)" : "#ffffff"}`,
                        zIndex: 2,
                        boxShadow: `0 0 0 2px ${isDark ? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.1)"}`,
                      }}
                    />

                    {/* Content */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      {/* Avatar */}
                      <div
                        style={{
                          width: `${avatarSize}px`,
                          height: `${avatarSize}px`,
                          borderRadius: "50%",
                          background: s.bg,
                          color: s.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: isSmall ? "13px" : "15px",
                          fontWeight: 800,
                          flexShrink: 0,
                          border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                        }}
                      >
                        {getInitials(log.actor)}
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1, marginTop: "-2px" }}>
                        <div style={{ fontSize: msgFont, color: t.textSub, fontWeight: 600, lineHeight: 1.4 }}>
                          {log.msg}
                        </div>
                        <div style={{ fontSize: metaFont, color: t.textFaint, marginTop: "6px", fontWeight: 500 }}>
                          {log.time} · {log.actor}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
