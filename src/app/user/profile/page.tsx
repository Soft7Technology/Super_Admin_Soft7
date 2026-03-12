"use client";

import { useState } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg:      "#080A12",
  surf:    "#0F1120",
  surf2:   "#171929",
  surf3:   "#1E2035",
  border:  "rgba(255,255,255,0.07)",
  accent:  "#6C5CE7",
  accent2: "#A29BFE",
  text:    "#E2E4F0",
  muted:   "#565875",
  success: "#00CBA4",
  danger:  "#FF6B6B",
  warn:    "#FDCB6E",
  info:    "#74B9FF",
} as const;

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!on)}
      style={{ width: 44, height: 25, borderRadius: 13, cursor: "pointer", position: "relative", flexShrink: 0, transition: "all 0.25s",
        background: on ? `linear-gradient(135deg,${T.accent},${T.accent2})` : T.surf3,
        border: `1px solid ${on ? "rgba(108,92,231,0.4)" : T.border}`,
        boxShadow: on ? `0 0 12px rgba(108,92,231,0.35)` : "none",
      }}>
      <div style={{ width: 17, height: 17, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: on ? 22 : 3, transition: "left 0.22s cubic-bezier(.34,1.56,.64,1)", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }} />
    </div>
  );
}

function Inp({ label, value, onChange, type = "text", placeholder = "", hint, disabled = false, prefix }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; hint?: string; disabled?: boolean; prefix?: string;
}) {
  const [f, setF] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: "0.06em" }}>{label.toUpperCase()}</label>
      <div style={{ display: "flex", alignItems: "center", background: disabled ? T.surf3 : T.surf, border: `1px solid ${f ? T.accent : T.border}`, borderRadius: 9, overflow: "hidden", opacity: disabled ? 0.55 : 1, transition: "border-color 0.2s" }}>
        {prefix && <span style={{ padding: "0 10px 0 13px", fontSize: 12, color: T.muted, borderRight: `1px solid ${T.border}`, lineHeight: "40px", whiteSpace: "nowrap" }}>{prefix}</span>}
        <input type={type} value={value} disabled={disabled} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setF(true)} onBlur={() => setF(false)}
          style={{ flex: 1, background: "transparent", border: "none", color: T.text, padding: "10px 13px", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
      </div>
      {hint && <span style={{ fontSize: 10, color: T.muted }}>{hint}</span>}
    </div>
  );
}

