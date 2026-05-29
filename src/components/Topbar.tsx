"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme, tokens } from "../context/ThemeContext";
import { useRouter, usePathname } from "next/navigation";
import NotificationModal from "./NotificationModal";

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

  const router = useRouter();
  const pathname = usePathname();

  // 🔥 Dropdown ref
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Clear search on route change
  useEffect(() => {
    setSearch("");
  }, [pathname]);

  // 🔥 Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDd(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

      {/* Title */}
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

        <div
          style={{
            fontSize: isMobile ? "1.1rem" : "1.5rem",
            fontWeight: 900,
            color: isDark ? "#f8fafc" : "#111827",
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            lineHeight: 1.2,
            paddingBottom: "2px",
          }}
        >
          {getTitle()}
        </div>
      </div>

      {/* Search */}
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

        {/* Suggestions */}
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

      {/* Right Section */}
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {/* Theme Toggle */}
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

        {/* Bell */}
        <div style={{ position: "relative" }}>
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

        {/* Avatar Dropdown */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <div
            onClick={() => setDd((p) => !p)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              padding: "5px 10px 5px 5px",
              borderRadius: "10px",
              background: t.iconBox,
              border: `1px solid ${t.border}`,
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg,#10b981,#14b8a6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "0.78rem",
                color: "#fff",
              }}
            >
              {adminName
                .split(" ")
                .map((word) => word[0])
                .join("")
                .toUpperCase()}
            </div>

            <div>
              <div
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: t.text,
                }}
              >
                {adminName}
              </div>

              <div
                style={{
                  fontSize: "0.65rem",
                  color: t.accent,
                  fontWeight: 600,
                }}
              >
                Administrator
              </div>
            </div>
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
                {
                  icon: "👤",
                  label: "Profile",
                  route: "/user/profile",
                },
                {
                  icon: "⚙️",
                  label: "Settings",
                  route: "/user/system",
                },
                {
                  icon: "🚪",
                  label: "Logout",
                  red: true,
                },
              ].map((item, i, arr) => (
                <div
                  key={item.label}
                  onClick={async () => {
                    if (item.label === "Logout") {
                      const response = await fetch("/api/auth/logout", {
                        method: "POST",
                      });

                      if (response.ok) {
                        router.push("/auth");
                      }
                    } else if (item.route) {
                      router.push(item.route);
                    }

                    setDd(false);
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
                      i < arr.length - 1
                        ? `1px solid ${t.border}`
                        : "none",
                  }}
                >
                  {item.icon} {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <NotificationModal
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />
    </header>
  );
}
