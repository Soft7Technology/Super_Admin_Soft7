"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
  ChevronRight,
  LogOut,
  Menu,
  Palette,
  Search,
  Settings,
  Trash2,
  User,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/lib/axiosInstance";
import { useThemeColors } from "@/theme";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Dropdown, { DropdownItem, DropdownLabel, DropdownSeparator } from "@/components/ui/Dropdown";
import IconButton from "@/components/ui/IconButton";
import Modal from "@/components/ui/Modal";
import NotificationModal from "@/components/NotificationModal";
import ThemeToggle from "../ThemeToggle";
import { SEARCH_DIRECTORY } from "./searchDirectory";
import styles from "./Topbar.module.css";

/* Breadcrumb labels for SuperAdmin route segments (matches the sidebar) */
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  "manage-companies": "Manage Companies",
  "all-user": "All Users",
  subscription: "Subscription",
  "audit-logs": "Audit Logs",
  system: "System",
  profile: "Profile",
  "support-tickets": "Support Tickets",
  permissions: "Permissions",
  transactions: "Transactions",
  "manage-transaction": "Manage Transactions",
  activity: "Activity",
  companies: "Companies",
  users: "Users",
  create: "Create",
};

/* Record ids (numbers, UUIDs, long ids) render as "Details" */
const isIdSegment = (s: string) => /^\d+$/.test(s) || /^[0-9a-f-]{16,}$/i.test(s) || /^[A-Za-z0-9_-]{20,}$/.test(s);

/* Historical-data cleanup ranges (unchanged from the original Topbar) */
const CLEANUP_RANGES = [
  { label: "Day wise (24h)", value: "day" },
  { label: "Weekly (7d)", value: "week" },
  { label: "Monthly (30d)", value: "month" },
  { label: "3 Months (90d)", value: "3months" },
  { label: "6 Months (180d)", value: "6months" },
  { label: "Yearly (365d)", value: "year" },
];

const CLEANUP_PERIOD: Record<string, string> = {
  day: "24 hours",
  week: "7 days",
  month: "30 days",
  "3months": "90 days",
  "6months": "180 days",
  year: "365 days",
};

interface TopbarProps {
  onOpenNavigation: () => void;
  sidebarCollapsed?: boolean;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
  /** Display name in the account menu */
  adminName?: string;
}

