"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowUpCircle,
  Ban,
  BarChart3,
  Bell,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Download,
  FileUp,
  Gauge,
  Hourglass,
  KeyRound,
  Link2,
  Loader2,
  Mail,
  MessageCircle,
  Package,
  Plug,
  Radio,
  Receipt,
  RefreshCw,
  RotateCcw,
  Rocket,
  Save,
  Settings,
  Shield,
  ShieldCheck,
  Stethoscope,
  Ticket,
  Timer,
  UserPlus,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import KitSelect from "@/components/ui/Select";
import Switch from "@/components/ui/Switch";
import Table from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import Textarea from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

// ─── REUSABLE PRIMITIVES ──────────────────────────────────────────────────────

/** Lets a <Toggle> inside a <SettingRow> pick up the row label for a11y. */
const RowLabelContext = createContext<string | undefined>(undefined);

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  const label = useContext(RowLabelContext);
  return <Switch checked={on} onCheckedChange={onChange} aria-label={label} />;
}

function Inp({
  label, value, onChange, placeholder = "", type = "text", hint, prefix, suffix, disabled = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; hint?: string; prefix?: string; suffix?: string; disabled?: boolean;
}) {
  return (
    <Input
      label={label}
      type={type}
      value={value}
      disabled={disabled}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      helperText={hint}
      leftIcon={prefix ? <span className="text-xs">{prefix}</span> : undefined}
      rightIcon={suffix ? <span className="whitespace-nowrap text-xs">{suffix}</span> : undefined}
      className={suffix ? "pr-[4.75rem]" : undefined}
    />
  );
}

function Select({ label, value, options, onChange, hint }: {
  label: string; value: string; options: { value: string; label: string }[];
  onChange: (v: string) => void; hint?: string;
}) {
  return (
    <KitSelect
      label={label}
      value={value}
      onChange={e => onChange(e.target.value)}
      options={options}
      helperText={hint}
    />
  );
}

function SectionCard({ title, desc, children, icon }: {
  title: string; desc?: string; children: ReactNode; icon?: LucideIcon;
}) {
  return (
    <Card>
      <CardHeader icon={icon} title={title} description={desc} divided />
      {children}
    </Card>
  );
}

function SettingRow({ label, desc, icon: Icon, children }: {
  label: string; desc?: string; icon?: LucideIcon; children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border-subtle py-3 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-lighter text-primary-text">
            <Icon size={14} />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {desc && <p className="mt-0.5 text-[0.8125rem] text-muted-foreground">{desc}</p>}
        </div>
      </div>
      <RowLabelContext.Provider value={label}>
        <div className="shrink-0">{children}</div>
      </RowLabelContext.Provider>
    </div>
  );
}

function SaveBtn({ onClick, saving, saved }: { onClick: () => void; saving: boolean; saved: boolean }) {
  return (
    <div className="flex justify-end">
      <Button onClick={onClick} isLoading={saving} leftIcon={saved ? <Check size={15} /> : <Save size={15} />}>
        {saved ? "Saved!" : "Save Changes"}
      </Button>
    </div>
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
    <span className={cn("inline-flex items-center gap-1.5 text-[0.8125rem] font-medium", ok ? "text-success" : "text-error")}>
      <span className={cn("h-2 w-2 rounded-full", ok ? "bg-success" : "bg-error")} aria-hidden />
      {label}
    </span>
  );
}

