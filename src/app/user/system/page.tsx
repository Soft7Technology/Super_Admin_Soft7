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

// ─── REUSABLE PRIMITIVES ──────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        width: 42, height: 24, borderRadius: 12, cursor: "pointer",
        background: on ? `linear-gradient(135deg,${T.accent},${T.accent2})` : T.surf3,
        border: `1px solid ${on ? "rgba(108,92,231,0.4)" : T.border}`,
        position: "relative", transition: "all 0.25s", flexShrink: 0,
        boxShadow: on ? `0 0 10px rgba(108,92,231,0.35)` : "none",
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: "50%", background: "#fff",
        position: "absolute", top: 3, left: on ? 21 : 3, transition: "left 0.22s cubic-bezier(.34,1.56,.64,1)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
      }} />
    </div>
  );
}

function Inp({
  label, value, onChange, placeholder = "", type = "text", hint, prefix, suffix, disabled = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; hint?: string; prefix?: string; suffix?: string; disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.04em" }}>{label.toUpperCase()}</label>
      <div style={{ display: "flex", alignItems: "center", background: disabled ? T.surf3 : T.surf, border: `1px solid ${focused ? T.accent : T.border}`, borderRadius: 9, overflow: "hidden", transition: "border-color 0.2s", opacity: disabled ? 0.5 : 1 }}>
        {prefix && <span style={{ padding: "0 10px 0 12px", fontSize: 12, color: T.muted, borderRight: `1px solid ${T.border}`, userSelect: "none", lineHeight: "38px" }}>{prefix}</span>}
        <input
          type={type} value={value} disabled={disabled}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{ flex: 1, background: "transparent", border: "none", color: T.text, padding: "9px 12px", fontSize: 12, outline: "none", fontFamily: "inherit" }}
        />
        {suffix && <span style={{ padding: "0 12px 0 10px", fontSize: 12, color: T.muted, borderLeft: `1px solid ${T.border}`, lineHeight: "38px" }}>{suffix}</span>}
      </div>
      {hint && <span style={{ fontSize: 10, color: T.muted }}>{hint}</span>}
    </div>
  );
}

function Select({ label, value, options, onChange, hint }: {
  label: string; value: string; options: { value: string; label: string }[];
  onChange: (v: string) => void; hint?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.04em" }}>{label.toUpperCase()}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ background: T.surf, border: `1px solid ${T.border}`, color: T.text, padding: "9px 12px", borderRadius: 9, fontSize: 12, outline: "none", fontFamily: "inherit", cursor: "pointer" }}
        onFocus={e => (e.target.style.borderColor = T.accent)}
        onBlur={e  => (e.target.style.borderColor = T.border)}>
        {options.map(o => <option key={o.value} value={o.value} style={{ background: T.surf2 }}>{o.label}</option>)}
      </select>
      {hint && <span style={{ fontSize: 10, color: T.muted }}>{hint}</span>}
    </div>
  );
}

