"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Settings,
  TicketPercent,
  UserCircle,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import Logo from "./Logo";

const BRAND = "#10b981";
const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 84;

type NavItem = {
  icon: LucideIcon;
  label: string;
  route: string;
};

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", route: "/user/dashboard" },
  { icon: Building2, label: "Manage Companies", route: "/user/manage-companies" },
  { icon: Users, label: "All User", route: "/user/all-user" },
  { icon: CreditCard, label: "Subscription", route: "/user/subscription" },
  { icon: ClipboardList, label: "Audit Logs", route: "/user/audit-logs" },
  { icon: Settings, label: "System", route: "/user/system" },
  { icon: UserCircle, label: "Profile", route: "/user/profile" },
  { icon: TicketPercent, label: "Support Tickets", route: "/user/support-tickets" },
];

function isRouteActive(pathname: string | null, route: string) {
  if (!pathname) return route === "/user/dashboard";
  return pathname === route || pathname.startsWith(`${route}/`);
}

export default function Sidebar({
  activeItem,
  onNavigate,
  onWidthChange,
}: {
  activeItem?: string;
  onNavigate?: (label: string) => void;
  onWidthChange?: (width: number) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark } = useTheme();
  const [expanded, setExpanded] = useState(true);

  const width = expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_sidebar_expanded");
      if (saved !== null) {
        setExpanded(saved === "true");
      }
    } catch {}
  }, []);

  useEffect(() => {
    onWidthChange?.(width);
  }, [onWidthChange, width]);

  const activeRoute = useMemo(() => {
    return (
      NAV_ITEMS.find((item) => isRouteActive(pathname, item.route))?.route ??
      NAV_ITEMS.find((item) => item.label === activeItem)?.route ??
      "/user/dashboard"
    );
  }, [activeItem, pathname]);

  const toggleExpanded = () => {
    setExpanded((previous) => {
      const next = !previous;
      try {
        localStorage.setItem("admin_sidebar_expanded", String(next));
      } catch {}
      return next;
    });
  };

  const handleNavigate = (item: NavItem) => {
    onNavigate?.(item.label);
    router.push(item.route);
  };

  return (
    <aside
      className="admin-sidebar"
      data-expanded={expanded}
      style={
        {
          "--sidebar-width": `${width}px`,
          "--brand": BRAND,
        } as React.CSSProperties
      }
    >
      <div className="admin-sidebar__shell">
        <div className="admin-sidebar__brand">
          <button
            type="button"
            className="admin-sidebar__brand-button"
            onClick={toggleExpanded}
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <span className="admin-sidebar__mark">
              <Logo />
            </span>
          </button>

          <button
            type="button"
            className="admin-sidebar__toggle"
            onClick={toggleExpanded}
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Admin navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeRoute === item.route;

            return (
              <button
                type="button"
                key={item.route}
                className="admin-sidebar__item"
                data-active={active}
                onClick={() => handleNavigate(item)}
                title={expanded ? undefined : item.label}
                aria-current={active ? "page" : undefined}
              >
                <span className="admin-sidebar__active-bar" />
                <span className="admin-sidebar__icon">
                  <Icon size={20} strokeWidth={2.25} />
                </span>
                {expanded && <span className="admin-sidebar__label">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar__footer">
          <span className="admin-sidebar__status-dot" />
          {expanded && (
            <span>
              System Online
              <small>{isDark ? "Dark Mode" : "Light Mode"}</small>
            </span>
          )}
        </div>
      </div>

      <style jsx>{`
        .admin-sidebar {
          width: var(--sidebar-width);
          height: 100vh;
          flex: 0 0 var(--sidebar-width);
          color: ${isDark ? "#f8fafc" : "#111827"};
          transition: width 220ms ease, flex-basis 220ms ease;
        }

        .admin-sidebar__shell {
          position: relative;
          display: flex;
          height: 100%;
          flex-direction: column;
          overflow: visible;
          border-right: 1px solid ${isDark ? "rgba(16,185,129,0.22)" : "#d1fae5"};
          background: ${isDark
            ? "linear-gradient(180deg,#07110e 0%,#0d1117 48%,#07140f 100%)"
            : "linear-gradient(180deg,#ffffff 0%,#f7fffb 52%,#ecfdf5 100%)"};
          box-shadow: ${isDark
            ? "18px 0 44px rgba(0,0,0,0.28)"
            : "16px 0 34px rgba(15,23,42,0.08)"};
        }

        .admin-sidebar__brand {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 76px;
          padding: 10px 48px 10px 14px;
          border-bottom: 1px solid ${isDark ? "rgba(148,163,184,0.12)" : "#d1fae5"};
        }

        .admin-sidebar__brand-button,
        .admin-sidebar__toggle,
        .admin-sidebar__item {
          border: 0;
          fontFamily: "'Inter', sans-serif",;
        }

        .admin-sidebar__brand-button {
          display: flex;
          min-width: 0;
          width: auto;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: transparent;
          padding: 0;
          color: inherit;
          text-align: left;
        }

        .admin-sidebar__brand-button:hover {
          background: transparent;
        }

        .admin-sidebar__mark {
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${expanded ? "90px" : "42px"};
          overflow: hidden;
          transition: width 0.25s ease;
        }

        .admin-sidebar__footer small {
          color: ${isDark ? "#94a3b8" : "#047857"};
          font-size: 0.72rem;
          font-weight: 700;
        }

        .admin-sidebar__toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          z-index: 5;
          display: grid;
          width: 28px;
          height: 28px;
          place-items: center;
          border: 1px solid ${isDark ? "rgba(16,185,129,0.35)" : "#a7f3d0"};
          border-radius: 999px;
          background: ${isDark ? "#0d1117" : "#ffffff"};
          color: var(--brand);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.15);
          transform: translateY(-50%);
        }

        .admin-sidebar__toggle:hover {
          background: var(--brand);
          color: #ffffff;
        }

        .admin-sidebar__nav {
          display: grid;
          gap: 6px;
          flex: 1;
          align-content: start;
          overflow-y: auto;
          padding: 16px 12px;
        }

        .admin-sidebar__nav::-webkit-scrollbar {
          width: 6px;
        }

        .admin-sidebar__nav::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.45);
        }

        .admin-sidebar__item {
          position: relative;
          display: flex;
          width: 100%;
          height: 46px;
          align-items: center;
          gap: 12px;
          overflow: hidden;
          border-radius: 12px;
          background: transparent;
          color: ${isDark ? "#cbd5e1" : "#334155"};
          padding: 0 13px;
          text-align: left;
          transition: background 180ms ease, color 180ms ease, box-shadow 180ms ease,
            transform 180ms ease;
        }

        .admin-sidebar[data-expanded="false"] .admin-sidebar__item {
          justify-content: center;
          padding: 0;
        }

        .admin-sidebar__item:hover {
          background: ${isDark ? "rgba(16,185,129,0.14)" : "#ecfdf5"};
          color: ${isDark ? "#ffffff" : "#047857"};
          transform: translateX(3px);
        }

        .admin-sidebar__item[data-active="true"] {
          background: ${isDark
            ? "linear-gradient(135deg,rgba(16,185,129,0.28),rgba(20,184,166,0.16))"
            : "linear-gradient(135deg,#d1fae5,#ecfdf5)"};
          color: ${isDark ? "#ffffff" : "#065f46"};
          box-shadow: inset 0 0 0 1px rgba(16, 185, 129, 0.28),
            0 10px 24px rgba(16, 185, 129, 0.14);
        }

        .admin-sidebar__active-bar {
          position: absolute;
          left: 0;
          top: 10px;
          width: 4px;
          height: 26px;
          border-radius: 0 999px 999px 0;
          background: var(--brand);
          opacity: 0;
          transition: opacity 180ms ease;
        }

        .admin-sidebar__item[data-active="true"] .admin-sidebar__active-bar {
          opacity: 1;
        }

        .admin-sidebar__icon {
          display: grid;
          flex: 0 0 22px;
          place-items: center;
          color: currentColor;
        }

        .admin-sidebar__label {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.92rem;
          font-weight: 750;
        }

        .admin-sidebar__footer {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 66px;
          padding: 14px 18px;
          border-top: 1px solid ${isDark ? "rgba(148,163,184,0.12)" : "#d1fae5"};
          color: ${isDark ? "#dbeafe" : "#065f46"};
          font-size: 0.8rem;
          font-weight: 800;
        }

        .admin-sidebar[data-expanded="false"] .admin-sidebar__footer {
          justify-content: center;
          padding-inline: 0;
        }

        .admin-sidebar__footer span:not(.admin-sidebar__status-dot) {
          display: grid;
          gap: 2px;
        }

        .admin-sidebar__status-dot {
          width: 9px;
          height: 9px;
          flex: 0 0 9px;
          border-radius: 999px;
          background: var(--brand);
          box-shadow: 0 0 0 5px rgba(16, 185, 129, 0.12), 0 0 18px rgba(16, 185, 129, 0.9);
        }
      `}</style>
    </aside>
  );
}
