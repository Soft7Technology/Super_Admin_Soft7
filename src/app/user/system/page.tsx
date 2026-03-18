"use client";

import { useState } from "react";
import "./system.css";

// ─── REUSABLE PRIMITIVES ──────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className={`ss-toggle ${on ? "ss-toggle--on" : ""}`} onClick={() => onChange(!on)}>
      <div className="ss-toggle__knob" />
    </div>
  );
}

function Inp({
  label, value, onChange, placeholder = "", type = "text", hint, prefix, suffix, disabled = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; hint?: string; prefix?: string; suffix?: string; disabled?: boolean;
}) {
  return (
    <div className="ss-field">
      <label className="ss-field__label">{label.toUpperCase()}</label>
      <div className={`ss-input-wrap ${disabled ? "ss-input-wrap--disabled" : ""}`}>
        {prefix && <span className="ss-input-prefix">{prefix}</span>}
        <input
          type={type} value={value} disabled={disabled}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="ss-input"
        />
        {suffix && <span className="ss-input-suffix">{suffix}</span>}
      </div>
      {hint && <span className="ss-field__hint">{hint}</span>}
    </div>
  );
}

function Select({ label, value, options, onChange, hint }: {
  label: string; value: string; options: { value: string; label: string }[];
  onChange: (v: string) => void; hint?: string;
}) {
  return (
    <div className="ss-field">
      <label className="ss-field__label">{label.toUpperCase()}</label>
      <select className="ss-select" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {hint && <span className="ss-field__hint">{hint}</span>}
    </div>
  );
}

function SectionCard({ title, desc, children, icon }: {
  title: string; desc?: string; children: React.ReactNode; icon?: string;
}) {
  return (
    <div className="ss-card">
      <div className="ss-card__header">
        {icon && <span className="ss-card__icon">{icon}</span>}
        <div>
          <div className="ss-card__title">{title}</div>
          {desc && <div className="ss-card__desc">{desc}</div>}
        </div>
      </div>
      <div className="ss-card__body">{children}</div>
    </div>
  );
}

function SettingRow({ label, desc, children }: {
  label: string; desc?: string; children: React.ReactNode;
}) {
  return (
    <div className="ss-row">
      <div className="ss-row__info">
        <div className="ss-row__label">{label}</div>
        {desc && <div className="ss-row__desc">{desc}</div>}
      </div>
      <div className="ss-row__control">{children}</div>
    </div>
  );
}

function SaveBtn({ onClick, saving, saved }: { onClick: () => void; saving: boolean; saved: boolean }) {
  return (
    <button onClick={onClick} className={`ss-btn-save ${saved ? "ss-btn-save--saved" : ""}`}>
      {saving
        ? <><span className="ss-btn-save__spinner" /> Saving…</>
        : saved ? <>✓ Saved!</>
        : <>💾 Save Changes</>
      }
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

function StatusDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="ss-status-dot">
      <span className={`ss-status-dot__circle ${ok ? "ss-status-dot__circle--ok" : "ss-status-dot__circle--err"}`} />
      <span className={ok ? "ss-status-dot__label--ok" : "ss-status-dot__label--err"}>{label}</span>
    </div>
  );
}