function SectionCard({ title, desc, children, icon }: { title: string; desc?: string; children: React.ReactNode; icon?: string }) {
  return (
    <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, background: T.surf2, display: "flex", alignItems: "center", gap: 10 }}>
        {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{title}</div>
          {desc && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{desc}</div>}
        </div>
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
      <div style={{ flex: 1, marginRight: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function SaveBtn({ onClick, saving, saved }: { onClick: () => void; saving: boolean; saved: boolean }) {
  return (
    <button onClick={onClick}
      style={{ background: saved ? "rgba(0,203,164,0.12)" : `linear-gradient(135deg,${T.accent},${T.accent2})`, color: saved ? T.success : "#fff", border: saved ? "1px solid rgba(0,203,164,0.3)" : "none", padding: "9px 22px", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s", fontFamily: "inherit" }}
      onMouseEnter={e => { if (!saved) e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
    >
      {saving ? <><span style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Saving…</> : saved ? <>✓ Saved!</> : <>💾 Save Changes</>}
    </button>
  );
}

function useSave() {
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const trigger = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500); }, 900);
  };
  return { saving, saved, trigger };
}

// ─── STATUS INDICATOR ─────────────────────────────────────────────────────────
function StatusDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: ok ? T.success : T.danger, display: "inline-block", boxShadow: `0 0 6px ${ok ? T.success : T.danger}80` }} />
      <span style={{ fontSize: 11, color: ok ? T.success : T.danger, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

// ─── TAB: GENERAL ─────────────────────────────────────────────────────────────
function GeneralTab() {
  const [platform,    setPlatform]    = useState("WhatsApp SaaS Platform");
  const [tagline,     setTagline]     = useState("Automate. Engage. Convert.");
  const [supportEmail,setSupportEmail]= useState("support@platform.io");
  const [timezone,    setTimezone]    = useState("Asia/Kolkata");
  const [language,    setLanguage]    = useState("en");
  const [dateFormat,  setDateFormat]  = useState("DD/MM/YYYY");
  const [maintenance, setMaintenance] = useState(false);
  const [betaFeatures,setBetaFeatures]= useState(true);
  const [analytics,   setAnalytics]  = useState(true);
  const [debugMode,   setDebugMode]  = useState(false);
  const { saving, saved, trigger } = useSave();

  return (
    <>
      <SectionCard title="Platform Identity" desc="Core branding and identity settings" icon="🏢">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Inp label="Platform Name"    value={platform}     onChange={setPlatform}     placeholder="My SaaS Platform" />
          <Inp label="Tagline"          value={tagline}      onChange={setTagline}      placeholder="Your tagline here" />
          <Inp label="Support Email"    value={supportEmail} onChange={setSupportEmail} type="email" placeholder="support@example.com" />
          <Select label="Default Timezone" value={timezone} onChange={setTimezone}
            options={[
              { value: "Asia/Kolkata",    label: "Asia/Kolkata (IST +5:30)" },
              { value: "UTC",             label: "UTC (±0:00)" },
              { value: "America/New_York",label: "America/New_York (EST -5:00)" },
              { value: "Europe/London",   label: "Europe/London (GMT +0:00)" },
              { value: "Asia/Dubai",      label: "Asia/Dubai (GST +4:00)" },
            ]}
          />
          <Select label="Default Language" value={language} onChange={setLanguage}
            options={[
              { value: "en",  label: "English" },
              { value: "hi",  label: "Hindi" },
              { value: "es",  label: "Spanish" },
              { value: "ar",  label: "Arabic" },
              { value: "pt",  label: "Portuguese" },
            ]}
          />
          <Select label="Date Format" value={dateFormat} onChange={setDateFormat}
            options={[
              { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
              { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
              { value: "YYYY-MM-DD", label: "YYYY-MM-DD (ISO)" },
            ]}
          />
        </div>
      </SectionCard>

      <SectionCard title="Feature Flags" desc="Toggle platform-wide feature availability" icon="🚀">
        <SettingRow label="Maintenance Mode" desc="Shows a maintenance page to all non-admin users">
          <Toggle on={maintenance} onChange={setMaintenance} />
        </SettingRow>
        <SettingRow label="Beta Features" desc="Enable experimental features for all users">
          <Toggle on={betaFeatures} onChange={setBetaFeatures} />
        </SettingRow>
        <SettingRow label="Analytics Tracking" desc="Collect anonymised usage data for product improvements">
          <Toggle on={analytics} onChange={setAnalytics} />
        </SettingRow>
        <SettingRow label="Debug Mode" desc="Show verbose error messages and stack traces (disable in production)">
          <Toggle on={debugMode} onChange={setDebugMode} />
        </SettingRow>
      </SectionCard>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SaveBtn onClick={trigger} saving={saving} saved={saved} />
      </div>
    </>
  );
}

// ─── TAB: EMAIL / SMTP ────────────────────────────────────────────────────────
function EmailTab() {
  const [provider,    setProvider]    = useState("smtp");
  const [host,        setHost]        = useState("smtp.sendgrid.net");
  const [port,        setPort]        = useState("587");
  const [username,    setUsername]    = useState("apikey");
  const [password,    setPassword]    = useState("SG.xxxxxxxx");
  const [fromName,    setFromName]    = useState("Platform Alerts");
  const [fromEmail,   setFromEmail]   = useState("no-reply@platform.io");
  const [replyTo,     setReplyTo]     = useState("support@platform.io");
  const [encryption,  setEncryption]  = useState("TLS");
  const [testEmail,   setTestEmail]   = useState("");
  const [testStatus,  setTestStatus]  = useState<"idle"|"sending"|"ok"|"fail">("idle");
  const { saving, saved, trigger }    = useSave();

  const sendTest = () => {
    if (!testEmail.trim()) return;
    setTestStatus("sending");
    setTimeout(() => setTestStatus(Math.random() > 0.2 ? "ok" : "fail"), 1400);
  };

  return (
    <>
      <SectionCard title="SMTP Configuration" desc="Configure outgoing mail server settings" icon="📧">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Select label="Email Provider" value={provider} onChange={setProvider}
            options={[
              { value: "smtp",      label: "Custom SMTP" },
              { value: "sendgrid",  label: "SendGrid" },
              { value: "mailgun",   label: "Mailgun" },
              { value: "ses",       label: "Amazon SES" },
              { value: "postmark",  label: "Postmark" },
            ]}
          />
          <Select label="Encryption" value={encryption} onChange={setEncryption}
            options={[
              { value: "TLS",  label: "TLS (Recommended)" },
              { value: "SSL",  label: "SSL" },
              { value: "None", label: "None (Not recommended)" },
            ]}
          />
          <Inp label="SMTP Host" value={host}     onChange={setHost}     placeholder="smtp.sendgrid.net" />
          <Inp label="SMTP Port" value={port}     onChange={setPort}     placeholder="587" />
          <Inp label="Username"  value={username} onChange={setUsername} placeholder="apikey" />
          <Inp label="Password"  value={password} onChange={setPassword} type="password" placeholder="••••••••••••" />
        </div>
      </SectionCard>

      <SectionCard title="Sender Identity" desc="Configure how emails appear to recipients" icon="✉️">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Inp label="From Name"  value={fromName}  onChange={setFromName}  placeholder="My Platform" />
          <Inp label="From Email" value={fromEmail} onChange={setFromEmail} type="email" placeholder="no-reply@example.com" />
          <Inp label="Reply-To"   value={replyTo}   onChange={setReplyTo}   type="email" placeholder="support@example.com" hint="Optional — defaults to From Email" />
        </div>
      </SectionCard>

      <SectionCard title="Test Connection" desc="Send a test email to verify your SMTP settings" icon="🔌">
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <Inp label="Test Recipient Email" value={testEmail} onChange={setTestEmail} type="email" placeholder="you@example.com" />
          </div>
          <button onClick={sendTest}
            style={{ background: testStatus === "ok" ? "rgba(0,203,164,0.12)" : testStatus === "fail" ? "rgba(255,107,107,0.12)" : T.surf2, color: testStatus === "ok" ? T.success : testStatus === "fail" ? T.danger : T.accent2, border: `1px solid ${testStatus === "ok" ? "rgba(0,203,164,0.3)" : testStatus === "fail" ? "rgba(255,107,107,0.3)" : "rgba(108,92,231,0.3)"}`, padding: "9px 18px", borderRadius: 9, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", height: 40 }}>
            {testStatus === "sending" ? "Sending…" : testStatus === "ok" ? "✓ Delivered!" : testStatus === "fail" ? "✕ Failed" : "Send Test"}
          </button>
        </div>
        {testStatus === "fail" && (
          <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: T.danger, fontWeight: 600 }}>Connection failed — check your host, port, and credentials.</div>
          </div>
        )}
      </SectionCard>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SaveBtn onClick={trigger} saving={saving} saved={saved} />
      </div>
    </>
  );
}

// ─── TAB: WHATSAPP ────────────────────────────────────────────────────────────
function WhatsAppTab() {
  const [apiVersion,  setApiVersion]  = useState("v20.0");
  const [baseUrl,     setBaseUrl]     = useState("https://graph.facebook.com");
  const [webhookUrl,  setWebhookUrl]  = useState("https://platform.io/webhook/whatsapp");
  const [verifyToken, setVerifyToken] = useState("wh_verify_abc123xyz");
  const [maxRetries,  setMaxRetries]  = useState("3");
  const [retryDelay,  setRetryDelay]  = useState("5");
  const [msgTimeout,  setMsgTimeout]  = useState("30");
  const [rateLimit,   setRateLimit]   = useState("1000");
  const [autoRetry,   setAutoRetry]   = useState(true);
  const [readReceipts,setReadReceipts]= useState(true);
  const [typingInd,   setTypingInd]   = useState(true);
  const [mediaComp,   setMediaComp]   = useState(false);
  const [status,      setStatus]      = useState<"connected"|"checking"|"error">("connected");
  const { saving, saved, trigger }    = useSave();

  const checkConnection = () => {
    setStatus("checking");
    setTimeout(() => setStatus(Math.random() > 0.2 ? "connected" : "error"), 1500);
  };

  return (
    <>
      {/* Connection status banner */}
      <div style={{ background: status === "connected" ? "rgba(0,203,164,0.06)" : status === "error" ? "rgba(255,107,107,0.06)" : "rgba(116,185,255,0.06)", border: `1px solid ${status === "connected" ? "rgba(0,203,164,0.2)" : status === "error" ? "rgba(255,107,107,0.2)" : "rgba(116,185,255,0.2)"}`, borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>{status === "connected" ? "✅" : status === "error" ? "❌" : "🔄"}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: status === "connected" ? T.success : status === "error" ? T.danger : T.info }}>
              {status === "connected" ? "WhatsApp API Connected" : status === "error" ? "Connection Error" : "Checking connection…"}
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
              {status === "connected" ? "Meta Graph API v20.0 · Latency: 124ms" : status === "error" ? "Unable to reach Meta Graph API — check credentials" : "Testing API connection…"}
            </div>
          </div>
        </div>
        <button onClick={checkConnection}
          style={{ background: T.surf2, color: T.muted, border: `1px solid ${T.border}`, padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 600 }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = T.accent2)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
          ↻ Re-test
        </button>
      </div>

      <SectionCard title="API Configuration" desc="Meta Graph API connection settings" icon="🔗">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Select label="API Version" value={apiVersion} onChange={setApiVersion}
            options={[
              { value: "v20.0", label: "v20.0 (Latest)" },
              { value: "v19.0", label: "v19.0" },
              { value: "v18.0", label: "v18.0" },
            ]}
          />
          <Inp label="Base URL" value={baseUrl} onChange={setBaseUrl} placeholder="https://graph.facebook.com" />
          <Inp label="Webhook URL"   value={webhookUrl}  onChange={setWebhookUrl}  placeholder="https://yourapp.com/webhook" hint="This URL must be publicly accessible" />
          <Inp label="Verify Token"  value={verifyToken} onChange={setVerifyToken} placeholder="your_verify_token" type="password" hint="Set this in your Meta App Dashboard" />
        </div>
      </SectionCard>

      <SectionCard title="Rate Limiting & Retry" desc="Control message delivery behaviour" icon="⚡">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
          <Inp label="Rate Limit"   value={rateLimit}  onChange={setRateLimit}  suffix="msg/min" hint="Per phone number" />
          <Inp label="Max Retries"  value={maxRetries}  onChange={setMaxRetries}  suffix="times" hint="On delivery failure" />
          <Inp label="Retry Delay"  value={retryDelay}  onChange={setRetryDelay}  suffix="seconds" hint="Between attempts" />
          <Inp label="Msg Timeout"  value={msgTimeout}  onChange={setMsgTimeout}  suffix="seconds" hint="Before marking failed" />
        </div>
        <SettingRow label="Auto-Retry Failed Messages" desc="Automatically retry messages that fail due to transient errors">
          <Toggle on={autoRetry} onChange={setAutoRetry} />
        </SettingRow>
        <SettingRow label="Read Receipts" desc="Mark messages as read when viewed in the chat interface">
          <Toggle on={readReceipts} onChange={setReadReceipts} />
        </SettingRow>
        <SettingRow label="Typing Indicators" desc="Show typing indicator while composing a reply">
          <Toggle on={typingInd} onChange={setTypingInd} />
        </SettingRow>
        <SettingRow label="Media Compression" desc="Automatically compress images and videos before sending">
          <Toggle on={mediaComp} onChange={setMediaComp} />
        </SettingRow>
      </SectionCard>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SaveBtn onClick={trigger} saving={saving} saved={saved} />
      </div>
    </>
  );
}

// ─── TAB: SECURITY ────────────────────────────────────────────────────────────
function SecurityTab() {
  const [enforce2FA,     setEnforce2FA]     = useState(true);
  const [ssoEnabled,     setSsoEnabled]     = useState(false);
  const [ipWhitelist,    setIpWhitelist]    = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [maxLoginAttempts,setMaxLoginAttempts]=useState("5");
  const [lockoutDuration,setLockoutDuration]= useState("30");
  const [passwordMinLen, setPasswordMinLen] = useState("10");
  const [jwtExpiry,      setJwtExpiry]      = useState("24");
  const [allowedIPs,     setAllowedIPs]     = useState("192.168.1.0/24\n10.0.0.0/8");
  const [logFailedLogins,setLogFailedLogins]= useState(true);
  const [auditRetention, setAuditRetention] = useState("365");
  const { saving, saved, trigger } = useSave();

  return (
    <>
      <SectionCard title="Authentication" desc="Control how users log in and access the platform" icon="🔐">
        <SettingRow label="Enforce 2FA for All Admins" desc="Require two-factor authentication for all admin and super-admin accounts">
          <Toggle on={enforce2FA} onChange={setEnforce2FA} />
        </SettingRow>
        <SettingRow label="Single Sign-On (SSO)" desc="Allow users to log in with Google Workspace or Microsoft Entra ID">
          <Toggle on={ssoEnabled} onChange={setSsoEnabled} />
        </SettingRow>
        <SettingRow label="IP Whitelist Enforcement" desc="Restrict admin access to specific IP addresses only">
          <Toggle on={ipWhitelist} onChange={setIpWhitelist} />
        </SettingRow>
        {ipWhitelist && (
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.04em", display: "block", marginBottom: 5 }}>ALLOWED IP RANGES (ONE PER LINE)</label>
            <textarea value={allowedIPs} onChange={e => setAllowedIPs(e.target.value)} rows={4}
              style={{ width: "100%", background: T.surf2, border: `1px solid ${T.border}`, color: T.text, padding: "10px 12px", borderRadius: 9, fontSize: 12, outline: "none", resize: "vertical", fontFamily: "monospace", lineHeight: 1.6 }}
              onFocus={e => (e.target.style.borderColor = T.accent)}
              onBlur={e  => (e.target.style.borderColor = T.border)} />
            <span style={{ fontSize: 10, color: T.muted }}>Supports CIDR notation (e.g. 192.168.1.0/24)</span>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Session & Token Policy" desc="Configure session duration and token expiry" icon="⏱">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Inp label="Session Timeout"  value={sessionTimeout}    onChange={setSessionTimeout}    suffix="mins"  hint="Inactive sessions are logged out" />
          <Inp label="JWT Expiry"       value={jwtExpiry}         onChange={setJwtExpiry}         suffix="hours" hint="API token lifetime" />
        </div>
      </SectionCard>

      <SectionCard title="Login Security" desc="Brute-force protection and lockout policy" icon="🛡">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <Inp label="Max Login Attempts"  value={maxLoginAttempts}  onChange={setMaxLoginAttempts}  suffix="tries"   hint="Before account lockout" />
          <Inp label="Lockout Duration"    value={lockoutDuration}   onChange={setLockoutDuration}   suffix="mins"    hint="After exceeding attempts" />
          <Inp label="Min Password Length" value={passwordMinLen}    onChange={setPasswordMinLen}    suffix="chars"   hint="Enforced at registration & reset" />
        </div>
        <SettingRow label="Log Failed Login Attempts" desc="Record all failed login attempts in the audit log">
          <Toggle on={logFailedLogins} onChange={setLogFailedLogins} />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Audit & Compliance" desc="Data retention and audit trail settings" icon="📋">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Inp label="Audit Log Retention" value={auditRetention} onChange={setAuditRetention} suffix="days" hint="Logs older than this are archived" />
        </div>
      </SectionCard>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SaveBtn onClick={trigger} saving={saving} saved={saved} />
      </div>
    </>
  );
}

// ─── TAB: BILLING / PAYMENTS ──────────────────────────────────────────────────
function BillingTab() {
  const [gateway,      setGateway]      = useState("razorpay");
  const [keyId,        setKeyId]        = useState("rzp_live_xxxxxxxxxxxxxxxx");
  const [keySecret,    setKeySecret]    = useState("••••••••••••••••••••••••");
  const [webhookSecret,setWebhookSecret]= useState("whs_xxxxxxxxxxxxxxxx");
  const [currency,     setCurrency]     = useState("INR");
  const [taxRate,      setTaxRate]      = useState("18");
  const [taxName,      setTaxName]      = useState("GST");
  const [trialDays,    setTrialDays]    = useState("14");
  const [gracePeriod,  setGracePeriod]  = useState("7");
  const [autoInvoice,  setAutoInvoice]  = useState(true);
  const [dunning,      setDunning]      = useState(true);
  const [prorations,   setProrations]   = useState(true);
  const [testMode,     setTestMode]     = useState(false);
  const { saving, saved, trigger }      = useSave();

  return (
    <>
      {testMode && (
        <div style={{ background: "rgba(253,203,110,0.08)", border: "1px solid rgba(253,203,110,0.25)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.warn }}>Test Mode Active</div>
            <div style={{ fontSize: 11, color: T.muted }}>No real transactions will be processed. Disable before going live.</div>
          </div>
        </div>
      )}

      <SectionCard title="Payment Gateway" desc="Configure your payment processor" icon="💳">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Select label="Gateway" value={gateway} onChange={setGateway}
            options={[
              { value: "razorpay",  label: "Razorpay" },
              { value: "stripe",    label: "Stripe" },
              { value: "payu",      label: "PayU" },
              { value: "cashfree",  label: "Cashfree" },
              { value: "ccavenue",  label: "CCAvenue" },
            ]}
          />
          <Select label="Default Currency" value={currency} onChange={setCurrency}
            options={[
              { value: "INR", label: "₹ INR — Indian Rupee" },
              { value: "USD", label: "$ USD — US Dollar" },
              { value: "EUR", label: "€ EUR — Euro" },
              { value: "GBP", label: "£ GBP — British Pound" },
              { value: "AED", label: "د.إ AED — UAE Dirham" },
            ]}
          />
          <Inp label="API Key ID"       value={keyId}         onChange={setKeyId}         type="password" hint={`Your ${gateway === "razorpay" ? "Razorpay" : "Stripe"} publishable key`} />
          <Inp label="API Key Secret"   value={keySecret}     onChange={setKeySecret}     type="password" hint="Never share this publicly" />
          <Inp label="Webhook Secret"   value={webhookSecret} onChange={setWebhookSecret} type="password" hint="Used to verify webhook payloads" />
        </div>
        <div style={{ marginTop: 14 }}>
          <SettingRow label="Test / Sandbox Mode" desc="Use test credentials — no real money is charged">
            <Toggle on={testMode} onChange={setTestMode} />
          </SettingRow>
        </div>
      </SectionCard>

      <SectionCard title="Tax & Invoicing" desc="Configure tax rates and invoice settings" icon="🧾">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <Inp label="Tax Name"  value={taxName}  onChange={setTaxName}  placeholder="GST / VAT / Sales Tax" />
          <Inp label="Tax Rate"  value={taxRate}  onChange={setTaxRate}  suffix="%" hint="Applied to all subscription invoices" />
        </div>
        <SettingRow label="Auto-Generate Invoices"  desc="Automatically generate and email invoices on each billing cycle">
          <Toggle on={autoInvoice} onChange={setAutoInvoice} />
        </SettingRow>
        <SettingRow label="Smart Dunning" desc="Automatically retry failed payments with escalating reminders">
          <Toggle on={dunning} onChange={setDunning} />
        </SettingRow>
        <SettingRow label="Proration on Plan Changes" desc="Charge or credit the difference when customers upgrade or downgrade mid-cycle">
          <Toggle on={prorations} onChange={setProrations} />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Trial & Grace Period" desc="Configure free trial and overdue grace windows" icon="⏳">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Inp label="Free Trial Duration" value={trialDays}   onChange={setTrialDays}   suffix="days" hint="Applied to all new company signups" />
          <Inp label="Payment Grace Period" value={gracePeriod} onChange={setGracePeriod} suffix="days" hint="Before account is suspended on overdue payment" />
        </div>
      </SectionCard>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SaveBtn onClick={trigger} saving={saving} saved={saved} />
      </div>
    </>
  );
}

// ─── TAB: NOTIFICATIONS ───────────────────────────────────────────────────────
function NotificationsTab() {
  const [emailAlerts,    setEmailAlerts]    = useState(true);
  const [slackAlerts,    setSlackAlerts]    = useState(false);
  const [slackWebhook,   setSlackWebhook]   = useState("");
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [webhookUrl,     setWebhookUrl]     = useState("");
  const [events, setEvents] = useState({
    newCompany:    true,
    suspendCompany:true,
    newTicket:     true,
    criticalLog:   true,
    paymentFail:   true,
    planUpgrade:   false,
    userSignup:    false,
    exportRequest: false,
  });
  const { saving, saved, trigger } = useSave();

  const toggle = (key: keyof typeof events) => setEvents(prev => ({ ...prev, [key]: !prev[key] }));

  const EVENT_LABELS: { key: keyof typeof events; label: string; desc: string; icon: string }[] = [
    { key: "newCompany",     label: "New Company Signup",     desc: "When a new company registers",                icon: "🏢" },
    { key: "suspendCompany", label: "Company Suspended",      desc: "When a company is suspended",                 icon: "⛔" },
    { key: "newTicket",      label: "New Support Ticket",     desc: "When a customer opens a ticket",             icon: "🎫" },
    { key: "criticalLog",    label: "Critical Audit Event",   desc: "When a CRITICAL severity event is logged",   icon: "🔴" },
    { key: "paymentFail",    label: "Payment Failure",        desc: "When a subscription payment fails",          icon: "💳" },
    { key: "planUpgrade",    label: "Plan Upgrade",           desc: "When a company upgrades their plan",         icon: "⬆️" },
    { key: "userSignup",     label: "New User Signup",        desc: "When any user registers",                    icon: "👤" },
    { key: "exportRequest",  label: "Data Export Request",    desc: "When a user requests a data export",         icon: "📤" },
  ];

  return (
    <>
      <SectionCard title="Alert Channels" desc="Configure where system alerts are delivered" icon="🔔">
        <SettingRow label="Email Alerts" desc="Send system alerts to the support email address">
          <Toggle on={emailAlerts} onChange={setEmailAlerts} />
        </SettingRow>
        <SettingRow label="Slack Notifications" desc="Post alerts to a Slack channel via webhook">
          <Toggle on={slackAlerts} onChange={setSlackAlerts} />
        </SettingRow>
        {slackAlerts && (
          <div style={{ marginTop: 12 }}>
            <Inp label="Slack Webhook URL" value={slackWebhook} onChange={setSlackWebhook} placeholder="https://hooks.slack.com/services/…" hint="Create a webhook in your Slack App settings" />
          </div>
        )}
        <SettingRow label="Custom Webhook" desc="POST event payloads to your own endpoint">
          <Toggle on={webhookEnabled} onChange={setWebhookEnabled} />
        </SettingRow>
        {webhookEnabled && (
          <div style={{ marginTop: 12 }}>
            <Inp label="Webhook Endpoint URL" value={webhookUrl} onChange={setWebhookUrl} placeholder="https://yourapp.com/webhooks/system" hint="Must return 200 OK to acknowledge receipt" />
          </div>
        )}
      </SectionCard>

      <SectionCard title="Event Subscriptions" desc="Choose which events trigger notifications" icon="📡">
        {EVENT_LABELS.map(({ key, label, desc, icon }) => (
          <SettingRow key={key} label={`${icon} ${label}`} desc={desc}>
            <Toggle on={events[key]} onChange={() => toggle(key)} />
          </SettingRow>
        ))}
      </SectionCard>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SaveBtn onClick={trigger} saving={saving} saved={saved} />
      </div>
    </>
  );
}

// ─── TAB: SYSTEM HEALTH ───────────────────────────────────────────────────────
function HealthTab() {
  const [clearing, setClearing] = useState(false);
  const [cleared,  setCleared]  = useState(false);

  const clearCache = () => {
    setClearing(true);
    setTimeout(() => { setClearing(false); setCleared(true); setTimeout(() => setCleared(false), 3000); }, 1200);
  };

  const services = [
    { name: "API Server",        status: true,  latency: "18ms",  uptime: "99.98%", region: "Mumbai" },
    { name: "Database (Postgres)",status: true, latency: "4ms",   uptime: "99.99%", region: "Mumbai" },
    { name: "Redis Cache",        status: true, latency: "1ms",   uptime: "100%",   region: "Mumbai" },
    { name: "WhatsApp Gateway",   status: true, latency: "124ms", uptime: "99.95%", region: "Global" },
    { name: "Email Service",      status: true, latency: "210ms", uptime: "99.97%", region: "Global" },
    { name: "File Storage (S3)",  status: true, latency: "42ms",  uptime: "99.99%", region: "Mumbai" },
    { name: "Background Jobs",    status: true, latency: "—",     uptime: "99.92%", region: "Mumbai" },
    { name: "CDN",                status: false, latency: "—",    uptime: "98.10%", region: "Global" },
  ];

  const metrics = [
    { label: "CPU Usage",        value: "24%",   bar: 0.24, color: T.success },
    { label: "Memory",           value: "61%",   bar: 0.61, color: T.warn    },
    { label: "Disk I/O",         value: "8%",    bar: 0.08, color: T.success },
    { label: "Network Throughput",value: "2.4 GB/s", bar: 0.48, color: T.info  },
  ];

  return (
    <>
      {/* System metrics */}
      <SectionCard title="System Resources" desc="Real-time server resource utilisation" icon="📊">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {metrics.map(m => (
            <div key={m.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: T.muted }}>{m.label}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{m.value}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: T.surf3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${m.bar * 100}%`, background: `linear-gradient(90deg,${m.color},${m.color}99)`, borderRadius: 3, transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Service status */}
      <SectionCard title="Service Status" desc="Health of all connected platform services" icon="🩺">
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 90px 80px", padding: "7px 0", borderBottom: `1px solid ${T.border}` }}>
            {["Service","Status","Latency","Uptime","Region"].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: "0.05em" }}>{h.toUpperCase()}</span>
            ))}
          </div>
          {services.map(s => (
            <div key={s.name} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 90px 80px", padding: "11px 0", borderBottom: `1px solid ${T.border}`, alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{s.name}</span>
              <StatusDot ok={s.status} label={s.status ? "Online" : "Down"} />
              <span style={{ fontSize: 11, color: s.status ? T.text : T.danger, fontWeight: 600 }}>{s.latency}</span>
              <span style={{ fontSize: 11, color: parseFloat(s.uptime) >= 99.9 ? T.success : T.warn, fontWeight: 600 }}>{s.uptime}</span>
              <span style={{ fontSize: 11, color: T.muted }}>{s.region}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Cache & maintenance actions */}
      <SectionCard title="Maintenance Actions" desc="System cache and data management tools" icon="🔧">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { label: "Clear App Cache",   sub: "Flush Redis + in-memory cache",     action: clearCache, loading: clearing, done: cleared, col: T.info   },
            { label: "Rebuild Indexes",   sub: "Rebuild DB search indexes",          action: ()=>{},     loading: false,    done: false,   col: T.warn   },
            { label: "Vacuum Database",   sub: "Reclaim dead tuples and space",      action: ()=>{},     loading: false,    done: false,   col: T.accent2 },
            { label: "Flush Job Queue",   sub: "Clear all pending background jobs",  action: ()=>{},     loading: false,    done: false,   col: T.warn   },
            { label: "Rotate Log Files",  sub: "Archive and compress old log files", action: ()=>{},     loading: false,    done: false,   col: T.muted  },
            { label: "Check DB Integrity",sub: "Run PostgreSQL consistency checks",  action: ()=>{},     loading: false,    done: false,   col: T.success },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action}
              style={{ background: btn.done ? "rgba(0,203,164,0.08)" : T.surf2, border: `1px solid ${btn.done ? "rgba(0,203,164,0.25)" : T.border}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = btn.col)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = btn.done ? "rgba(0,203,164,0.25)" : T.border)}>
              <div style={{ fontSize: 12, fontWeight: 700, color: btn.done ? T.success : "#fff", marginBottom: 4 }}>
                {btn.loading ? "Running…" : btn.done ? "✓ Done!" : btn.label}
              </div>
              <div style={{ fontSize: 10, color: T.muted }}>{btn.sub}</div>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Build info */}
      <SectionCard title="Build Information" desc="Current deployment details" icon="📦">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            ["App Version",    "v3.14.2"],
            ["Node.js",        "v20.11.0"],
            ["Deployed",       "Mar 10, 2026 02:45 AM"],
            ["Commit",         "a7f3c9d"],
            ["Environment",    "Production"],
            ["Region",         "ap-south-1 (Mumbai)"],
          ].map(([k, v]) => (
            <div key={k} style={{ background: T.surf2, borderRadius: 8, padding: "10px 12px", border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 4 }}>{String(k).toUpperCase()}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, fontFamily: "monospace" }}>{v}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}

// ─── TAB DEFINITIONS ──────────────────────────────────────────────────────────
const TABS = [
  { id: "general",       label: "General",       icon: "⚙️",  comp: GeneralTab       },
  { id: "email",         label: "Email / SMTP",  icon: "📧",  comp: EmailTab         },
  { id: "whatsapp",      label: "WhatsApp",       icon: "💬",  comp: WhatsAppTab      },
  { id: "security",      label: "Security",       icon: "🔐",  comp: SecurityTab      },
  { id: "billing",       label: "Billing",        icon: "💳",  comp: BillingTab       },
  { id: "notifications", label: "Notifications",  icon: "🔔",  comp: NotificationsTab },
  { id: "health",        label: "System Health",  icon: "🩺",  comp: HealthTab        },
] as const;

type TabId = typeof TABS[number]["id"];

// ─── PAGE COMPONENT ───────────────────────────────────────────────────────────
export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const current = TABS.find(t => t.id === activeTab)!;
  const Comp    = current.comp;

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: T.bg, minHeight: "100vh", padding: "28px 32px", color: T.text }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #1E2035; border-radius: 4px; }
        ::placeholder { color: #3A3D5C; }
        button, input, select, textarea { font-family: inherit; }
        @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>System Settings</h1>
          <p style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>Configure platform behaviour, integrations, and security policies.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ background: T.surf2, color: T.muted, border: `1px solid ${T.border}`, padding: "9px 16px", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = T.accent2)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
            ↺ Reset Defaults
          </button>
          <button style={{ background: T.surf2, color: T.info, border: "1px solid rgba(116,185,255,0.25)", padding: "9px 16px", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 700 }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(116,185,255,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = T.surf2)}>
            ⬇ Export Config
          </button>
        </div>
      </div>

      {/* ── LAYOUT: vertical tab nav + content ── */}
      <div style={{ display: "grid", gridTemplateColumns: "210px 1fr", gap: 20, alignItems: "start" }}>

        {/* Sidebar tabs */}
        <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", position: "sticky", top: 20 }}>
          {TABS.map((tab, i) => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  width: "100%", background: active ? "rgba(108,92,231,0.10)" : "transparent",
                  border: "none", borderLeft: `3px solid ${active ? T.accent : "transparent"}`,
                  borderBottom: i < TABS.length - 1 ? `1px solid ${T.border}` : "none",
                  color: active ? T.accent2 : T.muted,
                  padding: "13px 16px", cursor: "pointer", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(108,92,231,0.04)"; e.currentTarget.style.color = T.text; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.muted; } }}
              >
                <span style={{ fontSize: 15 }}>{tab.icon}</span>
                <span style={{ fontSize: 12, fontWeight: active ? 700 : 500 }}>{tab.label}</span>
                {active && <span style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: T.accent, display: "inline-block" }} />}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div key={activeTab} style={{ animation: "fadeUp 0.18s ease" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <span style={{ fontSize: 11, color: T.muted }}>Settings</span>
            <span style={{ fontSize: 11, color: T.muted }}>›</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.accent2 }}>{current.icon} {current.label}</span>
          </div>
          <Comp />
        </div>
      </div>
    </div>
  );
}