const GRID_2 = "grid grid-cols-1 gap-4 sm:grid-cols-2";

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
      <SectionCard title="Platform Identity" desc="Core branding and identity settings" icon={Building2}>
        <div className={GRID_2}>
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

      <SectionCard title="Feature Flags" desc="Toggle platform-wide feature availability" icon={Rocket}>
        <SettingRow label="Maintenance Mode"   desc="Shows a maintenance page to all non-admin users"><Toggle on={maintenance}  onChange={setMaintenance}  /></SettingRow>
        <SettingRow label="Beta Features"      desc="Enable experimental features for all users"><Toggle on={betaFeatures} onChange={setBetaFeatures} /></SettingRow>
        <SettingRow label="Analytics Tracking" desc="Collect anonymised usage data for product improvements"><Toggle on={analytics}    onChange={setAnalytics}    /></SettingRow>
        <SettingRow label="Debug Mode"         desc="Show verbose error messages and stack traces (disable in production)"><Toggle on={debugMode}    onChange={setDebugMode}    /></SettingRow>
      </SectionCard>

      <SaveBtn onClick={trigger} saving={saving} saved={saved} />
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
      <SectionCard title="SMTP Configuration" desc="Configure outgoing mail server settings" icon={Mail}>
        <div className={GRID_2}>
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

      <SectionCard title="Sender Identity" desc="Configure how emails appear to recipients" icon={Mail}>
        <div className={GRID_2}>
          <Inp label="From Name"  value={fromName}  onChange={setFromName}  placeholder="My Platform" />
          <Inp label="From Email" value={fromEmail} onChange={setFromEmail} type="email" placeholder="no-reply@example.com" />
          <Inp label="Reply-To"   value={replyTo}   onChange={setReplyTo}   type="email" placeholder="support@example.com" hint="Optional — defaults to From Email" />
        </div>
      </SectionCard>

      <SectionCard title="Test Connection" desc="Send a test email to verify your SMTP settings" icon={Plug}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Inp label="Test Recipient Email" value={testEmail} onChange={setTestEmail} type="email" placeholder="you@example.com" />
          </div>
          <Button
            variant={testStatus === "fail" ? "danger" : "secondary"}
            onClick={sendTest}
            isLoading={testStatus === "sending"}
            leftIcon={testStatus === "ok" ? <CheckCircle2 size={15} /> : testStatus === "fail" ? <XCircle size={15} /> : undefined}
          >
            {testStatus === "sending" ? "Sending…" : testStatus === "ok" ? "Delivered!" : testStatus === "fail" ? "Failed" : "Send Test"}
          </Button>
        </div>
        {testStatus === "fail" && (
          <p className="mt-2 text-[0.8125rem] text-error" role="alert">
            Connection failed — check your host, port, and credentials.
          </p>
        )}
      </SectionCard>

      <SaveBtn onClick={trigger} saving={saving} saved={saved} />
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

  return (
    <>
      <Card
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
          status === "connected" && "border-success-border bg-success-bg",
          status === "error" && "border-error-border bg-error-bg",
          status === "checking" && "border-info-border bg-info-bg",
        )}
      >
        <div className="flex items-center gap-3">
          {status === "connected" ? (
            <CheckCircle2 size={20} className="shrink-0 text-success" />
          ) : status === "error" ? (
            <XCircle size={20} className="shrink-0 text-error" />
          ) : (
            <Loader2 size={20} className="shrink-0 animate-spin text-info" />
          )}
          <div>
            <p
              className={cn(
                "text-sm font-semibold",
                status === "connected" ? "text-success" : status === "error" ? "text-error" : "text-info",
              )}
            >
              {status === "connected" ? "WhatsApp API Connected" : status === "error" ? "Connection Error" : "Checking connection…"}
            </p>
            <p className="text-[0.8125rem] text-secondary-foreground">
              {status === "connected" ? "Meta Graph API v20.0 · Latency: 124ms" : status === "error" ? "Unable to reach Meta Graph API — check credentials" : "Testing API connection…"}
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={14} />} onClick={checkConnection}>
          Re-test
        </Button>
      </Card>

      <SectionCard title="API Configuration" desc="Meta Graph API connection settings" icon={Link2}>
        <div className={GRID_2}>
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

      <SectionCard title="Rate Limiting & Retry" desc="Control message delivery behaviour" icon={Zap}>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Inp label="Rate Limit"  value={rateLimit}  onChange={setRateLimit}  suffix="msg/min" hint="Per phone number" />
          <Inp label="Max Retries" value={maxRetries} onChange={setMaxRetries} suffix="times"   hint="On delivery failure" />
          <Inp label="Retry Delay" value={retryDelay} onChange={setRetryDelay} suffix="seconds" hint="Between attempts" />
          <Inp label="Msg Timeout" value={msgTimeout} onChange={setMsgTimeout} suffix="seconds" hint="Before marking failed" />
        </div>
        <SettingRow label="Auto-Retry Failed Messages" desc="Automatically retry messages that fail due to transient errors"><Toggle on={autoRetry}    onChange={setAutoRetry}    /></SettingRow>
        <SettingRow label="Read Receipts"              desc="Mark messages as read when viewed in the chat interface"><Toggle on={readReceipts} onChange={setReadReceipts} /></SettingRow>
        <SettingRow label="Typing Indicators"          desc="Show typing indicator while composing a reply"><Toggle on={typingInd}    onChange={setTypingInd}    /></SettingRow>
        <SettingRow label="Media Compression"          desc="Automatically compress images and videos before sending"><Toggle on={mediaComp}    onChange={setMediaComp}    /></SettingRow>
      </SectionCard>

      <SaveBtn onClick={trigger} saving={saving} saved={saved} />
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
      <SectionCard title="Authentication" desc="Control how users log in and access the platform" icon={KeyRound}>
        <SettingRow label="Enforce 2FA for All Admins" desc="Require two-factor authentication for all admin and super-admin accounts"><Toggle on={enforce2FA}  onChange={setEnforce2FA}  /></SettingRow>
        <SettingRow label="Single Sign-On (SSO)"       desc="Allow users to log in with Google Workspace or Microsoft Entra ID"><Toggle on={ssoEnabled}  onChange={setSsoEnabled}  /></SettingRow>
        <SettingRow label="IP Whitelist Enforcement"   desc="Restrict admin access to specific IP addresses only"><Toggle on={ipWhitelist} onChange={setIpWhitelist} /></SettingRow>
        {ipWhitelist && (
          <Textarea
            wrapperClassName="mt-3"
            label="Allowed IP ranges (one per line)"
            value={allowedIPs}
            onChange={e => setAllowedIPs(e.target.value)}
            rows={4}
            className="font-mono"
            helperText="Supports CIDR notation (e.g. 192.168.1.0/24)"
          />
        )}
      </SectionCard>

      <SectionCard title="Session & Token Policy" desc="Configure session duration and token expiry" icon={Timer}>
        <div className={GRID_2}>
          <Inp label="Session Timeout" value={sessionTimeout} onChange={setSessionTimeout} suffix="mins"  hint="Inactive sessions are logged out" />
          <Inp label="JWT Expiry"      value={jwtExpiry}      onChange={setJwtExpiry}      suffix="hours" hint="API token lifetime" />
        </div>
      </SectionCard>

      <SectionCard title="Login Security" desc="Brute-force protection and lockout policy" icon={Shield}>
        <div className={cn(GRID_2, "mb-4")}>
          <Inp label="Max Login Attempts"  value={maxLoginAttempts} onChange={setMaxLoginAttempts} suffix="tries" hint="Before account lockout" />
          <Inp label="Lockout Duration"    value={lockoutDuration}  onChange={setLockoutDuration}  suffix="mins"  hint="After exceeding attempts" />
          <Inp label="Min Password Length" value={passwordMinLen}   onChange={setPasswordMinLen}   suffix="chars" hint="Enforced at registration & reset" />
        </div>
        <SettingRow label="Log Failed Login Attempts" desc="Record all failed login attempts in the audit log">
          <Toggle on={logFailedLogins} onChange={setLogFailedLogins} />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Audit & Compliance" desc="Data retention and audit trail settings" icon={ClipboardList}>
        <div className={GRID_2}>
          <Inp label="Audit Log Retention" value={auditRetention} onChange={setAuditRetention} suffix="days" hint="Logs older than this are archived" />
        </div>
      </SectionCard>

      <SaveBtn onClick={trigger} saving={saving} saved={saved} />
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
        <Alert
          variant="warning"
          title="Test Mode Active"
          message="No real transactions will be processed. Disable before going live."
        />
      )}

      <SectionCard title="Payment Gateway" desc="Configure your payment processor" icon={CreditCard}>
        <div className={GRID_2}>
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
        <div className="mt-4 border-t border-border-subtle pt-4">
          <SettingRow label="Test / Sandbox Mode" desc="Use test credentials — no real money is charged">
            <Toggle on={testMode} onChange={setTestMode} />
          </SettingRow>
        </div>
      </SectionCard>

      <SectionCard title="Tax & Invoicing" desc="Configure tax rates and invoice settings" icon={Receipt}>
        <div className={cn(GRID_2, "mb-4")}>
          <Inp label="Tax Name" value={taxName} onChange={setTaxName} placeholder="GST / VAT / Sales Tax" />
          <Inp label="Tax Rate" value={taxRate} onChange={setTaxRate} suffix="%" hint="Applied to all subscription invoices" />
        </div>
        <SettingRow label="Auto-Generate Invoices"    desc="Automatically generate and email invoices on each billing cycle"><Toggle on={autoInvoice} onChange={setAutoInvoice} /></SettingRow>
        <SettingRow label="Smart Dunning"             desc="Automatically retry failed payments with escalating reminders"><Toggle on={dunning}     onChange={setDunning}     /></SettingRow>
        <SettingRow label="Proration on Plan Changes" desc="Charge or credit the difference when customers upgrade or downgrade mid-cycle"><Toggle on={prorations} onChange={setProrations} /></SettingRow>
      </SectionCard>

      <SectionCard title="Trial & Grace Period" desc="Configure free trial and overdue grace windows" icon={Hourglass}>
        <div className={GRID_2}>
          <Inp label="Free Trial Duration"  value={trialDays}   onChange={setTrialDays}   suffix="days" hint="Applied to all new company signups" />
          <Inp label="Payment Grace Period" value={gracePeriod} onChange={setGracePeriod} suffix="days" hint="Before account is suspended on overdue payment" />
        </div>
      </SectionCard>

      <SaveBtn onClick={trigger} saving={saving} saved={saved} />
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
    { key: "newCompany"     as const, label: "New Company Signup",   desc: "When a new company registers",               icon: Building2 },
    { key: "suspendCompany" as const, label: "Company Suspended",    desc: "When a company is suspended",                icon: Ban },
    { key: "newTicket"      as const, label: "New Support Ticket",   desc: "When a customer opens a ticket",             icon: Ticket },
    { key: "criticalLog"    as const, label: "Critical Audit Event", desc: "When a CRITICAL severity event is logged",   icon: AlertTriangle },
    { key: "paymentFail"    as const, label: "Payment Failure",      desc: "When a subscription payment fails",          icon: CreditCard },
    { key: "planUpgrade"    as const, label: "Plan Upgrade",         desc: "When a company upgrades their plan",         icon: ArrowUpCircle },
    { key: "userSignup"     as const, label: "New User Signup",      desc: "When any user registers",                    icon: UserPlus },
    { key: "exportRequest"  as const, label: "Data Export Request",  desc: "When a user requests a data export",         icon: FileUp },
  ];

  return (
    <>
      <SectionCard title="Alert Channels" desc="Configure where system alerts are delivered" icon={Bell}>
        <SettingRow label="Email Alerts"        desc="Send system alerts to the support email address"><Toggle on={emailAlerts}    onChange={setEmailAlerts}    /></SettingRow>
        <SettingRow label="Slack Notifications" desc="Post alerts to a Slack channel via webhook"><Toggle on={slackAlerts}    onChange={setSlackAlerts}    /></SettingRow>
        {slackAlerts && <div className="pb-3"><Inp label="Slack Webhook URL" value={slackWebhook} onChange={setSlackWebhook} placeholder="https://hooks.slack.com/services/…" hint="Create a webhook in your Slack App settings" /></div>}
        <SettingRow label="Custom Webhook"      desc="POST event payloads to your own endpoint"><Toggle on={webhookEnabled} onChange={setWebhookEnabled} /></SettingRow>
        {webhookEnabled && <div className="pt-3"><Inp label="Webhook Endpoint URL" value={webhookUrl} onChange={setWebhookUrl} placeholder="https://yourapp.com/webhooks/system" hint="Must return 200 OK to acknowledge receipt" /></div>}
      </SectionCard>

      <SectionCard title="Event Subscriptions" desc="Choose which events trigger notifications" icon={Radio}>
        {EVENT_LABELS.map(({ key, label, desc, icon }) => (
          <SettingRow key={key} label={label} desc={desc} icon={icon}>
            <Toggle on={events[key]} onChange={() => toggle(key)} />
          </SettingRow>
        ))}
      </SectionCard>

      <SaveBtn onClick={trigger} saving={saving} saved={saved} />
    </>
  );
}

