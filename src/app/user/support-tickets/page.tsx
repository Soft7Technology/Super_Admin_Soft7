"use client";

import { useState } from "react";
import "./support-tickets.css";

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
const STATUS_META: Record<TicketStatus, { label: string; dot: string }> = {
  OPEN:        { label: "Open",        dot: "var(--st-status-open-col)"     },
  IN_PROGRESS: { label: "In Progress", dot: "var(--st-status-inprog-col)"   },
  RESOLVED:    { label: "Resolved",    dot: "var(--st-status-resolved-col)" },
  CLOSED:      { label: "Closed",      dot: "var(--st-status-closed-col)"   },
  WAITING:     { label: "Waiting",     dot: "var(--st-status-waiting-col)"  },
};

const PRIORITY_META: Record<TicketPriority, { label: string; icon: string }> = {
  LOW:    { label: "Low",    icon: "↓" },
  MEDIUM: { label: "Medium", icon: "→" },
  HIGH:   { label: "High",   icon: "↑" },
  URGENT: { label: "Urgent", icon: "⚠" },
};

const CAT_ICON: Record<string, string> = {
  Billing: "💳", Technical: "🔧", Account: "👤", WhatsApp: "💬",
  Subscription: "📦", Integration: "🔌", Performance: "⚡", Other: "📋",
};

const AVATAR_COLORS: Record<string, string> = {
  SR: "#FDCB6E", AP: "#A29BFE", PS: "#00B894", JD: "#6C5CE7",
  TK: "#00CBA4", ML: "#FF6B6B", RK: "#E17055", LH: "#FD79A8", ST: "#6C5CE7",
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
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
      { id:4, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"Found a bug in our scheduled report job — fixed in our latest deploy. Q1 export emailed to priya@prism.co", time:"Mar 10, 05:30 PM", read:true },
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
      { id:2, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"Hi Anya! This typically happens when the authenticator app time is out of sync. Please sync time in the app settings.", time:"Mar 9, 11:15 AM", read:true },
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
      { id:4, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"Found a regex parsing bug in v2.14.1. Fix rolling out now, ETA 2 hours.", time:"Mar 8, 04:00 PM", read:true },
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
      { id:2, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"WhatsApp API limits 1,000 msg/min per phone number. Enabling burst mode on your account now.", time:"Mar 7, 09:30 AM", read:true },
      { id:3, sender:"USER",  name:"Priya Sharma", avatar:"PS", content:"Fixed! Thank you.", time:"Mar 7, 11:00 AM", read:true },
      { id:4, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"Glad to hear it! Marking resolved!", time:"Mar 7, 12:00 PM", read:true },
    ],
  },
  {
    id: 1006, subject: "Plan upgrade not reflecting in dashboard",
    company: "SkyLine Inc", companyLogo: "SK", companyCol: "#00CBA4",
    user: "Tom King", userEmail: "tom@skyline.co",
    status: "OPEN", priority: "HIGH", category: "Subscription",
    created: "Mar 11, 2026 08:00 AM", updated: "3 hrs ago", unread: 2,
    messages: [
      { id:1, sender:"USER",  name:"Tom King",     avatar:"TK", content:"We upgraded from Starter to Pro 3 hours ago and the payment was charged, but our dashboard still shows Starter limits.", time:"Mar 11, 08:00 AM", read:true },
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
      { id:2, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"Certificate renewal issue on our CDN — renewed and propagated.", time:"Mar 5, 01:45 PM", read:true },
      { id:3, sender:"USER",  name:"Mike Loren",   avatar:"ML", content:"All good now, thanks!", time:"Mar 5, 04:00 PM", read:true },
      { id:4, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"Glad to hear it! Closing this ticket.", time:"Mar 5, 04:15 PM", read:true },
    ],
  },
  {
    id: 1008, subject: "Dashboard slow loading — taking 15+ seconds",
    company: "Delta Forge", companyLogo: "DF", companyCol: "#E17055",
    user: "Ravi Kumar", userEmail: "ravi@deltaforge.in",
    status: "OPEN", priority: "URGENT", category: "Performance",
    created: "Mar 11, 2026 07:30 AM", updated: "30 mins ago", unread: 4,
    messages: [
      { id:1, sender:"USER",  name:"Ravi Kumar",   avatar:"RK", content:"The main dashboard is taking over 15 seconds to load since this morning.", time:"Mar 11, 07:30 AM", read:true },
      { id:2, sender:"USER",  name:"Ravi Kumar",   avatar:"RK", content:"Still slow. Network is fine on our end.", time:"Mar 11, 08:00 AM", read:false },
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
      { id:1, sender:"USER",  name:"Leila Hassan", avatar:"LH", content:"When we import a contact CSV with more than 10,000 rows, the import fails silently.", time:"Mar 10, 10:00 AM", read:true },
      { id:2, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"Confirmed the bug — working on chunked imports. ETA 2 business days.", time:"Mar 10, 11:00 AM", read:true },
    ],
  },
  {
    id: 1010, subject: "Invoice not generated for December 2025",
    company: "Acme Corp", companyLogo: "AC", companyCol: "#6C5CE7",
    user: "James Doe", userEmail: "james@acme.com",
    status: "RESOLVED", priority: "LOW", category: "Billing",
    created: "Mar 3, 2026 09:00 AM", updated: "1 week ago", unread: 0,
    messages: [
      { id:1, sender:"USER",  name:"James Doe",    avatar:"JD", content:"The December 2025 invoice is missing from our billing portal.", time:"Mar 3, 09:00 AM", read:true },
      { id:2, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"Regenerated and uploaded to your billing portal now!", time:"Mar 3, 10:00 AM", read:true },
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
      { id:1, sender:"USER",  name:"Anya Patel",   avatar:"AP", content:"Several users are not receiving email notifications for new messages.", time:"Mar 9, 03:00 PM", read:true },
      { id:2, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"SMTP update looks fine on our end. Can you check if emails land in spam?", time:"Mar 9, 03:30 PM", read:true },
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
      { id:2, sender:"ADMIN", name:"Support Team", avatar:"ST", content:"Recalculated: 'Spring Sale' now shows 34.2% open rate.", time:"Mar 1, 12:30 PM", read:true },
      { id:3, sender:"USER",  name:"Tom King",     avatar:"TK", content:"34.2% sounds right. Thanks!", time:"Mar 1, 01:00 PM", read:true },
    ],
  },
];

