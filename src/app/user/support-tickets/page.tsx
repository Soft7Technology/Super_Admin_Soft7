"use client";

import { useEffect, useMemo, useState } from "react";
import "./support-tickets.css";

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
  OPEN: { label: "Open", dot: "var(--st-status-open-col)" },
  IN_PROGRESS: { label: "In Progress", dot: "var(--st-status-inprog-col)" },
  RESOLVED: { label: "Resolved", dot: "var(--st-status-resolved-col)" },
  CLOSED: { label: "Closed", dot: "var(--st-status-closed-col)" },
  WAITING: { label: "Waiting", dot: "var(--st-status-waiting-col)" },
};

const PRIORITY_META: Record<TicketPriority, { label: string; icon: string }> = {
  LOW: { label: "Low", icon: "↓" },
  MEDIUM: { label: "Medium", icon: "→" },
  HIGH: { label: "High", icon: "↑" },
  URGENT: { label: "Urgent", icon: "⚠" },
};

const CAT_ICON: Record<string, string> = {
  Billing: "💳",
  Technical: "🔧",
  Account: "👤",
  WhatsApp: "💬",
  Subscription: "📦",
  Integration: "🔌",
  Performance: "⚡",
  Other: "📋",
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

const PAGE_SIZE = 8;

const getExternalHeaders = () => {
  let token =
    typeof window !== "undefined"
      ? localStorage.getItem("console_access_token")
      : null;

  if (token && token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
  }

  return {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Always returns a safe array, even if the server omits the field. */
const safeMessages = (ticket: Ticket): Message[] =>
  Array.isArray(ticket.messages) ? ticket.messages : [];

// ─── Sub-components ─────────────────────────────────────────────────────────

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
  icon: string;
  color: string;
}) {
  return (
    <div className="st-kpi">
      <div className="st-kpi__orb" style={{ background: `${color}0D` }} />
      <div className="st-kpi__top">
        <span className="st-kpi__label">{label}</span>
        <div className="st-kpi__icon" style={{ background: `${color}18` }}>
          {icon}
        </div>
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
  const meta = PRIORITY_META[priority];
  return (
    <span className={`st-priority-badge st-priority-badge--${priority}`}>
      {meta.icon} {meta.label}
    </span>
  );
}

function Ava({
  init,
  size = 32,
  col,
}: {
  init: string;
  size?: number;
  col?: string;
}) {
  const bg = col ?? AVATAR_COLORS[init] ?? "#6C5CE7";
  return (
    <div
      className="st-ava"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.31 }}
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
    (v) => v === 1 || v === pages || Math.abs(v - page) <= 1
  );

  const withDots: (number | "…")[] = [];
  nums.forEach((v, i) => {
    if (i > 0 && v - nums[i - 1] > 1) withDots.push("…");
    withDots.push(v);
  });

  const from = total === 0 ? 0 : (page - 1) * size + 1;
  const to = Math.min(page * size, total);

  return (
    <div className="st-pager">
      <span className="st-pager__info">
        {from}–{to} of {total}
      </span>
      <div className="st-pager__btns">
        <button className="st-pager__btn" onClick={() => onChange(1)} disabled={page === 1}>
          «
        </button>
        <button className="st-pager__btn" onClick={() => onChange(page - 1)} disabled={page === 1}>
          ‹
        </button>
        {withDots.map((v, i) =>
          v === "…" ? (
            <span key={`dots-${i}`} className="st-pager__dots">
              …
            </span>
          ) : (
            <button
              key={v}
              onClick={() => onChange(v as number)}
              className={`st-pager__btn ${page === v ? "st-pager__btn--active" : ""}`}
            >
              {v}
            </button>
          )
        )}
        <button className="st-pager__btn" onClick={() => onChange(page + 1)} disabled={page === pages}>
          ›
        </button>
        <button className="st-pager__btn" onClick={() => onChange(pages)} disabled={page === pages}>
          »
        </button>
      </div>
      <span className="st-pager__info">
        p{page}/{pages}
      </span>
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

  // ✅ Always use the safe accessor inside this component
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

  return (
    <div className="st-conv">
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
              <div
                className="st-conv__company-logo"
                style={{ background: ticket.companyCol }}
              >
                {ticket.companyLogo}
              </div>
              <span className="st-conv__meta-text">{ticket.company}</span>
              <span className="st-conv__meta-sep">·</span>
              <span className="st-conv__meta-text">{ticket.user}</span>
              <span className="st-conv__meta-sep">·</span>
              <span className="st-conv__meta-text">
                {CAT_ICON[ticket.category] ?? "📋"} {ticket.category}
              </span>
            </div>
          </div>

          <div className="st-conv__header-right">
            <div className="st-status-dd">
              <button
                className={`st-status-dd__trigger st-status-badge--${ticket.status}`}
                style={{ borderColor: `${STATUS_META[ticket.status].dot}35` }}
                onClick={() => setShowStatus((v) => !v)}
              >
                <span
                  className="st-status-dd__trigger-dot"
                  style={{ background: STATUS_META[ticket.status].dot }}
                />
                {STATUS_META[ticket.status].label} ▾
              </button>

              {showStatus && (
                <div className="st-status-dd__menu">
                  {(
                    Object.entries(STATUS_META) as [
                      TicketStatus,
                      { label: string; dot: string }
                    ][]
                  ).map(([key, meta]) => (
                    <button
                      key={key}
                      className="st-status-dd__option"
                      style={{
                        background:
                          ticket.status === key
                            ? `${meta.dot}12`
                            : "transparent",
                        color:
                          ticket.status === key
                            ? meta.dot
                            : "var(--st-muted)",
                        fontWeight: ticket.status === key ? 700 : 400,
                      }}
                      onClick={() => {
                        void onStatusChange(ticket.id, key);
                        setShowStatus(false);
                      }}
                    >
                      <span
                        className="st-status-dd__option-dot"
                        style={{ background: meta.dot }}
                      />
                      {meta.label}
                      {ticket.status === key && (
                        <span className="st-status-dd__check">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="st-btn-close" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className="st-conv__meta-strip">
          {[
            "🗓 Created",
            ticket.created,
            "🕐 Updated",
            ticket.updated,
            // ✅ Use the safe local variable
            "💬 Messages",
            String(messages.length),
          ]
            .reduce<string[][]>((acc, v, i, arr) => {
              if (i % 2 === 0) acc.push([v, arr[i + 1]]);
              return acc;
            }, [])
            .map(([label, value]) => (
              <div key={label} style={{ display: "flex", gap: 5 }}>
                <span className="st-conv__meta-key">{label}:</span>
                <span className="st-conv__meta-val">{value}</span>
              </div>
            ))}
        </div>
      </div>

      {/* ✅ Map over the safe local variable, not ticket.messages */}
      <div className="st-messages">
        {messages.length === 0 && (
          <div
            style={{
              padding: "32px 0",
              textAlign: "center",
              color: "var(--st-muted)",
              fontSize: 14,
            }}
          >
            No messages yet.
          </div>
        )}

        {messages.map((message, index) => {
          const isAdmin = message.sender === "ADMIN";
          const isFirst =
            index === 0 || messages[index - 1].sender !== message.sender;

          return (
            <div
              key={message.id}
              className={`st-msg ${isAdmin ? "st-msg--admin" : "st-msg--user"}`}
            >
              {isFirst ? (
                <Ava init={message.avatar} size={30} />
              ) : (
                <div className="st-msg__ava-spacer" />
              )}
              <div className="st-msg__body">
                {isFirst && (
                  <div className="st-msg__name-row">
                    <span
                      className={
                        isAdmin ? "st-msg__name-admin" : "st-msg__name-user"
                      }
                    >
                      {message.name}
                    </span>
                    {!message.read && !isAdmin && (
                      <span className="st-msg__unread-tag">UNREAD</span>
                    )}
                  </div>
                )}
                <div
                  className={`st-msg__bubble ${
                    isAdmin
                      ? "st-msg__bubble--admin"
                      : "st-msg__bubble--user"
                  }`}
                >
                  <div className="st-msg__text">{message.content}</div>
                </div>
                <span className="st-msg__time">{message.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      {ticket.status !== "CLOSED" ? (
        <div className="st-reply">
          <textarea
            className="st-reply__textarea"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) void send();
            }}
            placeholder="Type your reply… (Ctrl+Enter to send)"
            rows={3}
          />

          {feedback && (
            <div
              className={`st-reply__feedback st-reply__feedback--${feedback.type}`}
            >
              {feedback.text}
            </div>
          )}

          <div className="st-reply__actions">
            <div className="st-reply__left">
              <button
                className="st-btn-resolve"
                onClick={() => void onStatusChange(ticket.id, "RESOLVED")}
              >
                ✓ Resolve
              </button>
              <button
                className="st-btn-close-ticket"
                onClick={() => void onStatusChange(ticket.id, "CLOSED")}
              >
                ✕ Close
              </button>
            </div>

            <button
              className={`st-btn-send ${
                reply.trim() ? "st-btn-send--active" : "st-btn-send--inactive"
              }`}
              onClick={() => void send()}
              disabled={sending || !reply.trim()}
            >
              {sending ? (
                <>
                  <span className="st-btn-send__spinner" /> Sending...
                </>
              ) : (
                <>Send Reply ›</>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="st-conv__closed-footer">
          <div className="st-conv__closed-text">This ticket is closed.</div>
          <button
            className="st-btn-reopen"
            onClick={() => void onStatusChange(ticket.id, "OPEN")}
          >
            ↺ Reopen Ticket
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
  const [priorityF, setPriorityF] = useState<"ALL" | TicketPriority>("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;

    const loadTickets = async () => {
      setLoading(true);
      setApiError(null);

      try {
        const response = await fetch(
          "https://hostapi.soft7.in/v1/admin/support/tickets/forward",
          {
            method: "GET",
            headers: getExternalHeaders(),
            cache: "no-store",
          }
        );

        const data = await response.json();
        console.log("Forward Tickets API Response:", data);

        if (!active) return;

        if (!response.ok) {
          setApiError(data?.message || "Failed to load support tickets.");
          setTickets([]);
          return;
        }

        const ticketsData = data?.data ?? data?.tickets ?? [];

       const normalised: Ticket[] = (
  Array.isArray(ticketsData) ? ticketsData : []
).map((t: any) => ({
  id:String(t.id),

  subject: t.message || "Support Ticket",

  company: "Soft7 User",

  companyLogo: "S",

  companyCol: "#10b981",

  user: t.name || "Unknown User",

  userEmail: t.email || "",

  status: ((t.status || "OPEN").toUpperCase() as TicketStatus),

  priority: "MEDIUM",

  category: "Support",

  created: new Date(t.created_at).toLocaleDateString(),

  updated: new Date(t.updated_at).toLocaleDateString(),

  unread: 0,

  messages: [
    {
      id: "1",
      sender: "USER",
      name: t.name || "User",
      avatar: (t.name || "U")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),

      content: t.message || "",

      time: new Date(t.created_at).toLocaleTimeString(),

      read: true,
    },
  ],
}));

        setTickets(normalised);
      } catch (error) {
        console.log("Forward API Error:", error);
        if (!active) return;
        setApiError("Unable to load support tickets right now.");
        setTickets([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadTickets();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (
      selectedId !== null &&
      !tickets.some((t) => t.id === selectedId)
    ) {
      setSelectedId(null);
    }
  }, [selectedId, tickets]);

  const selected = useMemo(
    () =>
      selectedId === null
        ? null
        : tickets.find((t) => t.id === selectedId) ?? null,
    [selectedId, tickets]
  );

  const filtered = useMemo(
    () =>
      tickets.filter((t) => {
        const q = search.toLowerCase();
        const matchesStatus = statusF === "ALL" || t.status === statusF;
        const matchesPriority = priorityF === "ALL" || t.priority === priorityF;
        const matchesSearch =
          (t.subject ?? "").toLowerCase().includes(q) ||
          (t.company ?? "").toLowerCase().includes(q) ||
          (t.user ?? "").toLowerCase().includes(q) ||
          (t.userEmail ?? "").toLowerCase().includes(q) ||
          (t.category ?? "").toLowerCase().includes(q);
        return matchesStatus && matchesPriority && matchesSearch;
      }),
    [tickets, search, statusF, priorityF]
  );

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (page > maxPage) setPage(maxPage);
  }, [filtered.length, page]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

 const loadSingleTicket = async (ticketId: string) => {
  try {
    setApiError(null);

    const response = await fetch(
      `https://hostapi.soft7.in/v1/admin/support/${ticketId}/forward`,
      {
        method: "GET",
        headers: getExternalHeaders(),
        cache: "no-store",
      }
    );

    const data = await response.json();

    console.log("Single Ticket Response:", data);

    if (!response.ok) {
      setApiError(data?.message || "Failed to load ticket.");
      return;
    }
const conversations = Array.isArray(data?.data)
  ? data.data
  : [];

if (conversations.length === 0) {
  setApiError("No conversation found.");
  return;
}

const firstMessage = conversations[0];

const formattedMessages: Message[] = conversations.map(
  (msg: any, index: number) => ({
    id: msg.id || String(index),

    sender:
      msg.user_name === "Soft7 Tech"
        ? "ADMIN"
        : "USER",

    name: msg.user_name || "User",

    avatar: (msg.user_name || "U")
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),

    content: msg.message || "",

    time: new Date(
      msg.created_at
    ).toLocaleString(),

    read: true,
  })
);

const formattedTicket: Ticket = {
  id: firstMessage.ticket_id,

  subject:
    firstMessage.message || "Support Ticket",

  company: "Soft7 User",

  companyLogo: "S",

  companyCol: "#10b981",

  user:
    firstMessage.user_name ||
    "Unknown User",

  userEmail:
    firstMessage.user_email || "",

  status: "OPEN",

  priority: "MEDIUM",

  category: "Support",

  created: new Date(
    firstMessage.created_at
  ).toLocaleDateString(),

  updated: new Date(
    conversations[
      conversations.length - 1
    ].created_at
  ).toLocaleDateString(),

  unread: 0,

  messages: formattedMessages,
};

setSelectedId(formattedTicket.id);

setTickets((prev) =>
  prev.map((ticket) =>
    ticket.id === formattedTicket.id
      ? formattedTicket
      : ticket
  )
);
    
 
   
  } catch (error) {
    console.log("Single Ticket Error:", error);

    setApiError("Failed to load ticket details.");
  }
};
const applyServerTicket = (updatedTicket: Ticket) => {
  setTickets((prev) =>
    prev.map((ticket) =>
      ticket.id === updatedTicket.id
        ? updatedTicket
        : ticket
    )
  );
};
  const handleStatusChange = async (id: string, status: TicketStatus) => {
    setApiError(null);
    try {
      const response = await fetch("/api/admin/support-tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: id, status }),
      });
      const payload = (await response.json().catch(() => null)) as {
        ticket?: Ticket;
        error?: string;
      } | null;

      if (!response.ok || !payload?.ticket) {
        throw new Error(payload?.error ?? "Failed to update ticket status.");
      }
      applyServerTicket(payload.ticket);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to update ticket status."
      );
    }
  };

 const handleReply = async (
  id: string,
  text: string
): Promise<ReplyActionResult> => {
  setApiError(null);

  try {
    const selectedTicket = tickets.find(
      (t) => t.id === id
    );

    const response = await fetch(
      `https://hostapi.soft7.in/v1/admin/support/${id}/forward/reply`,
      {
        method: "POST",

        headers: getExternalHeaders(),

        body: JSON.stringify({
          message: text,
          email: selectedTicket?.userEmail || "",
          phone: "9372597458",
        }),
      }
    );

    const data = await response.json();

    console.log("Reply API Response:", data);

    if (!response.ok) {
      return {
        ok: false,
        error:
          data?.message ||
          "Failed to send reply.",
      };
    }

    const newMessage: Message = {
      id: Date.now().toString(),

      sender: "ADMIN",

      name: "Soft7 Tech",

      avatar: "ST",

      content: text,

      time: new Date().toLocaleString(),

      read: true,
    };

    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === id
          ? {
              ...ticket,
              updated:
                new Date().toLocaleDateString(),

              messages: [
                ...(ticket.messages || []),
                newMessage,
              ],
            }
          : ticket
      )
    );

    return { ok: true };
  } catch (error) {
    console.log("Reply API Error:", error);

    return {
      ok: false,
      error:
        "Unable to send reply right now.",
    };
  }
};
  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolved = tickets.filter((t) => t.status === "RESOLVED").length;
  const urgent = tickets.filter((t) => t.priority === "URGENT").length;
  // ✅ Guard against undefined unread field
  const totalUnread = tickets.reduce(
    (acc, t) => acc + (typeof t.unread === "number" ? t.unread : 0),
    0
  );

  return (
    <div className="st-root">
      {loading && (
        <div
          style={{
            padding: "60px 0",
            textAlign: "center",
            color: "var(--st-muted, #888)",
            fontSize: 16,
          }}
        >
          Loading tickets...
        </div>
      )}

      {!loading && (
        <>
          <div className="st-header">
            <div>
              <h1 className="st-header__title">Support Tickets</h1>
              <p className="st-header__sub">
                Manage and respond to all customer support requests.
              </p>
            </div>
            <div className="st-header__actions">
              {totalUnread > 0 && (
                <div className="st-unread-banner">
                  <span className="st-unread-banner__dot" />
                  <span className="st-unread-banner__text">
                    {totalUnread} unread
                  </span>
                </div>
              )}
              <button className="st-btn-new"> New Ticket</button>
            </div>
          </div>

          {apiError && <div className="st-page-alert">{apiError}</div>}

          <div className="st-kpi-grid">
            <KPI
              label="Open Tickets"
              value={String(openCount)}
              sub={`${urgent} urgent`}
              icon="🎫"
              color="#74ff76"
            />
            <KPI
              label="In Progress"
              value={String(inProgress)}
              sub="being handled"
              icon="⚙️"
              color="#FDCB6E"
            />
            <KPI
              label="Resolved (7d)"
              value={String(resolved)}
              sub="closed this week"
              icon="✅"
              color="#00CBA4"
            />
            <KPI
              label="Avg Response"
              value="18m"
              sub="across all tickets"
              icon="⚡"
              color="#41c993"
            />
          </div>

          <div
            className={`st-main-grid ${
              selected ? "st-main-grid--split" : "st-main-grid--full"
            }`}
          >
            <div
              className={`st-list-panel ${
                selected ? "st-list-panel--selection-open" : ""
              }`}
            >
              <div className="st-filters st-filters-row">
                {/* Search */}
                <div className="st-search-wrap">
                  <span className="st-search-icon">🔍</span>
                  <input
                    className="st-search-input"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search tickets..."
                  />
                </div>

                {/* Status */}
                <div className="st-group st-status-group">
                  {(
                    [
                      "ALL",
                      "OPEN",
                      "IN_PROGRESS",
                      "WAITING",
                      "RESOLVED",
                      "CLOSED",
                    ] as const
                  ).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusF(status);
                        setPage(1);
                      }}
                      className={`st-pill ${
                        statusF === status ? "st-pill--active" : ""
                      }`}
                      style={
                        statusF === status && status !== "ALL"
                          ? {
                              background: `var(--st-status-${
                                status === "IN_PROGRESS"
                                  ? "inprog"
                                  : status.toLowerCase()
                              }-bg)`,
                              color: `var(--st-status-${
                                status === "IN_PROGRESS"
                                  ? "inprog"
                                  : status.toLowerCase()
                              }-col)`,
                              borderColor: `var(--st-status-${
                                status === "IN_PROGRESS"
                                  ? "inprog"
                                  : status.toLowerCase()
                              }-col)`,
                            }
                          : statusF === status
                          ? {
                              background: "var(--st-surf3)",
                              color: "#10b981",
                              borderColor: "rgba(16,185,129,0.35)",
                            }
                          : {}
                      }
                    >
                      {status === "ALL" ? "All" : STATUS_META[status]?.label}
                    </button>
                  ))}
                </div>

                {/* Priority */}
                <div className="st-group st-priority-group">
                  <span className="st-priority-label">Priority:</span>
                  {(["ALL", "URGENT", "HIGH", "MEDIUM", "LOW"] as const).map(
                    (priority) => (
                      <button
                        key={priority}
                        onClick={() => {
                          setPriorityF(priority);
                          setPage(1);
                        }}
                        className={`st-pill ${
                          priorityF === priority ? "st-pill--active" : ""
                        }`}
                        style={
                          priorityF === priority && priority !== "ALL"
                            ? {
                                background: `var(--st-pri-${priority.toLowerCase()}-bg)`,
                                color: `var(--st-pri-${priority.toLowerCase()}-col)`,
                                borderColor: `var(--st-pri-${priority.toLowerCase()}-col)`,
                              }
                            : priorityF === priority
                            ? {
                                background: "var(--st-surf3)",
                                color: "var(--st-accent2)",
                                borderColor: "rgba(108,92,231,0.35)",
                              }
                            : {}
                        }
                      >
                        {priority === "ALL"
                          ? "All"
                          : PRIORITY_META[priority]?.label}
                      </button>
                    )
                  )}
                </div>

                {/* Count */}
                <div className="st-count-group">
                  <span className="st-filter-count">
                    {filtered.length} ticket
                    {filtered.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="st-list">
                {paginated.map((ticket) => {
                  const isActive = selected?.id === ticket.id;
                  // ✅ Safe message count in the row badge
                  const msgCount = safeMessages(ticket).length;

                  return (
                    <div
                      key={ticket.id}
                      className={`st-ticket-row ${
                        isActive ? "st-ticket-row--active" : ""
                      }`}
                    onClick={() => {
  void loadSingleTicket(ticket.id);
}}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedId(ticket.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-current={isActive ? "true" : "false"}
                    >
                      <div className="st-ticket-row__top">
                        <div className="st-ticket-row__left">
                          <div
                            className="st-company-logo"
                            style={{ background: ticket.companyCol }}
                          >
                            {ticket.companyLogo}
                          </div>
                          <div>
                            <div className="st-ticket-row__subject-row">
                              <div className="st-ticket-row__subject">
                                {ticket.subject}
                              </div>
                              {isActive && (
                                <span className="st-ticket-row__selected-pill">
                                  Selected
                                </span>
                              )}
                            </div>
                            <div className="st-ticket-row__meta">
                              {ticket.company} · {ticket.user}
                            </div>
                          </div>
                        </div>
                        <div className="st-ticket-row__right">
                          {(ticket.unread ?? 0) > 0 && (
                            <span className="st-unread-dot">
                              {ticket.unread}
                            </span>
                          )}
                          <span className="st-ticket-row__time">
                            {ticket.updated}
                          </span>
                        </div>
                      </div>
                      <div className="st-ticket-row__badges">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                        <span className="st-cat-chip">
                          {CAT_ICON[ticket.category] ?? "📋"} {ticket.category}
                        </span>
                        {/* ✅ Safe message count */}
                        <span className="st-msg-count">💬 {msgCount}</span>
                      </div>
                    </div>
                  );
                })}

                {filtered.length === 0 && (
                  <div className="st-empty">
                    <div style={{ fontSize: 32, marginBottom: 10 }}>🎫</div>
                    <div className="st-empty__title">No tickets found</div>
                    <div className="st-empty__desc">
                      Try adjusting your filters.
                    </div>
                  </div>
                )}
              </div>

              {filtered.length > 0 && (
                <Pager
                  page={page}
                  total={filtered.length}
                  size={PAGE_SIZE}
                  onChange={(p) => setPage(p)}
                />
              )}
            </div>

            {selected ? (
              <ConvPanel
                ticket={selected}
                onClose={() => setSelectedId(null)}
                onStatusChange={handleStatusChange}
                onReply={handleReply}
              />
            ) : (
              <div className="st-conv-empty">
                <div className="st-conv-empty__icon">🎫</div>
                <div style={{ textAlign: "center" }}>
                  <div className="st-conv-empty__title">Select a ticket</div>
                  <div className="st-conv-empty__desc">
                    Click any ticket from the list to view the conversation and
                    reply.
                  </div>
                </div>
                <div className="st-conv-empty__chips">
                  <div className="st-conv-empty__chip">
                    <span
                      className="st-conv-empty__chip-dot"
                      style={{ background: "var(--st-info)" }}
                    />
                    <span className="st-conv-empty__chip-text">
                      {openCount} open
                    </span>
                  </div>
                  <div className="st-conv-empty__chip">
                    <span
                      className="st-conv-empty__chip-dot"
                      style={{ background: "var(--st-danger)" }}
                    />
                    <span className="st-conv-empty__chip-text">
                      {urgent} urgent
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}