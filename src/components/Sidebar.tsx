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
    </aside>
  );
}