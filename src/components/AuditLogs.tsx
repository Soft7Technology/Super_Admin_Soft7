"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Activity, ChevronRight } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import Alert from "@/components/ui/Alert";

interface LogEntry {
  id: string;
  msg: string;
  actor: string;
  time: string;
  sev: string;
}

/* Severity → status dot (same mapping language as WA_ADMIN's activity feed) */
const SEV_DOT: Record<string, string> = {
  success: "bg-success",
  warn: "bg-warning",
  warning: "bg-warning",
  danger: "bg-error",
  error: "bg-error",
  critical: "bg-error",
  info: "bg-primary",
};

/** Recent activity card — same design as WA_ADMIN's "Recent Activity Logs". */
export default function AuditLogs({
  logs = [],
  loading = false,
  error = null,
}: {
  logs?: LogEntry[];
  loading?: boolean;
  error?: string | null;
}) {
  const router = useRouter();

  // Group logs for the timeline (unchanged logic)
  const todayLogs = logs.filter((l) => l.time.includes("min") || l.time.includes("hour"));
  const earlierLogs = logs.filter((l) => !l.time.includes("min") && !l.time.includes("hour"));
  const groups: { title: string; items: LogEntry[] }[] = [];
  if (todayLogs.length > 0) groups.push({ title: "Today", items: todayLogs });
  if (earlierLogs.length > 0) groups.push({ title: "This Week", items: earlierLogs });
  if (groups.length === 0 && logs.length > 0) groups.push({ title: "Today", items: logs });

  return (
    <Card>
      <CardHeader
        icon={Activity}
        title="Audit Logs"
        description="Latest platform activity"
        action={
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ChevronRight size={14} />}
            onClick={() => router.push("/user/audit-logs")}
          >
            View all
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton circle className="h-8 w-8" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <Alert variant="error" message={error} />
      ) : groups.length === 0 ? (
        <EmptyState compact icon={<Activity size={18} />} title="No activity yet" />
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{group.title}</p>
              <ul className="-mx-2">
                {group.items.map((log) => (
                  <li key={log.id} className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-surface-hover">
                    <span className="relative shrink-0">
                      <Avatar name={log.actor} size="sm" />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-surface ${
                          SEV_DOT[log.sev?.toLowerCase()] ?? "bg-primary"
                        }`}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">{log.msg}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {log.actor} · {log.time}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
