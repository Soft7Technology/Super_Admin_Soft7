"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader,
  MessageSquare,
  RotateCcw,
  Search,
  Send,
  Ticket as TicketIcon,
  XCircle,
  Zap,
} from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import { PageContainer, PageHeader } from "@/components/layout";
import KpiCard from "@/components/admin/KpiCard";
import Alert from "@/components/ui/Alert";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Dropdown, { DropdownItem } from "@/components/ui/Dropdown";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Table from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import Textarea from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";


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

const STATUS_META: Record<TicketStatus, { label: string; variant: BadgeVariant; dot: string }> = {
  OPEN:        { label: "Open",        variant: "primary", dot: "bg-primary" },
  IN_PROGRESS: { label: "In Progress", variant: "warning", dot: "bg-warning" },
  WAITING:     { label: "Waiting",     variant: "info",    dot: "bg-info" },
  RESOLVED:    { label: "Resolved",    variant: "success", dot: "bg-success" },
  CLOSED:      { label: "Closed",      variant: "neutral", dot: "bg-muted-foreground" },
};

const STATUS_ORDER: Record<TicketStatus, number> = {
  OPEN: 1,
  IN_PROGRESS: 2,
  WAITING: 3,
  RESOLVED: 4,
  CLOSED: 5,
};

const PRIORITY_META: Record<TicketPriority, { label: string; variant: BadgeVariant; text: string }> = {
  LOW:    { label: "Low",    variant: "neutral", text: "text-muted-foreground" },
  MEDIUM: { label: "Medium", variant: "info",    text: "text-info" },
  HIGH:   { label: "High",   variant: "warning", text: "text-warning" },
  URGENT: { label: "Urgent", variant: "error",   text: "text-error" },
};

const PAGE_SIZE = 8;

const safeMessages = (ticket: Ticket): Message[] =>
  Array.isArray(ticket.messages) ? ticket.messages : [];

