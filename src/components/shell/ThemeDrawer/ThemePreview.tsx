"use client";

import { Bell, Building2, ClipboardList, LayoutDashboard, Search, Shield, Users } from "lucide-react";
import styles from "./ThemeDrawer.module.css";

/**
 * Miniature of the real application, built only from theme tokens — so it
 * shows exactly what a color change will do before it is saved.
 *
 * Purely decorative: inert controls, hidden from assistive tech.
 */
export default function ThemePreview() {
  return (
    <div className={styles.preview} aria-hidden>
      <div className={styles.previewApp}>
        <div className={styles.previewSidebar}>
          <div className={styles.previewBrand}>
            <span className={styles.previewLogo}>
              <Shield size={10} />
            </span>
            <span className={styles.previewBrandName}>Super Admin</span>
          </div>
          <span className={`${styles.previewNavItem} ${styles.previewNavActive}`}>
            <LayoutDashboard size={12} /> Dashboard
          </span>
          <span className={styles.previewNavItem}>
            <Building2 size={12} /> Companies
          </span>
          <span className={styles.previewNavItem}>
            <Users size={12} /> All Users
          </span>
          <span className={styles.previewNavItem}>
            <ClipboardList size={12} /> Audit Logs
          </span>
        </div>

        <div className={styles.previewMain}>
          <div className={styles.previewHeader}>
            <span className={styles.previewSearch}>
              <Search size={11} /> Search…
            </span>
            <Bell size={13} className={styles.previewHeaderIcon} />
            <span className={styles.previewAvatar}>AA</span>
          </div>

          <div className={styles.previewBody}>
            <div className={styles.previewCards}>
              <div className={styles.previewCard}>
                <span className={styles.previewCardLabel}>Companies</span>
                <strong className={styles.previewCardValue}>248</strong>
                <span className={styles.previewTrack}>
                  <span className={styles.previewFill} style={{ width: "72%" }} />
                </span>
              </div>
              <div className={styles.previewCard}>
                <span className={styles.previewCardLabel}>Renewals</span>
                <strong className={styles.previewCardValue}>94.2%</strong>
                <span className={styles.previewTrack}>
                  <span className={styles.previewFill} style={{ width: "94%" }} />
                </span>
              </div>
            </div>

            <div className={styles.previewActions}>
              <span className={styles.previewBtnPrimary}>Primary</span>
              <span className={styles.previewBtnOutline}>Secondary</span>
              <span className={styles.previewBadge}>Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
