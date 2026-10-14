"use client";

import { useState } from "react";
import { KeyRound, Pencil } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import { User, planVariant, roleVariant } from "../types";
import { Badge } from "./Badge";
import { EditUserModal } from "./EditUserModal";
import { ResetPasswordModal } from "./ResetPasswordModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Avatar from "@/components/ui/Avatar";
import KitBadge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import Tabs from "@/components/ui/Tabs";
import { cn } from "@/lib/utils";

interface DetailPanelProps {
  user: User;
  onClose: () => void;
  onRefresh?: () => void;
}

interface UserActivityStats {
  messages: number;
  campaigns: number;
  contacts: number;
  templates: number;
  delivered: number;
  failed: number;
}

export function DetailPanel({ user, onClose, onRefresh }: DetailPanelProps) {
  const [tab,          setTab]          = useState<"info" | "stats">("info");
  const [userStats,    setUserStats]    = useState<UserActivityStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [editOpen,     setEditOpen]     = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const fetchUserStats = async () => {
    try {
      setStatsLoading(true);
      const { data } = await axiosInstance.get(`/v1/admin/companies/user-details/${user.id}`);
      if (data.success !== false) {
        const s = data?.data ?? data;
        setUserStats({
          messages:  Number(s?.sent_count      ?? s?.messages  ?? 0),
          campaigns: Number(s?.campaigns_count ?? s?.campaigns ?? 0),
          contacts:  Number(s?.contacts_count  ?? s?.contacts  ?? 0),
          templates: Number(s?.template_count  ?? s?.templates ?? 0),
          delivered: Number(s?.delivered_count ?? 0),
          failed:    Number(s?.failed_count    ?? 0),
        });
      }
    } catch (error: any) {
      console.error("Stats Error:", error);
      toast.error(
        error?.response?.data?.message ||
        "Failed to load user statistics"
      );
    } finally {
      setStatsLoading(false);
    }
  };

  const handleTabChange = (key: "info" | "stats") => {
    setTab(key);
    if (key === "stats") fetchUserStats();
  };

  const infoRows: [string, string][] = [
    ["Company",    user.company],
    ["Plan",       user.plan],
    ["Phone",      user.phone || "—"],
    ["Joined",     user.joined],
    ["Last Login", user.login],
  ];

  const statCells: [string, number, string, string][] = [
    ["messages",  userStats?.messages  ?? 0, "text-primary-text", "Messages Sent"],
    ["campaigns", userStats?.campaigns ?? 0, "text-primary-text", "Campaigns"],
    ["contacts",  userStats?.contacts  ?? 0, "text-primary-text", "Contacts"],
    ["templates", userStats?.templates ?? 0, "text-warning",      "Templates"],
    ["delivered", userStats?.delivered ?? 0, "text-success",      "Delivered"],
    ["failed",    userStats?.failed    ?? 0, "text-error",        "Failed"],
  ];

  const infoContent = (
    <div>
      <dl className="divide-y divide-border-subtle overflow-hidden rounded-lg border border-border-subtle">
        {infoRows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 bg-surface px-4 py-2.5">
            <dt className="text-[0.8125rem] text-muted-foreground">{label}</dt>
            <dd className="truncate text-sm font-medium text-foreground">
              {label === "Plan" ? <KitBadge variant={planVariant(value)}>{value}</KitBadge> : value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button leftIcon={<Pencil size={15} />} onClick={() => setEditOpen(true)}>
          Edit User
        </Button>
        <Button variant="secondary" leftIcon={<KeyRound size={15} />} onClick={() => setPasswordOpen(true)}>
          Reset Password
        </Button>
      </div>
    </div>
  );

  const statsContent = (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {statCells.map(([key, val, color, lbl]) =>
        statsLoading ? (
          <Skeleton key={key} className="h-[4.5rem] w-full rounded-lg" />
        ) : (
          <div key={key} className="rounded-lg border border-border-subtle bg-surface-muted px-3 py-3 text-center">
            <div className={cn("text-xl font-semibold tabular-nums", color)}>{val}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{lbl}</div>
          </div>
        ),
      )}
    </div>
  );

  return (
    <>
      <Modal isOpen onClose={onClose} title="User Details" description={user.email}>
        {/* Identity */}
        <div className="mb-5 flex flex-col items-center text-center">
          <Avatar name={user.name} size="xl" />
          <p className="mt-3 text-base font-semibold text-foreground">{user.name}</p>
          <p className="text-[0.8125rem] text-muted-foreground">{user.email}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            <Badge status={user.status} />
            <KitBadge variant={roleVariant(user.role)}>{user.role}</KitBadge>
            {user.pro && <KitBadge variant="warning">PRO</KitBadge>}
          </div>
        </div>

        <Tabs
          activeTab={tab}
          onChange={(id) => handleTabChange(id as "info" | "stats")}
          tabs={[
            { id: "info", label: "Info", content: infoContent },
            { id: "stats", label: "Stats", content: statsContent },
          ]}
        />
      </Modal>

      {editOpen && (
        <EditUserModal
          user={user}
          onClose={() => setEditOpen(false)}
          onUpdated={(updatedUser: Partial<User>) => {
            Object.assign(user, updatedUser);
            onRefresh?.();
          }}
        />
      )}

      {passwordOpen && (
        <ResetPasswordModal user={user} onClose={() => setPasswordOpen(false)} />
      )}
    </>
  );
}
