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

// ─── TYPES ────────────────────────────────────────────────────────────────────
type TicketStatus   = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "WAITING";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type MessageSender  = "USER" | "ADMIN";

interface Message {
  id:      number;
  sender:  MessageSender;
  name:    string;
  avatar:  string;
  content: string;
  time:    string;
  read:    boolean;
}

interface Ticket {
  id:          number;
  subject:     string;
  company:     string;
  companyLogo: string;
  companyCol:  string;
  user:        string;
  userEmail:   string;
  status:      TicketStatus;
  priority:    TicketPriority;
  category:    string;
  created:     string;
  updated:     string;
  messages:    Message[];
  unread:      number;
}

// ─── META MAPS ────────────────────────────────────────────────────────────────
const STATUS_META: Record<TicketStatus, { label: string; color: string; bg: string; dot: string }> = {
  OPEN:        { label: "Open",        color: "#74B9FF", bg: "rgba(116,185,255,0.12)", dot: "#74B9FF" },
  IN_PROGRESS: { label: "In Progress", color: "#FDCB6E", bg: "rgba(253,203,110,0.12)", dot: "#FDCB6E" },
  RESOLVED:    { label: "Resolved",    color: "#00CBA4", bg: "rgba(0,203,164,0.12)",   dot: "#00CBA4" },
  CLOSED:      { label: "Closed",      color: "#565875", bg: "rgba(86,88,117,0.20)",   dot: "#565875" },
  WAITING:     { label: "Waiting",     color: "#A29BFE", bg: "rgba(162,155,254,0.12)", dot: "#A29BFE" },
};

const PRIORITY_META: Record<TicketPriority, { label: string; color: string; bg: string; icon: string }> = {
  LOW:    { label: "Low",    color: "#565875", bg: "rgba(86,88,117,0.20)",    icon: "↓" },
  MEDIUM: { label: "Medium", color: "#74B9FF", bg: "rgba(116,185,255,0.12)", icon: "→" },
  HIGH:   { label: "High",   color: "#FDCB6E", bg: "rgba(253,203,110,0.12)", icon: "↑" },
  URGENT: { label: "Urgent", color: "#FF6B6B", bg: "rgba(255,107,107,0.12)", icon: "⚠" },
};

const CAT_ICON: Record<string, string> = {
  Billing: "💳", Technical: "🔧", Account: "👤", WhatsApp: "💬",
  Subscription: "📦", Integration: "🔌", Performance: "⚡", Other: "📋",
};

const AVATAR_COLORS: Record<string, string> = {
  SR: "#FDCB6E", AP: "#A29BFE", PS: "#00B894", JD: "#6C5CE7",
  TK: "#00CBA4", ML: "#FF6B6B", RK: "#E17055", LH: "#FD79A8",
  ST: "#6C5CE7",
};

