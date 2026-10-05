"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ShieldCheck,
  TicketPercent,
  Receipt,
  Settings,
  UserCircle,
  ChevronRight,
  Zap,
} from "lucide-react";

interface ActionItem {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  bgColor: string;
  badge?: string;
}

export default function QuickAdminActions() {
  const router = useRouter();

  const actions: ActionItem[] = [
    {
      id: "add-company",
      title: "Add Company",
      desc: "Register a new business & admin account",
      icon: <Building2 size={18} strokeWidth={2.2} />,
      route: "/user/manage-companies/create",
      color: "var(--crm-primary, #206bc4)",
      bgColor: "rgba(32, 107, 196, 0.12)",
      badge: "+ Add",
    },
    {
      id: "permissions",
      title: "Domain Approvals",
      desc: "Review & approve custom domain requests",
      icon: <ShieldCheck size={18} strokeWidth={2.2} />,
      route: "/user/permissions",
      color: "var(--crm-green, #2fb344)",
      bgColor: "rgba(47, 179, 68, 0.12)",
      badge: "Pending",
    },
    {
      id: "support-tickets",
      title: "Support Tickets",
      desc: "Resolve open customer requests & tickets",
      icon: <TicketPercent size={18} strokeWidth={2.2} />,
      route: "/user/support-tickets",
      color: "var(--crm-cyan, #17a2b8)",
      bgColor: "rgba(23, 162, 184, 0.12)",
    },
    {
      id: "transactions",
      title: "Transactions",
      desc: "Monitor wallet balance & billing ledger",
      icon: <Receipt size={18} strokeWidth={2.2} />,
      route: "/user/transactions",
      color: "var(--crm-yellow, #f59f00)",
      bgColor: "rgba(245, 159, 0, 0.12)",
    },
    {
      id: "system",
      title: "System Config",
      desc: "Platform settings, email & maintenance",
      icon: <Settings size={18} strokeWidth={2.2} />,
      route: "/user/system",
      color: "var(--crm-indigo, #6366f1)",
      bgColor: "rgba(99, 102, 241, 0.12)",
    },
    {
      id: "profile",
      title: "Admin Profile",
      desc: "Account credentials & security preferences",
      icon: <UserCircle size={18} strokeWidth={2.2} />,
      route: "/user/profile",
      color: "var(--crm-purple, #ae3ec9)",
      bgColor: "rgba(174, 62, 201, 0.12)",
    },
  ];

  return (
    <div className="crm-card">
      <div className="crm-card__header">
        <div>
          <h2 className="crm-card__title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Zap size={16} style={{ color: "#f59f00", fill: "#f59f00" }} />
            Quick Admin Actions
          </h2>
          <div className="crm-card__subtitle">
            Fast access to high-frequency platform workflows
          </div>
        </div>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            padding: "3px 8px",
            borderRadius: "999px",
            background: "rgba(32, 107, 196, 0.1)",
            color: "var(--crm-primary, #206bc4)",
          }}
        >
          {actions.length} Shortcuts
        </span>
      </div>
      <div className="crm-card__body">
        <div className="crm-actions-grid">
          {actions.map((act) => (
            <div
              key={act.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(act.route)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(act.route);
                }
              }}
              className="crm-action-tile"
              title={act.title}
            >
              <div
                className="crm-action-tile__icon"
                style={{
                  background: act.bgColor,
                  color: act.color,
                }}
              >
                {act.icon}
              </div>
              <div className="crm-action-tile__info">
                <div className="crm-action-tile__title">
                  <span>{act.title}</span>
                  {act.badge && (
                    <span
                      style={{
                        fontSize: "9.5px",
                        fontWeight: 700,
                        padding: "1px 5px",
                        borderRadius: "4px",
                        background: act.bgColor,
                        color: act.color,
                        lineHeight: 1.3,
                      }}
                    >
                      {act.badge}
                    </span>
                  )}
                </div>
                <div className="crm-action-tile__desc">{act.desc}</div>
              </div>
              <ChevronRight size={16} className="crm-action-tile__arrow" strokeWidth={2.2} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
