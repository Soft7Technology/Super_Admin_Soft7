"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  Camera,
  Check,
  Clock,
  Globe,
  KeyRound,
  Lock,
  Mail,
  Package,
  Phone,
  Save,
  ShieldCheck,
  Upload,
  User,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import { PageContainer, PageHeader } from "@/components/layout";
import KpiCard from "@/components/admin/KpiCard";
import type { KpiTone } from "@/components/admin/KpiCard";
import Alert from "@/components/ui/Alert";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import KitSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import Switch from "@/components/ui/Switch";
import Tabs from "@/components/ui/Tabs";
import Textarea from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function Inp({ label, value, onChange, type = "text", placeholder = "", hint, disabled = false, icon }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; hint?: string; disabled?: boolean; icon?: ReactNode;
}) {
  return (
    <Input
      label={label}
      type={type}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      helperText={hint}
      leftIcon={icon}
    />
  );
}

function Sel({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return <KitSelect label={label} value={value} onChange={e => onChange(e.target.value)} options={options} />;
}

function useSave() {
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const go = (cb?: () => void) => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => { setSaved(false); cb?.(); }, 2000); }, 900);
  };
  return { saving, saved, go };
}

function SaveBtn({ onClick, saving, saved }: { onClick: () => void; saving: boolean; saved: boolean }) {
  return (
    <Button onClick={onClick} isLoading={saving} leftIcon={saved ? <Check size={15} /> : <Save size={15} />}>
      {saved ? "Saved!" : "Save Changes"}
    </Button>
  );
}

// ─── PROFILE DATA TYPE ────────────────────────────────────────────────────────
interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  avatar: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  created_at: string;
  settings: Record<string, unknown> | null;
}

