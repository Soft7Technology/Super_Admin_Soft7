"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Sidebar } from "../Sidebar";
import { Topbar } from "../Topbar";
import styles from "./AppShell.module.css";

const COLLAPSE_KEY = "soft7_superadmin_sidebar_collapsed";

/** Authenticated application frame: sidebar + topbar + scrollable content. */
export default function AppShell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    try {
      setDesktopCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* ignore */
    }
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setDesktopCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const closeNav = useCallback(() => setNavOpen(false), []);
  const openNav = useCallback(() => setNavOpen(true), []);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setNavOpen((prev) => !prev);
    } else {
      toggleCollapsed();
    }
  }, [isMobile, toggleCollapsed]);

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  // Route change: return the scroll container to the top and replay the
  // entrance animation. Alternating two identical keyframes restarts the
  // animation without remounting (and resetting) the page tree.
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(false);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    contentRef.current?.scrollTo({ top: 0 });
    setPhase((p) => !p);
  }, [pathname]);

  const isCollapsed = desktopCollapsed && !isMobile;

  return (
    <div className={styles.shell}>
      <Sidebar
        mobileOpen={navOpen}
        onMobileClose={closeNav}
        collapsed={isCollapsed}
        onToggleCollapse={toggleCollapsed}
      />
      <main id="app-main" className={styles.main}>
        <Topbar
          onOpenNavigation={openNav}
          sidebarCollapsed={isCollapsed}
          isMobile={isMobile}
          onToggleSidebar={toggleSidebar}
        />
        <div ref={contentRef} className={`${styles.content} ${phase ? styles.enterB : styles.enterA}`}>
          {children}
        </div>
      </main>
    </div>
  );
}

export { AppShell };
