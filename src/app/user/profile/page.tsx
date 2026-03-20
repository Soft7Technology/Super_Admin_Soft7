"use client";

import { useState } from "react";
import "./profile.css";

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

// ─── TAB: PERSONAL INFO ───────────────────────────────────────────────────────
function PersonalTab() {
  const [firstName,  setFirstName]  = useState("James");
  const [lastName,   setLastName]   = useState("Doe");
  const [email,      setEmail]      = useState("james.doe@platform.io");
  const [phone,      setPhone]      = useState("+91 98765 43210");
  const [bio,        setBio]        = useState("Super administrator for the WhatsApp SaaS platform. Overseeing all companies, subscriptions, and system health.");
  const [location,   setLocation]   = useState("Mumbai, India");
  const [timezone,   setTimezone]   = useState("Asia/Kolkata");
  const [language,   setLanguage]   = useState("en");
  const [website,    setWebsite]    = useState("https://jamesdoe.dev");
  const [weekStart,  setWeekStart]  = useState("Mon");
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif,   setSmsNotif]   = useState(false);
  const [darkMode,   setDarkMode]   = useState(true);
  const [compactUI,  setCompactUI]  = useState(false);
  const { saving, saved, go } = useSave();

  const prefs = [
    { label:"Email Notifications", desc:"Receive system alerts and updates via email",  val:emailNotif, set:setEmailNotif },
    { label:"SMS Notifications",   desc:"Receive critical alerts via SMS",               val:smsNotif,   set:setSmsNotif   },
    { label:"Dark Mode",           desc:"Use dark theme across the admin portal",        val:darkMode,   set:setDarkMode   },
    { label:"Compact UI",          desc:"Reduce spacing for a denser information layout",val:compactUI,  set:setCompactUI  },
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
            <Inp label="First Name" value={firstName} onChange={setFirstName} placeholder="John" />
            <Inp label="Last Name"  value={lastName}  onChange={setLastName}  placeholder="Doe" />
            <Inp label="Email"      value={email}     onChange={setEmail}     type="email" hint="Used for login and notifications" />
            <Inp label="Phone"      value={phone}     onChange={setPhone}     type="tel" prefix="📱" />
            <Inp label="Location"   value={location}  onChange={setLocation}  placeholder="City, Country" />
            <Inp label="Website"    value={website}   onChange={setWebsite}   type="url" placeholder="https://…" />
          </div>
          <div className="pf-field">
            <label className="pf-field__label">BIO</label>
            <textarea className="pf-textarea" value={bio} onChange={e => setBio(e.target.value)} rows={3} />
            <span className="pf-field__char-count">{bio.length}/240 characters</span>
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
              { value:"Asia/Kolkata",    label:"Asia/Kolkata (IST +5:30)" },
              { value:"UTC",             label:"UTC (±0:00)" },
              { value:"America/New_York",label:"America/New_York (EST)" },
              { value:"Europe/London",   label:"Europe/London (GMT)" },
              { value:"Asia/Dubai",      label:"Asia/Dubai (GST +4:00)" },
            ]} />
            <Sel label="Language" value={language} onChange={setLanguage} options={[
              { value:"en",label:"English" },{ value:"hi",label:"Hindi" },
              { value:"es",label:"Spanish"},{ value:"ar",label:"Arabic" },
            ]} />
            <Sel label="Week Starts" value={weekStart} onChange={setWeekStart} options={[
              { value:"Mon",label:"Monday" },{ value:"Sun",label:"Sunday" },{ value:"Sat",label:"Saturday" },
            ]} />
          </div>
        </div>
      </div>

      {/* Prefs */}
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