// ─── HERO CARD (shared, receives profile data) ────────────────────────────────
function HeroCard({
  profile,
  uploading,
  avatarEmoji,
  onUpload,
}: {
  profile: ProfileData | null;
  uploading: boolean;
  avatarEmoji: string | null;
  onUpload: () => void;
}) {
  const displayName = profile?.name ?? "—";
  const roleLabel   = profile?.role?.toUpperCase().replace("superadmin", "SUPER ADMIN") ?? "—";

  // Format last login
  const lastLogin = profile?.last_login_at
    ? new Date(profile.last_login_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : null;

  const meta: { icon: LucideIcon; val: string }[] = [
    { icon: Mail,  val: profile?.email ?? "—" },
    { icon: Phone, val: profile?.phone ? `+91 ${profile.phone}` : "—" },
    ...(lastLogin ? [{ icon: Clock, val: `Last login: ${lastLogin}` }] : []),
    { icon: Globe, val: profile?.status === "active" ? "Active" : profile?.status ?? "—" },
  ];

  return (
    <Card padding="none" className="mb-6 overflow-hidden">
      <div className="h-24 bg-linear-to-r from-primary to-primary-hover" aria-hidden />

      <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end">
        <div className="group relative -mt-10 w-fit">
          <div className="rounded-full ring-4 ring-surface">
            <Avatar
              size="xl"
              status="online"
              name={uploading || avatarEmoji ? undefined : displayName}
              src={profile?.avatar}
              fallback={uploading ? <Upload size={20} className="animate-pulse" /> : avatarEmoji ? <span className="text-2xl">{avatarEmoji}</span> : undefined}
            />
          </div>
          <button
            type="button"
            onClick={onUpload}
            aria-label="Upload profile photo"
            className="absolute inset-0 flex items-center justify-center rounded-full bg-overlay text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Camera size={18} />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-semibold text-foreground">{displayName}</h2>
            {roleLabel !== "—" && roleLabel !== "" && <Badge variant="primary">{roleLabel}</Badge>}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem] text-muted-foreground">
            {meta.map(({ icon: Icon, val }, index) => (
              <span key={index} className="flex items-center gap-1.5">
                <Icon size={14} />
                {val}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── TAB: PERSONAL INFO ───────────────────────────────────────────────────────
function PersonalTab({ profile }: { profile: ProfileData | null }) {
  // Split `name` into first/last for display; API returns single `name` field
  const nameParts  = (profile?.name ?? "").split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] ?? "");
  const [lastName,  setLastName]  = useState(nameParts.slice(1).join(" ") ?? "");
  const [email,     setEmail]     = useState(profile?.email    ?? "");
  const [phone,     setPhone]     = useState(profile?.phone    ?? "");
  const [location,  setLocation]  = useState("");
  const [website,   setWebsite]   = useState("");
  const [timezone,  setTimezone]  = useState("Asia/Kolkata");
  const [language,  setLanguage]  = useState("en");
  const [weekStart, setWeekStart] = useState("Mon");

  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif,   setSmsNotif]   = useState(false);
  const [darkMode,   setDarkMode]   = useState(true);
  const [compactUI,  setCompactUI]  = useState(false);

  const { saving, saved, go } = useSave();

  // Sync when profile loads
  useEffect(() => {
    if (!profile) return;
    const parts = (profile.name ?? "").split(" ");
    setFirstName(parts[0] ?? "");
    setLastName(parts.slice(1).join(" ") ?? "");
    setEmail(profile.email    ?? "");
    setPhone(profile.phone    ?? "");
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const payload = {
        name: fullName,
        email,
        phone,
        reason: "Admin profile updated via console",
      };

      const cId = (profile as any)?.company_id || (profile as any)?.companyId || "1";
      const uId = profile?.id || "1";

      await axiosInstance
        .patch(`/v1/super-admin/companies/${cId}/users/${uId}`, payload)
        .catch(async () => {
          return axiosInstance.put("/v1/admin/users/", payload).catch(() => null);
        });

      go();
    } catch {
      go();
    }
  };

  const prefs = [
    { label: "Email Notifications", desc: "Receive system alerts and updates via email",   val: emailNotif, set: setEmailNotif },
    { label: "SMS Notifications",   desc: "Receive critical alerts via SMS",                val: smsNotif,   set: setSmsNotif   },
    { label: "Dark Mode",           desc: "Use dark theme across the admin portal",         val: darkMode,   set: setDarkMode   },
    { label: "Compact UI",          desc: "Reduce spacing for a denser information layout", val: compactUI,  set: setCompactUI  },
  ];

  return (
    <div className="space-y-4">
      {/* Basic info */}
      <Card>
        <CardHeader icon={User} title="Personal Information" description="Update your name, contact, and bio details." divided />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Inp label="First Name" value={firstName} onChange={setFirstName} placeholder="First name" />
          <Inp label="Last Name"  value={lastName}  onChange={setLastName}  placeholder="Last name" />
          <Inp label="Email"      value={email}     onChange={setEmail}     type="email" hint="Used for login and notifications" />
          <Inp label="Phone"      value={phone}     onChange={setPhone}     type="tel"   icon={<Phone size={15} />} />
          <Inp label="Location"   value={location}  onChange={setLocation}  placeholder="City, Country" />
          <Inp label="Website"    value={website}   onChange={setWebsite}   type="url"   placeholder="https://…" />
        </div>
      </Card>

      {/* Account info (read-only from API) */}
      <Card>
        <CardHeader icon={ShieldCheck} title="Account Details" description="Read-only information from your account record." divided />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Inp label="Role"       value={profile?.role ?? "—"}   onChange={() => {}} disabled />
          <Inp label="Status"     value={profile?.status ?? "—"} onChange={() => {}} disabled />
          <Inp label="Account ID" value={profile?.id ?? "—"}     onChange={() => {}} disabled />
          <Inp
            label="Member Since"
            value={profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })
              : "—"}
            onChange={() => {}}
            disabled
          />
        </div>
      </Card>

      {/* Regional */}
      <Card>
        <CardHeader icon={Globe} title="Regional Preferences" divided />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Sel label="Timezone" value={timezone} onChange={setTimezone} options={[
            { value: "Asia/Kolkata",     label: "Asia/Kolkata (IST +5:30)" },
            { value: "UTC",              label: "UTC (±0:00)" },
            { value: "America/New_York", label: "America/New_York (EST)" },
            { value: "Europe/London",    label: "Europe/London (GMT)" },
            { value: "Asia/Dubai",       label: "Asia/Dubai (GST +4:00)" },
          ]} />
          <Sel label="Language" value={language} onChange={setLanguage} options={[
            { value: "en", label: "English" }, { value: "hi", label: "Hindi" },
            { value: "es", label: "Spanish"  }, { value: "ar", label: "Arabic" },
          ]} />
          <Sel label="Week Starts" value={weekStart} onChange={setWeekStart} options={[
            { value: "Mon", label: "Monday" }, { value: "Sun", label: "Sunday" }, { value: "Sat", label: "Saturday" },
          ]} />
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader title="Display & Notification Preferences" divided />
        <div className="divide-y divide-border-subtle">
          {prefs.map(({ label, desc, val, set }) => (
            <div key={label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="mt-0.5 text-[0.8125rem] text-muted-foreground">{desc}</p>
              </div>
              <Switch checked={val} onCheckedChange={set} aria-label={label} />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <SaveBtn onClick={handleSaveProfile} saving={saving} saved={saved} />
      </div>
    </div>
  );
}

// ─── CHANGE OWNERSHIP MODAL ───────────────────────────────────────────────────
function ChangeOwnershipModal({
  open, step, setStep, onClose,
}: {
  open: boolean; step: number; setStep: (step: 1 | 2) => void; onClose: () => void;
}) {
  const [email,  setEmail]  = useState("");
  const [reason, setReason] = useState("");

  const transferOwnership = async () => {
    try {
      console.log({ newOwnerEmail: email, reason });
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={step === 1 ? "Transfer Ownership" : "New Owner Information"}
      footer={
        step === 1 ? (
          <>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="danger" onClick={() => setStep(2)}>Proceed</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
            <Button variant="danger" onClick={transferOwnership}>Transfer Ownership</Button>
          </>
        )
      }
    >
      {step === 1 && (
        <div className="space-y-3 text-sm text-secondary-foreground">
          <p>You are about to transfer ownership of this account to another administrator.</p>
          <p>The new owner will receive full administrative control over the platform including users, companies, subscriptions and settings.</p>
          <Alert variant="warning" message="Your role will be downgraded to Administrator after the transfer." />
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <Input label="Email Address" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" />
          <Textarea label="Reason (Optional)" value={reason} onChange={e => setReason(e.target.value)} rows={3} />
        </div>
      )}
    </Modal>
  );
}

// ─── TAB: SECURITY ────────────────────────────────────────────────────────────
const STRENGTH_BAR = ["", "bg-error", "bg-warning", "bg-info", "bg-success"];
const STRENGTH_TEXT = ["", "text-error", "text-warning", "text-info", "text-success"];

function SecurityTab({ profile }: { profile: ProfileData | null }) {
  const [curPwd,    setCurPwd]    = useState("");
  const [newPwd,    setNewPwd]    = useState("");
  const [confPwd,   setConfPwd]   = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdSaved,  setPwdSaved]  = useState(false);
  const [pwdErr,    setPwdErr]    = useState("");
  const [showOwnershipModal, setShowOwnershipModal] = useState(false);
  const [ownershipStep,      setOwnershipStep]      = useState<1 | 2>(1);

  const strength = newPwd.length === 0 ? 0 : newPwd.length < 6 ? 1 : newPwd.length < 10 ? 2
    : /[A-Z]/.test(newPwd) && /[0-9]/.test(newPwd) && /[^a-zA-Z0-9]/.test(newPwd) ? 4 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];

  const savePwd = () => {
    if (!curPwd.trim())     { setPwdErr("Current password is required."); return; }
    if (newPwd.length < 8)  { setPwdErr("New password must be at least 8 characters."); return; }
    if (newPwd !== confPwd) { setPwdErr("Passwords do not match."); return; }
    setPwdErr(""); setPwdSaving(true);
    setTimeout(() => {
      setPwdSaving(false); setPwdSaved(true);
      setCurPwd(""); setNewPwd(""); setConfPwd("");
      setTimeout(() => setPwdSaved(false), 2500);
    }, 1000);
  };

  // Last login info from API
  const lastLoginAt = profile?.last_login_at
    ? new Date(profile.last_login_at).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })
    : "—";
  const lastLoginIp = profile?.last_login_ip ?? "—";

  return (
    <div className="space-y-4">
      {/* Last login info card */}
      {profile && (
        <Card>
          <CardHeader icon={Clock} title="Last Login" description="Most recent login session details from the server." divided />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Inp label="Last Login At" value={lastLoginAt} onChange={() => {}} disabled />
            <Inp label="Last Login IP" value={lastLoginIp} onChange={() => {}} disabled />
          </div>
        </Card>
      )}

      {/* Change password */}
      <Card>
        <CardHeader icon={Lock} title="Change Password" description="Use a strong, unique password you don't use elsewhere." divided />
        <div className="space-y-4">
          <Inp label="Current Password" value={curPwd} onChange={setCurPwd} type="password" placeholder="••••••••••••" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Inp label="New Password" value={newPwd} onChange={setNewPwd} type="password" placeholder="Min 8 characters" />
              {newPwd.length > 0 && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex flex-1 gap-1" aria-hidden>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={cn("h-1.5 flex-1 rounded-full", i <= strength ? STRENGTH_BAR[strength] : "bg-surface-muted")} />
                    ))}
                  </div>
                  <span className={cn("text-xs font-medium", STRENGTH_TEXT[strength])}>{strengthLabel}</span>
                </div>
              )}
            </div>
            <Inp label="Confirm Password" value={confPwd} onChange={setConfPwd} type="password" placeholder="Repeat new password" />
          </div>
          {pwdErr && <Alert variant="error" message={pwdErr} onClose={() => setPwdErr("")} />}
          <div className="flex justify-end">
            <Button onClick={savePwd} isLoading={pwdSaving} leftIcon={pwdSaved ? <Check size={15} /> : <KeyRound size={15} />}>
              {pwdSaving ? "Updating…" : pwdSaved ? "Updated!" : "Update Password"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="border-error-border">
        <CardHeader
          icon={AlertTriangle}
          title={<span className="text-error">Danger Zone</span>}
          description="Irreversible actions — proceed with extreme caution."
          divided
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Change Ownership</p>
            <p className="mt-0.5 text-[0.8125rem] text-muted-foreground">Permanently transfer ownership of your admin profile to another user.</p>
          </div>
          <Button variant="danger" onClick={() => { setOwnershipStep(1); setShowOwnershipModal(true); }}>
            Change Ownership
          </Button>
        </div>
      </Card>

      <ChangeOwnershipModal
        open={showOwnershipModal}
        step={ownershipStep}
        setStep={setOwnershipStep}
        onClose={() => { setShowOwnershipModal(false); setOwnershipStep(1); }}
      />
    </div>
  );
}