export function Topbar({ onOpenNavigation, isMobile = false, adminName = "Admin" }: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const { setPickerOpen } = useThemeColors();

  const [creditBalance, setCreditBalance] = useState("0");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationsRef = useRef<HTMLDivElement>(null);

  /* Close notifications on outside click */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* Search (frontend-only directory) */
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  /* Data cleanup */
  const [confirmRange, setConfirmRange] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);

  /* Wallet balance: cached value first, then API; refreshed every 30s */
  useEffect(() => {
    const fetchBalance = () => {
      const localBalance = localStorage.getItem("credit_balance");
      setCreditBalance(localBalance && localBalance !== "null" ? localBalance : "0");

      axiosInstance
        .get("/v1/admin/users/")
        .then((res) => {
          const balance = res.data?.data?.credit_balance;
          const finalBalance = balance === null || balance === undefined ? "0" : String(balance);
          setCreditBalance(finalBalance);
          localStorage.setItem("credit_balance", finalBalance);
        })
        .catch((err) => {
          console.error("Failed to fetch wallet balance", err);
        });
    };

    fetchBalance();
    const pollInterval = setInterval(fetchBalance, 30000);
    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    setSearch("");
    setMobileSearchOpen(false);
  }, [pathname]);

  const searchResults =
    search.trim() === ""
      ? []
      : SEARCH_DIRECTORY.filter((item) => {
          const q = search.toLowerCase();
          return item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q);
        });

  const goToResult = (route: string) => {
    router.push(route);
    setSearch("");
    setSearchFocused(false);
    setMobileSearchOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore — we clear everything regardless
    }
    localStorage.removeItem("console_access_token");
    document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "refreshToken=; path=/; max-age=0; SameSite=Lax";
    router.replace("/auth");
  };

  const handleCleanup = async () => {
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
    } catch (err: unknown) {
      console.error("Cleanup error:", err);
      const response = (err as { response?: { data?: { message?: string; error?: string } } }).response;
      alert(response?.data?.message || response?.data?.error || "An error occurred while cleaning up data.");
      setConfirmRange(null);
    } finally {
      setIsDeleting(false);
    }
  };

  /* Breadcrumbs (the "user" route segment is hidden) */
  const rawParts = pathname.split("/").filter(Boolean);
  const isDashboardPage = pathname === "/user/dashboard";
  const crumbs: { label: string; href?: string }[] = [];
  if (!isDashboardPage) crumbs.push({ label: "Dashboard", href: "/user/dashboard" });
  rawParts.forEach((part, i) => {
    if (i === 0 && part === "user") return;
    if (part === "dashboard" && i === 1) return;
    const href = "/" + rawParts.slice(0, i + 1).join("/");
    const decoded = decodeURIComponent(part);
    const label =
      SEGMENT_LABELS[decoded] ??
      (isIdSegment(decoded) ? "Details" : decoded.replace(/[-_]+/g, " ").replace(/^\w/, (c) => c.toUpperCase()));
    crumbs.push({ label, href });
  });
  const current = isDashboardPage ? "Dashboard" : crumbs[crumbs.length - 1]?.label ?? "Dashboard";
  const trail = isDashboardPage ? [] : crumbs.slice(0, -1);

  const showResults = (searchFocused || mobileSearchOpen) && search.trim() !== "";

  return (
    <>
      <header className={styles.topbar}>
        {/* Title / breadcrumbs */}
        <div className={styles.titleArea}>
          {isMobile && (
            <IconButton
              aria-label="Open navigation"
              className={styles.menuButton}
              icon={<Menu size={19} />}
              onClick={onOpenNavigation}
            />
          )}
          <nav aria-label="Breadcrumb" className={styles.crumbs}>
            {trail.length > 0 && (
              <span className={styles.crumbsTrail}>
                {trail.map((item, idx) => (
                  <Fragment key={`${item.label}-${idx}`}>
                    {item.href ? (
                      <Link href={item.href} className={styles.crumb}>
                        {item.label}
                      </Link>
                    ) : (
                      <span className={styles.crumb}>{item.label}</span>
                    )}
                    <ChevronRight size={14} className={styles.crumbSeparator} aria-hidden />
                  </Fragment>
                ))}
              </span>
            )}
            <span className={styles.current} aria-current="page">
              {current}
            </span>
          </nav>
        </div>

        {/* Search */}
        <div className={cn(styles.search, mobileSearchOpen && styles.searchMobileOpen)} role="search">
          <Search size={15} className={styles.searchIcon} aria-hidden />
          <input
            ref={searchInputRef}
            type="search"
            value={search}
            placeholder="Search users, companies, email, phone…"
            aria-label="Search"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchResults.length > 0) goToResult(searchResults[0].route);
              if (e.key === "Escape") {
                setSearch("");
                setMobileSearchOpen(false);
              }
            }}
            className={styles.searchInput}
          />
          {(search || mobileSearchOpen) && (
            <IconButton
              aria-label="Clear search"
              size="sm"
              className={styles.searchClear}
              icon={<X size={15} />}
              onClick={() => {
                setSearch("");
                setMobileSearchOpen(false);
              }}
            />
          )}
          {showResults && (
            <div className={styles.results} role="listbox" aria-label="Search results">
              {searchResults.length === 0 ? (
                <p className={styles.resultsEmpty}>
                  No matches for “{search}”. Try a name, email, or phone number.
                </p>
              ) : (
                searchResults.map((item, index) => (
                  <button
                    key={`${item.title}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={false}
                    className={styles.result}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      goToResult(item.route);
                    }}
                  >
                    <span className={styles.resultIcon}>
                      {item.subtitle === "Page" ? <ChevronRight size={15} /> : <User size={15} />}
                    </span>
                    <span className="min-w-0">
                      <span className={cn(styles.resultTitle, styles.truncate)}>{item.title}</span>
                      {item.subtitle && (
                        <span className={cn(styles.resultSubtitle, styles.truncate)}>{item.subtitle}</span>
                      )}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <IconButton
            aria-label="Search"
            className={styles.searchToggle}
            icon={<Search size={18} />}
            onClick={() => {
              setMobileSearchOpen((v) => !v);
              requestAnimationFrame(() => searchInputRef.current?.focus());
            }}
          />

          {/* Historical data cleanup */}
          <Dropdown
            width="13rem"
            trigger={
              <IconButton
                aria-label="Clean up historical data"
                title="Clean up historical data"
                className={styles.dangerAction}
                icon={<Trash2 size={18} />}
              />
            }
          >
            <DropdownLabel>Cleanup data</DropdownLabel>
            {CLEANUP_RANGES.map((item) => (
              <DropdownItem key={item.value} icon={<Trash2 size={14} />} onSelect={() => setConfirmRange(item.value)}>
                {item.label}
              </DropdownItem>
            ))}
          </Dropdown>

          {/* Wallet balance */}
          <button
            type="button"
            className={cn(styles.wallet, styles.hideSm)}
            onClick={() => router.push("/user/transactions")}
            title="View wallet transactions"
          >
            <Wallet size={15} aria-hidden />
            <span>₹{creditBalance}</span>
          </button>

          <ThemeToggle />
          <IconButton
            aria-label="Customize theme"
            className={styles.hideSm}
            icon={<Palette size={18} />}
            onClick={() => setPickerOpen(true)}
          />

          {/* Notifications */}
          <div className={styles.anchor} ref={notificationsRef}>
            <IconButton
              aria-label="Notifications"
              icon={<Bell size={18} />}
              dot={unreadCount > 0}
              active={notificationOpen}
              onClick={() => setNotificationOpen((v) => !v)}
            />
            <NotificationModal
              isOpen={notificationOpen}
              onClose={() => setNotificationOpen(false)}
              onUnreadChange={setUnreadCount}
            />
          </div>

          <span className={cn(styles.divider, styles.hideSm)} aria-hidden />

          {/* Profile */}
          <Dropdown
            width="14rem"
            trigger={
              <button type="button" className={styles.profileButton} aria-label="Account menu">
                <Avatar name={adminName} size="sm" />
                <span className={styles.profileName}>{adminName}</span>
              </button>
            }
          >
            <div className={styles.menuHeader}>
              <p className={styles.menuHeaderName}>{adminName}</p>
              <p className={styles.menuHeaderMeta}>Administrator</p>
            </div>
            <DropdownItem href="/user/profile" icon={<User size={15} />}>
              Profile
            </DropdownItem>
            <DropdownItem href="/user/system" icon={<Settings size={15} />}>
              Settings
            </DropdownItem>
            <DropdownItem onSelect={() => setPickerOpen(true)} icon={<Palette size={15} />}>
              Appearance
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem danger onSelect={handleLogout} icon={<LogOut size={15} />}>
              Logout
            </DropdownItem>
          </Dropdown>
        </div>
      </header>


      {/* Confirmation for data cleanup */}
      <Modal
        isOpen={!!confirmRange}
        onClose={() => !isDeleting && setConfirmRange(null)}
        size="sm"
        title="Confirm Data Deletion"
        footer={
          <>
            <Button variant="secondary" disabled={isDeleting} onClick={() => setConfirmRange(null)}>
              Cancel
            </Button>
            <Button variant="danger" disabled={isDeleting} onClick={handleCleanup}>
              {isDeleting ? "Deleting..." : "Delete Data"}
            </Button>
          </>
        }
      >
        <div className={styles.confirmBody}>
          <span className={styles.confirmIcon}>
            <AlertTriangle size={18} />
          </span>
          <p className={styles.confirmText}>
            Are you sure you want to delete all historical data (Messages, Conversations, Webhooks, Wallet
            Transactions, support tickets, and notifications) older than{" "}
            <strong>{confirmRange ? CLEANUP_PERIOD[confirmRange] ?? "365 days" : ""}</strong>?
            <span className={styles.confirmWarning}>This action is permanent and cannot be undone.</span>
          </p>
        </div>
      </Modal>

      {deleteStatus === "SUCCESS" && (
        <div className={styles.successToast} role="status">
          Data cleaned up successfully!
        </div>
      )}
    </>
  );
}

export default Topbar;
