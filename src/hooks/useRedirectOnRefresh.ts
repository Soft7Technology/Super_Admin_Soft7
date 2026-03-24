"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

function isReloadNavigation(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const navigationEntries = window.performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  const firstEntry = navigationEntries[0];

  if (firstEntry?.type) {
    return firstEntry.type === "reload";
  }

  const legacyNavigation = (window.performance as Performance & { navigation?: { type?: number } }).navigation;
  return legacyNavigation?.type === 1;
}

export function useRedirectOnRefresh(targetPath = "/user/dashboard") {
  const pathname = usePathname();
  const router = useRouter();
  const hasEvaluatedRef = useRef(false);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    if (hasEvaluatedRef.current) {
      return;
    }

    hasEvaluatedRef.current = true;

    if (!pathname?.startsWith("/user")) {
      return;
    }

    if (!isReloadNavigation()) {
      return;
    }

    // Don't redirect on page refresh - preserve current page
    return;
  }, [pathname, router, targetPath]);
}
