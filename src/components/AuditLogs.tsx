"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

function useWindowWidth() {
  const [width, setWidth] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
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
  if (!name) return "U";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
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
  const t = isDark ? tokens.dark : tokens.light;
  const width = useWindowWidth();
  const isSmall  = width <= 1000;
  const isMedium = width <= 1300;

  // Responsive sizes
  const titleSize   = isSmall ? "0.92rem" : isMedium ? "1rem"   : "1.18rem";
  const viewAllSize = isSmall ? "0.78rem" : isMedium ? "0.85rem" : "0.95rem";
  const headerPad   = isSmall ? "14px 16px 12px" : isMedium ? "18px 20px 16px" : "24px 26px 20px";
  const msgFont     = isSmall ? "0.82rem" : isMedium ? "0.88rem" : "0.95rem";
  const metaFont    = isSmall ? "0.72rem" : isMedium ? "0.78rem" : "0.82rem";
  const avatarSize  = isSmall ? 32 : isMedium ? 36 : 40;
  const dotSize     = isSmall ? 10 : 12;

  // Green theme color
  const themeGreen = "#10b981";

  // Group logs artificially for the timeline view demonstration
  const todayLogs = logs.filter(l => l.time.includes("min") || l.time.includes("hour"));
  const earlierLogs = logs.filter(l => !l.time.includes("min") && !l.time.includes("hour"));

  const groups = [];
  if (todayLogs.length > 0) groups.push({ title: "Today", items: todayLogs });
  if (earlierLogs.length > 0) groups.push({ title: "This Week", items: earlierLogs });
  if (groups.length === 0 && logs.length > 0) groups.push({ title: "Today", items: logs });

  return (
    <div style={{ background:t.surface, border:`2px solid ${t.border}`, borderRadius: isSmall ? "12px" : "16px", overflow:"hidden", boxShadow:"0 8px 24px rgba(16,185,129,0.08)", transition:"background 0.3s,border-color 0.3s" }}>
      <div style={{ padding: headerPad, borderBottom:`2px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontWeight:800, fontSize: titleSize, color:t.text }}>Activity Logs</span>
        <span onClick={() => router.push("/user/activity")} style={{ fontSize: viewAllSize, color: themeGreen, cursor:"pointer", fontWeight:800, display:"flex", alignItems:"center", gap:"6px" }}>
          View All <svg width={isSmall ? "12" : "14"} height={isSmall ? "12" : "14"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </span>
      </div>
      
      {loading ? (
        <div style={{ padding:"30px", textAlign:"center", color:t.textFaint, fontSize: msgFont }}>Loading activity...</div>
      ) : error ? (
        <div style={{ padding:"30px", textAlign:"center", color:t.textFaint, fontSize: msgFont }}>{error}</div>
      ) : (
        <div style={{ padding: isSmall ? "16px 20px" : "20px 28px" }}>
          {logs.length === 0 ? (
            <div style={{ padding:"20px", textAlign:"center", color:t.textFaint, fontSize: msgFont }}>No activity found</div>
          ) : (
            groups.map((group, groupIdx) => (
              <div key={group.title} style={{ marginBottom: groupIdx === groups.length - 1 ? "0" : "24px" }}>
                <h3 style={{ 
                  fontSize: isSmall ? "0.9rem" : "1rem", 
                  fontWeight: 700, 
                  color: t.text, 
                  marginBottom: "16px",
                  marginTop: "0" 
                }}>
                  {group.title}
                </h3>
                
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {group.items.map((log, i) => {
                    const isLastInGroup = i === group.items.length - 1;
                    const isLastOverall = groupIdx === groups.length - 1 && isLastInGroup;
                    const s = SEV[log.sev] ?? SEV["info"];
                    
                    return (
                      <div key={log.id} style={{ position: "relative", paddingLeft: isSmall ? "24px" : "32px", paddingBottom: isLastInGroup ? "0" : "24px" }}>
                        {/* Vertical Line */}
                        {!isLastOverall && (
                          <div style={{
                            position: "absolute",
                            left: isSmall ? "4px" : "5px",
                            top: `${dotSize + 4}px`,
                            bottom: isLastInGroup ? "-24px" : "-4px",
                            width: "2px",
                            background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                            zIndex: 1
                          }} />
                        )}
                        
                        {/* Dot */}
                        <div style={{
                          position: "absolute",
                          left: "0",
                          top: "4px",
                          width: `${dotSize}px`,
                          height: `${dotSize}px`,
                          borderRadius: "50%",
                          background: themeGreen,
                          border: `2px solid ${t.surface}`,
                          zIndex: 2,
                          boxShadow: `0 0 0 2px ${isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.1)'}`
                        }} />

                        {/* Content */}
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                          {/* Avatar */}
                          <div style={{
                            width: `${avatarSize}px`, 
                            height: `${avatarSize}px`, 
                            borderRadius: "50%",
                            background: s.bg, 
                            color: s.color,
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            fontSize: isSmall ? "11px" : "13px",
                            fontWeight: 800,
                            flexShrink: 0,
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                          }}>
                            {getInitials(log.actor)}
                          </div>
                          
                          {/* Text */}
                          <div style={{ flex: 1, marginTop: "-2px" }}>
                            <div style={{ fontSize: msgFont, color: t.textSub, fontWeight: 600, lineHeight: 1.4 }}>
                              {log.msg}
                            </div>
                            <div style={{ fontSize: metaFont, color: t.textFaint, marginTop: "4px", fontWeight: 500 }}>
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

