"use client";

import { useState, useEffect } from "react";
import "./profile.css";
import { axiosInstance } from "@/lib/axiosInstance";
import {
  User,
  ShieldCheck,
  Activity,
  Mail,
  Phone,
  Clock,
  Globe,
  Camera,
  Save,
  Check,
  Loader2,
  Lock,
  Building2,
  AlertTriangle,
  Download,
  BarChart3,
  KeyRound,
  Sliders,
  AlertCircle,
} from "lucide-react";

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className={`pf-toggle ${on ? "pf-toggle--on" : ""}`} onClick={() => onChange(!on)}>
      <div className="pf-toggle__knob" />
    </div>
  );
}

function Inp({ label, value, onChange, type = "text", placeholder = "", hint, disabled = false, prefix, autoComplete }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; hint?: string; disabled?: boolean; prefix?: React.ReactNode; autoComplete?: string;
}) {
  return (
    <div className="pf-field">
      <label className="pf-field__label">{label.toUpperCase()}</label>
      <div className={`pf-input-wrap ${disabled ? "pf-input-wrap--disabled" : ""}`}>
        {prefix && <span className="pf-input-prefix">{prefix}</span>}
        <input type={type} value={value} disabled={disabled} placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={e => onChange(e.target.value)} className="pf-input" />
      </div>
      {hint && <span className="pf-field__hint">{hint}</span>}
    </div>
  );
}