// ─── TAB: SECURITY ────────────────────────────────────────────────────────────
function SecurityTab() {
  const [curPwd,    setCurPwd]    = useState("");
  const [newPwd,    setNewPwd]    = useState("");
  const [confPwd,   setConfPwd]   = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdSaved,  setPwdSaved]  = useState(false);
  const [pwdErr,    setPwdErr]    = useState("");

  const strength = newPwd.length === 0 ? 0 : newPwd.length < 6 ? 1 : newPwd.length < 10 ? 2
    : /[A-Z]/.test(newPwd) && /[0-9]/.test(newPwd) && /[^a-zA-Z0-9]/.test(newPwd) ? 4 : 3;
  const strengthLabel = ["","Weak","Fair","Good","Strong"][strength];
  const strengthColor = ["","var(--pf-danger)","var(--pf-warn)","var(--pf-info)","var(--pf-success)"][strength];

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

  return (
    <div className="pf-tab-section">
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
                      {[1,2,3,4].map(i => (
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

      <div className="pf-danger-card">
        <div className="pf-danger-card__header">
          <div className="pf-danger-card__title">⚠ Danger Zone</div>
          <div className="pf-danger-card__desc">Irreversible actions — proceed with extreme caution.</div>
        </div>
        <div className="pf-danger-card__body">
          <div>
            <div className="pf-danger-card__name">Delete My Account</div>
            <div className="pf-danger-card__sub">Permanently remove your admin profile and all associated data.</div>
          </div>
          <button className="pf-btn-delete">Delete Account</button>
        </div>
      </div>
    </div>
  );
}

// ─── TAB: PERMISSIONS ─────────────────────────────────────────────────────────
function PermissionsTab() {
  const groups = [
    { group:"Company Management", icon:"🏢", color:"#74B9FF", perms:[
      { label:"View Companies",    desc:"Read company profiles and details",       granted:true  },
      { label:"Create Companies",  desc:"Register new companies on the platform",  granted:true  },
      { label:"Edit Companies",    desc:"Modify company settings and metadata",    granted:true  },
      { label:"Suspend Companies", desc:"Suspend or restore company accounts",     granted:true  },
      { label:"Delete Companies",  desc:"Permanently remove company data",         granted:true  },
    ]},
    { group:"User Management", icon:"👥", color:"#00CBA4", perms:[
      { label:"View Users",   desc:"Browse all user accounts",            granted:true },
      { label:"Create Users", desc:"Invite and create new user accounts", granted:true },
      { label:"Edit Users",   desc:"Modify user roles and settings",      granted:true },
      { label:"Suspend Users",desc:"Suspend or restore user accounts",    granted:true },
      { label:"Delete Users", desc:"Permanently delete user accounts",    granted:true },
    ]},
    { group:"Billing & Subscriptions", icon:"💳", color:"#A29BFE", perms:[
      { label:"View Billing",        desc:"View subscription and payment data",    granted:true },
      { label:"Manage Plans",        desc:"Create, edit, and delete pricing plans",granted:true },
      { label:"Process Refunds",     desc:"Issue refunds to customers",            granted:true },
      { label:"Export Billing Data", desc:"Download billing reports and invoices", granted:true },
    ]},
    { group:"System & Settings", icon:"⚙️", color:"#FDCB6E", perms:[
      { label:"View Settings",       desc:"Read system configuration",             granted:true },
      { label:"Edit Settings",       desc:"Modify platform-wide settings",         granted:true },
      { label:"Manage Integrations", desc:"Configure API and webhook integrations",granted:true },
      { label:"View Audit Logs",     desc:"Access the full audit trail",           granted:true },
      { label:"Export Audit Logs",   desc:"Download audit log CSV exports",        granted:true },
    ]},
    { group:"Support", icon:"🎫", color:"#FD79A8", perms:[
      { label:"View Tickets",   desc:"Read all support tickets",               granted:true  },
      { label:"Reply to Tickets",desc:"Post replies on behalf of support team",granted:true  },
      { label:"Close Tickets",  desc:"Resolve and close open tickets",         granted:true  },
      { label:"Delete Tickets", desc:"Permanently remove tickets",             granted:false },
    ]},
  ];

  const total   = groups.reduce((a,g) => a + g.perms.length, 0);
  const granted = groups.reduce((a,g) => a + g.perms.filter(p => p.granted).length, 0);

  return (
    <div className="pf-tab-section">
      <div className="pf-perm-overview">
        <div className="pf-perm-overview__row">
          <div>
            <div className="pf-perm-overview__title">Permission Overview</div>
            <div className="pf-perm-overview__desc">Super Admin has full platform access. Permissions are inherited from the role.</div>
          </div>
          <div className="pf-perm-overview__badge">
            <div className="pf-perm-overview__count">{granted}/{total}</div>
            <div className="pf-perm-overview__sublbl">PERMISSIONS</div>
          </div>
        </div>
        <div className="pf-perm-overview__track">
          <div className="pf-perm-overview__fill" style={{ width: `${(granted/total)*100}%` }} />
        </div>
      </div>

      {groups.map(g => (
        <div key={g.group} className="pf-perm-group">
          <div className="pf-perm-group__header">
            <div className="pf-perm-group__icon" style={{ background: `${g.color}15`, border: `1px solid ${g.color}28` }}>
              {g.icon}
            </div>
            <div className="pf-perm-group__name">{g.group}</div>
            <span className="pf-perm-group__count">{g.perms.filter(p=>p.granted).length}/{g.perms.length} granted</span>
          </div>
          <div className="pf-perm-grid">
            {g.perms.map(p => (
              <div key={p.label} className="pf-perm-cell">
                <div>
                  <div className="pf-perm-cell__label" style={{ color: p.granted ? "var(--pf-text)" : "var(--pf-muted)" }}>{p.label}</div>
                  <div className="pf-perm-cell__desc">{p.desc}</div>
                </div>
                <div className="pf-perm-cell__status">
                  <span className={`pf-perm-cell__dot ${p.granted ? "pf-perm-cell__dot--granted" : "pf-perm-cell__dot--denied"}`} />
                  <span className={p.granted ? "pf-perm-cell__lbl--granted" : "pf-perm-cell__lbl--denied"}>
                    {p.granted ? "Granted" : "Denied"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="pf-perm-note">
        🔒 Permissions are controlled by your role assignment. Contact your system owner to modify role-based access.
      </div>
    </div>
  );
}

// ─── TAB: ACTIVITY ────────────────────────────────────────────────────────────
function ActivityTab() {
  const activities = [
    { icon:"🏢", color:"#00CBA4", action:"Created company",       detail:"Orbit Analytics",              time:"2 mins ago",  date:"Mar 11, 2026", badge:"CREATE",   badgeCol:"#00CBA4" },
    { icon:"⛔", color:"#FF6B6B", action:"Suspended company",     detail:"Delta Forge (overdue payment)", time:"2 hrs ago",   date:"Mar 11, 2026", badge:"SUSPEND",  badgeCol:"#FF6B6B" },
    { icon:"📦", color:"#A29BFE", action:"Updated plan pricing",  detail:"Starter plan ₹399 → ₹499",     time:"5 hrs ago",   date:"Mar 11, 2026", badge:"UPDATE",   badgeCol:"#74B9FF" },
    { icon:"🔐", color:"#FDCB6E", action:"Changed password",      detail:"Account security updated",     time:"Yesterday",   date:"Mar 10, 2026", badge:"SECURITY", badgeCol:"#FDCB6E" },
    { icon:"📤", color:"#74B9FF", action:"Exported audit logs",   detail:"12 admin accounts CSV",        time:"Yesterday",   date:"Mar 10, 2026", badge:"EXPORT",   badgeCol:"#74B9FF" },
    { icon:"👤", color:"#A29BFE", action:"Updated user role",     detail:"Carlos Mendes → Manager",      time:"2 days ago",  date:"Mar 9, 2026",  badge:"UPDATE",   badgeCol:"#74B9FF" },
    { icon:"⚙️", color:"#565875", action:"Updated SMTP settings", detail:"smtp.sendgrid.net port 587",   time:"4 days ago",  date:"Mar 7, 2026",  badge:"SETTINGS", badgeCol:"#565875" },
    { icon:"🔑", color:"#00CBA4", action:"Enabled 2FA",           detail:"Authenticator app linked",     time:"1 week ago",  date:"Mar 4, 2026",  badge:"SECURITY", badgeCol:"#FDCB6E" },
    { icon:"🏢", color:"#74B9FF", action:"Viewed company profile",detail:"Nexus Ltd — full details",     time:"1 week ago",  date:"Mar 4, 2026",  badge:"VIEW",     badgeCol:"#565875" },
    { icon:"💳", color:"#A29BFE", action:"Processed refund",      detail:"Prism Analytics — ₹2,499",    time:"8 days ago",  date:"Mar 3, 2026",  badge:"BILLING",  badgeCol:"#A29BFE" },
    { icon:"📋", color:"#565875", action:"Exported billing report",detail:"Q1 2026 PDF — 3.2 MB",       time:"10 days ago", date:"Mar 1, 2026",  badge:"EXPORT",   badgeCol:"#74B9FF" },
    { icon:"🎫", color:"#FD79A8", action:"Closed support ticket", detail:"Ticket #1007 — SSL issue",    time:"11 days ago", date:"Feb 28, 2026", badge:"SUPPORT",  badgeCol:"#FD79A8" },
  ];

  const stats = [
    { label:"Actions (30d)",    value:"247", icon:"📊", color:"#6C5CE7" },
    { label:"Logins (30d)",     value:"31",  icon:"🔑", color:"#74B9FF" },
    { label:"Exports",          value:"12",  icon:"📤", color:"#FDCB6E" },
    { label:"Companies Created",value:"8",   icon:"🏢", color:"#00CBA4" },
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
  { id:"personal",    label:"Personal Info", icon:"👤" },
  { id:"security",    label:"Security",      icon:"🔐" },
  { id:"permissions", label:"Permissions",   icon:"🛡" },
  { id:"activity",    label:"Activity",      icon:"📊" },
] as const;
type TabId = typeof TABS[number]["id"];

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Profile() {
  const [tab,         setTab]         = useState<TabId>("personal");
  const [uploading,   setUploading]   = useState(false);
  const [avatarEmoji, setAvatarEmoji] = useState<string | null>(null);

  const triggerUpload = () => {
    setUploading(true);
    setTimeout(() => { setUploading(false); setAvatarEmoji("🧑‍💻"); }, 1200);
  };

  const TabComp: Record<TabId, React.ComponentType> = {
    personal:    PersonalTab,
    security:    SecurityTab,
    permissions: PermissionsTab,
    activity:    ActivityTab,
  };
  const Comp = TabComp[tab];

  return (
    <div className="pf-root">

      {/* ── PAGE HEADER ── */}
      <div className="pf-header">
        <div>
          <h1 className="pf-header__title">My Profile</h1>
          <p className="pf-header__sub">Manage your personal information, security, and preferences.</p>
        </div>
        <button className="pf-btn-signout">Sign Out</button>
      </div>

      {/* ── HERO CARD ── */}
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
                {uploading ? "⬆" : (avatarEmoji ?? "JD")}
              </div>
              <div className="pf-avatar__online" />
              <div className="pf-avatar__upload-overlay" onClick={triggerUpload}>📷</div>
            </div>
            <div className="pf-hero__actions">
              <button className="pf-btn-share">Share Profile</button>
              <button className="pf-btn-edit" onClick={() => setTab("personal")}>✏️ Edit Profile</button>
            </div>
          </div>

          <div className="pf-hero__info">
            <div className="pf-hero__name-row">
              <span className="pf-hero__name">James Doe</span>
              <span className="pf-hero__role">SUPER ADMIN</span>
            </div>
            <div className="pf-hero__meta">
              {[
                { icon:"📧", val:"james.doe@platform.io" },
                { icon:"📱", val:"+91 98765 43210" },
                { icon:"📍", val:"Mumbai, India" },
                { icon:"🕐", val:"IST +5:30" },
              ].map(({ icon, val }) => (
                <span key={val} className="pf-hero__meta-item">
                  <span className="pf-hero__meta-icon">{icon}</span>{val}
                </span>
              ))}
            </div>
            <div className="pf-hero__bio">
              Super administrator for the WhatsApp SaaS platform. Overseeing all companies, subscriptions, and system health.
            </div>
          </div>

          <div className="pf-stat-strip">
            {[
              { label:"Companies",  value:"47",      color:"#74B9FF" },
              { label:"Users",      value:"5,831",   color:"#A29BFE" },
              { label:"Actions/mo", value:"247",     color:"#00CBA4" },
              { label:"Tickets",    value:"12 open", color:"#FD79A8" },
              { label:"Last Login", value:"Now",     color:"#00CBA4" },
            ].map(s => (
              <div key={s.label} className="pf-stat-strip__cell">
                <div className="pf-stat-strip__val" style={{ color: s.color }}>{s.value}</div>
                <div className="pf-stat-strip__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
        <Comp />
      </div>
    </div>
  );
}