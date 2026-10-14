"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, Bell, Check, CheckCheck, CheckCircle2, Info, Trash2, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Checkbox from "@/components/ui/Checkbox";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
}

const TYPE_META: Record<Notification["type"], { icon: LucideIcon; tone: string }> = {
  info:    { icon: Info,          tone: "bg-info-bg text-info" },
  success: { icon: CheckCircle2,  tone: "bg-success-bg text-success" },
  warning: { icon: AlertTriangle, tone: "bg-warning-bg text-warning" },
  error:   { icon: XCircle,       tone: "bg-error-bg text-error" },
};

/**
 * Notifications popover — same surface as WA_Admin's topbar notifications.
 * Anchored by the topbar's relative wrapper; the topbar handles outside-click.
 * Stays mounted while closed so read/delete state survives toggling.
 */
export default function NotificationModal({
  isOpen,
  onUnreadChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUnreadChange?: (count: number) => void;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "New User Registration",
      message: "A new super admin user has registered",
      timestamp: "2 hours ago",
      read: false,
      type: "info",
    },
    {
      id: 2,
      title: "Subscription Expired",
      message: "Company ABC's subscription has expired",
      timestamp: "1 day ago",
      read: true,
      type: "warning",
    },
    {
      id: 3,
      title: "Support Ticket Closed",
      message: "Ticket #12345 has been successfully resolved",
      timestamp: "3 days ago",
      read: true,
      type: "success",
    },
    {
      id: 4,
      title: "System Alert",
      message: "High server load detected on production",
      timestamp: "5 days ago",
      read: false,
      type: "error",
    },
    {
      id: 5,
      title: "Audit Log Update",
      message: "New audit entries have been recorded",
      timestamp: "1 week ago",
      read: true,
      type: "info",
    },
  ]);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const unread = notifications.filter((n) => !n.read).length;
  useEffect(() => {
    onUnreadChange?.(unread);
  }, [unread, onUnreadChange]);

  const handleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n.id));
    }
  };

  const handleSelectNotification = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((nId) => nId !== id) : [...prev, id]
    );
  };

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setSelectedIds((prev) => prev.filter((nId) => nId !== id));
  };

  const handleDeleteSelected = () => {
    setNotifications((prev) =>
      prev.filter((n) => !selectedIds.includes(n.id))
    );
    setSelectedIds([]);
  };

  if (!isOpen) return null;

  const allSelected = notifications.length > 0 && selectedIds.length === notifications.length;

  return (
    <div
      role="dialog"
      aria-label="Notifications"
      className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[0.9375rem] font-semibold text-foreground">Notifications</h3>
          {notifications.length > 0 && (
            <span className="rounded-full bg-primary-light px-2 py-0.5 text-[11px] font-semibold text-primary-text">
              {notifications.length}
            </span>
          )}
        </div>
        {notifications.length > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-primary-text hover:bg-primary-lighter"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Selection bar */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-2">
          <Checkbox label="Select All" checked={allSelected} onChange={handleSelectAll} />
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-error hover:bg-error-bg"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete ({selectedIds.length})
            </button>
          )}
        </div>
      )}

      {/* List */}
      <div className="max-h-[22rem] divide-y divide-border-subtle overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((n) => {
            const meta = TYPE_META[n.type] ?? TYPE_META.info;
            const Icon = meta.icon;
            return (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 transition-colors",
                  n.read ? "opacity-75 hover:bg-surface-hover hover:opacity-100" : "bg-primary-lighter hover:bg-surface-hover",
                )}
              >
                <Checkbox
                  aria-label={`Select ${n.title}`}
                  checked={selectedIds.includes(n.id)}
                  onChange={() => handleSelectNotification(n.id)}
                  className="mt-1"
                />
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", meta.tone)}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.8125rem] font-semibold text-foreground">{n.title}</p>
                  <p className="mt-0.5 text-[0.8125rem] leading-snug text-secondary-foreground">{n.message}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{n.timestamp}</p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  {n.read ? (
                    <span className="p-1 text-primary-text" title="Read">
                      <CheckCheck className="h-4 w-4" />
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(n.id)}
                      title="Mark as read"
                      aria-label="Mark as read"
                      className="rounded-md p-1 text-muted-foreground hover:bg-surface-active hover:text-primary-text"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteNotification(n.id)}
                    title="Delete"
                    aria-label="Delete notification"
                    className="rounded-md p-1 text-muted-foreground hover:bg-error-bg hover:text-error"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary-text">
              <Bell className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">No notifications</p>
            <p className="mt-0.5 text-xs text-muted-foreground">You are all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
