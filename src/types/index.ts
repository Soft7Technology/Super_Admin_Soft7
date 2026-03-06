export type PlanType = "Enterprise" | "Pro" | "Starter" | "Basic" | "Trial";
export type StatusType = "Active" | "Inactive" | "Trial";
export type RoleType = "Admin" | "Manager" | "User";
export type AuditSeverity = "info" | "warn" | "danger" | "success";

export interface Company {
  id: string; name: string; initials: string; color: string;
  status: StatusType; plan: PlanType; users: number;
}
export interface AuditLog {
  id: string; message: string; actor: string; time: string; severity: AuditSeverity;
}
export interface StatCard {
  label: string; value: string; icon: string; change: string;
  changeType: "up" | "down"; accent: "blue" | "green" | "purple" | "orange" | "red" | "teal";
}
export type RoleType2 = "Admin" | "Manager" | "User";
