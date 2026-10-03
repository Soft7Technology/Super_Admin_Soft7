"use client";

import React, { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Settings,
  TicketPercent,
  UserCircle,
  Users,
  Receipt,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import Logo from "./Logo";

const BRAND = "#206bc4";
const SIDEBAR_WIDTH = 260;

type NavItem = {
  icon: LucideIcon;
  label: string;
  route: string;
};

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", route: "/user/dashboard" },
  { icon: Building2, label: "Manage Companies", route: "/user/manage-companies" },
  { icon: Users, label: "All User", route: "/user/all-user" },
  // { icon: CreditCard, label: "Subscription", route: "/user/subscription" },
  { icon: ClipboardList, label: "Audit Logs", route: "/user/audit-logs" },
  { icon: Settings, label: "System", route: "/user/system" },
  { icon: UserCircle, label: "Profile", route: "/user/profile" },
  { icon: TicketPercent, label: "Support Tickets", route: "/user/support-tickets" },
  { icon: ShieldCheck, label: "Permissions", route: "/user/permissions" },
  { icon: Receipt, label: "Transactions", route: "/user/transactions" }
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

  // Notify parent of fixed width on mount
  React.useEffect(() => {
    onWidthChange?.(SIDEBAR_WIDTH);
  }, [onWidthChange]);

  const activeRoute = useMemo(() => {
    return (
      NAV_ITEMS.find((item) => isRouteActive(pathname, item.route))?.route ??
      NAV_ITEMS.find((item) => item.label === activeItem)?.route ??
      "/user/dashboard"
    );
  }, [activeItem, pathname]);

  const handleNavigate = (item: NavItem) => {
    onNavigate?.(item.label);
    router.push(item.route);
  };

  return (
    <aside
      className="admin-sidebar"
      style={{ "--brand": BRAND } as React.CSSProperties}
    >
      <div className="admin-sidebar__shell">
        {/* ── Brand / Logo ── */}
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__mark">
            <Logo />
          </span>
        </div>

        {/* ── Navigation ── */}
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
                aria-current={active ? "page" : undefined}
              >
                
                <span className="admin-sidebar__icon">
                  <Icon size={20} strokeWidth={2.25} />
                </span>
                <span className="admin-sidebar__label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Footer ── */}
        <div className="admin-sidebar__footer">
          <span className="admin-sidebar__status-dot" />
          <span>
            System Online
            <small>{isDark ? "Dark Mode" : "Light Mode"}</small>
          </span>
        </div>
      </div>

      <style jsx>{`
        .admin-sidebar {
          width: ${SIDEBAR_WIDTH}px;
          height: 100vh;
          flex: 0 0 ${SIDEBAR_WIDTH}px;
          color: ${isDark ? "#f8fafc" : "#111827"};
        }

        .admin-sidebar__shell {
          display: flex;
          height: 100%;
          flex-direction: column;
          overflow: hidden;
          border-right: 1px solid ${isDark ? "#233144" : "#e6e8eb"};
          background: ${isDark ? "#182230" : "#ffffff"};
        }

        .admin-sidebar__brand {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 70px;
          padding: 4px 8px;
          border-bottom: 1px solid ${isDark ? "#233144" : "#e6e8eb"};
          background: ${isDark ? "transparent" : "#ffffff"};
        }

        .admin-sidebar__mark {
          display: flex;
          align-items: center;
          justify-content: center;
          width: auto;
          margin: 0;
          line-height: 1;
        }

        /* ── Nav ── */
        .admin-sidebar__nav {
          display: grid;
          gap: 4px;
          flex: 1;
          align-content: start;
          overflow-y: auto;
          padding: 16px 12px;
        }

        .admin-sidebar__nav::-webkit-scrollbar {
          width: 5px;
        }

        .admin-sidebar__nav::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: ${isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(32, 107, 196, 0.2)"};
        }

        .admin-sidebar__item {
          position: relative;
          display: flex;
          width: 100%;
          height: 44px;
          align-items: center;
          gap: 12px;
          overflow: hidden;
          border-radius: 8px;
          border: 0;
          background: transparent;
          color: ${isDark ? "#e2e8f0" : "#334155"};
          padding: 0 14px;
          font-family: inherit;
          text-align: left;
          transition: background 150ms ease, color 150ms ease, transform 150ms ease;
          cursor: pointer;
        }

        .admin-sidebar__item:hover {
          background: ${isDark ? "rgba(32, 107, 196, 0.16)" : "rgba(32, 107, 196, 0.09)"};
          color: ${isDark ? "#ffffff" : "#206bc4"};
          transform: translateX(2px);
        }

        .admin-sidebar__item[data-active="true"] {
          background: #206bc4;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(32, 107, 196, 0.25);
        }

        .admin-sidebar__item[data-active="true"]:hover {
          background: #1c5fac;
          color: #ffffff;
          transform: none;
        }

        /* ── Active bar ── */
        .admin-sidebar__icon {
          display: grid;
          flex: 0 0 20px;
          place-items: center;
          color: currentColor;
        }

        .admin-sidebar__label {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.92rem;
          font-weight: 650;
          letter-spacing: -0.01em;
        }

        /* ── Footer ── */
        .admin-sidebar__footer {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 60px;
          padding: 12px 18px;
          border-top: 1px solid ${isDark ? "#233144" : "#e6e8eb"};
          color: ${isDark ? "#f1f5f9" : "#1e293b"};
          font-size: 0.82rem;
          font-weight: 700;
        }

        .admin-sidebar__footer span:not(.admin-sidebar__status-dot) {
          display: grid;
          gap: 2px;
        }

        .admin-sidebar__footer small {
          color: ${isDark ? "#94a3b8" : "#64748b"};
          font-size: 0.72rem;
          font-weight: 600;
        }

        .admin-sidebar__status-dot {
          width: 8px;
          height: 8px;
          flex: 0 0 8px;
          border-radius: 999px;
          background: #2fb344;
          box-shadow: 0 0 0 4px rgba(47, 179, 68, 0.2);
        }
      `}</style>
    </aside>
  );
}