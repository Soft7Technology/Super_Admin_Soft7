"use client";

import React, { useState, useEffect, useRef } from "react";
import { Wallet } from "lucide-react";
import { useTheme, tokens } from "../context/ThemeContext";
import { useRouter, usePathname } from "next/navigation";
import NotificationModal from "./NotificationModal";
import { axiosInstance } from "@/lib/axiosInstance";

export default function Topbar({
  title = "Dashboard",
  adminName = "Admin",
  onMenuClick,
}: {
  title?: string;
  adminName?: string;
  onMenuClick?: () => void;
}) {
  const { isDark, toggleTheme } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;

  const [sf, setSf] = useState(false);
  const [dd, setDd] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [winWidth, setWinWidth] = useState(1024);

  const [cleanupOpen, setCleanupOpen] = useState(false);
  const [confirmRange, setConfirmRange] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<HTMLDivElement>(null);

const router = useRouter();
const pathname = usePathname();

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 640);
    setWinWidth(window.innerWidth);
  };

  handleResize();
  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);

useEffect(() => {
  setSearch("");
}, [pathname]);

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      profileMenuRef.current &&
      !profileMenuRef.current.contains(event.target as Node)
    ) {
      setDd(false);
    }
    if (
      cleanupRef.current &&
      !cleanupRef.current.contains(event.target as Node)
    ) {
      setCleanupOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);
  const isCompact = winWidth <= 1300;
  const isNarrow  = winWidth <= 800;
  
  const pages = [
    { name: "Dashboard", route: "/user/dashboard" },
    { name: "Manage Companies", route: "/user/manage-companies" },
    { name: "All User", route: "/user/all-user" },
    { name: "Subscription", route: "/user/subscription" },
    { name: "Audit Logs", route: "/user/audit-logs" },
    { name: "Settings", route: "/user/system" },
    { name: "Profile", route: "/user/profile" },
    { name: "Support Tickets", route: "/user/support-tickets" },
  ];

  const filteredPages = pages.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const getTitle = () => {
    if (pathname.includes("dashboard")) return "Dashboard";
    if (pathname.includes("profile")) return "Profile";
    if (pathname.includes("system")) return "Settings";
    if (pathname.includes("subscription")) return "Subscription";
    if (pathname.includes("manage-companies")) return "Manage Companies";
    if (pathname.includes("all-user")) return "All User";
    if (pathname.includes("audit-logs")) return "Audit Logs";
    if (pathname.includes("support-tickets")) return "Support Tickets";

    return "Dashboard";
  };

  const pageTitle = title || getTitle();

  return (
    <header
      style={{
        height: "78px",
        background: t.surface,
        borderBottom: `1px solid ${t.border}`,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: "16px",
        position: "sticky",
        top: 0,
        zIndex: 50,
        transition: "background 0.3s,border-color 0.3s",
      }}
    >
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          style={{
            fontSize: "20px",
            background: "none",
            border: "none",
            cursor: "pointer",
            marginRight: "10px",
            color: t.text,
          }}
        >
          ☰
        </button>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          minWidth: "fit-content",
          flexShrink: 0,
          marginLeft: "-24px",
        }}
      >
        <div
          style={{
            width: "5px",
            height: isMobile ? "26px" : "32px",
            borderRadius: "999px",
            background: "linear-gradient(180deg,#10b981,#14b8a6)",
          }}
        />
      </div>

      <div style={{ position: "relative", flex: 1, maxWidth: "420px" }}>
        <div
          style={{
            background: t.inputBg,
            border: `1px solid ${sf ? t.accent : t.border}`,
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "0 14px",
            height: "40px",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={t.textFaint}
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>

          <input
            type="text"
            value={search}
            placeholder="Search pages..."
            onFocus={() => setSf(true)}
            onBlur={() => setTimeout(() => setSf(false), 150)}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filteredPages.length > 0) {
                router.push(filteredPages[0].route);
              }
            }}
            style={{
              background: "none",
              border: "none",
              outline: "none",
              color: t.textSub,
              fontSize: isMobile ? "0.75rem" : "0.875rem",
              width: "100%",
            }}
          />
        </div>

        {sf && search && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              width: "100%",
              marginTop: "6px",
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: "10px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              zIndex: 999,
              overflow: "auto",
            }}
          >
            {filteredPages.length > 0 ? (
              filteredPages.map((item) => (
                <div
                  key={item.name}
                  onMouseDown={() => {
                    router.push(item.route);
                    setSearch("");
                    setSf(false);
                  }}
                  style={{
                    padding: isMobile ? "8px 10px" : "10px 14px",
                    cursor: "pointer",
                    borderBottom: `1px solid ${t.border}`,
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                  }}
                >
                  🔍 {item.name}
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "10px 14px",
                  color: t.textMuted,
                  fontSize: isMobile ? "0.75rem" : "0.875rem",
                }}
              >
                No results found
              </div>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {/* Data Cleanup Dropdown */}
        <div ref={cleanupRef} style={{ position: "relative" }}>
          <button
            onClick={() => setCleanupOpen(!cleanupOpen)}
            title="Clean up historical data"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: t.iconBox,
              border: `1px solid ${t.border}`,
              cursor: "pointer",
              color: "#ef4444",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.background = isDark ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.background = t.iconBox;
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>

          {cleanupOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: "12px",
                minWidth: "200px",
                overflow: "hidden",
                zIndex: 200,
                boxShadow: `0 12px 40px ${t.shadow}`,
              }}
            >
              <div
                style={{
                  padding: "10px 16px 6px 16px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: t.textFaint,
                  borderBottom: `1px solid ${t.border}`,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Cleanup Data
              </div>
              {[
                { label: "Day wise (24h)", value: "day" },
                { label: "Weekly (7d)", value: "week" },
                { label: "Monthly (30d)", value: "month" },
                { label: "3 Months (90d)", value: "3months" },
                { label: "6 Months (180d)", value: "6months" },
                { label: "Yearly (365d)", value: "year" },
              ].map((item) => (
                <div
                  key={item.value}
                  onClick={() => {
                    setConfirmRange(item.value);
                    setCleanupOpen(false);
                  }}
                  style={{
                    padding: "10px 16px",
                    fontSize: "0.85rem",
                    color: t.textSub,
                    cursor: "pointer",
                    transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
                    e.currentTarget.style.color = t.text;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = t.textSub;
                  }}
                >
                  🗑️ {item.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => router.push("/user/transactions")}
          title="View transactions"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: t.iconBox,
            border: `1px solid ${t.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: t.text,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
          }}
        >
          <Wallet size={18} />
        </button>

        <button
          onClick={toggleTheme}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: t.iconBox,
            border: `1px solid ${t.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {isDark ? "☀️" : "🌙"}
        </button>

        <div ref={dropdownRef} style={{ position: "relative" }}>
          <div
            onClick={() => setNotificationOpen(!notificationOpen)}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: t.iconBox,
              border: `1px solid ${t.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            🔔
          </div>
        </div>

        <div
          style={{
            width: "1px",
            height: "24px",
            background: t.border,
          }}
        />

        <div style={{ position: "relative" }} ref={profileMenuRef}>
          <div
            onClick={() => setDd((p) => !p)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: isNarrow ? "0" : isCompact ? "7px" : "10px",
              cursor: "pointer",
              padding: isNarrow
                ? "4px"
                : isCompact
                ? "4px 8px 4px 4px"
                : "5px 10px 5px 5px",
              borderRadius: isCompact ? "8px" : "10px",
              background: t.iconBox,
              border: `1px solid ${t.border}`,
              transition: "all 0.15s",
            }}
          >
            <div
              style={{
                width: isCompact ? "28px" : "32px",
                height: isCompact ? "28px" : "32px",
                borderRadius: isCompact ? "6px" : "8px",
                background: "linear-gradient(135deg,#10b981,#14b8a6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: isCompact ? "0.68rem" : "0.78rem",
                color: "#fff",
              }}
            >
              {adminName
                .split(" ")
                .map((word) => word[0])
                .join("")
                .toUpperCase()}
            </div>
            {!isNarrow && (
              <div>
                <div
                  style={{
                    fontSize: isCompact ? "0.72rem" : "0.82rem",
                    fontWeight: 600,
                    color: t.text,
                    lineHeight: 1.2,
                    transition: "color 0.3s",
                  }}
                >
                  {adminName}
                </div>
                <div
                  style={{
                    fontSize: isCompact ? "0.58rem" : "0.65rem",
                    color: t.accent,
                    fontWeight: 600,
                  }}
                >
                  Administrator
                </div>
              </div>
            )}
            <svg
              width={isCompact ? "10" : "12"}
              height={isCompact ? "10" : "12"}
              viewBox="0 0 24 24"
              fill="none"
              stroke={t.textFaint}
              strokeWidth="2.5"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {dd && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: "12px",
                minWidth: "175px",
                overflow: "hidden",
                zIndex: 200,
                boxShadow: `0 12px 40px ${t.shadow}`,
              }}
            >
              {[
                { icon: "👤", label: "Profile", route: "/user/profile" },
                { icon: "⚙️", label: "Settings", route: "/user/system" },
                { icon: "🚪", label: "Logout", red: true },
              ].map((item, i, arr) => (
                <div
                  key={item.label}
                  onClick={async (e) => {
                    e.stopPropagation();
                    setDd(false);

                    if (item.label === "Logout") {
                      try {
                        await fetch("/api/auth/logout", { method: "POST" });
                      } catch (_) {
                        // ignore — we clear everything regardless
                      }
                      // Clear local storage token
                      localStorage.removeItem("console_access_token");
                      // Clear client-side cookie
                      document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
                      document.cookie = "refreshToken=; path=/; max-age=0; SameSite=Lax";
                      router.replace("/auth");
                    } else if (item.route) {
                      router.push(item.route);
                    }
                  }}
                  style={{
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "0.85rem",
                    color: item.red ? "#f03e3e" : t.textSub,
                    cursor: "pointer",
                    borderBottom:
                      i < arr.length - 1 ? `1px solid ${t.border}` : "none",
                  }}
                >
                  {item.icon} {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <NotificationModal
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />

      {/* Confirmation Modal for Data Cleanup */}
      {confirmRange && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "440px",
              width: "100%",
              boxShadow: `0 20px 50px ${t.shadow}`,
              color: t.text,
              margin: "0 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "rgba(239, 68, 68, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ef4444",
                  fontSize: "20px",
                }}
              >
                ⚠️
              </div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>
                Confirm Data Deletion
              </h3>
            </div>

            <p style={{ fontSize: "0.9rem", color: t.textSub, lineHeight: 1.5, marginBottom: "20px" }}>
              Are you sure you want to delete all historical data (Messages, Conversations, Webhooks, Wallet Transactions, support tickets, and notifications) older than{" "}
              <strong>
                {confirmRange === "day"
                  ? "24 hours"
                  : confirmRange === "week"
                  ? "7 days"
                  : confirmRange === "month"
                  ? "30 days"
                  : confirmRange === "3months"
                  ? "90 days"
                  : confirmRange === "6months"
                  ? "180 days"
                  : "365 days"}
              </strong>
              ?
              <br />
              <br />
              <span style={{ color: "#ef4444", fontWeight: 600 }}>
                This action is permanent and cannot be undone.
              </span>
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                disabled={isDeleting}
                onClick={() => setConfirmRange(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: "transparent",
                  border: `1px solid ${t.border}`,
                  color: t.textSub,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    const response = await axiosInstance.post("/v1/admin/cleanup", { range: confirmRange });
                    const data = response.data;
                    if (data.success) {
                      setDeleteStatus("SUCCESS");
                      setTimeout(() => {
                        setDeleteStatus(null);
                        setConfirmRange(null);
                        router.refresh();
                      }, 2000);
                    } else {
                      alert(data.error || data.message || "Failed to perform database cleanup.");
                      setConfirmRange(null);
                    }
                  } catch (err: any) {
                    console.error("Cleanup error:", err);
                    const errMsg = err.response?.data?.message || err.response?.data?.error || "An error occurred while cleaning up data.";
                    alert(errMsg);
                    setConfirmRange(null);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: "#ef4444",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {isDeleting ? "Deleting..." : "Delete Data"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {deleteStatus === "SUCCESS" && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#10b981",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 600,
            fontSize: "0.9rem",
            animation: "slideIn 0.3s ease",
          }}
        >
          <span>✓</span> Data cleaned up successfully!
        </div>
      )}
    </header>
  );
}
