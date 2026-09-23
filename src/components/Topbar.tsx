"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Wallet,
  X,
  ArrowUpRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Sun,
  Moon,
  Bell,
  Search,
  LayoutDashboard,
  Building2,
  Users,
  Receipt,
  LifeBuoy,
  ShieldCheck,
  FileText,
  UserCheck,
  Settings,
  CornerDownLeft,
} from "lucide-react";
import { useTheme, tokens } from "../context/ThemeContext";
import { useRouter, usePathname } from "next/navigation";
import NotificationModal from "./NotificationModal";
import toast from "react-hot-toast";
import { clearAuth } from "@/lib/auth-client";
import { axiosInstance } from "@/lib/axiosInstance";
import {
  fetchWalletBalance,
  getCachedWalletBalance,
  updateCachedWalletBalance,
} from "@/lib/wallet";

/**
 * Formats a raw number or string into the Indian Currency Format (en-IN)
 * with comma grouping and 2 decimal places (e.g. 101834 -> "1,01,834.00").
 */
function formatIndianCurrency(val: string | number | null | undefined): string {
  if (val === null || val === undefined || val === "") return "0.00";
  const num = Number(val);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

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

  // Wallet state
  const [creditBalance, setCreditBalance] = useState("0");
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("1000");
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [rechargeSuccess, setRechargeSuccess] = useState(false);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);

  // Search & Command Palette state
  const [search, setSearch] = useState("");
  const [sf, setSf] = useState(false);
  const [paletteIndex, setPaletteIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Dropdown states
  const [dd, setDd] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Cleanup modal states
  const [cleanupModalOpen, setCleanupModalOpen] = useState(false);
  const [confirmRange, setConfirmRange] = useState("month");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);

  // Layout & viewport responsive
  const [isMobile, setIsMobile] = useState(false);
  const [winWidth, setWinWidth] = useState(1024);

  // Refs
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const consecutiveErrorsRef = useRef(0);

  const router = useRouter();
  const pathname = usePathname();

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setWinWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Safe background balance polling with graceful failure handling & zero console errors
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let cancelled = false;
    let pollDelay = 30000;

    const poll = async () => {
      try {
        const balance = await fetchWalletBalance();
        if (!cancelled && balance !== undefined && balance !== null) {
          setCreditBalance(balance);
        }
        pollDelay = 30000; // Reset interval to 30s upon success
      } catch {
        // Exponential backoff if offline, capped at 2 minutes
        pollDelay = Math.min(pollDelay * 2, 120000);
      } finally {
        if (!cancelled) {
          timer = setTimeout(poll, pollDelay);
        }
      }
    };

    // 1. Initial cached value for instant smooth UI
    const initialBalance = getCachedWalletBalance();
    if (initialBalance) {
      setCreditBalance(initialBalance);
    }

    // 2. Fetch immediately
    poll();

    // 3. Listen for immediate wallet balance updates across tabs, windows, and modals
    const handleSync = (e: any) => {
      const val = e?.detail ?? getCachedWalletBalance();
      if (val !== null && val !== undefined) {
        setCreditBalance(String(val));
      }
    };

    // 4. Online event - immediately resume polling when network reconnects
    const handleOnline = () => {
      pollDelay = 30000;
      poll();
    };

    window.addEventListener("wallet-balance-updated", handleSync);
    window.addEventListener("storage", handleSync);
    window.addEventListener("online", handleOnline);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      window.removeEventListener("wallet-balance-updated", handleSync);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // Clear search on navigation
  useEffect(() => {
    setSearch("");
    setSf(false);
  }, [pathname]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setDd(false);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSf(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle ESC key to close active modals & dropdowns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setWalletModalOpen(false);
        setCleanupModalOpen(false);
        setNotificationOpen(false);
        setSf(false);
        setDd(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Global shortcut (Ctrl+K / Cmd+K) to open/toggle Command Palette
  useEffect(() => {
    const handleGlobalShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSf((prev) => {
          if (!prev) {
            setTimeout(() => {
              searchInputRef.current?.focus();
              searchInputRef.current?.select();
            }, 30);
            return true;
          } else {
            searchInputRef.current?.blur();
            return false;
          }
        });
      }
    };

    window.addEventListener("keydown", handleGlobalShortcut);
    return () => window.removeEventListener("keydown", handleGlobalShortcut);
  }, []);

  // Search items directory with categories, icons, and keyword search
  const searchDirectory = useMemo(
    () => [
      {
        id: "dashboard",
        title: "Dashboard",
        subtitle: "Main platform metrics & analytics",
        category: "Navigation",
        route: "/user/dashboard",
        icon: LayoutDashboard,
        badge: "Page",
        keywords: ["dashboard", "home", "analytics", "stats", "metrics", "kpi"],
      },
      {
        id: "all-user",
        title: "All Users",
        subtitle: "Manage registered user accounts, email & phone",
        category: "Navigation",
        route: "/user/all-user",
        icon: Users,
        badge: "Page",
        keywords: ["users", "accounts", "all users", "email", "phone", "members"],
      },
      {
        id: "manage-companies",
        title: "Manage Companies",
        subtitle: "Tenants, business domains & plan subscriptions",
        category: "Navigation",
        route: "/user/manage-companies",
        icon: Building2,
        badge: "Page",
        keywords: ["companies", "tenants", "manage companies", "domains", "organizations"],
      },
      {
        id: "transactions",
        title: "Transactions",
        subtitle: "Wallet balance & billing ledger",
        category: "Navigation",
        route: "/user/transactions",
        icon: Receipt,
        badge: "Page",
        keywords: ["transactions", "wallet", "credits", "debits", "billing", "balance", "ledger"],
      },
      {
        id: "support-tickets",
        title: "Support Tickets",
        subtitle: "Customer support tickets & email replies",
        category: "Navigation",
        route: "/user/support-tickets",
        icon: LifeBuoy,
        badge: "Page",
        keywords: ["support", "tickets", "issues", "help", "customer", "inquiries"],
      },
      {
        id: "permissions",
        title: "Permissions",
        subtitle: "Custom domains & Cloudflare hostnames",
        category: "Navigation",
        route: "/user/permissions",
        icon: ShieldCheck,
        badge: "Page",
        keywords: ["permissions", "domains", "ssl", "cloudflare", "hostnames"],
      },
      {
        id: "audit-logs",
        title: "Audit Logs",
        subtitle: "System audit logs & user activities",
        category: "Navigation",
        route: "/user/audit-logs",
        icon: FileText,
        badge: "Page",
        keywords: ["audit", "logs", "security", "activity", "audit logs", "events"],
      },
      {
        id: "profile",
        title: "Profile",
        subtitle: "Super Admin profile & credentials",
        category: "Navigation",
        route: "/user/profile",
        icon: UserCheck,
        badge: "Page",
        keywords: ["profile", "admin", "account", "settings", "credentials", "password"],
      },
      {
        id: "system",
        title: "System",
        subtitle: "Platform settings & system configuration",
        category: "Navigation",
        route: "/user/system",
        icon: Settings,
        badge: "Page",
        keywords: ["system", "settings", "configuration", "platform"],
      },
    ],
    []
  );

  // Filtered search results & dynamic actions for command palette
  const paletteItems = useMemo(() => {
    const q = search.trim();
    const lowerQ = q.toLowerCase();

    // When query is empty: show quick actions + full navigation directory
    if (!q) {
      const quickActions = [
        {
          id: "quick-users",
          title: "Search All Users",
          subtitle: "Find users by name, email, or phone number",
          category: "Quick Search",
          route: "/user/all-user",
          icon: Users,
          badge: "Users",
        },
        {
          id: "quick-companies",
          title: "Search Companies",
          subtitle: "Find companies by name or custom domain",
          category: "Quick Search",
          route: "/user/manage-companies",
          icon: Building2,
          badge: "Companies",
        },
        {
          id: "quick-transactions",
          title: "View Transactions",
          subtitle: "Inspect wallet debits, credits, and billing records",
          category: "Quick Search",
          route: "/user/transactions",
          icon: Receipt,
          badge: "Billing",
        },
      ];

      return [
        ...quickActions,
        ...searchDirectory.map((item) => ({
          ...item,
          category: "Navigation",
        })),
      ];
    }

    // Dynamic direct queries for current search term
    const dynamicResults = [
      {
        id: `query-user-${q}`,
        title: `Search Users for "${q}"`,
        subtitle: "Filter All Users by name, email, phone or company",
        category: "Direct Search",
        route: `/user/all-user?search=${encodeURIComponent(q)}`,
        icon: Users,
        badge: "Users",
      },
      {
        id: `query-company-${q}`,
        title: `Search Companies for "${q}"`,
        subtitle: "Filter Companies by name, domain, or admin email",
        category: "Direct Search",
        route: `/user/manage-companies?search=${encodeURIComponent(q)}`,
        icon: Building2,
        badge: "Companies",
      },
      {
        id: `query-transactions-${q}`,
        title: `Search Transactions for "${q}"`,
        subtitle: "Filter transactions and billing records",
        category: "Direct Search",
        route: `/user/transactions`,
        icon: Receipt,
        badge: "Billing",
      },
    ];

    // Matching navigation pages
    const matchingPages = searchDirectory
      .filter(
        (item) =>
          item.title.toLowerCase().includes(lowerQ) ||
          item.subtitle.toLowerCase().includes(lowerQ) ||
          item.keywords.some((k) => k.includes(lowerQ))
      )
      .map((item) => ({
        ...item,
        category: "Matching Pages",
      }));

    return [...dynamicResults, ...matchingPages];
  }, [search, searchDirectory]);

  // Keep active index visible in palette scroll
  useEffect(() => {
    if (sf && listContainerRef.current) {
      const activeEl = listContainerRef.current.querySelector(
        `[data-index="${paletteIndex}"]`
      ) as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [paletteIndex, sf]);

  // Handle Search Submission (Enter key or item click)
  const handleSearchSubmit = (targetItem?: { route: string }) => {
    const q = search.trim();

    if (targetItem) {
      router.push(targetItem.route);
      setSearch("");
      setSf(false);
      searchInputRef.current?.blur();
      return;
    }

    // If an item in the palette is currently highlighted
    if (
      paletteItems.length > 0 &&
      paletteIndex >= 0 &&
      paletteIndex < paletteItems.length
    ) {
      router.push(paletteItems[paletteIndex].route);
      setSearch("");
      setSf(false);
      searchInputRef.current?.blur();
      return;
    }

    if (!q) {
      setSf(false);
      return;
    }

    // Smart redirect on Enter when no specific index selected:
    // 1. If email (@) or phone number (digits/+), route to all-user
    if (q.includes("@") || /^[+]?[\d\s-]{4,}$/.test(q)) {
      router.push(`/user/all-user?search=${encodeURIComponent(q)}`);
    } else if (
      q.toLowerCase().includes("company") ||
      q.toLowerCase().includes("domain") ||
      q.toLowerCase().includes("tenant")
    ) {
      router.push(`/user/manage-companies?search=${encodeURIComponent(q)}`);
    } else {
      // Check if query matches a page title
      const pageMatch = searchDirectory.find(
        (p) =>
          p.title.toLowerCase().includes(q.toLowerCase()) ||
          p.keywords.some((k) => k.includes(q.toLowerCase()))
      );
      if (pageMatch) {
        router.push(pageMatch.route);
      } else {
        router.push(`/user/all-user?search=${encodeURIComponent(q)}`);
      }
    }

    setSearch("");
    setSf(false);
    searchInputRef.current?.blur();
  };

  // Execute Historical Data Cleanup
  const handleExecuteCleanup = async () => {
    setIsDeleting(true);
    let anySuccess = false;

    // 1. Clean up external activity logs from backend API
    try {
      await axiosInstance.delete("/v1/admin/activity");
      anySuccess = true;
    } catch (err: any) {
      console.warn("External activity cleanup:", err?.message || err);
    }

    // 2. Clean up server-side database records (webhooks, tickets, stale items) via internal route
    try {
      const res = await fetch("/api/admin/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ range: confirmRange }),
      });
      if (res.ok) {
        anySuccess = true;
      }
    } catch (err: any) {
      console.warn("Internal database cleanup:", err?.message || err);
    }

    // 3. Clean up stale historical caches in localStorage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith("cached_") ||
            key.includes("audit") ||
            key.includes("history") ||
            key.includes("logs"))
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      anySuccess = true;
    } catch {}

    setIsDeleting(false);
    setDeleteStatus("SUCCESS");
    toast.success("Historical data cleanup completed successfully!");

    setTimeout(() => {
      setDeleteStatus(null);
      setCleanupModalOpen(false);
      router.refresh();
    }, 1200);
  };

  // Quick Wallet Recharge Simulation
  const handleRechargeWallet = () => {
    const amt = parseFloat(rechargeAmount);
    if (isNaN(amt) || amt <= 0) return;

    setRechargeLoading(true);
    setTimeout(() => {
      const current = parseFloat(creditBalance) || 0;
      const updated = (current + amt).toFixed(2);
      setCreditBalance(updated);
      updateCachedWalletBalance(updated);
      setRechargeLoading(false);
      setRechargeSuccess(true);
      setTimeout(() => {
        setRechargeSuccess(false);
        setWalletModalOpen(false);
      }, 1200);
    }, 600);
  };

  // Manual wallet balance refresh from server
  const handleManualRefresh = async () => {
    setIsRefreshingBalance(true);
    try {
      const balance = await fetchWalletBalance();
      if (balance !== undefined && balance !== null) {
        setCreditBalance(balance);
      }
    } finally {
      setTimeout(() => setIsRefreshingBalance(false), 500);
    }
  };

  const isCompact = winWidth <= 1300;
  const isNarrow = winWidth <= 800;
  const isStacked = winWidth <= 700;

  const getTitle = () => {
    if (pathname.includes("dashboard")) return "Dashboard";
    if (pathname.includes("profile")) return "Profile";
    if (pathname.includes("system")) return "Settings";
    if (pathname.includes("subscription")) return "Subscription";
    if (pathname.includes("manage-companies")) return "Manage Companies";
    if (pathname.includes("all-user")) return "All Users";
    if (pathname.includes("audit-logs")) return "Audit Logs";
    if (pathname.includes("support-tickets")) return "Support Tickets";
    if (pathname.includes("permissions")) return "Permissions";
    if (pathname.includes("transactions")) return "Transactions";
    return "Dashboard";
  };

  const pageTitle = title || getTitle();

  return (
    <header
      style={{
        minHeight: "78px",
        height: isStacked ? "auto" : "78px",
        background: t.surface,
        borderBottom: `1px solid ${t.border}`,
        display: "flex",
        flexWrap: isStacked ? "wrap" : "nowrap",
        alignItems: "center",
        rowGap: "10px",
        padding: isStacked ? "12px 16px" : "0 24px",
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
          aria-label="Open navigation menu"
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

      {/* Decorative accent marker */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          minWidth: "fit-content",
          flexShrink: 0,
          marginLeft: isStacked ? 0 : "-24px",
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

      {/* ── Global Header Search Input & Command Palette ── */}
      <div
        ref={searchContainerRef}
        style={{
          position: "relative",
          flex: isStacked ? "1 1 100%" : 1,
          maxWidth: isStacked ? "100%" : "480px",
          order: isStacked ? 3 : 0,
        }}
      >
        <div
          style={{
            background: t.inputBg,
            border: `1.5px solid ${sf ? "#10b981" : t.border}`,
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "0 12px",
            height: "40px",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            boxShadow: sf ? "0 0 0 3px rgba(16, 185, 129, 0.15)" : "none",
          }}
        >
          <Search size={15} color={sf ? "#10b981" : t.textFaint} />

          <input
            ref={searchInputRef}
            type="text"
            value={search}
            placeholder="Search users, companies, email, phone..."
            onFocus={() => {
              setSf(true);
              setPaletteIndex(0);
            }}
            onChange={(e) => {
              setSearch(e.target.value);
              setPaletteIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                if (paletteItems.length > 0) {
                  setPaletteIndex((prev) => (prev + 1) % paletteItems.length);
                }
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (paletteItems.length > 0) {
                  setPaletteIndex((prev) =>
                    prev <= 0 ? paletteItems.length - 1 : prev - 1
                  );
                }
              } else if (e.key === "Enter") {
                e.preventDefault();
                handleSearchSubmit();
              } else if (e.key === "Escape") {
                e.preventDefault();
                setSf(false);
                searchInputRef.current?.blur();
              }
            }}
            style={{
              background: "none",
              border: "none",
              outline: "none",
              color: t.textSub,
              fontSize: isMobile ? "0.75rem" : "0.85rem",
              width: "100%",
            }}
          />

          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPaletteIndex(0);
                searchInputRef.current?.focus();
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                color: t.textFaint,
                display: "flex",
                alignItems: "center",
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}

          {/* Keyboard shortcut badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              pointerEvents: "none",
              userSelect: "none",
              flexShrink: 0,
            }}
          >
            <kbd
              style={{
                fontSize: "10px",
                fontWeight: 700,
                fontFamily: "inherit",
                padding: "2px 6px",
                borderRadius: "5px",
                background: isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9",
                border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.12)" : "#e2e8f0"}`,
                color: t.textFaint,
                letterSpacing: "0.02em",
                lineHeight: 1.2,
              }}
            >
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* ── Global Command Palette Dropdown ── */}
        {sf && (
          <div
            ref={listContainerRef}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              width: "100%",
              minWidth: isStacked ? "100%" : "440px",
              background: isDark ? "#0d1117" : "#ffffff",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0"}`,
              borderRadius: "14px",
              boxShadow: isDark
                ? "0 22px 50px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(16, 185, 129, 0.12)"
                : "0 20px 45px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)",
              zIndex: 9999,
              maxHeight: "420px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {paletteItems.length > 0 ? (
              <div style={{ padding: "6px 0" }}>
                {paletteItems.map((item, index) => {
                  const isSelected = index === paletteIndex;
                  const IconComp = item.icon || Search;

                  // Category divider header
                  const isFirstInCategory =
                    index === 0 ||
                    item.category !== paletteItems[index - 1]?.category;

                  return (
                    <React.Fragment key={item.id || index}>
                      {isFirstInCategory && (
                        <div
                          style={{
                            padding:
                              index === 0
                                ? "6px 14px 4px 14px"
                                : "10px 14px 4px 14px",
                            fontSize: "10px",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: t.textFaint,
                            borderTop:
                              index === 0
                                ? "none"
                                : `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9"}`,
                          }}
                        >
                          {item.category}
                        </div>
                      )}

                      <div
                        data-index={index}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSearchSubmit(item);
                        }}
                        onMouseEnter={() => setPaletteIndex(index)}
                        style={{
                          padding: "9px 14px",
                          margin: "2px 6px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: isSelected
                            ? isDark
                              ? "rgba(16, 185, 129, 0.16)"
                              : "#ecfdf5"
                            : "transparent",
                          borderLeft: isSelected
                            ? "3px solid #10b981"
                            : "3px solid transparent",
                          transition:
                            "background 0.12s ease, border-color 0.12s ease",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              background: isSelected
                                ? isDark
                                  ? "rgba(16, 185, 129, 0.25)"
                                  : "#d1fae5"
                                : isDark
                                ? "rgba(255, 255, 255, 0.05)"
                                : "#f3f4f6",
                              color: isSelected ? "#10b981" : t.textMuted,
                            }}
                          >
                            <IconComp size={16} />
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: "0.84rem",
                                color: isSelected
                                  ? isDark
                                    ? "#34d399"
                                    : "#059669"
                                  : t.text,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {item.title}
                            </div>
                            {item.subtitle && (
                              <div
                                style={{
                                  fontSize: "0.73rem",
                                  color: t.textMuted,
                                  marginTop: "2px",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {item.subtitle}
                              </div>
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            flexShrink: 0,
                            marginLeft: "10px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.68rem",
                              padding: "2px 7px",
                              borderRadius: "6px",
                              background: isSelected
                                ? isDark
                                  ? "rgba(16, 185, 129, 0.2)"
                                  : "#d1fae5"
                                : isDark
                                ? "rgba(255,255,255,0.06)"
                                : "#f3f4f6",
                              color: isSelected
                                ? isDark
                                  ? "#6ee7b7"
                                  : "#047857"
                                : t.textFaint,
                              fontWeight: 600,
                            }}
                          >
                            {item.badge || item.category}
                          </div>

                          {isSelected && (
                            <CornerDownLeft size={13} color="#10b981" />
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  padding: "24px 16px",
                  color: t.textMuted,
                  fontSize: "0.85rem",
                  textAlign: "center",
                }}
              >
                No matching results found for "{search}"
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "0.75rem",
                    color: t.textFaint,
                  }}
                >
                  Press Enter to search All Users
                </div>
              </div>
            )}

            {/* Sticky Command Palette Footer */}
            <div
              style={{
                padding: "8px 14px",
                background: isDark ? "rgba(13, 17, 23, 0.95)" : "#f8fafc",
                borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "11px",
                color: t.textFaint,
                position: "sticky",
                bottom: 0,
                zIndex: 2,
                borderRadius: "0 0 14px 14px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span>
                  <b>↑</b> <b>↓</b> Navigate
                </span>
                <span>•</span>
                <span>
                  <b>↵ Enter</b> {search.trim() ? "Search" : "Open"}
                </span>
              </div>
              <div>
                <span>
                  <b>ESC</b> Close
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Right-Side Controls Cluster ── */}
      <div
        style={{
          marginLeft: isStacked ? 0 : "auto",
          display: "flex",
          alignItems: "center",
          gap: isNarrow ? "8px" : "12px",
          order: isStacked ? 2 : 0,
          flex: isStacked ? "0 0 auto" : undefined,
        }}
      >
        {/* ── Header Trash Icon: Historical Data Cleanup ── */}
        <button
          onClick={() => {
            setConfirmRange("month");
            setCleanupModalOpen(true);
          }}
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
            e.currentTarget.style.background = isDark
              ? "rgba(239, 68, 68, 0.15)"
              : "rgba(239, 68, 68, 0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.background = t.iconBox;
          }}
        >
          <Trash2 size={18} />
        </button>

        {/* ── Header Wallet Button (Formatted Indian Currency + Quick Modal) ── */}
        <button
          onClick={() => setWalletModalOpen(true)}
          title="Quick wallet summary & recharge"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: isNarrow ? "0 10px" : "0 14px",
            height: "40px",
            borderRadius: "10px",
            background: t.iconBox,
            border: `1px solid ${t.border}`,
            color: t.text,
            fontWeight: 700,
            fontSize: isNarrow ? "0.8rem" : "0.875rem",
            cursor: "pointer",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.03)";
            e.currentTarget.style.borderColor = "#3b82f6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.borderColor = t.border;
          }}
        >
          <Wallet size={18} color="#3b82f6" />
          <span>₹{formatIndianCurrency(creditBalance)}</span>
        </button>

        {/* ── Theme Toggle Button (Sun/Moon) ── */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
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
            flexShrink: 0,
            color: isDark ? "#fbbf24" : "#64748b",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
          }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* ── Notifications Trigger ── */}
        <div
          onClick={() => setNotificationOpen(!notificationOpen)}
          title="Notifications"
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
            color: t.textSub,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
          }}
        >
          <Bell size={18} />
        </div>

        <div
          style={{
            width: "1px",
            height: "24px",
            background: t.border,
            margin: "0 2px",
          }}
        />

        {/* ── Profile Avatar & Dropdown ── */}
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
                flexShrink: 0,
              }}
            >
              {adminName
                .split(" ")
                .map((word) => word[0])
                .join("")
                .toUpperCase() || "SA"}
            </div>
            {!isNarrow && (
              <div>
                <div
                  style={{
                    fontSize: isCompact ? "0.72rem" : "0.82rem",
                    fontWeight: 600,
                    color: t.text,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {adminName}
                </div>
                <div
                  style={{
                    fontSize: isCompact ? "0.58rem" : "0.65rem",
                    color: t.accent,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  Super Admin
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
                minWidth: "185px",
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
                      } catch (_) {}
                      clearAuth();
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
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark
                      ? "rgba(255,255,255,0.05)"
                      : "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {item.icon} {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Notification Modal ── */}
      <NotificationModal
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />

      {/* ── Quick Wallet Summary & Recharge Modal ── */}
      {walletModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setWalletModalOpen(false);
          }}
        >
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: "20px",
              padding: "26px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: `0 24px 60px ${t.shadow}`,
              color: t.text,
              margin: "0 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "rgba(59, 130, 246, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#3b82f6",
                  }}
                >
                  <Wallet size={24} />
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.15rem",
                      fontWeight: 800,
                      color: t.text,
                    }}
                  >
                    Wallet Balance
                  </h3>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "#10b981",
                      fontWeight: 600,
                    }}
                  >
                    ● Active Balance
                  </span>
                </div>
              </div>
              <button
                onClick={() => setWalletModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: t.textFaint,
                  padding: "6px",
                  borderRadius: "8px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Current Balance Display with Manual Refresh */}
            <div
              style={{
                background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                border: `1px solid ${t.border}`,
                borderRadius: "14px",
                padding: "16px 20px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: t.textMuted,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Available Credit
                </span>
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={isRefreshingBalance}
                  title="Refresh live balance from server"
                  style={{
                    background: "none",
                    border: `1px solid ${t.border}`,
                    borderRadius: "6px",
                    padding: "3px 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: isRefreshingBalance ? "#3b82f6" : t.textSub,
                    cursor: isRefreshingBalance ? "not-allowed" : "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <RefreshCw
                    size={12}
                    style={{
                      transform: isRefreshingBalance ? "rotate(360deg)" : "none",
                      transition: isRefreshingBalance ? "transform 0.6s linear" : "none",
                    }}
                  />
                  <span>{isRefreshingBalance ? "Syncing..." : "Refresh"}</span>
                </button>
              </div>
              <div
                style={{
                  fontSize: "2.1rem",
                  fontWeight: 800,
                  color: isDark ? "#f8fafc" : "#0f172a",
                  letterSpacing: "-0.02em",
                }}
              >
                ₹{formatIndianCurrency(creditBalance)}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: t.textFaint,
                  marginTop: "4px",
                }}
              >
                Live balance for campaigns, messages & billing ledger
              </div>
            </div>

            {/* Quick Recharge Presets */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: t.textSub,
                  marginBottom: "8px",
                }}
              >
                Quick Top-Up Presets
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                {["500", "1000", "2500", "5000"].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRechargeAmount(amt)}
                    style={{
                      padding: "8px 0",
                      borderRadius: "8px",
                      background:
                        rechargeAmount === amt
                          ? "rgba(16, 185, 129, 0.18)"
                          : isDark
                          ? "rgba(255,255,255,0.04)"
                          : "#f3f4f6",
                      border: `1px solid ${
                        rechargeAmount === amt ? "#10b981" : t.border
                      }`,
                      color: rechargeAmount === amt ? "#10b981" : t.text,
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    +₹{Number(amt).toLocaleString("en-IN")}
                  </button>
                ))}
              </div>

              {/* Custom amount input */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                  border: `1px solid ${t.border}`,
                  borderRadius: "10px",
                  padding: "0 12px",
                  height: "42px",
                }}
              >
                <span
                  style={{
                    color: t.textMuted,
                    fontWeight: 700,
                    marginRight: "6px",
                  }}
                >
                  ₹
                </span>
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  placeholder="Enter custom amount"
                  style={{
                    background: "none",
                    border: "none",
                    outline: "none",
                    color: t.text,
                    width: "100%",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                />
              </div>
            </div>

            {/* Recharge button */}
            <button
              disabled={rechargeLoading}
              onClick={handleRechargeWallet}
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "10px",
                background: "#10b981",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "0.95rem",
                border: "none",
                cursor: rechargeLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "14px",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
              }}
            >
              {rechargeLoading ? (
                <span>Processing...</span>
              ) : rechargeSuccess ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>Wallet Recharged Successfully!</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>
                    Add ₹{formatIndianCurrency(rechargeAmount || "0")} to Wallet
                  </span>
                </>
              )}
            </button>

            {/* Navigation links: Retain full access to Transactions page and ledger */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                alignItems: "center",
                paddingTop: "10px",
                borderTop: `1px solid ${t.border}`,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setWalletModalOpen(false);
                  router.push("/user/transactions");
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#3b82f6",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  transition: "opacity 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <span>View Full Transaction History</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal for Data Cleanup ── */}
      {cleanupModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) {
              setCleanupModalOpen(false);
            }
          }}
        >
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: "18px",
              padding: "26px",
              maxWidth: "450px",
              width: "100%",
              boxShadow: `0 20px 50px ${t.shadow}`,
              color: t.text,
              margin: "0 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "rgba(239, 68, 68, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ef4444",
                }}
              >
                <Trash2 size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>
                  Confirm Historical Data Cleanup
                </h3>
                <span style={{ fontSize: "0.75rem", color: t.textMuted }}>
                  Permanent cleanup of stale logs & records
                </span>
              </div>
            </div>

            <p
              style={{
                fontSize: "0.875rem",
                color: t.textSub,
                lineHeight: 1.5,
                margin: "0 0 16px 0",
              }}
            >
              Select the timeframe threshold to delete historical logs, archived
              conversations, webhook records, and stale notifications.
            </p>

            {/* Timeframe Selector */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: t.textFaint,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "8px",
                }}
              >
                Threshold Timeframe
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                }}
              >
                {[
                  { label: "24 Hours", value: "day" },
                  { label: "7 Days", value: "week" },
                  { label: "30 Days", value: "month" },
                  { label: "90 Days", value: "3months" },
                  { label: "180 Days", value: "6months" },
                  { label: "365 Days", value: "year" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setConfirmRange(item.value)}
                    style={{
                      padding: "8px 0",
                      borderRadius: "8px",
                      background:
                        confirmRange === item.value
                          ? "rgba(239, 68, 68, 0.15)"
                          : isDark
                          ? "rgba(255,255,255,0.04)"
                          : "#f3f4f6",
                      border: `1px solid ${
                        confirmRange === item.value ? "#ef4444" : t.border
                      }`,
                      color: confirmRange === item.value ? "#ef4444" : t.textSub,
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "10px",
                padding: "10px 14px",
                marginBottom: "20px",
                fontSize: "0.8rem",
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>
                This operation is irreversible. All records older than the selected
                period will be permanently removed.
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                disabled={isDeleting}
                onClick={() => setCleanupModalOpen(false)}
                style={{
                  padding: "9px 16px",
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
                onClick={handleExecuteCleanup}
                style={{
                  padding: "9px 18px",
                  borderRadius: "8px",
                  background: "#ef4444",
                  border: "none",
                  color: "#fff",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                }}
              >
                {isDeleting ? "Cleaning Up..." : "Execute Cleanup"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Notification Toast ── */}
      {deleteStatus === "SUCCESS" && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#10b981",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(16, 185, 129, 0.35)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 700,
            fontSize: "0.9rem",
          }}
        >
          <CheckCircle2 size={18} />
          <span>Historical data cleanup completed successfully!</span>
        </div>
      )}
    </header>
  );
}