function timeAgoProfile(dateString: string | null): string {
  if (!dateString) return "Recently";
  const diffMs = Date.now() - new Date(dateString).getTime();
  if (isNaN(diffMs)) return "Recently";
  const diffDays = Math.floor(diffMs / 86400000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffMins = Math.floor(diffMs / 60000);
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return "Just now";
}

// ─── TAB: ACTIVITY ────────────────────────────────────────────────────────────
type ActivityKind = "create" | "suspend" | "update" | "security" | "export" | "action";

interface ActivityItem {
  kind: ActivityKind;
  action: string;
  detail: string;
  time: string;
  date: string;
  badge: string;
}

const KIND_META: Record<ActivityKind, { icon: LucideIcon; variant: BadgeVariant; tone: string }> = {
  create:   { icon: Building2, variant: "primary", tone: "bg-primary-lighter text-primary-text" },
  suspend:  { icon: XCircle,   variant: "error",   tone: "bg-error-bg text-error" },
  update:   { icon: Package,   variant: "primary", tone: "bg-primary-lighter text-primary-text" },
  security: { icon: Lock,      variant: "warning", tone: "bg-warning-bg text-warning" },
  export:   { icon: Upload,    variant: "primary", tone: "bg-primary-lighter text-primary-text" },
  action:   { icon: BarChart3, variant: "primary", tone: "bg-primary-lighter text-primary-text" },
};

function ActivityTab() {
  const [activities, setActivities] = useState<ActivityItem[]>([
    { kind: "create",   action: "Created company",      detail: "Orbit Analytics",              time: "2 mins ago", date: "Mar 11, 2026", badge: "CREATE" },
    { kind: "suspend",  action: "Suspended company",    detail: "Delta Forge (overdue payment)", time: "2 hrs ago",  date: "Mar 11, 2026", badge: "SUSPEND" },
    { kind: "update",   action: "Updated plan pricing", detail: "Starter plan ₹399 → ₹499",     time: "5 hrs ago",  date: "Mar 11, 2026", badge: "UPDATE" },
    { kind: "security", action: "Changed password",     detail: "Account security updated",     time: "Yesterday",  date: "Mar 10, 2026", badge: "SECURITY" },
    { kind: "export",   action: "Exported audit logs",  detail: "12 admin accounts CSV",        time: "Yesterday",  date: "Mar 10, 2026", badge: "EXPORT" },
    { kind: "update",   action: "Updated user role",    detail: "Carlos Mendes → Manager",      time: "2 days ago", date: "Mar 9, 2026",  badge: "UPDATE" },
  ]);

  useEffect(() => {
    let mounted = true;
    const fetchActivities = async () => {
      try {
        const { data: res } = await axiosInstance
          .get("/v1/super-admin/activities?page=1&limit=20")
          .catch(async () => {
            return axiosInstance.get("/v1/admin/activity?page=1&limit=20");
          });

        if (!mounted) return;
        const raw = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.activities)
          ? res.activities
          : [];

        if (raw.length > 0) {
          const mapped: ActivityItem[] = raw.map((a: any) => {
            const type = (a.type || a.action || a.event || "").toLowerCase();
            let kind: ActivityKind = "action";
            let badge = "ACTION";

            if (type.includes("create") || type.includes("add")) {
              kind = "create"; badge = "CREATE";
            } else if (type.includes("suspend") || type.includes("delete") || type.includes("remove")) {
              kind = "suspend"; badge = "SUSPEND";
            } else if (type.includes("security") || type.includes("password") || type.includes("auth")) {
              kind = "security"; badge = "SECURITY";
            } else if (type.includes("update") || type.includes("edit")) {
              kind = "update"; badge = "UPDATE";
            }

            const dStr = a.created_at || a.createdAt || a.time || "";
            const dFormatted = dStr && !isNaN(new Date(dStr).getTime())
              ? new Date(dStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "Recently";

            return {
              kind,
              action: a.action || a.message || a.msg || "Activity performed",
              detail: a.detail || a.description || a.user_name || a.actor || "System",
              time: timeAgoProfile(dStr),
              date: dFormatted,
              badge,
            };
          });
          setActivities(mapped);
        }
      } catch (err) {
        console.error("Failed to load activity feed:", err);
      }
    };
    fetchActivities();
    return () => { mounted = false; };
  }, []);

  const stats: { label: string; value: string; icon: LucideIcon; tone?: KpiTone }[] = [
    { label: "Actions (30d)",     value: String(activities.length), icon: BarChart3 },
    { label: "Logins (30d)",      value: "31",  icon: KeyRound },
    { label: "Exports",           value: "12",  icon: Upload, tone: "warning" },
    { label: "Companies Created", value: "8",   icon: Building2 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(s => (
          <KpiCard key={s.label} label={s.label} value={s.value} icon={<s.icon size={18} />} tone={s.tone} />
        ))}
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="px-5 pt-5">
          <CardHeader title="Recent Activity" description="Your last 30 days of actions on the platform." />
        </div>
        <ul className="divide-y divide-border-subtle border-t border-border-subtle">
          {activities.map((a, i) => {
            const meta = KIND_META[a.kind];
            const Icon = meta.icon;
            return (
              <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", meta.tone)}>
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{a.action}</span>
                    <Badge variant={meta.variant} size="sm">{a.badge}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-[0.8125rem] text-muted-foreground">{a.detail}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-medium text-secondary-foreground">{a.time}</p>
                  <p className="text-[0.6875rem] text-muted-foreground">{a.date}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-border-subtle px-5 py-3 text-center">
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
            Load More Activity
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ─── TABS CONFIG ──────────────────────────────────────────────────────────────
const TABS = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "security", label: "Security",      icon: Lock },
  { id: "activity", label: "Activity",      icon: BarChart3 },
] as const;
type TabId = typeof TABS[number]["id"];

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Profile() {
  const [tab,         setTab]         = useState<TabId>("personal");
  const [uploading,   setUploading]   = useState(false);
  const [avatarEmoji, setAvatarEmoji] = useState<string | null>(null);

  // ── Shared profile state fetched once ──
  const [profile,  setProfile]  = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        const { data: result } = await axiosInstance.get("/v1/admin/users/");

        if (!mounted) return;

        console.log("PROFILE API", result);
        if (result?.success && result?.data) {
          setProfile(result.data as ProfileData);
        }
      } catch (error) {
        if (!mounted) return;
        console.error("Profile fetch error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => { mounted = false; };
  }, []);

  const triggerUpload = () => {
    setUploading(true);
    setTimeout(() => { setUploading(false); setAvatarEmoji("🧑‍💻"); }, 1200);
  };

  return (
    <PageContainer>
      <PageHeader title="My Profile" description="Manage your personal information, security, and preferences." />

      {/* ── HERO CARD (shared, data-driven) ── */}
      <HeroCard
        profile={profile ?? {
          id: "",
          name: "Loading...",
          email: "",
          phone: "",
          role: "",
          status: "",
          avatar: null,
          last_login_at: null,
          last_login_ip: null,
          created_at: "",
          settings: null,
        }}
        uploading={uploading}
        avatarEmoji={avatarEmoji}
        onUpload={triggerUpload}
      />

      {/* ── TABS ── */}
      <Tabs
        activeTab={tab}
        onChange={id => setTab(id as TabId)}
        tabs={TABS.map(t => ({
          id: t.id,
          label: t.label,
          icon: <t.icon size={15} />,
          content:
            tab !== t.id ? null : t.id === "personal" ? (
              <PersonalTab profile={profile} />
            ) : t.id === "security" ? (
              <SecurityTab profile={profile} />
            ) : (
              <ActivityTab />
            ),
        }))}
      />
    </PageContainer>
  );
}
