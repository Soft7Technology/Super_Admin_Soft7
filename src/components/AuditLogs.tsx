"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/ThemeContext";
import { ChevronRight } from "lucide-react";
import Spinner from "./ui/Spinner";
import ProfileAvatar from "./ProfileAvatar";

export interface LogEntry {
  id:    string;
  msg:   string;
  actor: string;
  time:  string;
  sev:   string;
}

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

// Helper to get initials
function getInitials(name: string) {
  if (!name) return "TB";
  const clean = name.replace(/^@/, "").trim();
  const parts = clean.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.substring(0, 2).toUpperCase();
}

export default function AuditLogs({
  logs = [],
  loading = false,
  error = null,
}: {
  logs?: LogEntry[];
  loading?: boolean;
  error?: string | null;
}) {
  const router = useRouter();
  const { isDark } = useTheme();
  const width = useWindowWidth();
  const isSmall  = width <= 1000;
  const isMedium = width <= 1300;

  // Responsive typography
  const titleSize   = isSmall ? "0.92rem" : isMedium ? "1rem"   : "1.05rem";
  const viewAllSize = isSmall ? "0.78rem" : isMedium ? "0.82rem" : "0.88rem";
  const headerPad   = isSmall ? "14px 16px 12px" : "16px 20px";
  const msgFont     = isSmall ? "0.82rem" : isMedium ? "0.86rem" : "0.9rem";
  const metaFont    = isSmall ? "0.72rem" : "0.76rem";
  const avatarSize  = isSmall ? 30 : 34;
  const dotSize     = isSmall ? 9 : 10;

  // Group logs (This Week / Today)
  const todayLogs = logs.filter(l => l.time.includes("min") || l.time.includes("hour") || l.time.includes("Today"));
  const earlierLogs = logs.filter(l => !l.time.includes("min") && !l.time.includes("hour") && !l.time.includes("Today"));

  const groups: { title: string; items: LogEntry[] }[] = [];
  if (todayLogs.length > 0) groups.push({ title: "Today", items: todayLogs });
  if (earlierLogs.length > 0) groups.push({ title: "This Week", items: earlierLogs });
  if (groups.length === 0 && logs.length > 0) groups.push({ title: "This Week", items: logs });

  return (
    <div
      style={{
        background: "var(--crm-card-bg, #ffffff)",
        border: "1px solid var(--crm-border, #e2e8f0)",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "var(--crm-shadow, 0 1px 3px rgba(0,0,0,0.04))",
        transition: "background 0.2s, border-color 0.2s",
        minWidth: 0,
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* ─── Header ─── */}
      <div
        style={{
          padding: headerPad,
          borderBottom: "1px solid var(--crm-border, #e2e8f0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: titleSize,
            color: "var(--crm-title, #0f172a)",
          }}
        >
          Audit Logs
        </span>
        <span
          onClick={() => router.push("/user/audit-logs")}
          style={{
            fontSize: viewAllSize,
            color: "var(--crm-primary, #087f5b)",
            cursor: "pointer",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          View All <ChevronRight size={13} strokeWidth={2.5} />
        </span>
      </div>

      {loading ? (
        <Spinner variant="center" size="md" color="primary" text="Loading audit logs..." />
      ) : error ? (
        <div style={{ padding: "30px", textAlign: "center", color: "var(--crm-red, #ef4444)", fontSize: msgFont }}>
          {error}
        </div>
      ) : (
        <div style={{ padding: isSmall ? "16px 18px" : "18px 22px" }}>
          {logs.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--crm-muted, #94a3b8)", fontSize: msgFont }}>
              No audit logs found
            </div>
          ) : (
            groups.map((group, groupIdx) => (
              <div key={group.title} style={{ marginBottom: groupIdx === groups.length - 1 ? "0" : "20px" }}>
                <h3
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--crm-title, #0f172a)",
                    marginBottom: "16px",
                    marginTop: "0",
                  }}
                >
                  {group.title}
                </h3>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  {group.items.map((log, i) => {
                    const isLastInGroup = i === group.items.length - 1;
                    const isLastOverall = groupIdx === groups.length - 1 && isLastInGroup;

                    return (
                      <div
                        key={log.id}
                        style={{
                          position: "relative",
                          paddingLeft: isSmall ? "24px" : "28px",
                          paddingBottom: isLastInGroup ? "4px" : "20px",
                        }}
                      >
                        {/* Vertical Connecting Line */}
                        {!isLastOverall && (
                          <div
                            style={{
                              position: "absolute",
                              left: isSmall ? "4px" : "4.5px",
                              top: `${dotSize + 4}px`,
                              bottom: isLastInGroup ? "-20px" : "-4px",
                              width: "2px",
                              background: "var(--crm-border, #e2e8f0)",
                              zIndex: 1,
                            }}
                          />
                        )}

                        {/* Timeline Marker Dot */}
                        <div
                          style={{
                            position: "absolute",
                            left: "0",
                            top: "5px",
                            width: `${dotSize}px`,
                            height: `${dotSize}px`,
                            borderRadius: "50%",
                            background: "var(--crm-primary, #087f5b)",
                            border: "2px solid var(--crm-card-bg, #ffffff)",
                            zIndex: 2,
                            boxShadow: "0 0 0 2px rgba(8, 127, 91, 0.2)",
                          }}
                        />

                        {/* Log Item Content */}
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                          {/* Round Initial Avatar */}
                          <ProfileAvatar name={log.actor} size={avatarSize} fontSize={isSmall ? "11px" : "12px"} />

                          {/* Message & Timestamp */}
                          <div style={{ flex: 1, minWidth: 0, marginTop: "-1px" }}>
                            <div
                              style={{
                                fontSize: msgFont,
                                color: "var(--crm-title, #0f172a)",
                                fontWeight: 600,
                                lineHeight: 1.4,
                                wordBreak: "break-word",
                              }}
                            >
                              {log.msg}
                            </div>
                            <div
                              style={{
                                fontSize: metaFont,
                                color: "var(--crm-muted, #64748b)",
                                marginTop: "3px",
                                fontWeight: 400,
                              }}
                            >
                              {log.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