const PAGE_SIZE = 8;

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function KPI({ label, value, sub, icon, color }: { label: string; value: string; sub: string; icon: string; color: string }) {
  return (
    <div className="st-kpi">
      <div className="st-kpi__orb" style={{ background: `${color}0D` }} />
      <div className="st-kpi__top">
        <span className="st-kpi__label">{label}</span>
        <div className="st-kpi__icon" style={{ background: `${color}18` }}>{icon}</div>
      </div>
      <div className="st-kpi__value">{value}</div>
      <div className="st-kpi__sub">{sub}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`st-status-badge st-status-badge--${status}`}>
      <span className="st-status-badge__dot" />
      {STATUS_META[status].label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const m = PRIORITY_META[priority];
  return (
    <span className={`st-priority-badge st-priority-badge--${priority}`}>
      {m.icon} {m.label}
    </span>
  );
}

function Ava({ init, size = 32, col }: { init: string; size?: number; col?: string }) {
  const bg = col ?? AVATAR_COLORS[init] ?? "#6C5CE7";
  return (
    <div className="st-ava" style={{ width: size, height: size, background: bg, fontSize: size * 0.31 }}>
      {init}
    </div>
  );
}

// ─── PAGINATION ───────────────────────────────────────────────────────────────
function Pager({ page, total, size, onChange }: { page: number; total: number; size: number; onChange: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / size));
  const nums  = Array.from({ length: pages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === pages || Math.abs(p - page) <= 1);
  const withDots: (number | "…")[] = [];
  nums.forEach((p, i) => {
    if (i > 0 && p - nums[i - 1] > 1) withDots.push("…");
    withDots.push(p);
  });

  return (
    <div className="st-pager">
      <span className="st-pager__info">
        {(page - 1) * size + 1}–{Math.min(page * size, total)} of {total}
      </span>
      <div className="st-pager__btns">
        <button className="st-pager__btn" onClick={() => onChange(1)}         disabled={page === 1}>«</button>
        <button className="st-pager__btn" onClick={() => onChange(page - 1)} disabled={page === 1}>‹</button>
        {withDots.map((p, i) =>
          p === "…"
            ? <span key={`e${i}`} className="st-pager__dots">…</span>
            : <button key={p} onClick={() => onChange(p as number)}
                className={`st-pager__btn ${page === p ? "st-pager__btn--active" : ""}`}>{p}</button>
        )}
        <button className="st-pager__btn" onClick={() => onChange(page + 1)} disabled={page === pages}>›</button>
        <button className="st-pager__btn" onClick={() => onChange(pages)}    disabled={page === pages}>»</button>
      </div>
      <span className="st-pager__info">p{page}/{pages}</span>
    </div>
  );
}

// ─── CONVERSATION PANEL ───────────────────────────────────────────────────────
function ConvPanel({ ticket, onClose, onStatusChange, onReply }: {
  ticket: Ticket;
  onClose: () => void;
  onStatusChange: (id: number, s: TicketStatus) => void;
  onReply: (id: number, text: string) => void;
}) {
  const [reply,      setReply]      = useState("");
  const [sending,    setSending]    = useState(false);
  const [sent,       setSent]       = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  const send = () => {
    if (!reply.trim()) return;
    setSending(true);
    setTimeout(() => {
      onReply(ticket.id, reply.trim());
      setReply(""); setSending(false); setSent(true);
      setTimeout(() => setSent(false), 2000);
    }, 600);
  };

  return (
    <div className="st-conv">
      {/* Header */}
      <div className="st-conv__header">
        <div className="st-conv__header-top">
          <div className="st-conv__header-left">
            <div className="st-conv__header-badges">
              <span className="st-conv__ticket-num">#{ticket.id}</span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <div className="st-conv__subject">{ticket.subject}</div>
            <div className="st-conv__meta-row">
              <div className="st-conv__company-logo" style={{ background: ticket.companyCol }}>{ticket.companyLogo}</div>
              <span className="st-conv__meta-text">{ticket.company}</span>
              <span className="st-conv__meta-sep">·</span>
              <span className="st-conv__meta-text">{ticket.user}</span>
              <span className="st-conv__meta-sep">·</span>
              <span className="st-conv__meta-text">{CAT_ICON[ticket.category] ?? "📋"} {ticket.category}</span>
            </div>
          </div>

          <div className="st-conv__header-right">
            {/* Status dropdown */}
            <div className="st-status-dd">
              <button className={`st-status-dd__trigger st-status-badge--${ticket.status}`}
                style={{ borderColor: `${STATUS_META[ticket.status].dot}35` }}
                onClick={() => setShowStatus(v => !v)}>
                <span className="st-status-dd__trigger-dot"
                  style={{ background: STATUS_META[ticket.status].dot }} />
                {STATUS_META[ticket.status].label} ▾
              </button>
              {showStatus && (
                <div className="st-status-dd__menu">
                  {(Object.entries(STATUS_META) as [TicketStatus, typeof STATUS_META[TicketStatus]][]).map(([key, meta]) => (
                    <button key={key}
                      className="st-status-dd__option"
                      style={{
                        background: ticket.status === key ? `${meta.dot}12` : "transparent",
                        color: ticket.status === key ? meta.dot : "var(--st-muted)",
                        fontWeight: ticket.status === key ? 700 : 400,
                      }}
                      onClick={() => { onStatusChange(ticket.id, key); setShowStatus(false); }}>
                      <span className="st-status-dd__option-dot" style={{ background: meta.dot }} />
                      {meta.label}
                      {ticket.status === key && <span className="st-status-dd__check">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="st-btn-close" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="st-conv__meta-strip">
          {[["📅 Created", ticket.created], ["🕐 Updated", ticket.updated], ["💬 Messages", String(ticket.messages.length)]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", gap: 5 }}>
              <span className="st-conv__meta-key">{l}:</span>
              <span className="st-conv__meta-val">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="st-messages">
        {ticket.messages.map((msg, i) => {
          const isAdmin = msg.sender === "ADMIN";
          const isFirst = i === 0 || ticket.messages[i - 1].sender !== msg.sender;
          return (
            <div key={msg.id} className={`st-msg ${isAdmin ? "st-msg--admin" : "st-msg--user"}`}>
              {isFirst ? <Ava init={msg.avatar} size={30} /> : <div className="st-msg__ava-spacer" />}
              <div className="st-msg__body">
                {isFirst && (
                  <div className="st-msg__name-row">
                    <span className={isAdmin ? "st-msg__name-admin" : "st-msg__name-user"}>{msg.name}</span>
                    {!msg.read && !isAdmin && <span className="st-msg__unread-tag">UNREAD</span>}
                  </div>
                )}
                <div className={`st-msg__bubble ${isAdmin ? "st-msg__bubble--admin" : "st-msg__bubble--user"}`}>
                  <div className="st-msg__text">{msg.content}</div>
                </div>
                <span className="st-msg__time">{msg.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply / Closed footer */}
      {ticket.status !== "CLOSED" ? (
        <div className="st-reply">
          <textarea className="st-reply__textarea" value={reply}
            onChange={e => setReply(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send(); }}
            placeholder="Type your reply… (Ctrl+Enter to send)" rows={3} />
          <div className="st-reply__actions">
            <div className="st-reply__left">
              <button className="st-btn-resolve" onClick={() => onStatusChange(ticket.id, "RESOLVED")}>✓ Resolve</button>
              <button className="st-btn-close-ticket" onClick={() => onStatusChange(ticket.id, "CLOSED")}>✕ Close</button>
            </div>
            <button className={`st-btn-send ${reply.trim() ? "st-btn-send--active" : "st-btn-send--inactive"}`}
              onClick={send} disabled={sending || !reply.trim()}>
              {sending
                ? <><span className="st-btn-send__spinner" /> Sending…</>
                : sent ? <>✓ Sent!</>
                : <>Send Reply ›</>
              }
            </button>
          </div>
        </div>
      ) : (
        <div className="st-conv__closed-footer">
          <div className="st-conv__closed-text">This ticket is closed.</div>
          <button className="st-btn-reopen" onClick={() => onStatusChange(ticket.id, "OPEN")}>↺ Reopen Ticket</button>
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
  const [statusF,   setStatusF]   = useState("ALL");
  const [priorityF, setPriorityF] = useState("ALL");
  const [page,      setPage]      = useState(1);

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
      time: new Date().toLocaleString("en-IN", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" }), read: true,
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
    <div className="st-root">

      {/* HEADER */}
      <div className="st-header">
        <div>
          <h1 className="st-header__title">Support Tickets</h1>
          <p className="st-header__sub">Manage and respond to all customer support requests.</p>
        </div>
        <div className="st-header__actions">
          {totalUnread > 0 && (
            <div className="st-unread-banner">
              <span className="st-unread-banner__dot" />
              <span className="st-unread-banner__text">{totalUnread} unread</span>
            </div>
          )}
          <button className="st-btn-new">+ New Ticket</button>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="st-kpi-grid">
        <KPI label="Open Tickets"  value={String(openCount)} sub={`${urgent} urgent`}  icon="🎫" color="#74B9FF" />
        <KPI label="In Progress"   value={String(inProg)}    sub="being handled"        icon="⚙️" color="#FDCB6E" />
        <KPI label="Resolved (7d)" value={String(resolved)}  sub="closed this week"     icon="✅" color="#00CBA4" />
        <KPI label="Avg Response"  value="18m"               sub="across all tickets"   icon="⚡" color="#6C5CE7" />
      </div>

      {/* MAIN GRID */}
      <div className={`st-main-grid ${selected ? "st-main-grid--split" : "st-main-grid--full"}`}>

        {/* TICKET LIST */}
        <div className="st-list-panel">
          <div className="st-filters">
            <div className="st-search-wrap">
              <span className="st-search-icon">🔍</span>
              <input className="st-search-input" value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search tickets…"
                autoComplete="off" />
            </div>

            {/* Status pills */}
            <div className="st-pills">
              {(["ALL","OPEN","IN_PROGRESS","WAITING","RESOLVED","CLOSED"] as const).map(s => (
                <button key={s} onClick={() => { setStatusF(s); setPage(1); }}
                  className={`st-pill ${statusF === s ? "st-pill--active" : ""}`}
                  style={statusF === s && s !== "ALL" ? {
                    background: `var(--st-status-${s === "IN_PROGRESS" ? "inprog" : s.toLowerCase()}-bg)`,
                    color:      `var(--st-status-${s === "IN_PROGRESS" ? "inprog" : s.toLowerCase()}-col)`,
                    borderColor:`var(--st-status-${s === "IN_PROGRESS" ? "inprog" : s.toLowerCase()}-col)`,
                  } : statusF === s ? { background:"var(--st-surf3)", color:"var(--st-accent2)", borderColor:"rgba(108,92,231,0.35)" } : {}}>
                  {s === "ALL" ? "All" : STATUS_META[s as TicketStatus]?.label ?? s}
                </button>
              ))}
            </div>

            {/* Priority pills */}
            <div className="st-priority-row">
              <span className="st-priority-label">Priority:</span>
              {(["ALL","URGENT","HIGH","MEDIUM","LOW"] as const).map(p => (
                <button key={p} onClick={() => { setPriorityF(p); setPage(1); }}
                  className={`st-pill ${priorityF === p ? "st-pill--active" : ""}`}
                  style={priorityF === p && p !== "ALL" ? {
                    background: `var(--st-pri-${p.toLowerCase()}-bg)`,
                    color:      `var(--st-pri-${p.toLowerCase()}-col)`,
                    borderColor:`var(--st-pri-${p.toLowerCase()}-col)`,
                  } : priorityF === p ? { background:"var(--st-surf3)", color:"var(--st-accent2)", borderColor:"rgba(108,92,231,0.35)" } : {}}>
                  {p === "ALL" ? "All" : PRIORITY_META[p as TicketPriority]?.label ?? p}
                </button>
              ))}
              <span className="st-filter-count">{filtered.length} ticket{filtered.length !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Rows */}
          <div className="st-list">
            {paginated.map(t => {
              const isActive = selected?.id === t.id;
              return (
                <div key={t.id}
                  className={`st-ticket-row ${isActive ? "st-ticket-row--active" : ""}`}
                  onClick={() => setSelected(isActive ? null : t)}>
                  <div className="st-ticket-row__top">
                    <div className="st-ticket-row__left">
                      <div className="st-company-logo" style={{ background: t.companyCol }}>{t.companyLogo}</div>
                      <div>
                        <div className="st-ticket-row__subject">{t.subject}</div>
                        <div className="st-ticket-row__meta">{t.company} · {t.user}</div>
                      </div>
                    </div>
                    <div className="st-ticket-row__right">
                      {t.unread > 0 && <span className="st-unread-dot">{t.unread}</span>}
                      <span className="st-ticket-row__time">{t.updated}</span>
                    </div>
                  </div>
                  <div className="st-ticket-row__badges">
                    <StatusBadge status={t.status} />
                    <PriorityBadge priority={t.priority} />
                    <span className="st-cat-chip">{CAT_ICON[t.category] ?? "📋"} {t.category}</span>
                    <span className="st-msg-count">💬 {t.messages.length}</span>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="st-empty">
                <div style={{ fontSize: 32, marginBottom: 10 }}>🎫</div>
                <div className="st-empty__title">No tickets found</div>
                <div className="st-empty__desc">Try adjusting your filters.</div>
              </div>
            )}
          </div>

          {filtered.length > 0 && (
            <Pager page={page} total={filtered.length} size={PAGE_SIZE}
              onChange={p => { setPage(p); setSelected(null); }} />
          )}
        </div>

        {/* CONVERSATION / EMPTY STATE */}
        {selected ? (
          <ConvPanel ticket={selected} onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange} onReply={handleReply} />
        ) : (
          <div className="st-conv-empty">
            <div className="st-conv-empty__icon">🎫</div>
            <div style={{ textAlign: "center" }}>
              <div className="st-conv-empty__title">Select a ticket</div>
              <div className="st-conv-empty__desc">Click any ticket from the list to view the conversation and reply.</div>
            </div>
            <div className="st-conv-empty__chips">
              <div className="st-conv-empty__chip">
                <span className="st-conv-empty__chip-dot" style={{ background: "var(--st-info)" }} />
                <span className="st-conv-empty__chip-text">{openCount} open</span>
              </div>
              <div className="st-conv-empty__chip">
                <span className="st-conv-empty__chip-dot" style={{ background: "var(--st-danger)" }} />
                <span className="st-conv-empty__chip-text">{urgent} urgent</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}