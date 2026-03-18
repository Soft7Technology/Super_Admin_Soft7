"use client";

import { useEffect, useMemo, useState } from "react";
import "./support-tickets.css";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "WAITING";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type MessageSender = "USER" | "ADMIN";

interface Message {
  id: number;
  sender: MessageSender;
  name: string;
  avatar: string;
  content: string;
  time: string;
  read: boolean;
}

interface Ticket {
  id: number;
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
  JD: "#6C5CE7",
  TK: "#00CBA4",
  ML: "#FF6B6B",
  RK: "#E17055",
  LH: "#FD79A8",
  ST: "#6C5CE7",
};

const PAGE_SIZE = 8;

function KPI({ label, value, sub, icon, color }: { label: string; value: string; sub: string; icon: string; color: string }) {
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

function Ava({ init, size = 32, col }: { init: string; size?: number; col?: string }) {
  const bg = col ?? AVATAR_COLORS[init] ?? "#6C5CE7";

  return (
    <div className="st-ava" style={{ width: size, height: size, background: bg, fontSize: size * 0.31 }}>
      {init}
    </div>
  );
}

function Pager({ page, total, size, onChange }: { page: number; total: number; size: number; onChange: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / size));
  const nums = Array.from({ length: pages }, (_, index) => index + 1).filter(
    (value) => value === 1 || value === pages || Math.abs(value - page) <= 1
  );

  const withDots: (number | "…")[] = [];
  nums.forEach((value, index) => {
    if (index > 0 && value - nums[index - 1] > 1) {
      withDots.push("…");
    }
    withDots.push(value);
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
        {withDots.map((value, index) =>
          value === "…" ? (
            <span key={`dots-${index}`} className="st-pager__dots">
              …
            </span>
          ) : (
            <button
              key={value}
              onClick={() => onChange(value as number)}
              className={`st-pager__btn ${page === value ? "st-pager__btn--active" : ""}`}
            >
              {value}
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
  onStatusChange: (id: number, status: TicketStatus) => Promise<void>;
  onReply: (id: number, text: string) => Promise<ReplyActionResult>;
}) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [feedback, setFeedback] = useState<null | { type: "success" | "warning" | "error"; text: string }>(null);

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
              <div className="st-conv__company-logo" style={{ background: ticket.companyCol }}>
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
                onClick={() => setShowStatus((value) => !value)}
              >
                <span className="st-status-dd__trigger-dot" style={{ background: STATUS_META[ticket.status].dot }} />
                {STATUS_META[ticket.status].label} ▾
              </button>

              {showStatus && (
                <div className="st-status-dd__menu">
                  {(Object.entries(STATUS_META) as [TicketStatus, { label: string; dot: string }][]).map(([key, meta]) => (
                    <button
                      key={key}
                      className="st-status-dd__option"
                      style={{
                        background: ticket.status === key ? `${meta.dot}12` : "transparent",
                        color: ticket.status === key ? meta.dot : "var(--st-muted)",
                        fontWeight: ticket.status === key ? 700 : 400,
                      }}
                      onClick={() => {
                        void onStatusChange(ticket.id, key);
                        setShowStatus(false);
                      }}
                    >
                      <span className="st-status-dd__option-dot" style={{ background: meta.dot }} />
                      {meta.label}
                      {ticket.status === key && <span className="st-status-dd__check">✓</span>}
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
          {["🗓 Created", ticket.created, "🕐 Updated", ticket.updated, "💬 Messages", String(ticket.messages.length)]
            .reduce<string[][]>((acc, value, index, array) => {
              if (index % 2 === 0) acc.push([value, array[index + 1]]);
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

      <div className="st-messages">
        {ticket.messages.map((message, index) => {
          const isAdmin = message.sender === "ADMIN";
          const isFirst = index === 0 || ticket.messages[index - 1].sender !== message.sender;

          return (
            <div key={message.id} className={`st-msg ${isAdmin ? "st-msg--admin" : "st-msg--user"}`}>
              {isFirst ? <Ava init={message.avatar} size={30} /> : <div className="st-msg__ava-spacer" />}
              <div className="st-msg__body">
                {isFirst && (
                  <div className="st-msg__name-row">
                    <span className={isAdmin ? "st-msg__name-admin" : "st-msg__name-user"}>{message.name}</span>
                    {!message.read && !isAdmin && <span className="st-msg__unread-tag">UNREAD</span>}
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

      {ticket.status !== "CLOSED" ? (
        <div className="st-reply">
          <textarea
            className="st-reply__textarea"
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                void send();
              }
            }}
            placeholder="Type your reply… (Ctrl+Enter to send)"
            rows={3}
          />

          {feedback && <div className={`st-reply__feedback st-reply__feedback--${feedback.type}`}>{feedback.text}</div>}

          <div className="st-reply__actions">
            <div className="st-reply__left">
              <button className="st-btn-resolve" onClick={() => void onStatusChange(ticket.id, "RESOLVED")}>
                ✓ Resolve
              </button>
              <button className="st-btn-close-ticket" onClick={() => void onStatusChange(ticket.id, "CLOSED")}>
                ✕ Close
              </button>
            </div>

            <button
              className={`st-btn-send ${reply.trim() ? "st-btn-send--active" : "st-btn-send--inactive"}`}
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
          <button className="st-btn-reopen" onClick={() => void onStatusChange(ticket.id, "OPEN")}>
            ↺ Reopen Ticket
          </button>
        </div>
      )}
    </div>
  );
}

export default function SupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
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
        const response = await fetch("/api/admin/support-tickets", { cache: "no-store" });
        const data = await response.json();

        if (!active) return;

        if (!response.ok) {
          setApiError(typeof data?.error === "string" ? data.error : "Failed to load support tickets.");
          setTickets([]);
          return;
        }

        setTickets(Array.isArray(data) ? (data as Ticket[]) : []);
      } catch {
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
    if (selectedId !== null && !tickets.some((ticket) => ticket.id === selectedId)) {
      setSelectedId(null);
    }
  }, [selectedId, tickets]);

  const selected = useMemo(() => {
    if (selectedId === null) return null;
    return tickets.find((ticket) => ticket.id === selectedId) ?? null;
  }, [selectedId, tickets]);

  const filtered = useMemo(
    () =>
      tickets.filter((ticket) => {
        const query = search.toLowerCase();
        const matchesStatus = statusF === "ALL" || ticket.status === statusF;
        const matchesPriority = priorityF === "ALL" || ticket.priority === priorityF;
        const matchesSearch =
          ticket.subject.toLowerCase().includes(query) ||
          ticket.company.toLowerCase().includes(query) ||
          ticket.user.toLowerCase().includes(query) ||
          ticket.userEmail.toLowerCase().includes(query) ||
          ticket.category.toLowerCase().includes(query);

        return matchesStatus && matchesPriority && matchesSearch;
      }),
    [tickets, search, statusF, priorityF]
  );

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [filtered.length, page]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const applyServerTicket = (ticket: Ticket) => {
    setTickets((prev) => prev.map((current) => (current.id === ticket.id ? ticket : current)));
  };

  const handleStatusChange = async (id: number, status: TicketStatus) => {
    setApiError(null);

    try {
      const response = await fetch("/api/admin/support-tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: id, status }),
      });

      const payload = (await response.json().catch(() => null)) as { ticket?: Ticket; error?: string } | null;

      if (!response.ok || !payload?.ticket) {
        throw new Error(payload?.error ?? "Failed to update ticket status.");
      }

      applyServerTicket(payload.ticket);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Failed to update ticket status.");
    }
  };

  const handleReply = async (id: number, text: string): Promise<ReplyActionResult> => {
    setApiError(null);

    try {
      const response = await fetch("/api/admin/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: id, message: text }),
      });

      const payload = (await response.json().catch(() => null)) as {
        ticket?: Ticket;
        error?: string;
        emailSent?: boolean;
        emailError?: string | null;
      } | null;

      if (!response.ok || !payload?.ticket) {
        return {
          ok: false,
          error: payload?.error ?? "Failed to send reply.",
        };
      }

      applyServerTicket(payload.ticket);
      setSelectedId(payload.ticket.id);

      if (payload.emailSent === false) {
        return {
          ok: true,
          warning: payload.emailError ?? "Reply saved, but email delivery failed.",
        };
      }

      return { ok: true };
    } catch {
      return {
        ok: false,
        error: "Unable to reach server while sending reply.",
      };
    }
  };

  const openCount = tickets.filter((ticket) => ticket.status === "OPEN").length;
  const inProgress = tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length;
  const resolved = tickets.filter((ticket) => ticket.status === "RESOLVED").length;
  const urgent = tickets.filter((ticket) => ticket.priority === "URGENT").length;
  const totalUnread = tickets.reduce((acc, ticket) => acc + ticket.unread, 0);

  return (
    <div className="st-root">
      {loading && (
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--st-muted, #888)", fontSize: 16 }}>
          Loading tickets...
        </div>
      )}

      {!loading && (
        <>
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

          {apiError && <div className="st-page-alert">{apiError}</div>}

          <div className="st-kpi-grid">
            <KPI label="Open Tickets" value={String(openCount)} sub={`${urgent} urgent`} icon="🎫" color="#74B9FF" />
            <KPI label="In Progress" value={String(inProgress)} sub="being handled" icon="⚙️" color="#FDCB6E" />
            <KPI label="Resolved (7d)" value={String(resolved)} sub="closed this week" icon="✅" color="#00CBA4" />
            <KPI label="Avg Response" value="18m" sub="across all tickets" icon="⚡" color="#6C5CE7" />
          </div>

          <div className={`st-main-grid ${selected ? "st-main-grid--split" : "st-main-grid--full"}`}>
            <div className={`st-list-panel ${selected ? "st-list-panel--selection-open" : ""}`}>
              <div className="st-filters">
                <div className="st-search-wrap">
                  <span className="st-search-icon">🔍</span>
                  <input
                    className="st-search-input"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search tickets..."
                    autoComplete="off"
                  />
                </div>

                <div className="st-pills">
                  {(["ALL", "OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusF(status);
                        setPage(1);
                      }}
                      className={`st-pill ${statusF === status ? "st-pill--active" : ""}`}
                      style={
                        statusF === status && status !== "ALL"
                          ? {
                              background: `var(--st-status-${status === "IN_PROGRESS" ? "inprog" : status.toLowerCase()}-bg)`,
                              color: `var(--st-status-${status === "IN_PROGRESS" ? "inprog" : status.toLowerCase()}-col)`,
                              borderColor: `var(--st-status-${status === "IN_PROGRESS" ? "inprog" : status.toLowerCase()}-col)`,
                            }
                          : statusF === status
                          ? {
                              background: "var(--st-surf3)",
                              color: "var(--st-accent2)",
                              borderColor: "rgba(108,92,231,0.35)",
                            }
                          : {}
                      }
                    >
                      {status === "ALL" ? "All" : STATUS_META[status as TicketStatus]?.label ?? status}
                    </button>
                  ))}
                </div>

                <div className="st-priority-row">
                  <span className="st-priority-label">Priority:</span>
                  {(["ALL", "URGENT", "HIGH", "MEDIUM", "LOW"] as const).map((priority) => (
                    <button
                      key={priority}
                      onClick={() => {
                        setPriorityF(priority);
                        setPage(1);
                      }}
                      className={`st-pill ${priorityF === priority ? "st-pill--active" : ""}`}
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
                      {priority === "ALL" ? "All" : PRIORITY_META[priority as TicketPriority]?.label ?? priority}
                    </button>
                  ))}
                  <span className="st-filter-count">
                    {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="st-list">
                {paginated.map((ticket) => {
                  const isActive = selected?.id === ticket.id;

                  return (
                    <div
                      key={ticket.id}
                      className={`st-ticket-row ${isActive ? "st-ticket-row--active" : ""}`}
                      onClick={() => setSelectedId(ticket.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedId(ticket.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-current={isActive ? "true" : "false"}
                    >
                      <div className="st-ticket-row__top">
                        <div className="st-ticket-row__left">
                          <div className="st-company-logo" style={{ background: ticket.companyCol }}>
                            {ticket.companyLogo}
                          </div>
                          <div>
                            <div className="st-ticket-row__subject-row">
                              <div className="st-ticket-row__subject">{ticket.subject}</div>
                              {isActive && <span className="st-ticket-row__selected-pill">Selected</span>}
                            </div>
                            <div className="st-ticket-row__meta">
                              {ticket.company} · {ticket.user}
                            </div>
                          </div>
                        </div>
                        <div className="st-ticket-row__right">
                          {ticket.unread > 0 && <span className="st-unread-dot">{ticket.unread}</span>}
                          <span className="st-ticket-row__time">{ticket.updated}</span>
                        </div>
                      </div>
                      <div className="st-ticket-row__badges">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                        <span className="st-cat-chip">
                          {CAT_ICON[ticket.category] ?? "📋"} {ticket.category}
                        </span>
                        <span className="st-msg-count">💬 {ticket.messages.length}</span>
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
                <Pager
                  page={page}
                  total={filtered.length}
                  size={PAGE_SIZE}
                  onChange={(nextPage) => {
                    setPage(nextPage);
                  }}
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
        </>
      )}
    </div>
  );
}