// ─── MOCK DATA (12 tickets) ───────────────────────────────────────────────────
const INIT_TICKETS: Ticket[] = [
  {
    id: 1001, subject: "WhatsApp messages not being delivered",
    company: "Nexus Ltd", companyLogo: "NX", companyCol: "#FDCB6E",
    user: "Sara Rivera", userEmail: "sara@nexus.io",
    status: "OPEN", priority: "URGENT", category: "WhatsApp",
    created: "Mar 11, 2026 09:00 AM", updated: "2 mins ago", unread: 3,
    messages: [
      { id:1, sender:"USER",  name:"Sara Rivera",  avatar:"SR", content:"Hi, our WhatsApp messages have stopped delivering since yesterday afternoon. We've sent over 500 messages but none are reaching customers. This is causing huge business impact.", time:"Mar 11, 09:00 AM", read:true },
      { id:2, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"Hi Sara, thanks for reaching out! Escalating this to our WhatsApp integration team right now. Can you share your WA Business Account ID and the error codes you're seeing in the logs?", time:"Mar 11, 09:15 AM", read:true },
      { id:3, sender:"USER",  name:"Sara Rivera",  avatar:"SR", content:"Account ID is WA-NX-2024-001. Error code 131026 — Invalid recipient. But these are numbers we've messaged for months.", time:"Mar 11, 09:22 AM", read:true },
      { id:4, sender:"USER",  name:"Sara Rivera",  avatar:"SR", content:"Still no updates? We have a live campaign running — this is really urgent.", time:"Mar 11, 10:45 AM", read:false },
      { id:5, sender:"USER",  name:"Sara Rivera",  avatar:"SR", content:"It's been over an hour. Can someone please help?", time:"Mar 11, 11:30 AM", read:false },
    ],
  },
  {
    id: 1002, subject: "Unable to export billing report for Q1 2026",
    company: "Prism Analytics", companyLogo: "PA", companyCol: "#00B894",
    user: "Priya Sharma", userEmail: "priya@prism.co",
    status: "IN_PROGRESS", priority: "HIGH", category: "Billing",
    created: "Mar 10, 2026 03:00 PM", updated: "1 hr ago", unread: 0,
    messages: [
      { id:1, sender:"USER",  name:"Priya Sharma", avatar:"PS", content:"The billing report export keeps failing with a timeout error. I need this for our board meeting tomorrow morning.", time:"Mar 10, 03:00 PM", read:true },
      { id:2, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"Hi Priya! Your Q1 dataset has over 50,000 records which is hitting our export timeout. I'm running a manual export right now and will email it directly to you.", time:"Mar 10, 03:20 PM", read:true },
      { id:3, sender:"USER",  name:"Priya Sharma", avatar:"PS", content:"Thank you! Also, can you look into why the automated February report didn't generate?", time:"Mar 10, 04:00 PM", read:true },
      { id:4, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"Found a bug in our scheduled report job — it was skipping months where billing cycles crossed month boundaries. Fixed in our latest deploy. Q1 export emailed to priya@prism.co", time:"Mar 10, 05:30 PM", read:true },
    ],
  },
  {
    id: 1003, subject: "2FA setup not working on new device",
    company: "Zenith Group", companyLogo: "ZN", companyCol: "#A29BFE",
    user: "Anya Patel", userEmail: "anya@zenith.in",
    status: "WAITING", priority: "MEDIUM", category: "Account",
    created: "Mar 9, 2026 11:00 AM", updated: "Yesterday", unread: 1,
    messages: [
      { id:1, sender:"USER",  name:"Anya Patel",   avatar:"AP", content:"I got a new MacBook and the 2FA codes from my authenticator app aren't working. I'm completely locked out.", time:"Mar 9, 11:00 AM", read:true },
      { id:2, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"Hi Anya! This typically happens when the authenticator app time is out of sync. Please sync time in the app settings. If that doesn't work, I'll send you a recovery code.", time:"Mar 9, 11:15 AM", read:true },
      { id:3, sender:"USER",  name:"Anya Patel",   avatar:"AP", content:"Synced the time but still not working. Please send the recovery code.", time:"Mar 9, 11:45 AM", read:false },
    ],
  },
  {
    id: 1004, subject: "Chatbot flow not triggering on keyword match",
    company: "Acme Corp", companyLogo: "AC", companyCol: "#6C5CE7",
    user: "James Doe", userEmail: "james@acme.com",
    status: "IN_PROGRESS", priority: "HIGH", category: "Technical",
    created: "Mar 8, 2026 02:00 PM", updated: "2 days ago", unread: 0,
    messages: [
      { id:1, sender:"USER",  name:"James Doe",    avatar:"JD", content:"Our chatbot isn't triggering when customers type 'help' or 'support'. The flow is configured correctly and worked fine last week.", time:"Mar 8, 02:00 PM", read:true },
      { id:2, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"Hi James! I can see your flow config — the keyword matching is set to case-sensitive. Can you confirm customers type 'help' (lowercase) vs 'Help'?", time:"Mar 8, 02:30 PM", read:true },
      { id:3, sender:"USER",  name:"James Doe",    avatar:"JD", content:"Even 'HELP' doesn't work, so it's broader than case sensitivity.", time:"Mar 8, 03:00 PM", read:true },
      { id:4, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"You're right — found a regex parsing bug in v2.14.1 that broke keyword matching for flows created before v2.10. Fix rolling out now, ETA 2 hours.", time:"Mar 8, 04:00 PM", read:true },
    ],
  },
  {
    id: 1005, subject: "API rate limit errors during bulk campaign send",
    company: "Prism Analytics", companyLogo: "PA", companyCol: "#00B894",
    user: "Priya Sharma", userEmail: "priya@prism.co",
    status: "RESOLVED", priority: "MEDIUM", category: "Integration",
    created: "Mar 7, 2026 09:00 AM", updated: "3 days ago", unread: 0,
    messages: [
      { id:1, sender:"USER",  name:"Priya Sharma", avatar:"PS", content:"Getting 429 Too Many Requests errors when sending bulk campaigns — around 5,000 messages per minute.", time:"Mar 7, 09:00 AM", read:true },
      { id:2, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"Hi Priya! WhatsApp API limits 1,000 msg/min per phone number. You have 5 numbers registered, so you need to distribute evenly. Enabling burst mode on your account now.", time:"Mar 7, 09:30 AM", read:true },
      { id:3, sender:"USER",  name:"Priya Sharma", avatar:"PS", content:"Fixed! Thank you. Can you document how rate limiting works so our team doesn't hit this again?", time:"Mar 7, 11:00 AM", read:true },
      { id:4, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"Done — shared our rate limiting guide to your email and added a rate limit indicator to your dashboard. Marking resolved!", time:"Mar 7, 12:00 PM", read:true },
    ],
  },
  {
    id: 1006, subject: "Plan upgrade not reflecting in dashboard",
    company: "SkyLine Inc", companyLogo: "SK", companyCol: "#00CBA4",
    user: "Tom King", userEmail: "tom@skyline.co",
    status: "OPEN", priority: "HIGH", category: "Subscription",
    created: "Mar 11, 2026 08:00 AM", updated: "3 hrs ago", unread: 2,
    messages: [
      { id:1, sender:"USER",  name:"Tom King",     avatar:"TK", content:"We upgraded from Starter to Pro 3 hours ago and the payment was charged, but our dashboard still shows Starter limits. We can't access Pro features.", time:"Mar 11, 08:00 AM", read:true },
      { id:2, sender:"USER",  name:"Tom King",     avatar:"TK", content:"Payment receipt shows ₹2499 charged. Order ID: ORD-2026-03-1142. Please help!", time:"Mar 11, 08:15 AM", read:false },
    ],
  },
  {
    id: 1007, subject: "Custom domain SSL certificate error",
    company: "Vertex Co", companyLogo: "VT", companyCol: "#FF6B6B",
    user: "Mike Loren", userEmail: "mike@vertexco.com",
    status: "CLOSED", priority: "LOW", category: "Technical",
    created: "Mar 5, 2026 01:00 PM", updated: "5 days ago", unread: 0,
    messages: [
      { id:1, sender:"USER",  name:"Mike Loren",   avatar:"ML", content:"Our custom domain chat.vertexco.com shows SSL certificate errors for some users.", time:"Mar 5, 01:00 PM", read:true },
      { id:2, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"Hi Mike! Certificate renewal issue on our CDN — renewed and propagated. May take up to 24 hours to propagate globally.", time:"Mar 5, 01:45 PM", read:true },
      { id:3, sender:"USER",  name:"Mike Loren",   avatar:"ML", content:"All good now, thanks!", time:"Mar 5, 04:00 PM", read:true },
      { id:4, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"Glad to hear it! Closing this ticket. Feel free to reopen if the issue returns.", time:"Mar 5, 04:15 PM", read:true },
    ],
  },
  {
    id: 1008, subject: "Dashboard slow loading — taking 15+ seconds",
    company: "Delta Forge", companyLogo: "DF", companyCol: "#E17055",
    user: "Ravi Kumar", userEmail: "ravi@deltaforge.in",
    status: "OPEN", priority: "URGENT", category: "Performance",
    created: "Mar 11, 2026 07:30 AM", updated: "30 mins ago", unread: 4,
    messages: [
      { id:1, sender:"USER",  name:"Ravi Kumar",   avatar:"RK", content:"The main dashboard is taking over 15 seconds to load since this morning. All our managers are complaining.", time:"Mar 11, 07:30 AM", read:true },
      { id:2, sender:"USER",  name:"Ravi Kumar",   avatar:"RK", content:"Still slow. Network is fine on our end — other sites load instantly.", time:"Mar 11, 08:00 AM", read:false },
      { id:3, sender:"USER",  name:"Ravi Kumar",   avatar:"RK", content:"Now taking 20 seconds. Is there a server issue?", time:"Mar 11, 08:45 AM", read:false },
      { id:4, sender:"USER",  name:"Ravi Kumar",   avatar:"RK", content:"Please respond ASAP — this is blocking our whole team.", time:"Mar 11, 09:00 AM", read:false },
    ],
  },
  {
    id: 1009, subject: "Bulk contact import failing for CSV > 10,000 rows",
    company: "Nexus Ltd", companyLogo: "NX", companyCol: "#FDCB6E",
    user: "Leila Hassan", userEmail: "leila@nexus.io",
    status: "IN_PROGRESS", priority: "MEDIUM", category: "Technical",
    created: "Mar 10, 2026 10:00 AM", updated: "Yesterday", unread: 0,
    messages: [
      { id:1, sender:"USER",  name:"Leila Hassan", avatar:"LH", content:"When we import a contact CSV with more than 10,000 rows, the import fails silently — no error message, no partial import.", time:"Mar 10, 10:00 AM", read:true },
      { id:2, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"Confirmed the bug — our import job has a hard limit of 10,000 rows due to a memory constraint. Working on chunked imports. ETA 2 business days.", time:"Mar 10, 11:00 AM", read:true },
    ],
  },
  {
    id: 1010, subject: "Invoice not generated for December 2025",
    company: "Acme Corp", companyLogo: "AC", companyCol: "#6C5CE7",
    user: "James Doe", userEmail: "james@acme.com",
    status: "RESOLVED", priority: "LOW", category: "Billing",
    created: "Mar 3, 2026 09:00 AM", updated: "1 week ago", unread: 0,
    messages: [
      { id:1, sender:"USER",  name:"James Doe",    avatar:"JD", content:"The December 2025 invoice is missing from our billing portal. We need it for annual accounts.", time:"Mar 3, 09:00 AM", read:true },
      { id:2, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"Found it — December invoice had a rendering bug preventing it from appearing. Regenerated and uploaded to your billing portal now!", time:"Mar 3, 10:00 AM", read:true },
      { id:3, sender:"USER",  name:"James Doe",    avatar:"JD", content:"Got it, thank you!", time:"Mar 3, 10:30 AM", read:true },
    ],
  },
  {
    id: 1011, subject: "Email notifications not reaching users",
    company: "Zenith Group", companyLogo: "ZN", companyCol: "#A29BFE",
    user: "Anya Patel", userEmail: "anya@zenith.in",
    status: "WAITING", priority: "MEDIUM", category: "Technical",
    created: "Mar 9, 2026 03:00 PM", updated: "2 days ago", unread: 1,
    messages: [
      { id:1, sender:"USER",  name:"Anya Patel",   avatar:"AP", content:"Several users are not receiving email notifications for new messages — started after we updated SMTP settings last week.", time:"Mar 9, 03:00 PM", read:true },
      { id:2, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"SMTP update looks fine on our end. Can you check if emails land in spam? Also, share the sending domain.", time:"Mar 9, 03:30 PM", read:true },
      { id:3, sender:"USER",  name:"Anya Patel",   avatar:"AP", content:"Checked spam — not there. Domain is zenith.in. SPF and DKIM both configured.", time:"Mar 9, 04:00 PM", read:false },
    ],
  },
  {
    id: 1012, subject: "Campaign analytics showing wrong open rates",
    company: "SkyLine Inc", companyLogo: "SK", companyCol: "#00CBA4",
    user: "Tom King", userEmail: "tom@skyline.co",
    status: "CLOSED", priority: "LOW", category: "Other",
    created: "Mar 1, 2026 11:00 AM", updated: "1 week ago", unread: 0,
    messages: [
      { id:1, sender:"USER",  name:"Tom King",     avatar:"TK", content:"Campaign open rates are showing 100% — our actual rate should be around 35%.", time:"Mar 1, 11:00 AM", read:true },
      { id:2, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"Found the issue — tracking pixel misconfiguration on campaigns created Feb 20–28. Recalculated: 'Spring Sale' now shows 34.2% open rate.", time:"Mar 1, 12:30 PM", read:true },
      { id:3, sender:"USER",  name:"Tom King",     avatar:"TK", content:"34.2% sounds right. Thanks!", time:"Mar 1, 01:00 PM", read:true },
    ],
  },
];