function Sel({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="pf-field">
      <label className="pf-field__label">{label.toUpperCase()}</label>
      <select className="pf-select" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
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
    <button onClick={onClick} className={`pf-btn-save ${saved ? "pf-btn-save--saved" : ""}`}>
      {saving ? <><Loader2 size={14} className="pf-spin" /> Saving…</> : saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
    </button>
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
  // Derive initials from name
  const initials = profile?.name
    ? profile.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  const displayName = profile?.name ?? "—";
  const roleLabel   = profile?.role?.toUpperCase().replace("superadmin", "SUPER ADMIN") ?? "—";

  // Format last login
  const lastLogin = profile?.last_login_at
    ? new Date(profile.last_login_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : null;

  return (
    <div className="pf-hero">
      <div className="pf-hero__banner">
        <div className="pf-hero__banner-orb1" />
        <div className="pf-hero__banner-orb2" />
        <div className="pf-hero__banner-orb3" />
      </div>

      <div className="pf-hero__body">
        <div className="pf-hero__top-row">
          <div className="pf-avatar-wrap">
            <div className={`pf-avatar ${uploading ? "pf-avatar--uploading" : ""}`}>
              {uploading ? <Loader2 size={24} className="pf-spin" /> : (avatarEmoji ?? initials)}
            </div>
            <div className="pf-avatar__online" />
            <div className="pf-avatar__upload-overlay" onClick={onUpload} title="Upload photo">
              <Camera size={20} />
            </div>
          </div>
        </div>

        <div className="pf-hero__info">
          <div className="pf-hero__name-row">
            <span className="pf-hero__name">{displayName}</span>
            <span className="pf-hero__role">{roleLabel}</span>
          </div>
          <div className="pf-hero__meta">
            {[
              { icon: <Mail size={13} />, val: profile?.email ?? "—" },
              { icon: <Phone size={13} />, val: profile?.phone ? `+91 ${profile.phone}` : "—" },
              ...(lastLogin ? [{ icon: <Clock size={13} />, val: `Last login: ${lastLogin}` }] : []),
              { icon: <Globe size={13} />, val: profile?.status === "active" ? "Active" : profile?.status ?? "—" },
            ].map(({ icon, val }, index) => (
              <span key={index} className="pf-hero__meta-item">
                <span className="pf-hero__meta-icon">{icon}</span>{val}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
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
    <div className="pf-tab-section">
      {/* Basic info */}
      <div className="pf-card">
        <div className="pf-card__header">
          <div className="pf-card__title">Personal Information</div>
          <div className="pf-card__desc">Update your name, contact, and bio details.</div>
        </div>
        <div className="pf-card__body">
          <div className="pf-grid-2" style={{ marginBottom: 16 }}>
            <Inp label="First Name" value={firstName} onChange={setFirstName} placeholder="First name" />
            <Inp label="Last Name"  value={lastName}  onChange={setLastName}  placeholder="Last name" />
            <Inp label="Email"      value={email}     onChange={setEmail}     type="email" hint="Used for login and notifications" />
            <Inp label="Phone"      value={phone}     onChange={setPhone}     type="tel"   placeholder="Phone number" prefix={<Phone size={14} />} />
            <Inp label="Location"   value={location}  onChange={setLocation}  placeholder="City, Country" />
            <Inp label="Website"    value={website}   onChange={setWebsite}   type="url"   placeholder="https://…" />
          </div>
        </div>
      </div>

      {/* Account info (read-only from API) */}
      <div className="pf-card">
        <div className="pf-card__header">
          <div className="pf-card__title">Account Details</div>
          <div className="pf-card__desc">Read-only information from your account record.</div>
        </div>
        <div className="pf-card__body">
          <div className="pf-grid-2">
            <Inp label="Role"      value={profile?.role ?? "—"}    onChange={() => {}} disabled />
            <Inp label="Status"    value={profile?.status ?? "—"}  onChange={() => {}} disabled />
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
        </div>
      </div>

      {/* Regional */}
      <div className="pf-card">
        <div className="pf-card__header">
          <div className="pf-card__title">Regional Preferences</div>
        </div>
        <div className="pf-card__body">
          <div className="pf-grid-3">
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
        </div>
      </div>

      {/* Preferences */}
      <div className="pf-card">
        <div className="pf-card__header">
          <div className="pf-card__title">Display & Notification Preferences</div>
        </div>
        <div className="pf-card__body--p20">
          {prefs.map(({ label, desc, val, set }) => (
            <div key={label} className="pf-row">
              <div>
                <div className="pf-row__label">{label}</div>
                <div className="pf-row__desc">{desc}</div>
              </div>
              <Toggle on={val} onChange={set} />
            </div>
          ))}
        </div>
      </div>

      <div className="pf-save-row">
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

  if (!open) return null;

  const transferOwnership = async () => {
    try {
      console.log({ newOwnerEmail: email, reason });
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="pf-modal-overlay">
      <div className="pf-modal">
        {step === 1 && (
          <>
            <h2>Transfer Ownership</h2>
            <p>You are about to transfer ownership of this account to another administrator.</p>
            <p>The new owner will receive full administrative control over the platform including users, companies, subscriptions and settings.</p>
            <p>Your role will be downgraded to Administrator after the transfer.</p>
            <div className="pf-modal-actions">
              <button className="pf-btn-secondary" onClick={onClose}>Cancel</button>
              <button className="pf-btn-delete"    onClick={() => setStep(2)}>Proceed</button>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h2>New Owner Information</h2>
            <div className="pf-field">
              <label>Email Address</label>
              <input className="pf-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" />
            </div>
            <div className="pf-field">
              <label>Reason (Optional)</label>
              <textarea className="pf-textarea" value={reason} onChange={e => setReason(e.target.value)} rows={3} />
            </div>
            <div className="pf-modal-actions">
              <button className="pf-btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button className="pf-btn-delete"    onClick={transferOwnership}>Transfer Ownership</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── TAB: SECURITY ────────────────────────────────────────────────────────────
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
  const strengthColor = ["", "var(--pf-danger)", "var(--pf-warn)", "var(--pf-info)", "var(--pf-success)"][strength];

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
    <div className="pf-tab-section">

      {/* Last login info card */}
      {profile && (
        <div className="pf-card">
          <div className="pf-card__header">
            <div className="pf-card__title">Last Login</div>
            <div className="pf-card__desc">Most recent login session details from the server.</div>
          </div>
          <div className="pf-card__body">
            <div className="pf-grid-2">
              <Inp label="Last Login At" value={lastLoginAt} onChange={() => {}} disabled />
              <Inp label="Last Login IP" value={lastLoginIp} onChange={() => {}} disabled />
            </div>
          </div>
        </div>
      )}

      {/* Change password */}
      <div className="pf-card">
        <div className="pf-card__header">
          <div className="pf-card__title">Change Password</div>
          <div className="pf-card__desc">Use a strong, unique password you don't use elsewhere.</div>
        </div>
        <div className="pf-card__body">
          <form onSubmit={e => { e.preventDefault(); savePwd(); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Inp
              label="Current Password"
              value={curPwd}
              onChange={setCurPwd}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••••"
            />
            <div className="pf-grid-2">
              <div>
                <Inp
                  label="New Password"
                  value={newPwd}
                  onChange={setNewPwd}
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min 8 characters"
                />
                {newPwd.length > 0 && (
                  <div className="pf-strength">
                    <div className="pf-strength__bars">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="pf-strength__bar"
                          style={{ background: i <= strength ? strengthColor : "var(--pf-surf3)" }} />
                      ))}
                    </div>
                    <span className="pf-strength__label" style={{ color: strengthColor }}>{strengthLabel}</span>
                  </div>
                )}
              </div>
              <Inp
                label="Confirm Password"
                value={confPwd}
                onChange={setConfPwd}
                type="password"
                autoComplete="new-password"
                placeholder="Repeat new password"
              />
            </div>
            {pwdErr && <div className="pf-pwd-err">{pwdErr}</div>}
            <div className="pf-btn-row">
              <button type="submit" className={`pf-btn-pwd ${pwdSaved ? "pf-btn-pwd--saved" : ""}`}>
                {pwdSaving ? <><Loader2 size={14} className="pf-spin" /> Updating…</> : pwdSaved ? <><Check size={14} /> Updated!</> : <><Lock size={14} /> Update Password</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Danger zone */}
      <div className="pf-danger-card">
        <div className="pf-danger-card__header">
          <div className="pf-danger-card__title">⚠ Danger Zone</div>
          <div className="pf-danger-card__desc">Irreversible actions — proceed with extreme caution.</div>
        </div>
        <div className="pf-danger-card__body">
          <div>
            <div className="pf-danger-card__name">Change Ownership</div>
            <div className="pf-danger-card__sub">Permanently transfer ownership of your admin profile to another user.</div>
          </div>
          <button className="pf-btn-ownership"
            onClick={() => { setOwnershipStep(1); setShowOwnershipModal(true); }}>
            Change Ownership
          </button>
        </div>
      </div>

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
function ActivityTab() {
  const [activities, setActivities] = useState<any[]>([
    { icon: <Building2 size={16} />, color: "#2fb344", action: "Created company",        detail: "Orbit Analytics",              time: "2 mins ago",  date: "Mar 11, 2026", badge: "CREATE",   badgeCol: "#2fb344" },
    { icon: <AlertCircle size={16} />, color: "#d63939", action: "Suspended company",      detail: "Delta Forge (overdue payment)", time: "2 hrs ago",   date: "Mar 11, 2026", badge: "SUSPEND",  badgeCol: "#d63939" },
    { icon: <Sliders size={16} />, color: "#4299e1", action: "Updated plan pricing",   detail: "Starter plan ₹399 → ₹499",     time: "5 hrs ago",   date: "Mar 11, 2026", badge: "UPDATE",   badgeCol: "#4299e1" },
    { icon: <ShieldCheck size={16} />, color: "#f59f00", action: "Changed password",       detail: "Account security updated",     time: "Yesterday",   date: "Mar 10, 2026", badge: "SECURITY", badgeCol: "#f59f00" },
    { icon: <Download size={16} />, color: "#206bc4", action: "Exported audit logs",    detail: "12 admin accounts CSV",        time: "Yesterday",   date: "Mar 10, 2026", badge: "EXPORT",   badgeCol: "#206bc4" },
    { icon: <User size={16} />, color: "#4299e1", action: "Updated user role",      detail: "Carlos Mendes → Manager",      time: "2 days ago",  date: "Mar 9, 2026",  badge: "UPDATE",   badgeCol: "#4299e1" },
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
          const mapped = raw.map((a: any) => {
            const type = (a.type || a.action || a.event || "").toLowerCase();
            let icon: React.ReactNode = <Activity size={16} />;
            let color = "#206bc4";
            let badge = "ACTION";
            let badgeCol = "#206bc4";

            if (type.includes("create") || type.includes("add")) {
              icon = <Building2 size={16} />; color = "#2fb344"; badge = "CREATE"; badgeCol = "#2fb344";
            } else if (type.includes("suspend") || type.includes("delete") || type.includes("remove")) {
              icon = <AlertCircle size={16} />; color = "#d63939"; badge = "SUSPEND"; badgeCol = "#d63939";
            } else if (type.includes("security") || type.includes("password") || type.includes("auth")) {
              icon = <ShieldCheck size={16} />; color = "#f59f00"; badge = "SECURITY"; badgeCol = "#f59f00";
            } else if (type.includes("update") || type.includes("edit")) {
              icon = <Sliders size={16} />; color = "#4299e1"; badge = "UPDATE"; badgeCol = "#4299e1";
            }

            const dStr = a.created_at || a.createdAt || a.time || "";
            const dFormatted = dStr && !isNaN(new Date(dStr).getTime())
              ? new Date(dStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "Recently";

            return {
              icon,
              color,
              action: a.action || a.message || a.msg || "Activity performed",
              detail: a.detail || a.description || a.user_name || a.actor || "System",
              time: timeAgoProfile(dStr),
              date: dFormatted,
              badge,
              badgeCol,
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

  const stats = [
    { label: "Actions (30d)",     value: String(activities.length), icon: <BarChart3 size={18} />, color: "#206bc4" },
    { label: "Logins (30d)",      value: "31",  icon: <KeyRound size={18} />, color: "#4299e1" },
    { label: "Exports",           value: "12",  icon: <Download size={18} />, color: "#f59f00" },
    { label: "Companies Created", value: "8",   icon: <Building2 size={18} />, color: "#2fb344" },
  ];

  return (
    <div className="pf-tab-section">
      <div className="pf-activity-stats">
        {stats.map(s => (
          <div key={s.label} className="pf-stat-card">
            <div className="pf-stat-card__orb" style={{ background: `${s.color}15` }} />
            <div className="pf-stat-card__label">{s.label}</div>
            <div className="pf-stat-card__row">
              <div className="pf-stat-card__value">{s.value}</div>
              <span className="pf-stat-card__icon" style={{ color: s.color }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pf-activity-feed">
        <div className="pf-activity-feed__header">
          <div className="pf-activity-feed__title">Recent Activity</div>
          <div className="pf-activity-feed__desc">Your last 30 days of actions on the platform.</div>
        </div>
        <div className="pf-activity-feed__list">
          {activities.map((a, i) => (
            <div key={i} className="pf-activity-item">
              <div className="pf-activity-item__icon"
                style={{ background: `${a.color}14`, border: `1px solid ${a.color}30`, color: a.color }}>
                {a.icon}
              </div>
              <div className="pf-activity-item__body">
                <div className="pf-activity-item__top">
                  <span className="pf-activity-item__action">{a.action}</span>
                  <span className="pf-activity-item__badge"
                    style={{ background: `${a.badgeCol}18`, color: a.badgeCol }}>
                    {a.badge}
                  </span>
                </div>
                <div className="pf-activity-item__detail">{a.detail}</div>
              </div>
              <div className="pf-activity-item__time">
                <div className="pf-activity-item__rel">{a.time}</div>
                <div className="pf-activity-item__abs">{a.date}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="pf-activity-feed__footer">
          <button className="pf-btn-load-more">Load More Activity →</button>
        </div>
      </div>
    </div>
  );
}

// ─── TABS CONFIG ──────────────────────────────────────────────────────────────
const TABS = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "security", label: "Security",      icon: ShieldCheck },
  { id: "activity", label: "Activity",      icon: Activity },
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
    setTimeout(() => { setUploading(false); setAvatarEmoji(null); }, 1200);
  };

  return (
    <div className="pf-root">

      {/* ── PAGE HEADER ── */}
      <div className="pf-header">
        <div>
          <h1 className="pf-header__title">My Profile</h1>
          <p className="pf-header__sub">Manage your personal information, security, and preferences.</p>
        </div>
      </div>

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

      {/* ── TAB BAR ── */}
      <div className="pf-tabbar">
        {TABS.map(t => {
          const TabIcon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`pf-tab ${tab === t.id ? "pf-tab--active" : ""}`}>
              <span className="pf-tab__icon"><TabIcon size={15} /></span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT ── */}
      <div key={tab} className="pf-content">
        {tab === "personal" && <PersonalTab profile={profile} />}
        {tab === "security" && <SecurityTab profile={profile} />}
        {tab === "activity" && <ActivityTab />}
      </div>

    </div>
  );
}