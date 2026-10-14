"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FocusEvent, MouseEvent, ReactNode, useEffect, useRef, useState } from "react";
import {
  Building2,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Settings,
  Shield,
  ShieldCheck,
  TicketPercent,
  UserCircle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import IconButton from "@/components/ui/IconButton";
import Logo from "@/components/Logo";
import styles from "./Sidebar.module.css";

/* ─────────────────────────────────────────────────────────────────────────────
   Navigation config — the single place the admin navigation is defined.
   ───────────────────────────────────────────────────────────────────────── */

interface NavLink {
  type: "link";
  label: string;
  href: string;
  icon: ReactNode;
}
interface NavGroup {
  type: "group";
  id: string;
  label: string;
  icon: ReactNode;
  children: { label: string; href: string }[];
}
type NavEntry = NavLink | NavGroup;

const ICON = 18;

const NAV_SECTIONS: { title: string; items: NavEntry[] }[] = [
  {
    title: "Overview",
    items: [{ type: "link", label: "Dashboard", href: "/user/dashboard", icon: <LayoutDashboard size={ICON} /> }],
  },
  {
    title: "Customers",
    items: [
      { type: "link", label: "Manage Companies", href: "/user/manage-companies", icon: <Building2 size={ICON} /> },
      { type: "link", label: "All User", href: "/user/all-user", icon: <Users size={ICON} /> },
      { type: "link", label: "Transactions", href: "/user/transactions", icon: <Receipt size={ICON} /> },
    ],
  },
  {
    title: "Operations",
    items: [
      { type: "link", label: "Support Tickets", href: "/user/support-tickets", icon: <TicketPercent size={ICON} /> },
      { type: "link", label: "Audit Logs", href: "/user/audit-logs", icon: <ClipboardList size={ICON} /> },
    ],
  },
  {
    title: "Administration",
    items: [
      { type: "link", label: "Permissions", href: "/user/permissions", icon: <ShieldCheck size={ICON} /> },
      { type: "link", label: "Profile", href: "/user/profile", icon: <UserCircle size={ICON} /> },
    ],
  },
];

const SETTINGS: NavLink = {
  type: "link",
  label: "System",
  href: "/user/system",
  icon: <Settings size={ICON} />,
};

const COLLAPSE_KEY = "soft7_superadmin_sidebar_collapsed";

const isRouteActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

/* ─────────────────────────────────────────────────────────────────────────── */

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose, collapsed: controlledCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname() || "";

  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const collapsed = controlledCollapsed ?? desktopCollapsed;

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [floating, setFloating] = useState<{ label: string; top: number; left: number } | null>(null);

  const navRef = useRef<HTMLElement>(null);
  const scrollPosRef = useRef(0);

  const toggleCollapsed = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setDesktopCollapsed((prev) => {
        try {
          localStorage.setItem(COLLAPSE_KEY, prev ? "0" : "1");
        } catch {
          /* ignore */
        }
        return !prev;
      });
    }
    setFloating(null);
  };

  /* Auto-open the group that contains the current route; close mobile drawer */
  useEffect(() => {
    const groups = NAV_SECTIONS.flatMap((s) => s.items);
    const next: Record<string, boolean> = {};
    for (const item of groups) {
      if (item.type === "group" && item.children.some((c) => isRouteActive(pathname, c.href))) {
        next[item.id] = true;
      }
    }
    setOpenGroups((prev) => ({ ...prev, ...next }));
    onMobileClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  /* Persist nav scroll position across navigations */
  useEffect(() => {
    if (navRef.current) navRef.current.scrollTop = scrollPosRef.current;
  }, [pathname]);

  /* Collapsed-mode labels rendered in a fixed layer (escapes overflow) */
  const labelProps = (label: string) =>
    collapsed
      ? {
          onMouseEnter: (e: MouseEvent<HTMLElement>) => {
            const r = e.currentTarget.getBoundingClientRect();
            setFloating({ label, top: r.top + r.height / 2, left: r.right + 10 });
          },
          onMouseLeave: () => setFloating(null),
          onFocus: (e: FocusEvent<HTMLElement>) => {
            const r = e.currentTarget.getBoundingClientRect();
            setFloating({ label, top: r.top + r.height / 2, left: r.right + 10 });
          },
          onBlur: () => setFloating(null),
          "aria-label": label,
        }
      : {};

  const renderLink = (item: NavLink) => {
    const active = isRouteActive(pathname, item.href);
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          className={cn(styles.item, active && styles.active)}
          aria-current={active ? "page" : undefined}
          {...labelProps(item.label)}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </Link>
      </li>
    );
  };

  const renderGroup = (group: NavGroup) => {
    const open = !!openGroups[group.id];
    const containsActive = group.children.some((c) => isRouteActive(pathname, c.href));
    const subId = `nav-group-${group.id}`;
    return (
      <li key={group.id}>
        <button
          type="button"
          className={cn(styles.item, open && styles.groupOpen, containsActive && styles.groupActive)}
          aria-expanded={open}
          aria-controls={subId}
          onClick={() => {
            if (collapsed) {
              toggleCollapsed();
              setOpenGroups((p) => ({ ...p, [group.id]: true }));
            } else {
              setOpenGroups((p) => ({ ...p, [group.id]: !open }));
            }
          }}
          {...labelProps(group.label)}
        >
          <span className={styles.icon}>{group.icon}</span>
          <span className={styles.label}>{group.label}</span>
          <ChevronDown size={15} className={styles.chevron} aria-hidden />
        </button>
        {open && (
          <ul id={subId} className={styles.subList}>
            {group.children.map((child) => {
              const active = isRouteActive(pathname, child.href);
              return (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    className={cn(styles.subItem, active && styles.subActive)}
                    aria-current={active ? "page" : undefined}
                  >
                    {child.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  };


  return (
    <>
      {mobileOpen && <div className={styles.backdrop} onClick={onMobileClose} aria-hidden />}
      <aside
        className={cn(styles.sidebar, collapsed && styles.collapsed, mobileOpen && styles.mobileOpen)}
        aria-label="Main navigation"
      >
        {collapsed ? (
          <button
            type="button"
            className={cn(styles.brand, styles.brandCollapsedButton)}
            onClick={toggleCollapsed}
            aria-label="Expand sidebar"
            title="Expand sidebar (Ctrl+B)"
            {...labelProps("Expand sidebar")}
          >
            <span className={styles.logo}>
              <Shield size={18} aria-hidden />
              <span className={styles.logoHoverIcon} aria-hidden>
                <PanelLeftOpen size={16} />
              </span>
            </span>
          </button>
        ) : (
          <div className={styles.brand}>
            <Link href="/user/dashboard" className={styles.brandLink} aria-label="Soft7 Super Admin — Dashboard">
              <Logo className={styles.brandLogo} />
            </Link>
            <IconButton
              aria-label="Collapse sidebar"
              title="Collapse sidebar (Ctrl+B)"
              size="sm"
              className={styles.collapseButton}
              icon={<PanelLeftClose size={17} />}
              onClick={toggleCollapsed}
            />
          </div>
        )}

        <nav
          ref={navRef}
          className={styles.nav}
          onScroll={() => {
            scrollPosRef.current = navRef.current?.scrollTop ?? 0;
            setFloating(null);
          }}
        >
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className={styles.section}>
              <p className={styles.sectionTitle}>{section.title}</p>
              <ul className={styles.list}>
                {section.items.map((item) => (item.type === "link" ? renderLink(item) : renderGroup(item)))}
              </ul>
            </div>
          ))}
        </nav>

        <div className={styles.footer}>
          <ul className={styles.list}>
            {renderLink(SETTINGS)}
            <li>
              <button
                type="button"
                className={cn(styles.item, styles.expandButton)}
                onClick={toggleCollapsed}
                title="Expand sidebar (Ctrl+B)"
                aria-label="Expand sidebar"
                {...labelProps("Expand sidebar")}
              >
                <span className={styles.icon}>
                  <PanelLeftOpen size={ICON} />
                </span>
                <span className={styles.label}>Expand sidebar</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {collapsed && floating && (
        <div className={styles.floatingLabel} style={{ top: floating.top, left: floating.left }} role="tooltip">
          {floating.label}
        </div>
      )}
    </>
  );
}

export default Sidebar;
