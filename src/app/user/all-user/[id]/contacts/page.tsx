"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { axiosInstance } from "@/lib/axiosInstance";
import { ArrowLeft, Users, Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import "../user-profile.css";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

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

export default function UserContactsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [companyId, setCompanyId] = useState<string | null>(searchParams.get("companyId"));
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterValid, setFilterValid] = useState<string>("ALL");
  const [selectedContact, setSelectedContact] = useState<any | null>(null);

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

  // Fetch contacts with backend query params
  const fetchContacts = useCallback(async () => {
    if (!companyId || !userId) return;
    setLoading(true);
    try {
      const qParams: Record<string, any> = { page, limit };
      if (debouncedSearch.trim()) {
        qParams.search = debouncedSearch.trim();
      }
      if (filterValid === "VALID") {
        qParams.is_valid = true;
      } else if (filterValid === "INVALID") {
        qParams.is_valid = false;
      }

      const res = await axiosInstance.get(`/v1/super-admin/companies/${companyId}/${userId}/contacts`, {
        params: qParams,
      });
      const d = res.data?.data ?? res.data ?? {};
      const items = Array.isArray(d.items) ? d.items : Array.isArray(d) ? d : [];
      setContacts(items);
      setTotal(d.pagination?.total ?? items.length);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId, userId, page, limit, debouncedSearch, filterValid]);

  useEffect(() => {
    if (companyId) {
      fetchContacts();
    }
  }, [companyId, fetchContacts]);

  const handleValidFilterChange = (val: string) => {
    setFilterValid(val);
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
              User Contacts
            </h2>
            <div style={{ fontSize: "12.5px", color: "var(--muted, #64748b)", marginTop: "2px" }}>
              {userName ? `${userName} • ` : ""}Total {total} contacts saved
            </div>
          </div>
        </div>

        <button
          onClick={fetchContacts}
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
            placeholder="Search by contact name, phone, or source (Backend query)..."
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
          {[
            { id: "ALL", label: "All Contacts" },
            { id: "VALID", label: "Valid Only" },
            { id: "INVALID", label: "Invalid Only" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleValidFilterChange(item.id)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                border: "1px solid var(--border, #e2e8f0)",
                background: filterValid === item.id ? "var(--crm-primary, #206bc4)" : "var(--surf, #fff)",
                color: filterValid === item.id ? "#fff" : "var(--muted, #64748b)",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Spinner />
        </div>
      ) : contacts.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", background: "var(--surf, #fff)", borderRadius: "10px", border: "1px solid var(--border, #e2e8f0)", color: "var(--muted)" }}>
          No contacts found matching criteria.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {contacts.map((contact: any, idx: number) => {
            const isValid = contact.is_valid !== false;

            return (
              <div key={contact.id || idx} className="up-contact-card" onClick={() => setSelectedContact(contact)}>
                <div className="up-contact-icon"><Users size={18} /></div>
                <div className="up-contact-content">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span className="up-contact-name">{contact.name || "Unknown"}</span>
                    <span className={`up-contact-status ${isValid ? "up-contact-status--valid" : "up-contact-status--invalid"}`}>
                      {isValid ? "Valid" : "Invalid"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <span className="up-contact-phone">{contact.phone_number || "—"}</span>
                    {contact.source && (
                      <span style={{ fontSize: "11px", color: "var(--muted)", background: "var(--surf2)", padding: "1px 6px", borderRadius: "4px" }}>
                        {contact.source}
                      </span>
                    )}
                  </div>
                </div>
                <div className="up-contact-right">
                  <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>{formatDate(contact.created_at)}</span>
                  <svg className="up-contact-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
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

      {/* Contact Slide Drawer */}
      {selectedContact && (
        <>
          <div className="up-camp-drawer-overlay" onClick={() => setSelectedContact(null)} />
          <div className="up-camp-drawer">
            <div className="up-camp-drawer-header">
              <div className="up-camp-drawer-title">
                <div style={{ width: 32, height: 32, background: "rgba(32,107,196,0.1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--crm-primary,#206bc4)" }}>
                  <Users size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "700" }}>
                    {selectedContact.name || "Contact Details"}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "400", marginTop: "2px" }}>
                    User Contact Record
                  </div>
                </div>
              </div>
              <button className="up-camp-drawer-close" onClick={() => setSelectedContact(null)}>✕</button>
            </div>

            <div className="up-camp-drawer-body">
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <span className={`up-contact-status ${selectedContact.is_valid !== false ? "up-contact-status--valid" : "up-contact-status--invalid"}`} style={{ fontSize: "12.5px", padding: "4px 12px" }}>
                  {selectedContact.is_valid !== false ? "Valid Number" : "Invalid Number"}
                </span>
                <span style={{ fontSize: "12px", color: "var(--muted)", background: "var(--surf2)", border: "1px solid var(--border)", padding: "3px 10px", borderRadius: "9999px", fontWeight: "500", textTransform: "capitalize" }}>
                  Source: {selectedContact.source || "unknown"}
                </span>
              </div>

              <div className="up-cd-section">
                <div className="up-cd-section-title">Contact Info</div>
                {[
                  { label: "Name", val: selectedContact.name },
                  { label: "Phone", val: selectedContact.phone_number },
                  { label: "Email", val: selectedContact.email },
                  { label: "Country Code", val: selectedContact.country_code },
                ].map(({ label, val }) => (
                  <div key={label} className="up-cd-info-row">
                    <span className="up-cd-info-label">{label}</span>
                    <span className="up-cd-info-val" style={label === "Phone" ? { fontFamily: "monospace", fontSize: "13px", fontWeight: "600" } : {}}>{val || "—"}</span>
                  </div>
                ))}
              </div>

              <div className="up-cd-section">
                <div className="up-cd-section-title">Engagement Statistics</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div style={{ background: "var(--surf2)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)", textAlign: "center" }}>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--title-color)" }}>{selectedContact.message_count || 0}</div>
                    <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", marginTop: "4px" }}>Messages Sent</div>
                  </div>
                  <div style={{ background: "rgba(214,57,57,0.05)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(214,57,57,0.1)", textAlign: "center" }}>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: "#d63939" }}>{selectedContact.failed_count || 0}</div>
                    <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", marginTop: "4px" }}>Failed Msgs</div>
                  </div>
                </div>
              </div>

              {!selectedContact.is_valid && selectedContact.invalid_reason && (
                <div className="up-cd-section">
                  <div className="up-cd-section-title">Invalid Reason</div>
                  <div style={{ padding: "12px", background: "rgba(214,57,57,0.07)", border: "1px solid rgba(214,57,57,0.2)", borderRadius: "8px", fontSize: "13px", color: "#d63939", lineHeight: "1.6" }}>
                    {selectedContact.invalid_reason}
                  </div>
                </div>
              )}

              <div className="up-cd-section">
                <div className="up-cd-section-title">Timeline</div>
                {[
                  { label: "Created At", val: selectedContact.created_at },
                  { label: "Last Contacted", val: selectedContact.last_contacted_at },
                  { label: "Last Invalid", val: selectedContact.last_invalid_at },
                  { label: "Updated At", val: selectedContact.updated_at },
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
                  { label: "Contact ID", val: selectedContact.id },
                  { label: "Phone Num ID", val: selectedContact.phone_number_id },
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

