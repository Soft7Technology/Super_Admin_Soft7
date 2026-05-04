"use client";
import React, { useState } from "react";
import { useTheme, tokens } from "../context/ThemeContext";
import { Trash2, Check, CheckCheck } from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
}

export default function NotificationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;

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
  const [hoveredId, setHoveredId] = useState<number | null>(null);

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "#10b981";
      case "error":
        return "#f03e3e";
      case "warning":
        return "#fb923c";
      case "info":
      default:
        return "#3b82f6";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "⚠";
      case "warning":
        return "!";
      case "info":
      default:
        return "ℹ";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.4)",
          zIndex: 999,
          animation: "fadeIn 0.2s ease-out",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "70px",
          right: "24px",
          width: "420px",
          maxHeight: "calc(100vh - 100px)",
          background: isDark ? tokens.dark.surface : tokens.light.surface,
          border: `1px solid ${isDark ? tokens.dark.border : tokens.light.border}`,
          borderRadius: "16px",
          boxShadow:
            "0 20px 60px rgba(0, 0, 0, 0.3), 0 0 1px rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          animation: "slideDown 0.3s ease-out",
          "@media (max-width: 768px)": {
            width: "calc(100vw - 32px)",
            right: "16px",
          },
        } as React.CSSProperties}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px",
            borderBottom: `1px solid ${isDark ? tokens.dark.border : tokens.light.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: isDark ? tokens.dark.text : tokens.light.text,
              margin: 0,
            }}
          >
            Notifications ({notifications.length})
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: isDark ? tokens.dark.textFaint : tokens.light.textFaint,
            }}
          >
            ✕
          </button>
        </div>

        {/* Action Bar */}
        <div
          style={{
            padding: "12px 16px",
            display: "flex",
            gap: "8px",
            borderBottom: `1px solid ${isDark ? tokens.dark.border : tokens.light.border}`,
            alignItems: "center",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={selectedIds.length === notifications.length}
              onChange={handleSelectAll}
              style={{
                width: "18px",
                height: "18px",
                cursor: "pointer",
              }}
            />
            <span
              style={{
                fontSize: "13px",
                color: isDark ? tokens.dark.textSub : tokens.light.textSub,
              }}
            >
              Select All
            </span>
          </label>

          <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
            <button
              onClick={handleMarkAllAsRead}
              title="Mark all as read"
              style={{
                background: isDark ? tokens.dark.iconBox : tokens.light.iconBox,
                border: `1px solid ${isDark ? tokens.dark.border : tokens.light.border}`,
                borderRadius: "8px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: isDark ? tokens.dark.textMuted : tokens.light.textMuted,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  isDark ? tokens.dark.border : tokens.light.border;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = isDark
                  ? tokens.dark.iconBox
                  : tokens.light.iconBox;
              }}
            >
              <CheckCheck size={18} />
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                title={`Delete ${selectedIds.length} selected`}
                style={{
                  background: "rgba(240, 62, 62, 0.1)",
                  border: "1px solid rgba(240, 62, 62, 0.3)",
                  borderRadius: "8px",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#f03e3e",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(240, 62, 62, 0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(240, 62, 62, 0.1)";
                }}
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "8px",
          }}
        >
          {notifications.length === 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "200px",
                color: isDark ? tokens.dark.textMuted : tokens.light.textMuted,
                fontSize: "14px",
              }}
            >
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  display: "flex",
                  gap: "10px",
                  padding: "12px",
                  borderRadius: "10px",
                  marginBottom: "6px",
                  background: notification.read
                    ? "transparent"
                    : isDark
                      ? "rgba(59, 130, 246, 0.08)"
                      : "rgba(59, 130, 246, 0.05)",
                  border: `1px solid ${notification.read ? "transparent" : isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.15)"}`,
                  transition: "all 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  setHoveredId(notification.id);
                  (e.currentTarget as HTMLElement).style.background = isDark
                    ? tokens.dark.iconBox
                    : tokens.light.iconBox;
                }}
                onMouseLeave={(e) => {
                  setHoveredId(null);
                  (e.currentTarget as HTMLElement).style.background =
                    notification.read
                      ? "transparent"
                      : isDark
                        ? "rgba(59, 130, 246, 0.08)"
                        : "rgba(59, 130, 246, 0.05)";
                }}
              >
                {/* Checkbox Placeholder/Container - Show only on hover or when selected */}
               {/* Checkbox Placeholder - always reserve space, show checkbox on hover/selected */}
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    flexShrink: 0,
                    marginTop: "2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    visibility: (hoveredId === notification.id || selectedIds.includes(notification.id)) ? "visible" : "hidden", // ✅ visibility instead of conditional render
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(notification.id)}
                    onChange={() => handleSelectNotification(notification.id)}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Type Icon */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: getTypeColor(notification.type),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "16px",
                    flexShrink: 0,
                  }}
                >
                  {getTypeIcon(notification.type)}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: notification.read ? 500 : 700,
                      color: isDark ? tokens.dark.text : tokens.light.text,
                      marginBottom: "4px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {notification.title}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: isDark ? tokens.dark.textSub : tokens.light.textSub,
                      marginBottom: "6px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {notification.message}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: isDark
                        ? tokens.dark.textMuted
                        : tokens.light.textMuted,
                    }}
                  >
                    {notification.timestamp}
                  </div>
                </div>

                {/* Actions */}
               {/* Actions - always visible */}
<div
  style={{
    display: "flex",
    gap: "4px",
    flexShrink: 0,
    alignItems: "center", 
    minWidth: "fit-content",
  }}
  onClick={(e) => e.stopPropagation()}
>
  {!notification.read ? (
    <button
      onClick={() => handleMarkAsRead(notification.id)}
      title="Mark as read"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: isDark ? tokens.dark.accent : tokens.light.accent,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "28px",  
        height: "28px",
        borderRadius: "6px",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.2)";
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(59,130,246,0.1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLButtonElement).style.background = "none";
      }}
    >
      <Check size={16} />   {/* 1 tick = unread */}
    </button>
  ) : (
    <div
      style={{
        width: "28px",
        height: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#10b981",  
      }}
      title="Read"
    >
      <CheckCheck size={16} />   {/* 2 ticks = read */}
    </div>
  )}

  <button
    onClick={() => handleDeleteNotification(notification.id)}
    title="Delete"
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      color: isDark ? tokens.dark.textMuted : tokens.light.textMuted,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "28px",
      height: "28px",
      borderRadius: "6px",
      transition: "all 0.2s",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLButtonElement).style.color = "#f03e3e";
      (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.2)";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLButtonElement).style.color = isDark
        ? tokens.dark.textMuted
        : tokens.light.textMuted;
      (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
    }}
  >
    <Trash2 size={16} />
  </button>
</div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 768px) {
          [style*="position: fixed"][style*="right: 24px"] {
            width: calc(100vw - 32px);
            right: 16px;
          }
        }
      `}</style>
    </>
  );
}