const PAGE_SIZE = 8;

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function KPI({ label, value, sub, icon, color }: { label: string; value: string; sub: string; icon: string; color: string }) {
  return (
    <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -8, right: -8, width: 60, height: 60, borderRadius: "50%", background: `${color}0D` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>{label}</span>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 3 }}>{value}</div>
      <div style={{ fontSize: 10, color: T.muted }}>{sub}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const m = STATUS_META[status];
  return (
    <span style={{ background: m.bg, color: m.color, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.dot, display: "inline-block", flexShrink: 0 }} />
      {m.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const m = PRIORITY_META[priority];
  return (
    <span style={{ background: m.bg, color: m.color, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
      {m.icon} {m.label}
    </span>
  );
}

function Ava({ init, size = 32, col }: { init: string; size?: number; col?: string }) {
  const bg = col ?? AVATAR_COLORS[init] ?? T.accent;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.31, fontWeight: 800, color: "#fff", flexShrink: 0, letterSpacing: "-0.5px" }}>
      {init}
    </div>
  );
}

// ─── PAGINATION BAR ───────────────────────────────────────────────────────────
function Pager({ page, total, size, onChange }: { page: number; total: number; size: number; onChange: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / size));
  const nums  = Array.from({ length: pages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === pages || Math.abs(p - page) <= 1);
  const withDots: (number | "…")[] = [];
  nums.forEach((p, i) => {
    if (i > 0 && p - nums[i - 1] > 1) withDots.push("…");
    withDots.push(p);
  });

  const btn = (label: string | number, onClick: () => void, active = false, disabled = false) => (
    <button
      key={String(label)}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
        background: active ? `linear-gradient(135deg,${T.accent},${T.accent2})` : "transparent",
        border: `1px solid ${active ? "rgba(108,92,231,0.5)" : T.border}`,
        color: active ? "#fff" : disabled ? T.muted : T.text,
        cursor: disabled ? "not-allowed" : "pointer", fontSize: 11,
        fontWeight: active ? 800 : 400, opacity: disabled ? 0.35 : 1, transition: "all 0.12s",
      }}
    >{label}</button>
  );

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderTop: `1px solid ${T.border}`, background: T.surf2, flexShrink: 0 }}>
      <span style={{ fontSize: 10, color: T.muted }}>
        {(page - 1) * size + 1}–{Math.min(page * size, total)} of {total}
      </span>
      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
        {btn("«", () => onChange(1),           false, page === 1)}
        {btn("‹", () => onChange(page - 1),    false, page === 1)}
        {withDots.map((p, i) =>
          p === "…"
            ? <span key={`e${i}`} style={{ width: 28, textAlign: "center", color: T.muted, fontSize: 11 }}>…</span>
            : btn(p, () => onChange(p as number), page === p)
        )}
        {btn("›", () => onChange(page + 1),    false, page === pages)}
        {btn("»", () => onChange(pages),        false, page === pages)}
      </div>
      <span style={{ fontSize: 10, color: T.muted }}>p{page}/{pages}</span>
    </div>
  );
}

