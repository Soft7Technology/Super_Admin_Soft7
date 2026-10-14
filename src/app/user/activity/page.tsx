"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { PageContainer, PageHeader } from "@/components/layout";
import Avatar from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";

interface LogEntry {
  id: string;
  msg: string;
  actor: string;
  time: string;
  sev: string;
  dayGroup: string;
}

/* Severity → timeline dot */
const SEV_DOT: Record<string, string> = {
  success: "bg-success",
  warning: "bg-warning",
  warn: "bg-warning",
  danger: "bg-error",
  info: "bg-primary",
};

const DUMMY_ACTIVITIES: LogEntry[] = [
  // Today
  { id: "1", msg: "New campaign launched successfully", actor: "Sarah Johnson", time: "2 hours ago", sev: "info", dayGroup: "Today" },
  { id: "2", msg: "Company subscription upgraded to Enterprise", actor: "Michael Chen", time: "4 hours ago", sev: "success", dayGroup: "Today" },
  { id: "3", msg: "User access permissions updated", actor: "Emily Davis", time: "6 hours ago", sev: "warning", dayGroup: "Today" },
  // Yesterday
  { id: "4", msg: "Monthly analytics report generated", actor: "System", time: "May 23, 10:00 AM", sev: "info", dayGroup: "Yesterday" },
  { id: "5", msg: "API usage threshold reached", actor: "Monitoring Service", time: "May 23, 08:30 AM", sev: "warning", dayGroup: "Yesterday" },
  { id: "6", msg: "New API Key generated for frontend", actor: "James Wilson", time: "May 23, 07:15 AM", sev: "info", dayGroup: "Yesterday" },
  // 2 Days Ago
  { id: "7", msg: "Security audit completed", actor: "System", time: "May 22, 02:00 PM", sev: "success", dayGroup: "May 22, 2026" },
  { id: "8", msg: "Database backup finished successfully", actor: "System", time: "May 22, 01:00 AM", sev: "info", dayGroup: "May 22, 2026" },
  // 3 Days Ago
  { id: "9", msg: "Platform downtime for maintenance", actor: "Admin Team", time: "May 21, 11:30 PM", sev: "danger", dayGroup: "May 21, 2026" },
  { id: "10", msg: "Updated privacy policy published", actor: "Legal Team", time: "May 21, 04:00 PM", sev: "info", dayGroup: "May 21, 2026" },
  { id: "11", msg: "Resolved critical bug in billing system", actor: "DevOps", time: "May 21, 10:00 AM", sev: "success", dayGroup: "May 21, 2026" },
];

export default function AllActivityPage() {
  // Group the activity by dayGroup
  const groupsObj = DUMMY_ACTIVITIES.reduce((acc, log) => {
    if (!acc[log.dayGroup]) acc[log.dayGroup] = [];
    acc[log.dayGroup].push(log);
    return acc;
  }, {} as Record<string, LogEntry[]>);

  const groups = Object.keys(groupsObj).map((key) => ({ title: key, items: groupsObj[key] }));

  return (
    <PageContainer>
      <PageHeader title="All Activity" description="A complete timeline of all events across the platform." />

      <Card padding="lg">
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.title}>
              <h2 className="mb-4 text-[0.9375rem] font-semibold text-foreground">{group.title}</h2>
              <ol className="relative space-y-5 border-l border-border pl-6">
                {group.items.map((log) => (
                  <li key={log.id} className="relative">
                    <span
                      className={cn(
                        "absolute -left-[1.84rem] top-1.5 h-3 w-3 rounded-full ring-4 ring-surface",
                        SEV_DOT[log.sev] ?? "bg-primary",
                      )}
                      aria-hidden
                    />
                    <div className="flex items-start gap-3">
                      <Avatar name={log.actor} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{log.msg}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {log.time} · {log.actor}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
}