function Sel({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: "0.06em" }}>{label.toUpperCase()}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ background: T.surf, border: `1px solid ${T.border}`, color: T.text, padding: "10px 13px", borderRadius: 9, fontSize: 13, outline: "none", fontFamily: "inherit", cursor: "pointer" }}
        onFocus={e => (e.target.style.borderColor = T.accent)}
        onBlur={e  => (e.target.style.borderColor = T.border)}>
        {options.map(o => <option key={o.value} value={o.value} style={{ background: T.surf2 }}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Spin() {
  return <span style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite", display: "inline-block" }} />;
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
    <button onClick={onClick}
      style={{ background: saved ? "rgba(0,203,164,0.10)" : `linear-gradient(135deg,${T.accent},${T.accent2})`, color: saved ? T.success : "#fff", border: saved ? "1px solid rgba(0,203,164,0.3)" : "none", padding: "10px 24px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s", fontFamily: "inherit" }}>
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
  // prefs
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif,   setSmsNotif]   = useState(false);
  const [darkMode,   setDarkMode]   = useState(true);
  const [compactUI,  setCompactUI]  = useState(false);
  const [weekStart,  setWeekStart]  = useState("Mon");
  const { saving, saved, go } = useSave();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Basic info */}
      <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 14 }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, background: T.surf2, borderRadius: "14px 14px 0 0" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Personal Information</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Update your name, contact, and bio details.</div>
        </div>
        <div style={{ padding: "22px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Inp label="First Name" value={firstName} onChange={setFirstName} placeholder="John" />
            <Inp label="Last Name"  value={lastName}  onChange={setLastName}  placeholder="Doe" />
            <Inp label="Email"      value={email}     onChange={setEmail}     type="email" hint="Used for login and notifications" />
            <Inp label="Phone"      value={phone}     onChange={setPhone}     type="tel" prefix="📱" />
            <Inp label="Location"   value={location}  onChange={setLocation}  placeholder="City, Country" />
            <Inp label="Website"    value={website}   onChange={setWebsite}   type="url" placeholder="https://…" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: "0.06em" }}>BIO</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
              style={{ background: T.surf2, border: `1px solid ${T.border}`, color: T.text, padding: "10px 13px", borderRadius: 9, fontSize: 13, resize: "vertical", outline: "none", fontFamily: "inherit", lineHeight: 1.6 }}
              onFocus={e => (e.target.style.borderColor = T.accent)}
              onBlur={e  => (e.target.style.borderColor = T.border)} />
            <span style={{ fontSize: 10, color: T.muted }}>{bio.length}/240 characters</span>
          </div>
        </div>
      </div>

      {/* Regional */}
      <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 14 }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, background: T.surf2, borderRadius: "14px 14px 0 0" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Regional Preferences</div>
        </div>
        <div style={{ padding: "22px 20px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
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

      {/* Notification & UI prefs */}
      <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 14 }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, background: T.surf2, borderRadius: "14px 14px 0 0" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Display & Notification Preferences</div>
        </div>
        <div style={{ padding: "20px" }}>
          {[
            { label:"Email Notifications",  desc:"Receive system alerts and updates via email",         val:emailNotif, set:setEmailNotif },
            { label:"SMS Notifications",    desc:"Receive critical alerts via SMS",                      val:smsNotif,   set:setSmsNotif   },
            { label:"Dark Mode",            desc:"Use dark theme across the admin portal",               val:darkMode,   set:setDarkMode   },
            { label:"Compact UI",           desc:"Reduce spacing for a denser information layout",       val:compactUI,  set:setCompactUI  },
          ].map(({ label, desc, val, set }, i, arr) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{label}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{desc}</div>
              </div>
              <Toggle on={val} onChange={set} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
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

  const strength = newPwd.length === 0 ? 0 : newPwd.length < 6 ? 1 : newPwd.length < 10 ? 2 : /[A-Z]/.test(newPwd) && /[0-9]/.test(newPwd) && /[^a-zA-Z0-9]/.test(newPwd) ? 4 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", T.danger, T.warn, T.info, T.success][strength];

  const savePwd = () => {
    if (!curPwd.trim())          { setPwdErr("Current password is required."); return; }
    if (newPwd.length < 8)       { setPwdErr("New password must be at least 8 characters."); return; }
    if (newPwd !== confPwd)      { setPwdErr("Passwords do not match."); return; }
    setPwdErr(""); setPwdSaving(true);
    setTimeout(() => { setPwdSaving(false); setPwdSaved(true); setCurPwd(""); setNewPwd(""); setConfPwd(""); setTimeout(() => setPwdSaved(false), 2500); }, 1000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Change Password */}
      <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 14 }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, background: T.surf2, borderRadius: "14px 14px 0 0" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Change Password</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Use a strong, unique password you don't use elsewhere.</div>
        </div>
        <div style={{ padding: "22px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <Inp label="Current Password" value={curPwd} onChange={setCurPwd} type="password" placeholder="••••••••••••" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <Inp label="New Password" value={newPwd} onChange={setNewPwd} type="password" placeholder="Min 8 characters" />
              {/* Strength bar */}
              {newPwd.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColor : T.surf3, transition: "all 0.3s" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 10, color: strengthColor, fontWeight: 700 }}>{strengthLabel}</span>
                </div>
              )}
            </div>
            <Inp label="Confirm Password" value={confPwd} onChange={setConfPwd} type="password" placeholder="Repeat new password" />
          </div>
          {pwdErr && <div style={{ fontSize: 11, color: T.danger, background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 8, padding: "9px 12px" }}>{pwdErr}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={savePwd}
              style={{ background: pwdSaved ? "rgba(0,203,164,0.10)" : `linear-gradient(135deg,${T.accent},${T.accent2})`, color: pwdSaved ? T.success : "#fff", border: pwdSaved ? "1px solid rgba(0,203,164,0.3)" : "none", padding: "9px 22px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 7, fontFamily: "inherit" }}>
              {pwdSaving ? <><Spin /> Updating…</> : pwdSaved ? <>✓ Updated!</> : <>Update Password</>}
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{ background: T.surf, border: "1px solid rgba(255,107,107,0.2)", borderRadius: 14 }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,107,107,0.15)", background: "rgba(255,107,107,0.04)", borderRadius: "14px 14px 0 0" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.danger }}>⚠ Danger Zone</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Irreversible actions — proceed with extreme caution.</div>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Delete My Account</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Permanently remove your admin profile and all associated data.</div>
          </div>
          <button style={{ background: "rgba(255,107,107,0.08)", color: T.danger, border: "1px solid rgba(255,107,107,0.3)", padding: "8px 16px", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,107,107,0.16)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,107,107,0.08)")}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TAB: PERMISSIONS ────────────────────────────────────────────────────────
function PermissionsTab() {
  const groups = [
    {
      group: "Company Management",
      icon: "🏢",
      color: T.info,
      perms: [
        { label: "View Companies",      desc: "Read company profiles and details",       granted: true  },
        { label: "Create Companies",    desc: "Register new companies on the platform",  granted: true  },
        { label: "Edit Companies",      desc: "Modify company settings and metadata",    granted: true  },
        { label: "Suspend Companies",   desc: "Suspend or restore company accounts",     granted: true  },
        { label: "Delete Companies",    desc: "Permanently remove company data",         granted: true  },
      ],
    },
    {
      group: "User Management",
      icon: "👥",
      color: T.success,
      perms: [
        { label: "View Users",          desc: "Browse all user accounts",                granted: true  },
        { label: "Create Users",        desc: "Invite and create new user accounts",     granted: true  },
        { label: "Edit Users",          desc: "Modify user roles and settings",          granted: true  },
        { label: "Suspend Users",       desc: "Suspend or restore user accounts",        granted: true  },
        { label: "Delete Users",        desc: "Permanently delete user accounts",        granted: true  },
      ],
    },
    {
      group: "Billing & Subscriptions",
      icon: "💳",
      color: "#A29BFE",
      perms: [
        { label: "View Billing",        desc: "View subscription and payment data",      granted: true  },
        { label: "Manage Plans",        desc: "Create, edit, and delete pricing plans",  granted: true  },
        { label: "Process Refunds",     desc: "Issue refunds to customers",              granted: true  },
        { label: "Export Billing Data", desc: "Download billing reports and invoices",   granted: true  },
      ],
    },
    {
      group: "System & Settings",
      icon: "⚙️",
      color: T.warn,
      perms: [
        { label: "View Settings",       desc: "Read system configuration",               granted: true  },
        { label: "Edit Settings",       desc: "Modify platform-wide settings",           granted: true  },
        { label: "Manage Integrations", desc: "Configure API and webhook integrations",  granted: true  },
        { label: "View Audit Logs",     desc: "Access the full audit trail",             granted: true  },
        { label: "Export Audit Logs",   desc: "Download audit log CSV exports",          granted: true  },
      ],
    },
    {
      group: "Support",
      icon: "🎫",
      color: "#FD79A8",
      perms: [
        { label: "View Tickets",        desc: "Read all support tickets",                granted: true  },
        { label: "Reply to Tickets",    desc: "Post replies on behalf of support team",  granted: true  },
        { label: "Close Tickets",       desc: "Resolve and close open tickets",          granted: true  },
        { label: "Delete Tickets",      desc: "Permanently remove tickets",              granted: false },
      ],
    },
  ];

  const total   = groups.reduce((a, g) => a + g.perms.length, 0);
  const granted = groups.reduce((a, g) => a + g.perms.filter(p => p.granted).length, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Summary */}
      <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Permission Overview</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Super Admin has full platform access. Permissions are inherited from the role.</div>
          </div>
          <div style={{ background: `linear-gradient(135deg,${T.accent},${T.accent2})`, borderRadius: 10, padding: "8px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{granted}/{total}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>PERMISSIONS</div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ height: 5, borderRadius: 3, background: T.surf3 }}>
          <div style={{ height: "100%", width: `${(granted / total) * 100}%`, background: `linear-gradient(90deg,${T.accent},${T.success})`, borderRadius: 3 }} />
        </div>
      </div>

      {/* Groups */}
      {groups.map(g => (
        <div key={g.group} style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "12px 20px", borderBottom: `1px solid ${T.border}`, background: T.surf2, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `${g.color}15`, border: `1px solid ${g.color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{g.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{g.group}</div>
            <span style={{ marginLeft: "auto", fontSize: 10, color: T.muted }}>{g.perms.filter(p => p.granted).length}/{g.perms.length} granted</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
            {g.perms.map((p, i) => (
              <div key={p.label}
                style={{ padding: "12px 18px", borderBottom: i < g.perms.length - 2 ? `1px solid ${T.border}` : "none", borderRight: i % 2 === 0 ? `1px solid ${T.border}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: p.granted ? T.text : T.muted }}>{p.label}</div>
                  <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{p.desc}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.granted ? T.success : T.surf3, display: "inline-block", boxShadow: p.granted ? `0 0 6px ${T.success}60` : "none" }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: p.granted ? T.success : T.muted }}>{p.granted ? "Granted" : "Denied"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ background: "rgba(108,92,231,0.06)", border: "1px solid rgba(108,92,231,0.18)", borderRadius: 12, padding: "12px 16px", fontSize: 11, color: T.muted }}>
        🔒 Permissions are controlled by your role assignment. Contact your system owner to modify role-based access.
      </div>
    </div>
  );
}

// ─── TAB: ACTIVITY ────────────────────────────────────────────────────────────
function ActivityTab() {
  const activities = [
    { icon:"🏢", color:T.success, action:"Created company",       detail:"Orbit Analytics",             time:"2 mins ago",   date:"Mar 11, 2026", badge:"CREATE",   badgeCol:T.success },
    { icon:"⛔", color:T.danger,  action:"Suspended company",     detail:"Delta Forge (overdue payment)",time:"2 hrs ago",    date:"Mar 11, 2026", badge:"SUSPEND",  badgeCol:T.danger  },
    { icon:"📦", color:"#A29BFE", action:"Updated plan pricing",  detail:"Starter plan ₹399 → ₹499",    time:"5 hrs ago",    date:"Mar 11, 2026", badge:"UPDATE",   badgeCol:T.info    },
    { icon:"🔐", color:T.warn,    action:"Changed password",      detail:"Account security updated",    time:"Yesterday",    date:"Mar 10, 2026", badge:"SECURITY", badgeCol:T.warn    },
    { icon:"📤", color:T.info,    action:"Exported audit logs",   detail:"12 admin accounts CSV",       time:"Yesterday",    date:"Mar 10, 2026", badge:"EXPORT",   badgeCol:T.info    },
    { icon:"👤", color:T.accent2, action:"Updated user role",     detail:"Carlos Mendes → Manager",     time:"2 days ago",   date:"Mar 9, 2026",  badge:"UPDATE",   badgeCol:T.info    },
    { icon:"⚙️", color:T.muted,   action:"Updated SMTP settings", detail:"smtp.sendgrid.net port 587",  time:"4 days ago",   date:"Mar 7, 2026",  badge:"SETTINGS", badgeCol:T.muted   },
    { icon:"🔑", color:T.success, action:"Enabled 2FA",           detail:"Authenticator app linked",    time:"1 week ago",   date:"Mar 4, 2026",  badge:"SECURITY", badgeCol:T.warn    },
    { icon:"🏢", color:T.info,    action:"Viewed company profile", detail:"Nexus Ltd — full details",   time:"1 week ago",   date:"Mar 4, 2026",  badge:"VIEW",     badgeCol:T.muted   },
    { icon:"💳", color:"#A29BFE", action:"Processed refund",      detail:"Prism Analytics — ₹2,499",   time:"8 days ago",   date:"Mar 3, 2026",  badge:"BILLING",  badgeCol:"#A29BFE" },
    { icon:"📋", color:T.muted,   action:"Exported billing report","detail":"Q1 2026 PDF — 3.2 MB",    time:"10 days ago",  date:"Mar 1, 2026",  badge:"EXPORT",   badgeCol:T.info    },
    { icon:"🎫", color:"#FD79A8", action:"Closed support ticket", detail:"Ticket #1007 — SSL issue",   time:"11 days ago",  date:"Feb 28, 2026", badge:"SUPPORT",  badgeCol:"#FD79A8" },
  ];

  // Stats
  const stats = [
    { label: "Actions (30d)",  value: "247", icon: "📊", color: T.accent  },
    { label: "Logins (30d)",   value: "31",  icon: "🔑", color: T.info    },
    { label: "Exports",        value: "12",  icon: "📤", color: T.warn    },
    { label: "Companies Created", value: "8", icon: "🏢", color: T.success },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -6, right: -6, width: 50, height: 50, borderRadius: "50%", background: `${s.color}10` }} />
            <div style={{ fontSize: 10, color: T.muted, marginBottom: 6 }}>{s.label}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{s.value}</div>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Activity feed */}
      <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, background: T.surf2 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Recent Activity</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Your last 30 days of actions on the platform.</div>
        </div>
        <div style={{ padding: "8px 0" }}>
          {activities.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 14, padding: "12px 20px", borderBottom: i < activities.length - 1 ? `1px solid ${T.border}` : "none", alignItems: "center" }}>
              {/* Icon */}
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${a.color}12`, border: `1px solid ${a.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                {a.icon}
              </div>
              {/* Detail */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{a.action}</span>
                  <span style={{ background: `${a.badgeCol}15`, color: a.badgeCol, fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 8 }}>{a.badge}</span>
                </div>
                <div style={{ fontSize: 11, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.detail}</div>
              </div>
              {/* Time */}
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <div style={{ fontSize: 11, color: T.muted }}>{a.time}</div>
                <div style={{ fontSize: 10, color: T.surf3 }}>{a.date}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${T.border}`, background: T.surf2, textAlign: "center" }}>
          <button style={{ background: "none", color: T.accent2, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}
            onMouseEnter={e => (e.currentTarget.style.color = T.accent)}
            onMouseLeave={e => (e.currentTarget.style.color = T.accent2)}>
            Load More Activity →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TABS CONFIG ─────────────────────────────────────────────────────────────
const TABS = [
  { id: "personal",    label: "Personal Info", icon: "👤" },
  { id: "security",    label: "Security",      icon: "🔐" },
  { id: "permissions", label: "Permissions",   icon: "🛡" },
  { id: "activity",    label: "Activity",      icon: "📊" },
] as const;
type TabId = typeof TABS[number]["id"];

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Profile() {
  const [tab, setTab]         = useState<TabId>("personal");
  const [uploading, setUploading] = useState(false);
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
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: T.bg, minHeight: "100vh", padding: "28px 32px", color: T.text }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #1E2035; border-radius: 4px; }
        ::placeholder { color: #3A3D5C; }
        button, input, select, textarea { font-family: inherit; }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

      {/* ── PAGE HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>My Profile</h1>
          <p style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>Manage your personal information, security, and preferences.</p>
        </div>
        <button style={{ background: T.surf2, color: T.muted, border: `1px solid ${T.border}`, padding: "9px 16px", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = T.danger)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
          Sign Out
        </button>
      </div>

      {/* ── HERO CARD ── */}
      <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 18, overflow: "hidden", marginBottom: 24, position: "relative" }}>
        {/* Banner gradient */}
        <div style={{ height: 100, background: `linear-gradient(135deg, #0D0B1E 0%, #1A1040 40%, #0C1428 100%)`, position: "relative", overflow: "hidden" }}>
          {/* Decorative orbs */}
          <div style={{ position: "absolute", top: -30, left: -20, width: 120, height: 120, borderRadius: "50%", background: `${T.accent}18`, filter: "blur(30px)" }} />
          <div style={{ position: "absolute", top: 10, right: 60, width: 80, height: 80, borderRadius: "50%", background: `${T.info}12`, filter: "blur(20px)" }} />
          <div style={{ position: "absolute", bottom: -10, left: "40%", width: 100, height: 60, borderRadius: "50%", background: `${T.accent2}10`, filter: "blur(25px)" }} />
          {/* Subtle grid lines */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)`, backgroundSize: "28px 28px" }} />
        </div>

        <div style={{ padding: "0 28px 24px", position: "relative" }}>
          {/* Avatar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: -36 }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 88, height: 88, borderRadius: 22, background: `linear-gradient(135deg,${T.accent},${T.accent2})`, border: "4px solid #080A12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: avatarEmoji ? 40 : 32, fontWeight: 800, color: "#fff", boxShadow: `0 8px 32px rgba(108,92,231,0.4)`, letterSpacing: "-1px" }}>
                {uploading ? <span style={{ animation: "pulse 1s ease infinite", fontSize: 18, color: "rgba(255,255,255,0.7)" }}>⬆</span> : avatarEmoji ?? "JD"}
              </div>
              {/* Online dot */}
              <div style={{ position: "absolute", bottom: 4, right: 4, width: 14, height: 14, borderRadius: "50%", background: T.success, border: "3px solid #080A12", boxShadow: `0 0 8px ${T.success}80` }} />
              {/* Upload overlay */}
              <div onClick={triggerUpload}
                style={{ position: "absolute", inset: 0, borderRadius: 22, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, cursor: "pointer", transition: "opacity 0.2s", fontSize: 18 }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "0")}>
                📷
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, paddingBottom: 4 }}>
              <button style={{ background: T.surf2, color: T.muted, border: `1px solid ${T.border}`, padding: "8px 14px", borderRadius: 9, cursor: "pointer", fontSize: 11, fontWeight: 600 }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = T.accent2)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
                Share Profile
              </button>
              <button
                onClick={() => setTab("personal")}
                style={{ background: `linear-gradient(135deg,${T.accent},${T.accent2})`, color: "#fff", border: "none", padding: "8px 16px", borderRadius: 9, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                ✏️ Edit Profile
              </button>
            </div>
          </div>

          {/* Name & role */}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>James Doe</span>
              <span style={{ background: `linear-gradient(135deg,${T.accent},${T.accent2})`, color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.05em" }}>SUPER ADMIN</span>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
              {[
                { icon: "📧", val: "james.doe@platform.io" },
                { icon: "📱", val: "+91 98765 43210" },
                { icon: "📍", val: "Mumbai, India" },
                { icon: "🕐", val: "IST +5:30" },
              ].map(({ icon, val }) => (
                <span key={val} style={{ fontSize: 12, color: T.muted, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 13 }}>{icon}</span>{val}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, maxWidth: 580 }}>
              Super administrator for the WhatsApp SaaS platform. Overseeing all companies, subscriptions, and system health.
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, auto)", gap: 0, marginTop: 20, background: T.surf2, borderRadius: 12, border: `1px solid ${T.border}`, overflow: "hidden", width: "fit-content" }}>
            {[
              { label: "Companies",   value: "47",       color: T.info    },
              { label: "Users",       value: "5,831",    color: T.accent2 },
              { label: "Actions/mo",  value: "247",      color: T.success },
              { label: "Tickets",     value: "12 open",  color: "#FD79A8" },
              { label: "Last Login",  value: "Now",      color: T.success },
            ].map((s, i, arr) => (
              <div key={s.label} style={{ padding: "10px 20px", borderRight: i < arr.length - 1 ? `1px solid ${T.border}` : "none", textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.color, marginBottom: 2 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: T.muted, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 22, background: T.surf, border: `1px solid ${T.border}`, borderRadius: 12, padding: 5, width: "fit-content" }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ background: active ? `linear-gradient(135deg,${T.accent},${T.accent2})` : "transparent", color: active ? "#fff" : T.muted, border: "none", padding: "9px 20px", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: active ? 700 : 500, display: "flex", alignItems: "center", gap: 7, transition: "all 0.18s", boxShadow: active ? `0 4px 14px rgba(108,92,231,0.35)` : "none" }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = T.text; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = T.muted; }}>
              <span style={{ fontSize: 14 }}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT ── */}
      <div key={tab} style={{ animation: "fadeUp 0.2s ease" }}>
        <Comp />
      </div>
    </div>
  );
}