// ─── CONVERSATION PANEL ───────────────────────────────────────────────────────
function ConvPanel({
  ticket, onClose, onStatusChange, onReply,
}: {
  ticket: Ticket;
  onClose: () => void;
  onStatusChange: (id: number, s: TicketStatus) => void;
  onReply: (id: number, text: string) => void;
}) {
  const [reply,       setReply]       = useState("");
  const [sending,     setSending]     = useState(false);
  const [sent,        setSent]        = useState(false);
  const [showStatus,  setShowStatus]  = useState(false);
  const sm = STATUS_META[ticket.status];

  const send = () => {
    if (!reply.trim()) return;
    setSending(true);
    setTimeout(() => {
      onReply(ticket.id, reply.trim());
      setReply("");
      setSending(false);
      setSent(true);
      setTimeout(() => setSent(false), 2000);
    }, 600);
  };

  return (
    <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 16, display: "flex", flexDirection: "column", height: "calc(100vh - 230px)", minHeight: 520, overflow: "hidden" }}>

      {/* Header */}
      <div style={{ background: T.surf2, padding: "14px 18px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>#{ticket.id}</span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 5, lineHeight: 1.3 }}>{ticket.subject}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, background: ticket.companyCol, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: "#fff" }}>{ticket.companyLogo}</div>
              <span style={{ fontSize: 11, color: T.muted }}>{ticket.company}</span>
              <span style={{ color: T.border }}>·</span>
              <span style={{ fontSize: 11, color: T.muted }}>{ticket.user}</span>
              <span style={{ color: T.border }}>·</span>
              <span style={{ fontSize: 11, color: T.muted }}>{CAT_ICON[ticket.category] ?? "📋"} {ticket.category}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
            {/* Status dropdown */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowStatus(v => !v)}
                style={{ background: sm.bg, color: sm.color, border: `1px solid ${sm.color}35`, padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: sm.dot, display: "inline-block" }} />
                {sm.label} ▾
              </button>
              {showStatus && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: T.surf3, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden", zIndex: 50, minWidth: 155, boxShadow: "0 12px 40px rgba(0,0,0,0.5)", animation: "dropDown 0.15s ease" }}>
                  {(Object.entries(STATUS_META) as [TicketStatus, typeof STATUS_META[TicketStatus]][]).map(([key, meta]) => (
                    <button key={key} onClick={() => { onStatusChange(ticket.id, key); setShowStatus(false); }}
                      style={{ width: "100%", background: ticket.status === key ? `${meta.color}12` : "transparent", border: "none", color: ticket.status === key ? meta.color : T.muted, padding: "9px 14px", cursor: "pointer", fontSize: 11, fontWeight: ticket.status === key ? 700 : 400, textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.dot, display: "inline-block", flexShrink: 0 }} />
                      {meta.label}
                      {ticket.status === key && <span style={{ marginLeft: "auto" }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "3px" }}>×</button>
          </div>
        </div>
        {/* Meta row */}
        <div style={{ display: "flex", gap: 14, marginTop: 10, flexWrap: "wrap" }}>
          {[["📅 Created", ticket.created], ["🕐 Updated", ticket.updated], ["💬 Messages", String(ticket.messages.length)]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", gap: 5 }}>
              <span style={{ fontSize: 10, color: T.muted }}>{l}:</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: T.text }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 8px" }}>
        {ticket.messages.map((msg, i) => {
          const isAdmin = msg.sender === "ADMIN";
          const isFirst = i === 0 || ticket.messages[i - 1].sender !== msg.sender;
          return (
            <div key={msg.id} style={{ display: "flex", gap: 10, marginBottom: 14, flexDirection: isAdmin ? "row-reverse" : "row", alignItems: "flex-start" }}>
              {isFirst
                ? <Ava init={msg.avatar} size={30} />
                : <div style={{ width: 30, flexShrink: 0 }} />
              }
              <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: 3, alignItems: isAdmin ? "flex-end" : "flex-start" }}>
                {isFirst && (
                  <div style={{ display: "flex", gap: 7, alignItems: "center", flexDirection: isAdmin ? "row-reverse" : "row" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: isAdmin ? T.accent2 : T.text }}>{msg.name}</span>
                    {!msg.read && !isAdmin && (
                      <span style={{ background: "rgba(255,107,107,0.15)", color: T.danger, fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 10 }}>UNREAD</span>
                    )}
                  </div>
                )}
                <div style={{
                  background: isAdmin ? "rgba(108,92,231,0.12)" : T.surf2,
                  border: `1px solid ${isAdmin ? "rgba(108,92,231,0.25)" : T.border}`,
                  borderRadius: isAdmin ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                  padding: "10px 14px",
                }}>
                  <div style={{ fontSize: 12, color: T.text, lineHeight: 1.55, wordBreak: "break-word" }}>{msg.content}</div>
                </div>
                <span style={{ fontSize: 10, color: T.muted }}>{msg.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply box */}
      {ticket.status !== "CLOSED" ? (
        <div style={{ padding: "12px 16px 16px", borderTop: `1px solid ${T.border}`, background: T.surf2, flexShrink: 0 }}>
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send(); }}
            placeholder="Type your reply… (Ctrl+Enter to send)"
            rows={3}
            style={{ width: "100%", background: T.surf3, border: `1px solid ${T.border}`, color: T.text, padding: "10px 13px", borderRadius: 10, fontSize: 12, resize: "vertical", outline: "none", lineHeight: 1.5, minHeight: 72 }}
            onFocus={e => (e.target.style.borderColor = T.accent)}
            onBlur={e  => (e.target.style.borderColor = T.border)}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => onStatusChange(ticket.id, "RESOLVED")}
                style={{ background: "rgba(0,203,164,0.08)", color: T.success, border: "1px solid rgba(0,203,164,0.25)", padding: "6px 13px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700 }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,203,164,0.15)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,203,164,0.08)")}>
                ✓ Resolve
              </button>
              <button onClick={() => onStatusChange(ticket.id, "CLOSED")}
                style={{ background: T.surf3, color: T.muted, border: `1px solid ${T.border}`, padding: "6px 13px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 600 }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = T.danger)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
                ✕ Close
              </button>
            </div>
            <button onClick={send} disabled={sending || !reply.trim()}
              style={{ background: reply.trim() ? `linear-gradient(135deg,${T.accent},${T.accent2})` : T.surf3, color: reply.trim() ? "#fff" : T.muted, border: "none", padding: "8px 20px", borderRadius: 9, cursor: reply.trim() ? "pointer" : "not-allowed", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s", opacity: reply.trim() ? 1 : 0.5 }}>
              {sending
                ? <><span style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Sending…</>
                : sent ? <><span style={{ animation: "popIn 0.3s ease", display: "inline-block" }}>✓</span> Sent!</>
                : <>Send Reply ›</>
              }
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}`, background: T.surf2, textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>This ticket is closed.</div>
          <button onClick={() => onStatusChange(ticket.id, "OPEN")}
            style={{ background: T.surf3, color: T.accent2, border: "1px solid rgba(108,92,231,0.3)", padding: "7px 18px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
            ↺ Reopen Ticket
          </button>
        </div>
      )}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function SupportTickets() {
  const [tickets,   setTickets]   = useState<Ticket[]>(INIT_TICKETS);
  const [selected,  setSelected]  = useState<Ticket | null>(null);
  const [search,    setSearch]    = useState("");
  const [statusF,   setStatusF]   = useState<string>("ALL");
  const [priorityF, setPriorityF] = useState<string>("ALL");
  const [page,      setPage]      = useState(1);

  const applySearch    = (v: string) => { setSearch(v);    setPage(1); };
  const applyStatus    = (v: string) => { setStatusF(v);   setPage(1); };
  const applyPriority  = (v: string) => { setPriorityF(v); setPage(1); };

  const filtered = tickets.filter(t =>
    (statusF   === "ALL" || t.status   === statusF)   &&
    (priorityF === "ALL" || t.priority === priorityF) &&
    (t.subject.toLowerCase().includes(search.toLowerCase())  ||
     t.company.toLowerCase().includes(search.toLowerCase())  ||
     t.user.toLowerCase().includes(search.toLowerCase())     ||
     t.category.toLowerCase().includes(search.toLowerCase()))
  );
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleStatusChange = (id: number, status: TicketStatus) => {
    setTickets(p => p.map(t => t.id === id ? { ...t, status, updated: "Just now" } : t));
    setSelected(p => p?.id === id ? { ...p, status, updated: "Just now" } : p);
  };

  const handleReply = (id: number, text: string) => {
    const msg: Message = {
      id: Date.now(), sender: "ADMIN", name: "Support Team", avatar: "ST", content: text,
      time: new Date().toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }), read: true,
    };
    const update = (t: Ticket) => t.id === id
      ? { ...t, messages: [...t.messages, msg], updated: "Just now", status: t.status === "OPEN" ? "IN_PROGRESS" as TicketStatus : t.status }
      : t;
    setTickets(p => p.map(update));
    setSelected(p => p?.id === id ? update(p) : p);
  };

  const openCount   = tickets.filter(t => t.status === "OPEN").length;
  const inProg      = tickets.filter(t => t.status === "IN_PROGRESS").length;
  const resolved    = tickets.filter(t => t.status === "RESOLVED").length;
  const urgent      = tickets.filter(t => t.priority === "URGENT").length;
  const totalUnread = tickets.reduce((a, t) => a + t.unread, 0);

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: T.bg, minHeight: "100vh", padding: "28px 32px", color: T.text }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #1E2035; border-radius: 4px; }
        ::placeholder { color: #3A3D5C; }
        button, input, textarea { font-family: inherit; }
        @keyframes spin    { from{transform:rotate(0deg)}  to{transform:rotate(360deg)} }
        @keyframes popIn   { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        @keyframes dropDown{ from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>Support Tickets</h1>
          <p style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>Manage and respond to all customer support requests.</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {totalUnread > 0 && (
            <div style={{ background: "rgba(255,107,107,0.10)", border: "1px solid rgba(255,107,107,0.28)", borderRadius: 9, padding: "8px 14px", display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.danger, display: "inline-block", animation: "pulse 1.5s ease infinite" }} />
              <span style={{ fontSize: 12, color: T.danger, fontWeight: 700 }}>{totalUnread} unread</span>
            </div>
          )}
          <button style={{ background: `linear-gradient(135deg,${T.accent},${T.accent2})`, color: "#fff", border: "none", padding: "9px 18px", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 700 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
            + New Ticket
          </button>
        </div>
      </div>

      {/* KPI ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <KPI label="Open Tickets"  value={String(openCount)} sub={`${urgent} urgent`}       icon="🎫" color={T.info}    />
        <KPI label="In Progress"   value={String(inProg)}    sub="being handled"             icon="⚙️" color={T.warn}    />
        <KPI label="Resolved (7d)" value={String(resolved)}  sub="closed this week"          icon="✅" color={T.success}  />
        <KPI label="Avg Response"  value="18m"               sub="across all tickets"        icon="⚡" color={T.accent}   />
      </div>

      {/* MAIN LAYOUT — list left, thread right */}
      <div style={{ display: "grid", gridTemplateColumns: selected ? "420px 1fr" : "1fr", gap: 16, alignItems: "start" }}>

        {/* ── TICKET LIST ── */}
        <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>

          {/* Filters */}
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, background: T.surf2 }}>
            <div style={{ position: "relative", marginBottom: 10 }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.muted, fontSize: 13, pointerEvents: "none" }}>🔍</span>
              <input value={search} onChange={e => applySearch(e.target.value)} placeholder="Search tickets…"
                style={{ width: "100%", background: T.surf, border: `1px solid ${T.border}`, color: T.text, padding: "8px 12px 8px 32px", borderRadius: 9, fontSize: 12, outline: "none" }}
                onFocus={e => (e.target.style.borderColor = T.accent)}
                onBlur={e  => (e.target.style.borderColor = T.border)} />
            </div>
            {/* Status pills */}
            <div style={{ display: "flex", gap: 4, marginBottom: 7, flexWrap: "wrap" }}>
              {(["ALL","OPEN","IN_PROGRESS","WAITING","RESOLVED","CLOSED"] as const).map(s => {
                const m = STATUS_META[s as TicketStatus];
                const on = statusF === s;
                return (
                  <button key={s} onClick={() => applyStatus(s)}
                    style={{ background: on ? (m?.bg ?? T.surf3) : "transparent", border: `1px solid ${on ? (m ? `${m.dot}55` : "rgba(108,92,231,0.35)") : T.border}`, color: on ? (m?.color ?? T.accent2) : T.muted, padding: "4px 10px", borderRadius: 20, cursor: "pointer", fontSize: 10, fontWeight: on ? 700 : 400, transition: "all 0.12s" }}>
                    {s === "ALL" ? "All" : m?.label ?? s}
                  </button>
                );
              })}
            </div>
            {/* Priority pills */}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: T.muted, marginRight: 2 }}>Priority:</span>
              {(["ALL","URGENT","HIGH","MEDIUM","LOW"] as const).map(p => {
                const m = PRIORITY_META[p as TicketPriority];
                const on = priorityF === p;
                return (
                  <button key={p} onClick={() => applyPriority(p)}
                    style={{ background: on ? (m?.bg ?? T.surf3) : "transparent", border: `1px solid ${on ? (m ? `${m.color}55` : "rgba(108,92,231,0.35)") : T.border}`, color: on ? (m?.color ?? T.accent2) : T.muted, padding: "3px 9px", borderRadius: 20, cursor: "pointer", fontSize: 10, fontWeight: on ? 700 : 400, transition: "all 0.12s" }}>
                    {p === "ALL" ? "All" : m?.label ?? p}
                  </button>
                );
              })}
              <span style={{ fontSize: 10, color: T.muted, marginLeft: "auto" }}>{filtered.length} ticket{filtered.length !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Rows */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {paginated.map((t, i) => {
              const isActive = selected?.id === t.id;
              return (
                <div key={t.id} onClick={() => setSelected(isActive ? null : t)}
                  style={{ padding: "13px 16px", borderBottom: i < paginated.length - 1 ? `1px solid ${T.border}` : "none", cursor: "pointer", background: isActive ? "rgba(108,92,231,0.07)" : "transparent", borderLeft: `3px solid ${isActive ? T.accent : "transparent"}`, transition: "all 0.12s" }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(108,92,231,0.03)"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Top */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: t.companyCol, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{t.companyLogo}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.subject}</div>
                        <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{t.company} · {t.user}</div>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, marginLeft: 8, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      {t.unread > 0 && (
                        <span style={{ background: T.danger, color: "#fff", fontSize: 9, fontWeight: 800, width: 17, height: 17, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{t.unread}</span>
                      )}
                      <span style={{ fontSize: 10, color: T.muted, whiteSpace: "nowrap" }}>{t.updated}</span>
                    </div>
                  </div>
                  {/* Badges */}
                  <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
                    <StatusBadge status={t.status} />
                    <PriorityBadge priority={t.priority} />
                    <span style={{ background: T.surf2, color: T.muted, fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 6, border: `1px solid ${T.border}` }}>
                      {CAT_ICON[t.category] ?? "📋"} {t.category}
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: 10, color: T.muted }}>💬 {t.messages.length}</span>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div style={{ padding: "50px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🎫</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 5 }}>No tickets found</div>
                <div style={{ fontSize: 11, color: T.muted }}>Try adjusting your filters.</div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <Pager page={page} total={filtered.length} size={PAGE_SIZE} onChange={p => { setPage(p); setSelected(null); }} />
          )}
        </div>

        {/* ── CONVERSATION THREAD ── */}
        {selected ? (
          <ConvPanel
            ticket={selected}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
            onReply={handleReply}
          />
        ) : (
          <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 440, gap: 14 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(108,92,231,0.09)", border: "1px solid rgba(108,92,231,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🎫</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Select a ticket</div>
              <div style={{ fontSize: 12, color: T.muted, maxWidth: 220 }}>Click any ticket from the list to view the conversation and reply.</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ background: T.surf2, borderRadius: 9, padding: "7px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.info, display: "inline-block" }} />
                <span style={{ fontSize: 11, color: T.muted }}>{openCount} open</span>
              </div>
              <div style={{ background: T.surf2, borderRadius: 9, padding: "7px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.danger, display: "inline-block" }} />
                <span style={{ fontSize: 11, color: T.muted }}>{urgent} urgent</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}