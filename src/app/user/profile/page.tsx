"use client";

import { useState, useEffect } from "react";
import "./profile.css";
import { axiosInstance } from "@/lib/axiosInstance";

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className={`pf-toggle ${on ? "pf-toggle--on" : ""}`} onClick={() => onChange(!on)}>
      <div className="pf-toggle__knob" />
    </div>
  );
}

function Inp({ label, value, onChange, type = "text", placeholder = "", hint, disabled = false, prefix }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; hint?: string; disabled?: boolean; prefix?: string;
}) {
  return (
    <div className="pf-field">
      <label className="pf-field__label">{label.toUpperCase()}</label>
      <div className={`pf-input-wrap ${disabled ? "pf-input-wrap--disabled" : ""}`}>
        {prefix && <span className="pf-input-prefix">{prefix}</span>}
        <input type={type} value={value} disabled={disabled} placeholder={placeholder}
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

function Spin() {
  return <span className="pf-btn-save__spinner" />;
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
      {saving ? <><Spin /> Saving…</> : saved ? <>✓ Saved!</> : <>Save Changes</>}
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
        <div className="pf-hero__banner-grid" />
      </div>

      <div className="pf-hero__body">
        <div className="pf-hero__top-row">
          <div className="pf-avatar-wrap">
            <div className={`pf-avatar ${uploading ? "pf-avatar--uploading" : ""}`}>
              {uploading ? "⬆" : (avatarEmoji ?? initials)}
            </div>
            <div className="pf-avatar__online" />
            <div className="pf-avatar__upload-overlay" onClick={onUpload}>📷</div>
          </div>
        </div>

        <div className="pf-hero__info">
          <div className="pf-hero__name-row">
            <span className="pf-hero__name">{displayName}</span>
            <span className="pf-hero__role">{roleLabel}</span>
          </div>
          <div className="pf-hero__meta">
            {[
              { icon: "📧", val: profile?.email ?? "—" },
              { icon: "📱", val: profile?.phone ? `+91 ${profile.phone}` : "—" },
              ...(lastLogin ? [{ icon: "🕐", val: `Last login: ${lastLogin}` }] : []),
              { icon: "🌐", val: profile?.status === "active" ? "Active" : profile?.status ?? "—" },
           ].map(({ icon, val }, index) => (
  <span key={`${icon}-${index}`} className="pf-hero__meta-item">
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
            <Inp label="Phone"      value={phone}     onChange={setPhone}     type="tel"   prefix="📱" />
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
        <SaveBtn onClick={() => go()} saving={saving} saved={saved} />
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
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Inp label="Current Password" value={curPwd} onChange={setCurPwd} type="password" placeholder="••••••••••••" />
            <div className="pf-grid-2">
              <div>
                <Inp label="New Password" value={newPwd} onChange={setNewPwd} type="password" placeholder="Min 8 characters" />
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
              <Inp label="Confirm Password" value={confPwd} onChange={setConfPwd} type="password" placeholder="Repeat new password" />
            </div>
            {pwdErr && <div className="pf-pwd-err">{pwdErr}</div>}
            <div className="pf-btn-row">
              <button onClick={savePwd} className={`pf-btn-pwd ${pwdSaved ? "pf-btn-pwd--saved" : ""}`}>
                {pwdSaving ? <><Spin /> Updating…</> : pwdSaved ? <>✓ Updated!</> : <>Update Password</>}
              </button>
            </div>
          </div>
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

// ─── TAB: ACTIVITY ────────────────────────────────────────────────────────────
function ActivityTab() {
  const activities = [
    { icon: "🏢", color: "#00CBA4", action: "Created company",        detail: "Orbit Analytics",              time: "2 mins ago",  date: "Mar 11, 2026", badge: "CREATE",   badgeCol: "#00CBA4" },
    { icon: "⛔", color: "#FF6B6B", action: "Suspended company",      detail: "Delta Forge (overdue payment)", time: "2 hrs ago",   date: "Mar 11, 2026", badge: "SUSPEND",  badgeCol: "#FF6B6B" },
    { icon: "📦", color: "#A29BFE", action: "Updated plan pricing",   detail: "Starter plan ₹399 → ₹499",     time: "5 hrs ago",   date: "Mar 11, 2026", badge: "UPDATE",   badgeCol: "#74B9FF" },
    { icon: "🔐", color: "#FDCB6E", action: "Changed password",       detail: "Account security updated",     time: "Yesterday",   date: "Mar 10, 2026", badge: "SECURITY", badgeCol: "#FDCB6E" },
    { icon: "📤", color: "#74B9FF", action: "Exported audit logs",    detail: "12 admin accounts CSV",        time: "Yesterday",   date: "Mar 10, 2026", badge: "EXPORT",   badgeCol: "#74B9FF" },
    { icon: "👤", color: "#A29BFE", action: "Updated user role",      detail: "Carlos Mendes → Manager",      time: "2 days ago",  date: "Mar 9, 2026",  badge: "UPDATE",   badgeCol: "#74B9FF" },
    { icon: "⚙️", color: "#565875", action: "Updated SMTP settings",  detail: "smtp.sendgrid.net port 587",   time: "4 days ago",  date: "Mar 7, 2026",  badge: "SETTINGS", badgeCol: "#565875" },
    { icon: "🔑", color: "#00CBA4", action: "Enabled 2FA",            detail: "Authenticator app linked",     time: "1 week ago",  date: "Mar 4, 2026",  badge: "SECURITY", badgeCol: "#FDCB6E" },
    { icon: "🏢", color: "#74B9FF", action: "Viewed company profile", detail: "Nexus Ltd — full details",     time: "1 week ago",  date: "Mar 4, 2026",  badge: "VIEW",     badgeCol: "#565875" },
    { icon: "💳", color: "#A29BFE", action: "Processed refund",       detail: "Prism Analytics — ₹2,499",    time: "8 days ago",  date: "Mar 3, 2026",  badge: "BILLING",  badgeCol: "#A29BFE" },
    { icon: "📋", color: "#565875", action: "Exported billing report", detail: "Q1 2026 PDF — 3.2 MB",       time: "10 days ago", date: "Mar 1, 2026",  badge: "EXPORT",   badgeCol: "#74B9FF" },
    { icon: "🎫", color: "#FD79A8", action: "Closed support ticket",  detail: "Ticket #1007 — SSL issue",    time: "11 days ago", date: "Feb 28, 2026", badge: "SUPPORT",  badgeCol: "#FD79A8" },
  ];

  const stats = [
    { label: "Actions (30d)",     value: "247", icon: "📊", color: "#6C5CE7" },
    { label: "Logins (30d)",      value: "31",  icon: "🔑", color: "#74B9FF" },
    { label: "Exports",           value: "12",  icon: "📤", color: "#FDCB6E" },
    { label: "Companies Created", value: "8",   icon: "🏢", color: "#00CBA4" },
  ];

  return (
    <div className="pf-tab-section">
      <div className="pf-activity-stats">
        {stats.map(s => (
          <div key={s.label} className="pf-stat-card">
            <div className="pf-stat-card__orb" style={{ background: `${s.color}10` }} />
            <div className="pf-stat-card__label">{s.label}</div>
            <div className="pf-stat-card__row">
              <div className="pf-stat-card__value">{s.value}</div>
              <span className="pf-stat-card__icon">{s.icon}</span>
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
                style={{ background: `${a.color}12`, border: `1px solid ${a.color}22` }}>
                {a.icon}
              </div>
              <div className="pf-activity-item__body">
                <div className="pf-activity-item__top">
                  <span className="pf-activity-item__action">{a.action}</span>
                  <span className="pf-activity-item__badge"
                    style={{ background: `${a.badgeCol}15`, color: a.badgeCol }}>
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
  { id: "personal", label: "Personal Info", icon: "👤" },
  { id: "security", label: "Security",      icon: "🔐" },
  { id: "activity", label: "Activity",      icon: "📊" },
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
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`pf-tab ${tab === t.id ? "pf-tab--active" : ""}`}>
            <span className="pf-tab__icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
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