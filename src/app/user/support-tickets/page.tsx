"use client";

import { useEffect, useMemo, useState } from "react";
import "./support-tickets.css";
import { axiosInstance } from "@/lib/axiosInstance";
import Spinner from "@/components/ui/Spinner";
import {
  Ticket as TicketIcon,
  Clock,
  CheckCircle2,
  Zap,
  Search,
  Calendar,
  MessageSquare,
  Tag,
  ChevronDown,
  X,
  Check,
  Send,
  RefreshCw,
  AlertCircle,
  Eye,
} from "lucide-react";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "WAITING";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type MessageSender = "USER" | "ADMIN";

interface Message {
  id: string;
  sender: MessageSender;
  name: string;
  avatar: string;
  content: string;
  time: string;
  read: boolean;
}

interface Ticket {
  id: string;
  subject: string;
  company: string;
  companyLogo: string;
  companyCol: string;
  user: string;
  userEmail: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  created: string;
  updated: string;
  messages: Message[];
  unread: number;
}

interface ReplyActionResult {
  ok: boolean;
  warning?: string;
  error?: string;
}

const STATUS_META: Record<TicketStatus, { label: string; dot: string }> = {
  OPEN:        { label: "Open",        dot: "var(--st-status-open-col)" },
  IN_PROGRESS: { label: "In Progress", dot: "var(--st-status-inprog-col)" },
  WAITING:     { label: "Waiting",     dot: "var(--st-status-waiting-col)" },
  RESOLVED:    { label: "Resolved",    dot: "var(--st-status-resolved-col)" },
  CLOSED:      { label: "Closed",      dot: "var(--st-status-closed-col)" },
};

const STATUS_ORDER: Record<TicketStatus, number> = {
  OPEN: 1,
  IN_PROGRESS: 2,
  WAITING: 3,
  RESOLVED: 4,
  CLOSED: 5,
};

const PRIORITY_META: Record<TicketPriority, { label: string; icon: string }> = {
  LOW:    { label: "Low",    icon: "↓" },
  MEDIUM: { label: "Medium", icon: "→" },
  HIGH:   { label: "High",   icon: "↑" },
  URGENT: { label: "Urgent", icon: "⚠" },
};

const CAT_ICON: Record<string, string> = {
  Billing:      "💳",
  Technical:    "🔧",
  Account:      "👤",
  WhatsApp:     "💬",
  Subscription: "📦",
  Integration:  "🔌",
  Performance:  "⚡",
  Other:        "📋",
};

const AVATAR_COLORS: Record<string, string> = {
  SR: "#FDCB6E",
  AP: "#A29BFE",
  PS: "#00B894",
  JD: "#5ce7c7",
  TK: "#00CBA4",
  ML: "#FF6B6B",
  RK: "#E17055",
  LH: "#FD79A8",
  ST: "#5ce79d",
};

// Track segment colors
const TRACK_COLORS: Record<TicketStatus, string> = {
  OPEN:        "#34d399",
  IN_PROGRESS: "#FBBF24",
  WAITING:     "#FB923C",
  RESOLVED:    "#818CF8",
  CLOSED:      "#64748B",
};

const PAGE_SIZE = 8;

const safeMessages = (ticket: Ticket): Message[] =>
  Array.isArray(ticket.messages) ? ticket.messages : [];

// ─── Sub-components ─────────────────────────────────────────────────────────

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #206bc4, #4299e1)",
  "linear-gradient(135deg, #2fb344, #48bb78)",
  "linear-gradient(135deg, #f59f00, #ed8936)",
  "linear-gradient(135deg, #ae3ec9, #9f7aea)",
  "linear-gradient(135deg, #17a2b8, #38b2ac)",
];

const getAvatarBg = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

function KPI({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="st-kpi">
      <div className="st-kpi__left">
        <span className="st-kpi__icon" style={{ background: `${color}18`, color }}>
          {icon}
        </span>
        <div className="st-kpi__info">
          <div className="st-kpi__label">{label.toUpperCase()}</div>
          <div className="st-kpi__value">{value}</div>
          <div className="st-kpi__accent-bar" style={{ background: color }} />
        </div>
      </div>
      <span className="st-kpi__sub">
        {sub}
      </span>
    </div>
  );
}