// ─── Sub-components ─────────────────────────────────────────────────────────

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
    <Badge variant={STATUS_META[status]?.variant ?? "neutral"} dot>
      {label}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const meta = PRIORITY_META[priority];
  return <Badge variant={meta?.variant ?? "neutral"}>{meta?.label ?? "Normal"}</Badge>;
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
  const [feedback, setFeedback] = useState<null | {
    type: "success" | "warning" | "error";
    text: string;
  }>(null);

  const messages = safeMessages(ticket);

  useEffect(() => {
    setReply("");
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
    { key: "Created",  icon: Calendar,      val: ticket.created },
    { key: "Updated",  icon: Clock,         val: ticket.updated },
    { key: "Messages", icon: MessageSquare, val: String(messages.length) },
  ];

  const statusMenu = (
    <Dropdown
      align="end"
      width="11rem"
      trigger={
        <Button variant="secondary" size="sm" rightIcon={<ChevronDown size={14} />}>
          <span className={cn("h-2 w-2 rounded-full", STATUS_META[ticket.status].dot)} aria-hidden />
          {STATUS_META[ticket.status].label}
        </Button>
      }
    >
      {(Object.entries(STATUS_META) as [TicketStatus, (typeof STATUS_META)[TicketStatus]][]).map(([key, meta]) => (
        <DropdownItem
          key={key}
          icon={<span className={cn("h-2 w-2 rounded-full", meta.dot)} aria-hidden />}
          onSelect={() => { void onStatusChange(ticket.id, key); }}
          className={ticket.status === key ? "font-semibold text-primary-text" : undefined}
        >
          <span className="flex-1">{meta.label}</span>
          {ticket.status === key && <Check size={14} />}
        </DropdownItem>
      ))}
    </Dropdown>
  );

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="xl"
      title={
        <span className="flex flex-col gap-2">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-normal text-muted-foreground">#{ticket.id}</span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </span>
          <span className="line-clamp-2">{ticket.subject}</span>
        </span>
      }
      description={
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{ticket.company}</span>
          <span aria-hidden>·</span>
          <span>{ticket.user}</span>
          {ticket.userEmail && (
            <>
              <span aria-hidden>·</span>
              <span>{ticket.userEmail}</span>
            </>
          )}
          <span aria-hidden>·</span>
          <span>{ticket.category}</span>
        </span>
      }
      footer={
        ticket.status !== "CLOSED" ? (
          <div className="w-full space-y-3">
            <Textarea
              label={`Reply to ${ticket.user}`}
              value={reply}
              onChange={e => setReply(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) void send(); }}
              placeholder="Write your reply… (Ctrl+Enter to send)"
              rows={3}
            />

            {feedback && (
              <Alert
                variant={feedback.type}
                message={feedback.text}
                onClose={() => setFeedback(null)}
              />
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<CheckCircle2 size={14} />}
                  onClick={() => void onStatusChange(ticket.id, "RESOLVED")}
                >
                  Mark Resolved
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<XCircle size={14} />}
                  onClick={() => void onStatusChange(ticket.id, "CLOSED")}
                >
                  Close Ticket
                </Button>
              </div>

              <Button
                onClick={() => void send()}
                disabled={sending || !reply.trim()}
                isLoading={sending}
                rightIcon={<Send size={14} />}
              >
                {sending ? "Sending…" : "Send Reply"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">This ticket has been closed.</p>
            <Button variant="secondary" leftIcon={<RotateCcw size={14} />} onClick={() => void onStatusChange(ticket.id, "OPEN")}>
              Reopen Ticket
            </Button>
          </div>
        )
      }
    >
      {/* Meta strip + status */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-subtle bg-surface-muted px-4 py-2.5">
        <dl className="flex flex-wrap gap-x-5 gap-y-1 text-[0.8125rem]">
          {metaItems.map(({ key, icon: Icon, val }) => (
            <div key={key} className="flex items-center gap-1.5">
              <dt className="flex items-center gap-1 text-muted-foreground"><Icon size={13} /> {key}</dt>
              <dd className="font-medium text-foreground">{val}</dd>
            </div>
          ))}
        </dl>
        {statusMenu}
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {messages.length === 0 && (
          <EmptyState compact icon={<MessageSquare size={20} />} title="No messages yet." />
        )}

        {messages.map((message, index) => {
          const isAdmin = message.sender === "ADMIN";
          const isFirst = index === 0 || messages[index - 1].sender !== message.sender;

          return (
            <div key={message.id} className={cn("flex items-end gap-2.5", isAdmin && "flex-row-reverse")}>
              {isFirst ? (
                <Avatar name={message.name} size="sm" tone={isAdmin ? "brand" : "neutral"} />
              ) : (
                <span className="w-8 shrink-0" aria-hidden />
              )}
              <div className={cn("flex max-w-[75%] flex-col", isAdmin ? "items-end" : "items-start")}>
                {isFirst && (
                  <div className="mb-1 flex items-center gap-2">
                    <span className={cn("text-xs font-semibold", isAdmin ? "text-primary-text" : "text-foreground")}>
                      {message.name}
                    </span>
                    {!message.read && !isAdmin && <Badge variant="error" size="sm">UNREAD</Badge>}
                  </div>
                )}
                <div
                  className={cn(
                    "whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm",
                    isAdmin
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md border border-border-subtle bg-surface-muted text-foreground",
                  )}
                >
                  {message.content}
                </div>
                <span className="mt-1 text-[0.6875rem] text-muted-foreground">{message.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
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

  // Escape-to-close and body scroll lock are handled by the kit <Modal>.

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
          companyCol: "var(--color-primary-text)",
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

    const interval = setInterval(() => {
      // Do not refresh the list while the conversation modal is open.
      if (!selectedId) {
        void loadTickets();
      }
    }, 5000);

    return () => clearInterval(interval);
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
        companyCol: "var(--color-primary-text)",
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

  const columns: Column<Ticket>[] = [
    {
      key: "user",
      header: "Name",
      render: ticket => (
        <button
          type="button"
          className="group flex items-center gap-3 text-left"
          onClick={() => void loadSingleTicket(ticket.id)}
          title={`Open chat with ${ticket.user}`}
        >
          <Avatar name={ticket.user?.replace(/^User\s+/, "") || ticket.user || "U"} size="sm" />
          <span className="font-medium text-foreground group-hover:text-primary-text group-hover:underline">
            {ticket.user}
          </span>
        </button>
      ),
    },
    {
      key: "userEmail",
      header: "Email",
      render: ticket => <span className="text-secondary-foreground">{ticket.userEmail || "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: ticket => <StatusBadge status={ticket.status} />,
    },
    {
      key: "priority",
      header: "Priority",
      render: ticket => {
        const priorityDisplay =
          PRIORITY_META[ticket.priority]?.label ??
          (ticket.priority === "MEDIUM"
            ? "Normal"
            : ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase());
        return (
          <span className={cn("text-[0.8125rem] font-medium", PRIORITY_META[ticket.priority]?.text ?? "text-secondary-foreground")}>
            {priorityDisplay}
          </span>
        );
      },
    },
    {
      key: "created",
      header: "Created",
      render: ticket => <span className="text-muted-foreground">{ticket.created}</span>,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Support Tickets"
        description="Manage and respond to customer support requests."
        actions={
          totalUnread > 0 ? (
            <Badge variant="error" dot size="lg">{totalUnread} unread</Badge>
          ) : undefined
        }
      />

      {apiError && <Alert variant="error" className="mb-4" message={apiError} onClose={() => setApiError(null)} />}

      {/* KPI grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Open Tickets"  value={loading ? "…" : String(openCount)}  hint={`${urgent} urgent`}  icon={<TicketIcon size={18} />} />
        <KpiCard label="In Progress"   value={loading ? "…" : String(inProgress)} hint="being handled"      icon={<Loader size={18} />} tone="warning" />
        <KpiCard label="Resolved (7d)" value={loading ? "…" : String(resolved)}   hint="closed this week"   icon={<CheckCircle2 size={18} />} tone="success" />
        <KpiCard label="Avg Response"  value="18m"                                hint="across all tickets" icon={<Zap size={18} />} tone="info" />
      </div>

      {/* Filters */}
      <Card padding="sm" className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            wrapperClassName="min-w-0 flex-[1_1_16rem]"
            leftIcon={<Search size={15} />}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by subject, user, or email…"
            aria-label="Search tickets"
          />
          <div className="overflow-x-auto">
            <SegmentedControl<"ALL" | TicketStatus>
              aria-label="Filter by status"
              value={statusF}
              onChange={s => { setStatusF(s); setPage(1); }}
              options={(["ALL", "OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"] as const).map(s => ({
                value: s,
                label: s === "ALL" ? "All Status" : STATUS_META[s].label,
              }))}
            />
          </div>
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </Card>

      <Table
        columns={columns}
        data={paginated}
        rowKey={ticket => ticket.id}
        loading={loading}
        emptyMessage="No tickets found"
        emptyDescription="Try adjusting your filters or search term."
      />

      {!loading && filtered.length > 0 && (
        <Pagination
          className="mt-4"
          currentPage={page}
          totalPages={Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}
          totalItems={filtered.length}
          itemsPerPage={PAGE_SIZE}
          showInfo
          onPageChange={p => setPage(p)}
        />
      )}

      {/* Conversation modal */}
      {selected && (
        <ConvPanel
          ticket={selected}
          onClose={() => setSelectedId(null)}
          onStatusChange={handleStatusChange}
          onReply={handleReply}
        />
      )}
    </PageContainer>
  );
}