// ─── TAB: GENERAL ─────────────────────────────────────────────────────────────
function GeneralTab() {
  const [platform,     setPlatform]     = useState("WhatsApp SaaS Platform");
  const [tagline,      setTagline]      = useState("Automate. Engage. Convert.");
  const [supportEmail, setSupportEmail] = useState("support@platform.io");
  const [timezone,     setTimezone]     = useState("Asia/Kolkata");
  const [language,     setLanguage]     = useState("en");
  const [dateFormat,   setDateFormat]   = useState("DD/MM/YYYY");
  const [maintenance,  setMaintenance]  = useState(false);
  const [betaFeatures, setBetaFeatures] = useState(true);
  const [analytics,    setAnalytics]    = useState(true);
  const [debugMode,    setDebugMode]    = useState(false);
  const { saving, saved, trigger } = useSave();

  return (
    <>
      <SectionCard title="Platform Identity" desc="Core branding and identity settings" icon="🏢">
        <div className="ss-grid-2">
          <Inp label="Platform Name"    value={platform}     onChange={setPlatform}     placeholder="My SaaS Platform" />
          <Inp label="Tagline"          value={tagline}      onChange={setTagline}      placeholder="Your tagline here" />
          <Inp label="Support Email"    value={supportEmail} onChange={setSupportEmail} type="email" placeholder="support@example.com" />
          <Select label="Default Timezone" value={timezone} onChange={setTimezone} options={[
            { value: "Asia/Kolkata",     label: "Asia/Kolkata (IST +5:30)" },
            { value: "UTC",              label: "UTC (±0:00)" },
            { value: "America/New_York", label: "America/New_York (EST -5:00)" },
            { value: "Europe/London",    label: "Europe/London (GMT +0:00)" },
            { value: "Asia/Dubai",       label: "Asia/Dubai (GST +4:00)" },
          ]} />
          <Select label="Default Language" value={language} onChange={setLanguage} options={[
            { value: "en", label: "English" },
            { value: "hi", label: "Hindi" },
            { value: "es", label: "Spanish" },
            { value: "ar", label: "Arabic" },
            { value: "pt", label: "Portuguese" },
          ]} />
          <Select label="Date Format" value={dateFormat} onChange={setDateFormat} options={[
            { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
            { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
            { value: "YYYY-MM-DD", label: "YYYY-MM-DD (ISO)" },
          ]} />
        </div>
      </SectionCard>

      <SectionCard title="Feature Flags" desc="Toggle platform-wide feature availability" icon="🚀">
        <SettingRow label="Maintenance Mode"   desc="Shows a maintenance page to all non-admin users"><Toggle on={maintenance}  onChange={setMaintenance}  /></SettingRow>
        <SettingRow label="Beta Features"      desc="Enable experimental features for all users">      <Toggle on={betaFeatures} onChange={setBetaFeatures} /></SettingRow>
        <SettingRow label="Analytics Tracking" desc="Collect anonymised usage data for product improvements"><Toggle on={analytics}    onChange={setAnalytics}    /></SettingRow>
        <SettingRow label="Debug Mode"         desc="Show verbose error messages and stack traces (disable in production)"><Toggle on={debugMode}    onChange={setDebugMode}    /></SettingRow>
      </SectionCard>

      <div className="ss-save-row"><SaveBtn onClick={trigger} saving={saving} saved={saved} /></div>
    </>
  );
}

// ─── TAB: EMAIL / SMTP ────────────────────────────────────────────────────────
function EmailTab() {
  const [provider,   setProvider]   = useState("smtp");
  const [host,       setHost]       = useState("smtp.sendgrid.net");
  const [port,       setPort]       = useState("587");
  const [username,   setUsername]   = useState("apikey");
  const [password,   setPassword]   = useState("SG.xxxxxxxx");
  const [fromName,   setFromName]   = useState("Platform Alerts");
  const [fromEmail,  setFromEmail]  = useState("no-reply@platform.io");
  const [replyTo,    setReplyTo]    = useState("support@platform.io");
  const [encryption, setEncryption] = useState("TLS");
  const [testEmail,  setTestEmail]  = useState("");
  const [testStatus, setTestStatus] = useState<"idle"|"sending"|"ok"|"fail">("idle");
  const { saving, saved, trigger }  = useSave();

  const sendTest = () => {
    if (!testEmail.trim()) return;
    setTestStatus("sending");
    setTimeout(() => setTestStatus(Math.random() > 0.2 ? "ok" : "fail"), 1400);
  };

  return (
    <>
      <SectionCard title="SMTP Configuration" desc="Configure outgoing mail server settings" icon="📧">
        <div className="ss-grid-2">
          <Select label="Email Provider" value={provider} onChange={setProvider} options={[
            { value: "smtp",     label: "Custom SMTP" },
            { value: "sendgrid", label: "SendGrid" },
            { value: "mailgun",  label: "Mailgun" },
            { value: "ses",      label: "Amazon SES" },
            { value: "postmark", label: "Postmark" },
          ]} />
          <Select label="Encryption" value={encryption} onChange={setEncryption} options={[
            { value: "TLS",  label: "TLS (Recommended)" },
            { value: "SSL",  label: "SSL" },
            { value: "None", label: "None (Not recommended)" },
          ]} />
          <Inp label="SMTP Host" value={host}     onChange={setHost}     placeholder="smtp.sendgrid.net" />
          <Inp label="SMTP Port" value={port}     onChange={setPort}     placeholder="587" />
          <Inp label="Username"  value={username} onChange={setUsername} placeholder="apikey" />
          <Inp label="Password"  value={password} onChange={setPassword} type="password" placeholder="••••••••••••" />
        </div>
      </SectionCard>

      <SectionCard title="Sender Identity" desc="Configure how emails appear to recipients" icon="✉️">
        <div className="ss-grid-2">
          <Inp label="From Name"  value={fromName}  onChange={setFromName}  placeholder="My Platform" />
          <Inp label="From Email" value={fromEmail} onChange={setFromEmail} type="email" placeholder="no-reply@example.com" />
          <Inp label="Reply-To"   value={replyTo}   onChange={setReplyTo}   type="email" placeholder="support@example.com" hint="Optional — defaults to From Email" />
        </div>
      </SectionCard>

      <SectionCard title="Test Connection" desc="Send a test email to verify your SMTP settings" icon="🔌">
        <div className="ss-test-row">
          <div className="ss-test-row__input">
            <Inp label="Test Recipient Email" value={testEmail} onChange={setTestEmail} type="email" placeholder="you@example.com" />
          </div>
          <button onClick={sendTest} className={`ss-btn-test ss-btn-test--${testStatus === "sending" ? "idle" : testStatus}`}>
            {testStatus === "sending" ? "Sending…" : testStatus === "ok" ? "✓ Delivered!" : testStatus === "fail" ? "✕ Failed" : "Send Test"}
          </button>
        </div>
        {testStatus === "fail" && (
          <div className="ss-err-hint">Connection failed — check your host, port, and credentials.</div>
        )}
      </SectionCard>

      <div className="ss-save-row"><SaveBtn onClick={trigger} saving={saving} saved={saved} /></div>
    </>
  );
}

// ─── TAB: WHATSAPP ────────────────────────────────────────────────────────────
function WhatsAppTab() {
  const [apiVersion,   setApiVersion]   = useState("v20.0");
  const [baseUrl,      setBaseUrl]      = useState("https://graph.facebook.com");
  const [webhookUrl,   setWebhookUrl]   = useState("https://platform.io/webhook/whatsapp");
  const [verifyToken,  setVerifyToken]  = useState("wh_verify_abc123xyz");
  const [maxRetries,   setMaxRetries]   = useState("3");
  const [retryDelay,   setRetryDelay]   = useState("5");
  const [msgTimeout,   setMsgTimeout]   = useState("30");
  const [rateLimit,    setRateLimit]    = useState("1000");
  const [autoRetry,    setAutoRetry]    = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [typingInd,    setTypingInd]    = useState(true);
  const [mediaComp,    setMediaComp]    = useState(false);
  const [status,       setStatus]       = useState<"connected"|"checking"|"error">("connected");
  const { saving, saved, trigger } = useSave();

  const checkConnection = () => {
    setStatus("checking");
    setTimeout(() => setStatus(Math.random() > 0.2 ? "connected" : "error"), 1500);
  };

  const bannerClass = status === "connected" ? "ss-banner--ok" : status === "error" ? "ss-banner--err" : "ss-banner--info";
  const titleClass  = status === "connected" ? "ss-banner__title--ok" : status === "error" ? "ss-banner__title--err" : "ss-banner__title--info";

  return (
    <>
      <div className={`ss-banner ${bannerClass}`}>
        <div className="ss-banner__body">
          <span className="ss-banner__icon">{status === "connected" ? "✅" : status === "error" ? "❌" : "🔄"}</span>
          <div>
            <div className={`ss-banner__title ${titleClass}`}>
              {status === "connected" ? "WhatsApp API Connected" : status === "error" ? "Connection Error" : "Checking connection…"}
            </div>
            <div className="ss-banner__sub">
              {status === "connected" ? "Meta Graph API v20.0 · Latency: 124ms" : status === "error" ? "Unable to reach Meta Graph API — check credentials" : "Testing API connection…"}
            </div>
          </div>
        </div>
        <button className="ss-btn-retest" onClick={checkConnection}>↻ Re-test</button>
      </div>

      <SectionCard title="API Configuration" desc="Meta Graph API connection settings" icon="🔗">
        <div className="ss-grid-2">
          <Select label="API Version" value={apiVersion} onChange={setApiVersion} options={[
            { value: "v20.0", label: "v20.0 (Latest)" },
            { value: "v19.0", label: "v19.0" },
            { value: "v18.0", label: "v18.0" },
          ]} />
          <Inp label="Base URL"      value={baseUrl}     onChange={setBaseUrl}     placeholder="https://graph.facebook.com" />
          <Inp label="Webhook URL"   value={webhookUrl}  onChange={setWebhookUrl}  placeholder="https://yourapp.com/webhook" hint="This URL must be publicly accessible" />
          <Inp label="Verify Token"  value={verifyToken} onChange={setVerifyToken} type="password" hint="Set this in your Meta App Dashboard" />
        </div>
      </SectionCard>

      <SectionCard title="Rate Limiting & Retry" desc="Control message delivery behaviour" icon="⚡">
        <div className="ss-grid-3" style={{ marginBottom: 16 }}>
          <Inp label="Rate Limit"  value={rateLimit}  onChange={setRateLimit}  suffix="msg/min" hint="Per phone number" />
          <Inp label="Max Retries" value={maxRetries} onChange={setMaxRetries} suffix="times"   hint="On delivery failure" />
          <Inp label="Retry Delay" value={retryDelay} onChange={setRetryDelay} suffix="seconds" hint="Between attempts" />
          <Inp label="Msg Timeout" value={msgTimeout} onChange={setMsgTimeout} suffix="seconds" hint="Before marking failed" />
        </div>
        <SettingRow label="Auto-Retry Failed Messages" desc="Automatically retry messages that fail due to transient errors"><Toggle on={autoRetry}    onChange={setAutoRetry}    /></SettingRow>
        <SettingRow label="Read Receipts"              desc="Mark messages as read when viewed in the chat interface">      <Toggle on={readReceipts} onChange={setReadReceipts} /></SettingRow>
        <SettingRow label="Typing Indicators"          desc="Show typing indicator while composing a reply">               <Toggle on={typingInd}    onChange={setTypingInd}    /></SettingRow>
        <SettingRow label="Media Compression"          desc="Automatically compress images and videos before sending">     <Toggle on={mediaComp}    onChange={setMediaComp}    /></SettingRow>
      </SectionCard>

      <div className="ss-save-row"><SaveBtn onClick={trigger} saving={saving} saved={saved} /></div>
    </>
  );
}

// ─── TAB: SECURITY ────────────────────────────────────────────────────────────
function SecurityTab() {
  const [enforce2FA,       setEnforce2FA]       = useState(true);
  const [ssoEnabled,       setSsoEnabled]       = useState(false);
  const [ipWhitelist,      setIpWhitelist]      = useState(false);
  const [sessionTimeout,   setSessionTimeout]   = useState("60");
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");
  const [lockoutDuration,  setLockoutDuration]  = useState("30");
  const [passwordMinLen,   setPasswordMinLen]   = useState("10");
  const [jwtExpiry,        setJwtExpiry]        = useState("24");
  const [allowedIPs,       setAllowedIPs]       = useState("192.168.1.0/24\n10.0.0.0/8");
  const [logFailedLogins,  setLogFailedLogins]  = useState(true);
  const [auditRetention,   setAuditRetention]   = useState("365");
  const { saving, saved, trigger } = useSave();

  return (
    <>
      <SectionCard title="Authentication" desc="Control how users log in and access the platform" icon="🔐">
        <SettingRow label="Enforce 2FA for All Admins" desc="Require two-factor authentication for all admin and super-admin accounts"><Toggle on={enforce2FA}  onChange={setEnforce2FA}  /></SettingRow>
        <SettingRow label="Single Sign-On (SSO)"       desc="Allow users to log in with Google Workspace or Microsoft Entra ID">      <Toggle on={ssoEnabled}  onChange={setSsoEnabled}  /></SettingRow>
        <SettingRow label="IP Whitelist Enforcement"   desc="Restrict admin access to specific IP addresses only">                     <Toggle on={ipWhitelist} onChange={setIpWhitelist} /></SettingRow>
        {ipWhitelist && (
          <div style={{ marginTop: 12 }}>
            <label className="ss-textarea-label">ALLOWED IP RANGES (ONE PER LINE)</label>
            <textarea className="ss-textarea" value={allowedIPs} onChange={e => setAllowedIPs(e.target.value)} rows={4} />
            <span className="ss-textarea-hint">Supports CIDR notation (e.g. 192.168.1.0/24)</span>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Session & Token Policy" desc="Configure session duration and token expiry" icon="⏱">
        <div className="ss-grid-2">
          <Inp label="Session Timeout" value={sessionTimeout} onChange={setSessionTimeout} suffix="mins"  hint="Inactive sessions are logged out" />
          <Inp label="JWT Expiry"      value={jwtExpiry}      onChange={setJwtExpiry}      suffix="hours" hint="API token lifetime" />
        </div>
      </SectionCard>

      <SectionCard title="Login Security" desc="Brute-force protection and lockout policy" icon="🛡">
        <div className="ss-grid-2" style={{ marginBottom: 16 }}>
          <Inp label="Max Login Attempts"  value={maxLoginAttempts} onChange={setMaxLoginAttempts} suffix="tries" hint="Before account lockout" />
          <Inp label="Lockout Duration"    value={lockoutDuration}  onChange={setLockoutDuration}  suffix="mins"  hint="After exceeding attempts" />
          <Inp label="Min Password Length" value={passwordMinLen}   onChange={setPasswordMinLen}   suffix="chars" hint="Enforced at registration & reset" />
        </div>
        <SettingRow label="Log Failed Login Attempts" desc="Record all failed login attempts in the audit log">
          <Toggle on={logFailedLogins} onChange={setLogFailedLogins} />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Audit & Compliance" desc="Data retention and audit trail settings" icon="📋">
        <div className="ss-grid-2">
          <Inp label="Audit Log Retention" value={auditRetention} onChange={setAuditRetention} suffix="days" hint="Logs older than this are archived" />
        </div>
      </SectionCard>

      <div className="ss-save-row"><SaveBtn onClick={trigger} saving={saving} saved={saved} /></div>
    </>
  );
}

// ─── TAB: BILLING ─────────────────────────────────────────────────────────────
function BillingTab() {
  const [gateway,       setGateway]       = useState("razorpay");
  const [keyId,         setKeyId]         = useState("rzp_live_xxxxxxxxxxxxxxxx");
  const [keySecret,     setKeySecret]     = useState("••••••••••••••••••••••••");
  const [webhookSecret, setWebhookSecret] = useState("whs_xxxxxxxxxxxxxxxx");
  const [currency,      setCurrency]      = useState("INR");
  const [taxRate,       setTaxRate]       = useState("18");
  const [taxName,       setTaxName]       = useState("GST");
  const [trialDays,     setTrialDays]     = useState("14");
  const [gracePeriod,   setGracePeriod]   = useState("7");
  const [autoInvoice,   setAutoInvoice]   = useState(true);
  const [dunning,       setDunning]       = useState(true);
  const [prorations,    setProrations]    = useState(true);
  const [testMode,      setTestMode]      = useState(false);
  const { saving, saved, trigger } = useSave();

  return (
    <>
      {testMode && (
        <div className="ss-billing-warn">
          <span className="ss-billing-warn__icon">⚠️</span>
          <div>
            <div className="ss-billing-warn__title">Test Mode Active</div>
            <div className="ss-billing-warn__sub">No real transactions will be processed. Disable before going live.</div>
          </div>
        </div>
      )}

      <SectionCard title="Payment Gateway" desc="Configure your payment processor" icon="💳">
        <div className="ss-grid-2">
          <Select label="Gateway" value={gateway} onChange={setGateway} options={[
            { value: "razorpay", label: "Razorpay" },
            { value: "stripe",   label: "Stripe" },
            { value: "payu",     label: "PayU" },
            { value: "cashfree", label: "Cashfree" },
            { value: "ccavenue", label: "CCAvenue" },
          ]} />
          <Select label="Default Currency" value={currency} onChange={setCurrency} options={[
            { value: "INR", label: "₹ INR — Indian Rupee" },
            { value: "USD", label: "$ USD — US Dollar" },
            { value: "EUR", label: "€ EUR — Euro" },
            { value: "GBP", label: "£ GBP — British Pound" },
            { value: "AED", label: "د.إ AED — UAE Dirham" },
          ]} />
          <Inp label="API Key ID"     value={keyId}         onChange={setKeyId}         type="password" hint={`Your ${gateway === "razorpay" ? "Razorpay" : "Stripe"} publishable key`} />
          <Inp label="API Key Secret" value={keySecret}     onChange={setKeySecret}     type="password" hint="Never share this publicly" />
          <Inp label="Webhook Secret" value={webhookSecret} onChange={setWebhookSecret} type="password" hint="Used to verify webhook payloads" />
        </div>
        <div style={{ marginTop: 14 }}>
          <SettingRow label="Test / Sandbox Mode" desc="Use test credentials — no real money is charged">
            <Toggle on={testMode} onChange={setTestMode} />
          </SettingRow>
        </div>
      </SectionCard>

      <SectionCard title="Tax & Invoicing" desc="Configure tax rates and invoice settings" icon="🧾">
        <div className="ss-grid-2" style={{ marginBottom: 16 }}>
          <Inp label="Tax Name" value={taxName} onChange={setTaxName} placeholder="GST / VAT / Sales Tax" />
          <Inp label="Tax Rate" value={taxRate} onChange={setTaxRate} suffix="%" hint="Applied to all subscription invoices" />
        </div>
        <SettingRow label="Auto-Generate Invoices"    desc="Automatically generate and email invoices on each billing cycle"><Toggle on={autoInvoice} onChange={setAutoInvoice} /></SettingRow>
        <SettingRow label="Smart Dunning"             desc="Automatically retry failed payments with escalating reminders">  <Toggle on={dunning}     onChange={setDunning}     /></SettingRow>
        <SettingRow label="Proration on Plan Changes" desc="Charge or credit the difference when customers upgrade or downgrade mid-cycle"><Toggle on={prorations} onChange={setProrations} /></SettingRow>
      </SectionCard>

      <SectionCard title="Trial & Grace Period" desc="Configure free trial and overdue grace windows" icon="⏳">
        <div className="ss-grid-2">
          <Inp label="Free Trial Duration"  value={trialDays}   onChange={setTrialDays}   suffix="days" hint="Applied to all new company signups" />
          <Inp label="Payment Grace Period" value={gracePeriod} onChange={setGracePeriod} suffix="days" hint="Before account is suspended on overdue payment" />
        </div>
      </SectionCard>

      <div className="ss-save-row"><SaveBtn onClick={trigger} saving={saving} saved={saved} /></div>
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
    newCompany: true, suspendCompany: true, newTicket: true, criticalLog: true,
    paymentFail: true, planUpgrade: false, userSignup: false, exportRequest: false,
  });
  const { saving, saved, trigger } = useSave();
  const toggle = (key: keyof typeof events) => setEvents(prev => ({ ...prev, [key]: !prev[key] }));

  const EVENT_LABELS = [
    { key: "newCompany"     as const, label: "New Company Signup",   desc: "When a new company registers",               icon: "🏢" },
    { key: "suspendCompany" as const, label: "Company Suspended",    desc: "When a company is suspended",                icon: "⛔" },
    { key: "newTicket"      as const, label: "New Support Ticket",   desc: "When a customer opens a ticket",             icon: "🎫" },
    { key: "criticalLog"    as const, label: "Critical Audit Event", desc: "When a CRITICAL severity event is logged",   icon: "🔴" },
    { key: "paymentFail"    as const, label: "Payment Failure",      desc: "When a subscription payment fails",          icon: "💳" },
    { key: "planUpgrade"    as const, label: "Plan Upgrade",         desc: "When a company upgrades their plan",         icon: "⬆️" },
    { key: "userSignup"     as const, label: "New User Signup",      desc: "When any user registers",                    icon: "👤" },
    { key: "exportRequest"  as const, label: "Data Export Request",  desc: "When a user requests a data export",         icon: "📤" },
  ];

  return (
    <>
      <SectionCard title="Alert Channels" desc="Configure where system alerts are delivered" icon="🔔">
        <SettingRow label="Email Alerts"        desc="Send system alerts to the support email address">      <Toggle on={emailAlerts}    onChange={setEmailAlerts}    /></SettingRow>
        <SettingRow label="Slack Notifications" desc="Post alerts to a Slack channel via webhook">          <Toggle on={slackAlerts}    onChange={setSlackAlerts}    /></SettingRow>
        {slackAlerts && <div style={{ marginTop: 12 }}><Inp label="Slack Webhook URL" value={slackWebhook} onChange={setSlackWebhook} placeholder="https://hooks.slack.com/services/…" hint="Create a webhook in your Slack App settings" /></div>}
        <SettingRow label="Custom Webhook"      desc="POST event payloads to your own endpoint">            <Toggle on={webhookEnabled} onChange={setWebhookEnabled} /></SettingRow>
        {webhookEnabled && <div style={{ marginTop: 12 }}><Inp label="Webhook Endpoint URL" value={webhookUrl} onChange={setWebhookUrl} placeholder="https://yourapp.com/webhooks/system" hint="Must return 200 OK to acknowledge receipt" /></div>}
      </SectionCard>

      <SectionCard title="Event Subscriptions" desc="Choose which events trigger notifications" icon="📡">
        {EVENT_LABELS.map(({ key, label, desc, icon }) => (
          <SettingRow key={key} label={`${icon} ${label}`} desc={desc}>
            <Toggle on={events[key]} onChange={() => toggle(key)} />
          </SettingRow>
        ))}
      </SectionCard>

      <div className="ss-save-row"><SaveBtn onClick={trigger} saving={saving} saved={saved} /></div>
    </>
  );
}

// ─── TAB: SYSTEM HEALTH ───────────────────────────────────────────────────────
function HealthTab() {
  const [clearing, setClearing] = useState(false);
  const [cleared,  setCleared]  = useState(false);
  const clearCache = () => { setClearing(true); setTimeout(() => { setClearing(false); setCleared(true); setTimeout(() => setCleared(false), 3000); }, 1200); };

  const services = [
    { name: "API Server",         status: true,  latency: "18ms",  uptime: "99.98%", region: "Mumbai" },
    { name: "Database (Postgres)", status: true, latency: "4ms",   uptime: "99.99%", region: "Mumbai" },
    { name: "Redis Cache",         status: true, latency: "1ms",   uptime: "100%",   region: "Mumbai" },
    { name: "WhatsApp Gateway",    status: true, latency: "124ms", uptime: "99.95%", region: "Global" },
    { name: "Email Service",       status: true, latency: "210ms", uptime: "99.97%", region: "Global" },
    { name: "File Storage (S3)",   status: true, latency: "42ms",  uptime: "99.99%", region: "Mumbai" },
    { name: "Background Jobs",     status: true, latency: "—",     uptime: "99.92%", region: "Mumbai" },
    { name: "CDN",                 status: false, latency: "—",    uptime: "98.10%", region: "Global" },
  ];

  const metrics = [
    { label: "CPU Usage",         value: "24%",      bar: 0.24, color: "#00CBA4" },
    { label: "Memory",            value: "61%",      bar: 0.61, color: "#FDCB6E" },
    { label: "Disk I/O",          value: "8%",       bar: 0.08, color: "#00CBA4" },
    { label: "Network Throughput",value: "2.4 GB/s", bar: 0.48, color: "#74B9FF" },
  ];

  const actions = [
    { label: "Clear App Cache",    sub: "Flush Redis + in-memory cache",     action: clearCache, loading: clearing, done: cleared,  col: "#74B9FF" },
    { label: "Rebuild Indexes",    sub: "Rebuild DB search indexes",          action: ()=>{},     loading: false,    done: false,    col: "#FDCB6E" },
    { label: "Vacuum Database",    sub: "Reclaim dead tuples and space",      action: ()=>{},     loading: false,    done: false,    col: "#A29BFE" },
    { label: "Flush Job Queue",    sub: "Clear all pending background jobs",  action: ()=>{},     loading: false,    done: false,    col: "#FDCB6E" },
    { label: "Rotate Log Files",   sub: "Archive and compress old log files", action: ()=>{},     loading: false,    done: false,    col: "#565875" },
    { label: "Check DB Integrity", sub: "Run PostgreSQL consistency checks",  action: ()=>{},     loading: false,    done: false,    col: "#00CBA4" },
  ];

  return (
    <>
      <SectionCard title="System Resources" desc="Real-time server resource utilisation" icon="📊">
        <div className="ss-metrics-grid">
          {metrics.map(m => (
            <div key={m.label}>
              <div className="ss-metric__row">
                <span className="ss-metric__label">{m.label}</span>
                <span className="ss-metric__value">{m.value}</span>
              </div>
              <div className="ss-metric__track">
                <div className="ss-metric__fill" style={{ width: `${m.bar * 100}%`, background: `linear-gradient(90deg,${m.color},${m.color}99)` }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Service Status" desc="Health of all connected platform services" icon="🩺">
        <div className="ss-services">
          <div className="ss-services__head">
            {["Service","Status","Latency","Uptime","Region"].map(h => (
              <span key={h} className="ss-services__head-cell">{h.toUpperCase()}</span>
            ))}
          </div>
          {services.map(s => (
            <div key={s.name} className="ss-services__row">
              <span className="ss-services__name">{s.name}</span>
              <StatusDot ok={s.status} label={s.status ? "Online" : "Down"} />
              <span className="ss-services__latency" style={{ color: s.status ? "var(--ss-text)" : "var(--ss-danger)" }}>{s.latency}</span>
              <span className="ss-services__uptime"  style={{ color: parseFloat(s.uptime) >= 99.9 ? "var(--ss-success)" : "var(--ss-warn)" }}>{s.uptime}</span>
              <span className="ss-services__region">{s.region}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Maintenance Actions" desc="System cache and data management tools" icon="🔧">
        <div className="ss-actions-grid">
          {actions.map(btn => (
            <button key={btn.label} onClick={btn.action}
              className={`ss-action-btn ${btn.done ? "ss-action-btn--done" : ""}`}
              onMouseEnter={e => (e.currentTarget.style.borderColor = btn.col)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = btn.done ? "var(--ss-action-done-br)" : "var(--ss-border)")}>
              <div className={`ss-action-btn__title ${btn.done ? "ss-action-btn__title--done" : ""}`}>
                {btn.loading ? "Running…" : btn.done ? "✓ Done!" : btn.label}
              </div>
              <div className="ss-action-btn__sub">{btn.sub}</div>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Build Information" desc="Current deployment details" icon="📦">
        <div className="ss-build-grid">
          {[
            ["App Version",  "v3.14.2"],
            ["Node.js",      "v20.11.0"],
            ["Deployed",     "Mar 10, 2026 02:45 AM"],
            ["Commit",       "a7f3c9d"],
            ["Environment",  "Production"],
            ["Region",       "ap-south-1 (Mumbai)"],
          ].map(([k, v]) => (
            <div key={k} className="ss-build-cell">
              <div className="ss-build-cell__key">{String(k).toUpperCase()}</div>
              <div className="ss-build-cell__val">{v}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}

// ─── TAB DEFINITIONS ──────────────────────────────────────────────────────────
const TABS = [
  { id: "general",       label: "General",      icon: "⚙️",  comp: GeneralTab       },
  { id: "email",         label: "Email / SMTP", icon: "📧",  comp: EmailTab         },
  { id: "whatsapp",      label: "WhatsApp",      icon: "💬",  comp: WhatsAppTab      },
  { id: "security",      label: "Security",      icon: "🔐",  comp: SecurityTab      },
  { id: "billing",       label: "Billing",       icon: "💳",  comp: BillingTab       },
  { id: "notifications", label: "Notifications", icon: "🔔",  comp: NotificationsTab },
  { id: "health",        label: "System Health", icon: "🩺",  comp: HealthTab        },
] as const;

type TabId = typeof TABS[number]["id"];

// ─── PAGE COMPONENT ───────────────────────────────────────────────────────────
export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const current = TABS.find(t => t.id === activeTab)!;
  const Comp    = current.comp;

  return (
    <div className="ss-root">

      {/* ── HEADER ── */}
      <div className="ss-header">
        <div>
          <h1 className="ss-header__title">System Settings</h1>
          <p className="ss-header__sub">Configure platform behaviour, integrations, and security policies.</p>
        </div>
        <div className="ss-header__actions">
          <button className="ss-btn-reset">↺ Reset Defaults</button>
          <button className="ss-btn-export">⬇ Export Config</button>
        </div>
      </div>

      {/* ── LAYOUT ── */}
      <div className="ss-layout">

        {/* Sidebar */}
        <div className="ss-sidebar">
          {TABS.map((tab, i) => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`ss-sidebar__btn ${active ? "ss-sidebar__btn--active" : ""}`}>
                <span className="ss-sidebar__icon">{tab.icon}</span>
                <span>{tab.label}</span>
                {active && <span className="ss-sidebar__dot" />}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div key={activeTab} className="ss-content">
          <div className="ss-breadcrumb">
            <span className="ss-breadcrumb__root">Settings</span>
            <span className="ss-breadcrumb__sep">›</span>
            <span className="ss-breadcrumb__active">{current.icon} {current.label}</span>
          </div>
          <Comp />
        </div>
      </div>
    </div>
  );
}