function StatusBadge({ status }: { status: TicketStatus }) {
  const label =
    status === "IN_PROGRESS"
      ? "In Progress"
      : status === "WAITING"
      ? "On Hold"
      : status === "RESOLVED"
      ? "Resolved"
      : status === "CLOSED"
      ? "Closed"
      : "Open";

  return (
    <span className={`st-status-pill st-status-pill--${status.toLowerCase()}`}>
      {label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const meta = PRIORITY_META[priority] || { label: "Normal", icon: "" };
  return (
    <span className={`st-priority-badge st-priority-badge--${priority.toLowerCase()}`}>
      <span className="st-priority-badge__dot" />
      {meta.label}
    </span>
  );
}

function Ava({ init, size = 34, col }: { init: string; size?: number; col?: string }) {
  const bg = col ?? getAvatarBg(init);
  return (
    <div
      className="st-ava"
      style={{
        width: size,
        height: size,
        background: bg,
        fontSize: Math.max(10, Math.round(size * 0.36)),
        fontWeight: 700,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        flexShrink: 0,
      }}
    >
      {init}
    </div>
  );
}

function Pager({
  page,
  total,
  size,
  onChange,
}: {
  page: number;
  total: number;
  size: number;
  onChange: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / size));
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter(
    v => v === 1 || v === pages || Math.abs(v - page) <= 1
  );

  const withDots: (number | "…")[] = [];
  nums.forEach((v, i) => {
    if (i > 0 && v - nums[i - 1] > 1) withDots.push("…");
    withDots.push(v);
  });

  return (
    <div className="st-pager">
      <div className="st-pager__right">
        <button
          className="st-pager__text-btn"
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <div className="st-pager__nums">
          {withDots.map((v, i) =>
            v === "…" ? (
              <span key={`dots-${i}`} className="st-pager__dots">…</span>
            ) : (
              <button
                key={v}
                onClick={() => onChange(v as number)}
                className={`st-pager__btn ${page === v ? "st-pager__btn--active" : ""}`}
              >
                {String(v).padStart(2, "0")}
              </button>
            )
          )}
        </div>
        <button
          className="st-pager__text-btn"
          onClick={() => onChange(page + 1)}
          disabled={page === pages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function ConvPanel({
  ticket,
  onClose,
  onStatusChange,
  onReply,
}: {
  ticket: Ticket;
  onClose: () => void;
  onStatusChange: (id: string, status: TicketStatus) => Promise<void>;
  onReply: (id: string, text: string) => Promise<ReplyActionResult>;
}) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [feedback, setFeedback] = useState<null | {
    type: "success" | "warning" | "error";
    text: string;
  }>(null);

  const messages = safeMessages(ticket);

  useEffect(() => {
    setReply("");
    setShowStatus(false);
    setSending(false);
    setFeedback(null);
  }, [ticket.id]);

  const send = async () => {
    const text = reply.trim();
    if (!text || sending) return;
    setSending(true);
    setFeedback(null);
    const result = await onReply(ticket.id, text);
    setSending(false);
    if (!result.ok) {
      setFeedback({ type: "error", text: result.error ?? "Failed to send reply." });
      return;
    }
    setReply("");
    if (result.warning) {
      setFeedback({ type: "warning", text: result.warning });
      return;
    }
    setFeedback({ type: "success", text: "Reply sent successfully." });
    setTimeout(() => setFeedback(null), 2500);
  };

  const metaItems = [
    { label: "Created",  icon: <Calendar size={13} />, val: ticket.created },
    { label: "Updated",  icon: <Clock size={13} />,    val: ticket.updated },
    { label: "Messages", icon: <MessageSquare size={13} />, val: String(messages.length) },
  ];

  return (
    <div className="st-conv">
      {/* Header */}
      <div className="st-conv__header">
        <div className="st-conv__header-top">
          <div className="st-conv__header-left">
            <div className="st-conv__header-badges">
              <span className="st-conv__ticket-num" title={`#${ticket.id}`}>
                #{ticket.id.length > 10 ? ticket.id.slice(0, 8) : ticket.id}
              </span>
              <PriorityBadge priority={ticket.priority} />
            </div>
            <div className="st-conv__subject">{ticket.subject}</div>
            <div className="st-conv__meta-row">
              <div
                className="st-conv__company-logo"
                style={{ background: getAvatarBg(ticket.company || ticket.user || "C") }}
              >
                {ticket.companyLogo || (ticket.company ? ticket.company[0].toUpperCase() : "C")}
              </div>
              <span className="st-conv__meta-text">{ticket.company}</span>
              <span className="st-conv__meta-sep">·</span>
              <span className="st-conv__meta-text">{ticket.user}</span>
              {ticket.userEmail && (
                <>
                  <span className="st-conv__meta-sep">·</span>
                  <span className="st-conv__meta-text" style={{ opacity: 0.75 }}>{ticket.userEmail}</span>
                </>
              )}
              <span className="st-conv__meta-sep">·</span>
              <span className="st-conv__meta-text st-conv__meta-cat">
                <Tag size={12} />
                <span>{ticket.category}</span>
              </span>
            </div>
          </div>

          <div className="st-conv__header-right">
            {/* Status dropdown */}
            <div className="st-status-dd">
              <button
                type="button"
                className={`st-status-dd__trigger st-status-badge--${ticket.status}`}
                style={{ borderColor: `${STATUS_META[ticket.status].dot}35` }}
                onClick={() => setShowStatus(v => !v)}
              >
                <span
                  className="st-status-dd__trigger-dot"
                  style={{ background: STATUS_META[ticket.status].dot }}
                />
                <span>{STATUS_META[ticket.status].label}</span>
                <ChevronDown
                  size={13}
                  className={`st-status-dd__chevron ${showStatus ? "st-status-dd__chevron--open" : ""}`}
                />
              </button>

              {showStatus && (
                <div className="st-status-dd__menu">
                  {(Object.entries(STATUS_META) as [TicketStatus, { label: string; dot: string }][]).map(
                    ([key, meta]) => (
                      <button
                        key={key}
                        type="button"
                        className="st-status-dd__option"
                        style={{
                          background:  ticket.status === key ? `${meta.dot}14` : "transparent",
                          color:       ticket.status === key ? meta.dot : "var(--st-text-secondary)",
                          fontWeight:  ticket.status === key ? 700 : 400,
                        }}
                        onClick={() => { void onStatusChange(ticket.id, key); setShowStatus(false); }}
                      >
                        <span className="st-status-dd__option-dot" style={{ background: meta.dot }} />
                        <span>{meta.label}</span>
                        {ticket.status === key && <Check size={14} className="st-status-dd__check" />}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              className="st-btn-close"
              onClick={onClose}
              title="Close panel"
              aria-label="Close panel"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Meta strip */}
        <div className="st-conv__meta-strip">
          {metaItems.map(({ label, icon, val }) => (
            <div key={label} className="st-conv__meta-item">
              <span className="st-conv__meta-key">
                {icon}
                <span>{label}</span>
              </span>
              <span className="st-conv__meta-val">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="st-messages">
        {messages.length === 0 && (
          <div className="st-messages-empty">
            <div className="st-messages-empty__icon">
              <MessageSquare size={26} />
            </div>
            <div className="st-messages-empty__title">No messages yet</div>
            <div className="st-messages-empty__desc">
              Write a reply below to start the conversation with {ticket.user || "the customer"}.
            </div>
          </div>
        )}

        {messages.map((message, index) => {
          const isAdmin = message.sender === "ADMIN";
          const isFirst = index === 0 || messages[index - 1].sender !== message.sender;

          return (
            <div key={message.id} className={`st-msg ${isAdmin ? "st-msg--admin" : "st-msg--user"}`}>
              {isFirst ? (
                <Ava init={message.avatar} size={34} />
              ) : (
                <div className="st-msg__ava-spacer" />
              )}
              <div className="st-msg__body">
                {isFirst && (
                  <div className="st-msg__name-row">
                    <span className={isAdmin ? "st-msg__name-admin" : "st-msg__name-user"}>
                      {message.name}
                    </span>
                    {!message.read && !isAdmin && (
                      <span className="st-msg__unread-tag">UNREAD</span>
                    )}
                  </div>
                )}
                <div className={`st-msg__bubble ${isAdmin ? "st-msg__bubble--admin" : "st-msg__bubble--user"}`}>
                  <div className="st-msg__text">{message.content}</div>
                </div>
                <span className="st-msg__time">{message.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply / Closed footer */}
      {ticket.status !== "CLOSED" ? (
        <div className="st-reply">
          <div className="st-reply__label">Reply to {ticket.user}</div>
          <textarea
            className="st-reply__textarea"
            value={reply}
            onChange={e => setReply(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) void send(); }}
            placeholder="Write your reply… (Ctrl+Enter to send)"
            rows={1}
          />

          {feedback && (
            <div className={`st-reply__feedback st-reply__feedback--${feedback.type}`}>
              {feedback.type === "success" && <Check size={14} />}
              {feedback.type === "error" && <AlertCircle size={14} />}
              {feedback.type === "warning" && <AlertCircle size={14} />}
              <span>{feedback.text}</span>
            </div>
          )}

          <div className="st-reply__actions">
            <div className="st-reply__left">
              <button
                type="button"
                className="st-btn-resolve"
                onClick={() => void onStatusChange(ticket.id, "RESOLVED")}
              >
                <Check size={14} />
                <span>Mark Resolved</span>
              </button>
              <button
                type="button"
                className="st-btn-close-ticket"
                onClick={() => void onStatusChange(ticket.id, "CLOSED")}
              >
                <X size={14} />
                <span>Close Ticket</span>
              </button>
            </div>

            <button
              type="button"
              className={`st-btn-send ${reply.trim() ? "st-btn-send--active" : "st-btn-send--inactive"}`}
              onClick={() => void send()}
              disabled={sending || !reply.trim()}
            >
              {sending ? (
                <Spinner size="sm" text="Sending…" />
              ) : (
                <>
                  <Send size={13} />
                  <span>Send Reply</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="st-conv__closed-footer">
          <div className="st-conv__closed-text">This ticket has been closed.</div>
          <button
            type="button"
            className="st-btn-reopen"
            onClick={() => void onStatusChange(ticket.id, "OPEN")}
          >
            <RefreshCw size={13} />
            <span>Reopen Ticket</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function SupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState<"ALL" | TicketStatus>("ALL");
  const [page, setPage] = useState(1);


  const selected = useMemo(
    () => selectedId === null ? null : tickets.find(t => t.id === selectedId) ?? null,
    [selectedId, tickets]
  );

  useEffect(() => {
    if (!selected) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSelectedId(null); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  // ─ Super-admin ticket APIs ─
  //
  // GET  /v1/super-admin/tickets/forward
  // GET  /v1/super-admin/tickets/:ticketId/conversations
  // POST /v1/super-admin/tickets/:ticketId/forward/reply
  // PATCH /v1/super-admin/tickets/:ticketId/status

  const loadTickets = async () => {
    try {
      setApiError(null);

      // Fetch tickets and users in parallel to resolve real user names and emails
      const [ticketsResponse, usersResponse] = await Promise.allSettled([
        axiosInstance.get("/v1/super-admin/tickets/forward"),
        axiosInstance.get("/v1/super-admin/users", { params: { page: 1, limit: 100 } }),
      ]);

      const data = ticketsResponse.status === "fulfilled" ? ticketsResponse.value?.data : null;
      if (!data && ticketsResponse.status === "rejected") throw ticketsResponse.reason;

      const userMap = new Map<string, { name: string; email: string }>();
      if (usersResponse.status === "fulfilled") {
        const u = usersResponse.value?.data;
        const userList: any[] = u?.data?.data || u?.data?.items || u?.data?.users || u?.data || [];
        userList.forEach((usr: any) => {
          const id = usr.id || usr.user_id;
          const name = usr.name || usr.full_name || [usr.first_name, usr.last_name].filter(Boolean).join(" ");
          if (id && name) {
            userMap.set(String(id), { name, email: usr.email || "" });
            if (typeof window !== "undefined") {
              localStorage.setItem(`user_name_${id}`, name);
              if (usr.email) localStorage.setItem(`user_email_${id}`, usr.email);
            }
          }
        });
      }

      const ticketsData: any[] = Array.isArray(data?.data?.items) ? data.data.items : [];
      const sortedTickets = [...ticketsData].sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );

      const normalised: Ticket[] = sortedTickets.map((t: any) => {
        const uId = t.user_id ? String(t.user_id) : "";
        const matched = uId ? userMap.get(uId) : null;
        const cachedUser = typeof window !== "undefined"
          ? localStorage.getItem(`ticket_user_${t.id}`) || (uId ? localStorage.getItem(`user_name_${uId}`) : null)
          : null;
        const cachedEmail = typeof window !== "undefined" && uId ? localStorage.getItem(`user_email_${uId}`) : null;

        const user = t.user_name || t.user?.name || t.name || matched?.name || cachedUser || (uId ? `User ${uId.slice(0, 8)}` : "Unknown User");
        const userEmail = t.user_email || t.user?.email || t.email || matched?.email || cachedEmail || "";

        return {
          id: String(t.id),
          subject: t.subject || t.title || t.message || t.conversations?.[0]?.message || `Support Ticket #${String(t.id).slice(0, 8)}`,
          company: t.company_name || (t.company_id ? `Company ${String(t.company_id).slice(0, 8)}` : "Unknown Company"),
          companyLogo: "S",
          companyCol: "#10b981",
          user,
          userEmail,
          status: (t.status || "OPEN").toUpperCase() as TicketStatus,
          priority: "MEDIUM",
          category: t.category || "Support",
          created: t.created_at ? new Date(t.created_at).toLocaleDateString() : "-",
          updated: t.created_at ? new Date(t.created_at).toLocaleDateString() : "-",
          unread: 0,
          messages: [],
        };
      });

      setTickets(prev =>
        normalised.map(ticket => {
          const ex = prev.find(p => p.id === ticket.id);
          if (!ex) return ticket;
          return {
            ...ticket,
            messages: ex.messages || [],
            subject: ex.subject && !ex.subject.startsWith("Support Ticket #") ? ex.subject : ticket.subject,
            user: ex.user && !ex.user.startsWith("User ") && ex.user !== "Unknown User" ? ex.user : ticket.user,
            userEmail: ex.userEmail || ticket.userEmail,
          };
        })
      );
    } catch (error: any) {
      console.error("Failed to load super-admin tickets:", error);

      setApiError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to load support tickets."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTickets();
  }, [selectedId]);

  // Deselect if ticket disappears from the server response.
  useEffect(() => {
    if (selectedId !== null && !tickets.some(t => t.id === selectedId)) {
      setSelectedId(null);
    }
  }, [selectedId, tickets]);

  const filtered = useMemo(
    () => {
      const q = search.toLowerCase();

      return tickets
        .filter(t => {
          return (
            (statusF === "ALL" || t.status === statusF) &&
            (
              t.subject.toLowerCase().includes(q) ||
              t.company.toLowerCase().includes(q) ||
              t.user.toLowerCase().includes(q) ||
              t.userEmail.toLowerCase().includes(q) ||
              t.category.toLowerCase().includes(q) ||
              t.id.toLowerCase().includes(q)
            )
          );
        })
        .sort((a, b) => {
          const orderA = STATUS_ORDER[a.status] ?? 99;
          const orderB = STATUS_ORDER[b.status] ?? 99;
          return orderA - orderB;
        });
    },
    [tickets, search, statusF]
  );

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (page > maxPage) setPage(maxPage);
  }, [filtered.length, page]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  // ─ Load single ticket with full conversation ─
  const loadSingleTicket = async (ticketId: string) => {
    try {
      setApiError(null);

      const { data } = await axiosInstance.get(
        `/v1/super-admin/tickets/${ticketId}/conversations`
      );

      // API response:
      // {
      //   success: true,
      //   data: {
      //     ticket: {...},
      //     messages: [...]
      //   }
      // }
      const ticketData = data?.data?.ticket;
      const conversations = Array.isArray(data?.data?.messages)
        ? data.data.messages
        : [];

      if (!ticketData) {
        setApiError("Ticket details not found.");
        return;
      }

      const formattedMessages: Message[] = conversations.map(
        (msg: any, index: number) => {
          const name = msg.user_name || "User";
          const isAdmin = name === "Soft7 Tech";

          return {
            id: msg.id || String(index),
            sender: isAdmin ? "ADMIN" : "USER",
            name,
            avatar: name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),
            content: msg.message || "",
            time: msg.created_at
              ? new Date(msg.created_at).toLocaleString()
              : "-",
            read: true,
          };
        }
      );

      const firstMessage = conversations[0];
      const lastMessage = conversations[conversations.length - 1];

      const resolvedUserName =
        firstMessage?.user_name ||
        (ticketData.user_id && typeof window !== "undefined"
          ? localStorage.getItem(`user_name_${ticketData.user_id}`)
          : null) ||
        "Unknown User";

      if (firstMessage?.user_name && typeof window !== "undefined") {
        localStorage.setItem(`ticket_user_${ticketData.id || ticketId}`, firstMessage.user_name);
        if (ticketData.user_id) localStorage.setItem(`user_name_${ticketData.user_id}`, firstMessage.user_name);
      }

      const formattedTicket: Ticket = {
        id: String(ticketData.id || ticketId),
        subject: firstMessage?.message || `Support Ticket #${String(ticketData.id || ticketId).slice(0, 8)}`,
        company: ticketData.company_id ? `Company ${String(ticketData.company_id).slice(0, 8)}` : "Unknown Company",
        companyLogo: "S",
        companyCol: "#10b981",
        user: resolvedUserName,
        userEmail: "",
        status: (ticketData.status || "OPEN").toUpperCase() as TicketStatus,
        priority: "MEDIUM",
        category: "Support",
        created: ticketData.created_at ? new Date(ticketData.created_at).toLocaleDateString() : "-",
        updated: (lastMessage?.created_at || ticketData.created_at)
          ? new Date(lastMessage?.created_at || ticketData.created_at).toLocaleDateString()
          : "-",
        unread: 0,
        messages: formattedMessages,
      };

      setSelectedId(formattedTicket.id);

      setTickets(prev => {
        const existing = prev.find(t => t.id === formattedTicket.id);
        const mergedTicket: Ticket = {
          ...formattedTicket,
          userEmail: existing?.userEmail || formattedTicket.userEmail,
        };
        return existing
          ? prev.map(t => (t.id === formattedTicket.id ? mergedTicket : t))
          : [...prev, mergedTicket];
      });
    } catch (error: any) {
      console.error("Failed to load ticket conversation:", error);
      setApiError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to load ticket details."
      );
    }
  };

  const handleStatusChange = async (id: string, status: TicketStatus) => {
    setApiError(null);

    try {
      await axiosInstance.patch(`/v1/super-admin/tickets/${id}/status`, {
        status: status.toLowerCase(),
      });
      await loadTickets();
      if (selectedId === id) {
        await loadSingleTicket(id);
      }
    } catch (error: any) {
      console.error("Status update failed:", error);
      setApiError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to update ticket status."
      );
    }
  };

  const handleReply = async (
    id: string,
    text: string
  ): Promise<ReplyActionResult> => {
    setApiError(null);

    try {
      const { data } = await axiosInstance.post(
        `/v1/super-admin/tickets/${id}/forward/reply`,
        { message: text }
      );

      const responseMessage = data?.data;
      const newMessage: Message = {
        id: responseMessage?.id || Date.now().toString(),
        sender: "ADMIN",
        name: "Soft7 Tech",
        avatar: "ST",
        content: responseMessage?.message || text,
        time: responseMessage?.created_at
          ? new Date(responseMessage.created_at).toLocaleString()
          : new Date().toLocaleString(),
        read: true,
      };

      setTickets(prev =>
        prev.map(t =>
          t.id === id
            ? {
                ...t,
                updated: new Date(responseMessage?.created_at || Date.now()).toLocaleDateString(),
                messages: [...(t.messages || []), newMessage],
              }
            : t
        )
      );

      return { ok: true };
    } catch (error: any) {
      console.error("Reply API failed:", error);
      return {
        ok: false,
        error:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Unable to send reply right now.",
      };
    }
  };


  // ─ Derived counts ─
  const openCount  = tickets.filter(t => t.status === "OPEN").length;
  const inProgress = tickets.filter(t => t.status === "IN_PROGRESS").length;
  const resolved   = tickets.filter(t => t.status === "RESOLVED").length;
  const urgent     = tickets.filter(t => t.priority === "URGENT").length;
  const totalUnread = tickets.reduce((acc, t) => acc + (typeof t.unread === "number" ? t.unread : 0), 0);

  return (
    <div className="st-root">
      {loading && (
        <div style={{ padding: "80px 0" }}>
          <Spinner
            variant="center"
            size="lg"
            color="primary"
            text="Loading support tickets…"
          />
        </div>
      )}

      {!loading && (
        <>
          {/* Header */}
          <div className="st-header">
            <div>
              <h1 className="st-header__title">Support Tickets</h1>
              <p className="st-header__sub">Manage and respond to customer support requests.</p>
            </div>
            <div className="st-header__actions">
              {totalUnread > 0 && (
                <div className="st-unread-banner">
                  <span className="st-unread-banner__dot" />
                  <span className="st-unread-banner__text">{totalUnread} unread</span>
                </div>
              )}
            </div>
          </div>

          {apiError && <div className="st-page-alert">{apiError}</div>}

          {/* KPI grid */}
          <div className="st-kpi-grid">
            <KPI label="Open Tickets"   value={String(openCount)}  sub={`${urgent} urgent`}        icon={<TicketIcon size={20} />}    color="#4299e1" />
            <KPI label="In Progress"    value={String(inProgress)} sub="being handled"              icon={<Clock size={20} />}         color="#f59f00" />
            <KPI label="Resolved (7d)"  value={String(resolved)}   sub="closed this week"           icon={<CheckCircle2 size={20} />}  color="#2fb344" />
            <KPI label="Avg Response"   value="18m"                sub="across all tickets"         icon={<Zap size={20} />}           color="#206bc4" />
          </div>

          {/* Main grid */}
          <div className="st-main-grid st-main-grid--full">

            {/* List panel */}
           <div className="st-list-panel">
              <div className="st-filters st-filters-row">
                {/* Search */}
                <div className="st-search-wrap">
                  <span className="st-search-icon"><Search size={15} /></span>
                  <input
                    className="st-search-input"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search by subject, user, or email…"
                  />
                </div>

                {/* Status Segmented Tab Switcher */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div className="st-tab-switcher">
                    {(["ALL", "OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"] as const).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => { setStatusF(s); setPage(1); }}
                        className={`st-tab-btn ${statusF === s ? "st-tab-btn--active" : ""}`}
                      >
                        {s === "ALL" ? "All" : STATUS_META[s]?.label}
                      </button>
                    ))}
                  </div>

                  {/* Count */}
                  <div className="st-count-group">
                    <span className="st-filter-count">
                      {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reference Table matching screenshot (desktop) */}
              <div className="st-table-wrapper crm-desktop-table">
                <table className="st-table">
                  <thead>
                    <tr>
                      <th style={{ width: "260px" }}>Name</th>
                      <th style={{ width: "260px" }}>Email</th>
                      <th style={{ width: "140px", textAlign: "center" }}>Status</th>
                      <th style={{ width: "130px" }}>Priority</th>
                      <th style={{ width: "160px" }}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map(ticket => {
                      const isActive = selected?.id === ticket.id;
                      const priorityDisplay =
                        PRIORITY_META[ticket.priority]?.label ??
                        (ticket.priority === "MEDIUM"
                          ? "Normal"
                          : ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase());

                      const nameInitial =
                        (ticket.user?.replace(/^User\s+/, "") || ticket.user || "U")
                          .trim()
                          .charAt(0)
                          .toUpperCase() || "U";

                      return (
                        <tr
                          key={ticket.id}
                          className={`st-table-row ${isActive ? "st-table-row--active" : ""}`}
                        >
                          <td className="st-td-name">
                            <button
                              type="button"
                              className="st-td-user-btn"
                              onClick={() => void loadSingleTicket(ticket.id)}
                              title={`Open chat with ${ticket.user}`}
                            >
                              <div
                                className="st-company-logo"
                                style={{ background: getAvatarBg(ticket.user || "User") }}
                              >
                                {nameInitial}
                              </div>
                              <span className="st-td-user-name">
                                {ticket.user}
                              </span>
                            </button>
                          </td>
                          <td className="st-td-email">{ticket.userEmail || "—"}</td>
                          <td className="st-td-status" style={{ textAlign: "center" }}>
                            <StatusBadge status={ticket.status} />
                          </td>
                          <td className="st-td-priority">
                            <span className={`st-pri-text st-pri-text--${ticket.priority.toLowerCase()}`}>
                              {priorityDisplay}
                            </span>
                          </td>
                          <td className="st-td-created">{ticket.created}</td>
                        </tr>
                      );
                    })}

                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="st-table-empty">
                          <Search size={36} color="var(--st-muted)" style={{ opacity: 0.5, marginBottom: 8 }} />
                          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--st-title)" }}>No tickets found</div>
                          <div style={{ fontSize: 13, color: "var(--st-muted)" }}>Try adjusting your filters or search term.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards (<= 768px) using the shared global crm-card system */}
              <div className="crm-mobile-cards">
                {paginated.map(ticket => {
                  const priorityDisplay =
                    PRIORITY_META[ticket.priority]?.label ??
                    (ticket.priority === "MEDIUM"
                      ? "Normal"
                      : ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase());

                  const nameInitial =
                    (ticket.user?.replace(/^User\s+/, "") || ticket.user || "U")
                      .trim()
                      .charAt(0)
                      .toUpperCase() || "U";

                  const priorityColor =
                    ticket.priority === "URGENT"
                      ? { bg: "rgba(214, 57, 57, 0.15)", col: "var(--danger)" }
                      : ticket.priority === "HIGH"
                      ? { bg: "rgba(245, 159, 0, 0.15)", col: "var(--warn)" }
                      : ticket.priority === "MEDIUM"
                      ? { bg: "rgba(32, 107, 196, 0.15)", col: "var(--accent)" }
                      : { bg: "rgba(100, 116, 139, 0.15)", col: "var(--muted)" };

                  return (
                    <div
                      key={ticket.id}
                      className="crm-card"
                      onClick={() => void loadSingleTicket(ticket.id)}
                    >
                      {/* Header row: Avatar, Name & Email, Status Badge */}
                      <div className="crm-card__header">
                        <div className="crm-card__identity">
                          <div
                            className="crm-card__avatar"
                            style={{ background: getAvatarBg(ticket.user || "User") }}
                          >
                            {nameInitial}
                          </div>
                          <div className="crm-card__text">
                            <span className="crm-card__title">{ticket.user}</span>
                            <span className="crm-card__sub">{ticket.userEmail || "—"}</span>
                          </div>
                        </div>
                        <div className="crm-card__badge">
                          <StatusBadge status={ticket.status} />
                        </div>
                      </div>

                      {/* Meta details: Ticket, Priority, Created, Subject */}
                      <div className="crm-card__details">
                        <div className="crm-card__detail-row">
                          <span className="crm-card__detail-label">Ticket ID</span>
                          <span className="crm-card__detail-val" style={{ fontFamily: "monospace", fontSize: "11px" }}>
                            #{ticket.id.slice(0, 8)}
                          </span>
                        </div>

                        <div className="crm-card__detail-row">
                          <span className="crm-card__detail-label">Priority</span>
                          <span
                            className="au-chip"
                            style={{
                              background: priorityColor.bg,
                              color: priorityColor.col,
                              fontSize: "11px",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              fontWeight: 600,
                            }}
                          >
                            {priorityDisplay}
                          </span>
                        </div>

                        <div className="crm-card__detail-row">
                          <span className="crm-card__detail-label">Created</span>
                          <span className="crm-card__detail-val">{ticket.created}</span>
                        </div>

                        <div className="crm-card__detail-row">
                          <span className="crm-card__detail-label">Subject</span>
                          <span className="crm-card__detail-val" title={ticket.subject}>
                            {ticket.subject && ticket.subject.toLowerCase() !== ticket.user?.toLowerCase()
                              ? ticket.subject
                              : "Support Inquiry"}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Actions Toolbar */}
                      <div className="crm-card__actions" style={{ gridTemplateColumns: "1fr" }}>
                        <button
                          type="button"
                          className="crm-card__action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            void loadSingleTicket(ticket.id);
                          }}
                        >
                          <Eye size={15} />
                          <span>View Ticket & Chat</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filtered.length === 0 && (
                  <div className="crm-card--empty">
                    No tickets found matching your filters.
                  </div>
                )}
              </div>

              {filtered.length > 0 && (
                <Pager page={page} total={filtered.length} size={PAGE_SIZE} onChange={p => setPage(p)} />
              )}
            </div>

            {/* Conversation panel or empty state */}
            {selected ? (
  <>
    <div
      className="st-conv-overlay"
      onClick={() => setSelectedId(null)}
    />

    <div
      className="st-conv-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`Ticket ${selected.id} details`}
    >
      <ConvPanel
        ticket={selected}
        onClose={() => setSelectedId(null)}
        onStatusChange={handleStatusChange}
        onReply={handleReply}
      />
    </div>
  </>
) : null}
          </div>
        </>
      )}
    </div>
  );
}