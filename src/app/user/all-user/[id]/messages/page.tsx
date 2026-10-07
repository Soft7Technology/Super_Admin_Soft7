"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { axiosInstance } from "@/lib/axiosInstance";
import { ArrowLeft, MessageSquare, Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import "../user-profile.css";

function formatPlanDateTime(dateStr: string | null | Date) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    const datePart = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timePart = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    return `${datePart}, ${timePart}`;
  } catch {
    return String(dateStr);
  }
}

export default function UserMessagesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [companyId, setCompanyId] = useState<string | null>(searchParams.get("companyId"));
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  // Debounce search input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (companyId) return;
    try {
      const cached = sessionStorage.getItem(`user_${userId}`) || sessionStorage.getItem("sa_selected_user");
      if (cached) {
        const u = JSON.parse(cached);
        if (u.companyId || u.company_id) {
          setCompanyId(String(u.companyId || u.company_id));
          setUserName(u.name || "");
          return;
        }
      }
    } catch {}

    axiosInstance.get("/v1/admin/companies/user", { params: { limit: 1000 } }).then((res) => {
      const users = res.data?.data?.data || res.data?.data || res.data?.users || [];
      const match = users.find((u: any) => String(u.id) === String(userId));
      if (match) {
        setCompanyId(String(match.company_id ?? match.companyId ?? match.company?.id));
        setUserName(match.name || "");
      }
    }).catch(() => {});
  }, [userId, companyId]);

  // Fetch messages with backend query params
  const fetchMessages = useCallback(async () => {
    if (!companyId || !userId) return;
    setLoading(true);
    try {
      const qParams: Record<string, any> = { page, limit };
      if (debouncedSearch.trim()) {
        qParams.search = debouncedSearch.trim();
      }
      if (filterStatus !== "ALL") {
        qParams.status = filterStatus.toLowerCase();
      }

      const res = await axiosInstance.get(`/v1/super-admin/companies/${companyId}/${userId}/messages`, {
        params: qParams,
      });
      const d = res.data?.data ?? res.data ?? {};
      const items = Array.isArray(d.items) ? d.items : Array.isArray(d) ? d : [];
      setMessages(items);
      setTotal(d.pagination?.total ?? items.length);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId, userId, page, limit, debouncedSearch, filterStatus]);

  useEffect(() => {
    if (companyId) {
      fetchMessages();
    }
  }, [companyId, fetchMessages]);

  const handleStatusChange = (st: string) => {
    setFilterStatus(st);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="up-container" style={{ padding: "24px", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => router.back()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "8px",
              background: "var(--surf2, #f1f5f9)",
              border: "1px solid var(--border, #e2e8f0)",
              color: "var(--title-color, #1e293b)",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={16} />
            Back to Profile
          </button>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "var(--title-color, #1e293b)" }}>
              User WhatsApp Messages
            </h2>
            <div style={{ fontSize: "12.5px", color: "var(--muted, #64748b)", marginTop: "2px" }}>
              {userName ? `${userName} • ` : ""}Total {total} messages recorded
            </div>
          </div>
        </div>

        <button
          onClick={fetchMessages}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            borderRadius: "8px",
            background: "var(--surf, #fff)",
            border: "1px solid var(--border, #e2e8f0)",
            color: "var(--text, #334155)",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "18px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
          <input
            type="text"
            placeholder="Search by phone or template name (Backend query)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px 9px 34px",
              borderRadius: "8px",
              border: "1px solid var(--border, #e2e8f0)",
              background: "var(--surf, #fff)",
              color: "var(--title-color, #1e293b)",
              fontSize: "13px",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {["ALL", "sent", "delivered", "read", "failed"].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusChange(st)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600",
                textTransform: "capitalize",
                cursor: "pointer",
                border: "1px solid var(--border, #e2e8f0)",
                background: filterStatus === st ? "var(--crm-primary, #206bc4)" : "var(--surf, #fff)",
                color: filterStatus === st ? "#fff" : "var(--muted, #64748b)",
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Spinner />
        </div>
      ) : messages.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", background: "var(--surf, #fff)", borderRadius: "10px", border: "1px solid var(--border, #e2e8f0)", color: "var(--muted)" }}>
          No messages found matching criteria.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {messages.map((msg: any, idx: number) => {
            const st = (msg.status || "").toLowerCase();
            const iconCls = `up-msg-icon--${["sent", "delivered", "read", "failed"].includes(st) ? st : "default"}`;
            const statusIcon = st === "sent" ? "✉" : st === "delivered" ? "✔" : st === "read" ? "👁" : st === "failed" ? "✕" : "📨";
            const templateName = msg.content?.template?.name || msg.type || "Message";

            return (
              <div key={msg.id || idx} className="up-msg-card" onClick={() => setSelectedMessage(msg)}>
                <div className={`up-msg-icon ${iconCls}`}>{statusIcon}</div>
                <div className="up-msg-content">
                  <div className="up-msg-top-row">
                    <span className="up-msg-template-name">{templateName}</span>
                    <span className={`up-msg-status up-msg-status--${st}`}>{msg.status || "—"}</span>
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <span className="up-msg-to-phone">{msg.to_phone || "—"}</span>
                    {msg.error_message && (
                      <span className="up-msg-error-text">⚠ {msg.error_message}</span>
                    )}
                  </div>
                </div>
                <div className="up-msg-right">
                  <span className="up-msg-time">{formatPlanDateTime(msg.created_at)}</span>
                  <svg className="up-msg-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "20px", padding: "12px 16px", background: "var(--surf, #fff)", borderRadius: "8px", border: "1px solid var(--border, #e2e8f0)", flexWrap: "wrap", gap: "10px" }}>
          <span style={{ fontSize: "13px", color: "var(--muted)" }}>
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} items)
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                background: "var(--surf)",
                color: page <= 1 ? "var(--muted)" : "var(--title-color)",
                cursor: page <= 1 ? "not-allowed" : "pointer",
                fontSize: "12.5px",
              }}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                background: "var(--surf)",
                color: page >= totalPages ? "var(--muted)" : "var(--title-color)",
                cursor: page >= totalPages ? "not-allowed" : "pointer",
                fontSize: "12.5px",
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Message Slide Drawer */}
      {selectedMessage && (
        <>
          <div className="up-camp-drawer-overlay" onClick={() => setSelectedMessage(null)} />
          <div className="up-camp-drawer">
            <div className="up-camp-drawer-header">
              <div className="up-camp-drawer-title">
                <MessageSquare size={18} style={{ color: "var(--crm-primary,#206bc4)" }} />
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "700" }}>
                    {selectedMessage.content?.template?.name || "Message"}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "400", marginTop: "2px" }}>
                    WhatsApp Message Detail
                  </div>
                </div>
              </div>
              <button className="up-camp-drawer-close" onClick={() => setSelectedMessage(null)}>✕</button>
            </div>

            <div className="up-camp-drawer-body">
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <span className={`up-msg-status up-msg-status--${(selectedMessage.status || "").toLowerCase()}`} style={{ fontSize: "12.5px", padding: "4px 12px" }}>
                  {selectedMessage.status || "—"}
                </span>
                <span style={{ fontSize: "12px", color: "var(--muted)", background: "var(--surf2)", border: "1px solid var(--border)", padding: "3px 10px", borderRadius: "9999px", fontWeight: "500" }}>
                  {selectedMessage.direction || "outbound"} • {selectedMessage.type || "template"}
                </span>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Cost: <strong style={{ color: "var(--title-color)" }}>₹{selectedMessage.cost ?? "0.00"}</strong>
                </span>
              </div>

              {selectedMessage.content?.template && (
                <div className="up-cd-section">
                  <div className="up-cd-section-title">Template Message</div>
                  <div className="up-msg-body-box">
                    {(() => {
                      const components = selectedMessage.content?.template?.components || [];
                      const body = components.find((c: any) => c.type === "BODY");
                      if (!body) return <span style={{ color: "var(--muted)" }}>No body text</span>;
                      let text: string = body.text || "";
                      const params: any[] = body.parameters || [];
                      params.forEach((p: any, i: number) => {
                        text = text.replace(`{{${i + 1}}}`, `[${p.text || "?"}]`);
                      });
                      return <span>{text}</span>;
                    })()}
                  </div>

                  {(() => {
                    const components = selectedMessage.content?.template?.components || [];
                    const body = components.find((c: any) => c.type === "BODY");
                    const params = body?.parameters || [];
                    if (!params.length) return null;
                    return (
                      <div style={{ marginTop: "8px" }}>
                        <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Recipients</span>
                        <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {params.map((p: any, i: number) => (
                            <span key={i} className="up-msg-param-chip">{p.text}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="up-cd-info-row" style={{ marginTop: "8px" }}>
                    <span className="up-cd-info-label">Template</span>
                    <span className="up-cd-info-val">{selectedMessage.content.template.name}</span>
                  </div>
                  <div className="up-cd-info-row">
                    <span className="up-cd-info-label">Language</span>
                    <span className="up-cd-info-val">{selectedMessage.content.template.language?.code || "—"}</span>
                  </div>
                </div>
              )}

              <div className="up-cd-section">
                <div className="up-cd-section-title">Phone Details</div>
                {[
                  { label: "From", val: selectedMessage.from_phone },
                  { label: "To", val: selectedMessage.to_phone },
                  { label: "Direction", val: selectedMessage.direction },
                  { label: "Type", val: selectedMessage.type },
                ].map(({ label, val }) => (
                  <div key={label} className="up-cd-info-row">
                    <span className="up-cd-info-label">{label}</span>
                    <span className="up-cd-info-val" style={{ fontFamily: "monospace", fontSize: "12.5px" }}>{val || "—"}</span>
                  </div>
                ))}
              </div>

              {selectedMessage.error_message && (
                <div className="up-cd-section">
                  <div className="up-cd-section-title">Error Details</div>
                  <div style={{ padding: "12px", background: "rgba(214,57,57,0.07)", border: "1px solid rgba(214,57,57,0.2)", borderRadius: "8px", fontSize: "13px", color: "#d63939", lineHeight: "1.6" }}>
                    <div><strong>Code:</strong> {selectedMessage.error_code || "—"}</div>
                    <div style={{ marginTop: "4px" }}><strong>Reason:</strong> {selectedMessage.error_message}</div>
                  </div>
                </div>
              )}

              <div className="up-cd-section">
                <div className="up-cd-section-title">Timeline</div>
                {[
                  { label: "Created At", val: selectedMessage.created_at },
                  { label: "Queued At", val: selectedMessage.queued_at },
                  { label: "Sent At", val: selectedMessage.sent_at },
                  { label: "Delivered At", val: selectedMessage.delivered_at },
                  { label: "Read At", val: selectedMessage.read_at },
                  { label: "Failed At", val: selectedMessage.failed_at },
                ]
                  .filter(({ val }) => val)
                  .map(({ label, val }) => (
                    <div key={label} className="up-cd-info-row">
                      <span className="up-cd-info-label">{label}</span>
                      <span className="up-cd-info-val">{formatPlanDateTime(val)}</span>
                    </div>
                  ))}
              </div>

              <div className="up-cd-section">
                <div className="up-cd-section-title">Identifiers</div>
                {[
                  { label: "Message ID", val: selectedMessage.id },
                  { label: "Campaign ID", val: selectedMessage.campaign_id },
                  { label: "Phone Num ID", val: selectedMessage.phone_number_id },
                  { label: "WAMID", val: selectedMessage.wamid },
                ].map(({ label, val }) => (
                  <div key={label} className="up-cd-info-row">
                    <span className="up-cd-info-label">{label}</span>
                    <span className="up-cd-info-val" style={{ fontSize: "11px", fontFamily: "monospace", wordBreak: "break-all" }}>{val || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