// ─── TAB: SYSTEM HEALTH ───────────────────────────────────────────────────────
interface ServiceRow { name: string; status: boolean; latency: string; uptime: string; region: string }

function HealthTab() {
  const [clearing, setClearing] = useState(false);
  const [cleared,  setCleared]  = useState(false);
  const clearCache = () => { setClearing(true); setTimeout(() => { setClearing(false); setCleared(true); setTimeout(() => setCleared(false), 3000); }, 1200); };

  const services: ServiceRow[] = [
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
    { label: "CPU Usage",         value: "24%",      bar: 0.24, color: "bg-primary" },
    { label: "Memory",            value: "61%",      bar: 0.61, color: "bg-warning" },
    { label: "Disk I/O",          value: "8%",       bar: 0.08, color: "bg-primary" },
    { label: "Network Throughput",value: "2.4 GB/s", bar: 0.48, color: "bg-primary" },
  ];

  const actions = [
    { label: "Clear App Cache",    sub: "Flush Redis + in-memory cache",     action: clearCache, loading: clearing, done: cleared },
    { label: "Rebuild Indexes",    sub: "Rebuild DB search indexes",          action: ()=>{},     loading: false,    done: false },
    { label: "Vacuum Database",    sub: "Reclaim dead tuples and space",      action: ()=>{},     loading: false,    done: false },
    { label: "Flush Job Queue",    sub: "Clear all pending background jobs",  action: ()=>{},     loading: false,    done: false },
    { label: "Rotate Log Files",   sub: "Archive and compress old log files", action: ()=>{},     loading: false,    done: false },
    { label: "Check DB Integrity", sub: "Run PostgreSQL consistency checks",  action: ()=>{},     loading: false,    done: false },
  ];

  const serviceColumns: Column<ServiceRow>[] = [
    { key: "name", header: "Service", render: s => <span className="font-medium text-foreground">{s.name}</span> },
    { key: "status", header: "Status", render: s => <StatusDot ok={s.status} label={s.status ? "Online" : "Down"} /> },
    { key: "latency", header: "Latency", render: s => <span className={cn("tabular-nums", s.status ? "text-foreground" : "text-error")}>{s.latency}</span> },
    { key: "uptime", header: "Uptime", render: s => <span className={cn("tabular-nums", parseFloat(s.uptime) >= 99.9 ? "text-success" : "text-warning")}>{s.uptime}</span> },
    { key: "region", header: "Region", render: s => <span className="text-muted-foreground">{s.region}</span> },
  ];

  return (
    <>
      <SectionCard title="System Resources" desc="Real-time server resource utilisation" icon={Gauge}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {metrics.map(m => (
            <div key={m.label}>
              <div className="mb-1.5 flex justify-between text-[0.8125rem]">
                <span className="text-secondary-foreground">{m.label}</span>
                <span className="font-semibold tabular-nums text-foreground">{m.value}</span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-surface-muted"
                role="progressbar"
                aria-label={m.label}
                aria-valuenow={Math.round(m.bar * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className={cn("h-full rounded-full", m.color)} style={{ width: `${m.bar * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <Card padding="none" className="overflow-hidden">
        <div className="px-5 pt-5">
          <CardHeader icon={Stethoscope} title="Service Status" description="Health of all connected platform services" />
        </div>
        <Table className="rounded-none border-x-0 border-b-0" columns={serviceColumns} data={services} rowKey={s => s.name} />
      </Card>

      <SectionCard title="Maintenance Actions" desc="System cache and data management tools" icon={Wrench}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {actions.map(btn => (
            <button
              key={btn.label}
              type="button"
              onClick={btn.action}
              className={cn(
                "rounded-lg border px-4 py-3 text-left transition-colors",
                btn.done
                  ? "border-success-border bg-success-bg"
                  : "border-border bg-surface hover:border-primary-soft hover:bg-surface-hover",
              )}
            >
              <p className={cn("flex items-center gap-1.5 text-sm font-semibold", btn.done ? "text-success" : "text-foreground")}>
                {btn.loading && <Loader2 size={14} className="animate-spin" />}
                {btn.done && <Check size={14} />}
                {btn.loading ? "Running…" : btn.done ? "Done!" : btn.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{btn.sub}</p>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Build Information" desc="Current deployment details" icon={Package}>
        <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border-subtle bg-border-subtle sm:grid-cols-2 xl:grid-cols-3">
          {[
            ["App Version",  "v3.14.2"],
            ["Node.js",      "v20.11.0"],
            ["Deployed",     "Mar 10, 2026 02:45 AM"],
            ["Commit",       "a7f3c9d"],
            ["Environment",  "Production"],
            ["Region",       "ap-south-1 (Mumbai)"],
          ].map(([k, v]) => (
            <div key={k} className="bg-surface px-4 py-3">
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      </SectionCard>
    </>
  );
}

// ─── TAB DEFINITIONS ──────────────────────────────────────────────────────────
const TABS = [
  { id: "general",       label: "General",       icon: Settings,      comp: GeneralTab       },
  { id: "email",         label: "Email / SMTP",  icon: Mail,          comp: EmailTab         },
  { id: "whatsapp",      label: "WhatsApp",      icon: MessageCircle, comp: WhatsAppTab      },
  { id: "security",      label: "Security",      icon: ShieldCheck,   comp: SecurityTab      },
  { id: "billing",       label: "Billing",       icon: CreditCard,    comp: BillingTab       },
  { id: "notifications", label: "Notifications", icon: Bell,          comp: NotificationsTab },
  { id: "health",        label: "System Health", icon: BarChart3,     comp: HealthTab        },
] as const;

type TabId = typeof TABS[number]["id"];

// ─── PAGE COMPONENT ───────────────────────────────────────────────────────────
export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const current = TABS.find(t => t.id === activeTab)!;
  const Comp    = current.comp;
  const CurrentIcon = current.icon;

  return (
    <PageContainer>
      <PageHeader
        title="System Settings"
        description="Configure platform behaviour, integrations, and security policies."
        actions={
          <>
            <Button variant="secondary" leftIcon={<RotateCcw size={15} />}>Reset Defaults</Button>
            <Button variant="secondary" leftIcon={<Download size={15} />}>Export Config</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        {/* Section nav */}
        <nav aria-label="Settings sections" className="lg:sticky lg:top-4 lg:self-start">
          <Card padding="sm" className="flex gap-1 overflow-x-auto lg:flex-col">
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                    active
                      ? "bg-primary-lighter text-primary-text"
                      : "text-secondary-foreground hover:bg-surface-hover hover:text-foreground",
                  )}
                >
                  <Icon size={16} className="shrink-0" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </Card>
        </nav>

        {/* Content */}
        <div key={activeTab} className="min-w-0 space-y-4">
          <p className="flex items-center gap-1.5 text-[0.8125rem] text-muted-foreground">
            <span>Settings</span>
            <ChevronRight size={14} aria-hidden />
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <CurrentIcon size={14} /> {current.label}
            </span>
          </p>
          <Comp />
        </div>
      </div>
    </PageContainer>
  );
}
