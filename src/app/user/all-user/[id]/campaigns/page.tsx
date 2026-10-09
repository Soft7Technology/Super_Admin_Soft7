"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { axiosInstance } from "@/lib/axiosInstance";
import { ArrowLeft, Share2, Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
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

export default function UserCampaignsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [companyId, setCompanyId] = useState<string | null>(searchParams.get("companyId"));
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);

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

  // Fetch campaigns with backend query params
  const fetchCampaigns = useCallback(async () => {
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

      const res = await axiosInstance.get(`/v1/super-admin/companies/${companyId}/${userId}/campaign`, {
        params: qParams,
      });
      const d = res.data?.data ?? res.data ?? {};
      const items = Array.isArray(d.items) ? d.items : Array.isArray(d) ? d : [];
      setCampaigns(items);
      setTotal(d.pagination?.total ?? items.length);
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId, userId, page, limit, debouncedSearch, filterStatus]);

  useEffect(() => {
    if (companyId) {
      fetchCampaigns();
    }
  }, [companyId, fetchCampaigns]);

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
              User Campaigns
            </h2>
            <div style={{ fontSize: "12.5px", color: "var(--muted, #64748b)", marginTop: "2px" }}>
              {userName ? `${userName} • ` : ""}Total {total} campaigns created
            </div>
          </div>
        </div>

        <button
          onClick={fetchCampaigns}
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
            placeholder="Search campaign by name (Backend query)..."
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
          {["ALL", "completed", "running", "failed", "draft"].map((st) => (
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
      ) : campaigns.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", background: "var(--surf, #fff)", borderRadius: "10px", border: "1px solid var(--border, #e2e8f0)", color: "var(--muted)" }}>
          No campaigns found matching criteria.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {campaigns.map((camp: any, idx: number) => {
            const st = (camp.status || "draft").toLowerCase();
            const totalRec = camp.total_recipients ?? camp.sent_count ?? 0;
            const sent = camp.sent_count ?? 0;
            const failed = camp.failed_count ?? 0;

            return (
              <div key={camp.id || idx} className="up-camp-card" onClick={() => setSelectedCampaign(camp)}>
                <div className="up-camp-content">
                  <div className="up-camp-top-row">
                    <span className="up-camp-name">{camp.name || "Untitled Campaign"}</span>
                    <span className={`up-camp-status up-camp-status--${st}`}>{camp.status || "draft"}</span>
                  </div>
                  <div className="up-camp-meta-row">
                    <span>Recipients: <strong style={{ color: "var(--title-color)" }}>{totalRec}</strong></span>
                    <span>Sent: <strong style={{ color: "var(--title-color)" }}>{sent}</strong></span>
                    {failed > 0 && (
                      <span style={{ color: "#d63939" }}>Failed: <strong>{failed}</strong></span>
                    )}
                    <span>{formatDate(camp.created_at)}</span>
                  </div>
                </div>
                <div className="up-camp-right">
                  <svg className="up-camp-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
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

      {/* Campaign Slide Drawer */}
      {selectedCampaign && (
        <>
          <div className="up-camp-drawer-overlay" onClick={() => setSelectedCampaign(null)} />
          <div className="up-camp-drawer">
            <div className="up-camp-drawer-header">
              <div className="up-camp-drawer-title">
                <Share2 size={18} style={{ color: "var(--crm-primary,#206bc4)" }} />
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "700" }}>{selectedCampaign.name}</div>
                  <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "400", marginTop: "2px" }}>
                    Campaign Details
                  </div>
                </div>
              </div>
              <button className="up-camp-drawer-close" onClick={() => setSelectedCampaign(null)}>✕</button>
            </div>

            <div className="up-camp-drawer-body">
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <span className={`up-camp-status up-camp-status--${(selectedCampaign.status || "").toLowerCase()}`} style={{ fontSize: "12.5px", padding: "4px 12px" }}>
                  {selectedCampaign.status || "draft"}
                </span>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Cost: <strong style={{ color: "var(--title-color)" }}>₹{selectedCampaign.total_cost ?? "0.00"}</strong>
                </span>
              </div>

              {/* Stats Grid */}
              <div className="up-cd-section">
                <div className="up-cd-section-title">Message Statistics</div>
                <div className="up-cd-stat-grid">
                  {[
                    { label: "Recipients", val: selectedCampaign.total_recipients ?? 0 },
                    { label: "Sent", val: selectedCampaign.sent_count ?? 0 },
                    { label: "Delivered", val: selectedCampaign.delivered_count ?? 0 },
                    { label: "Read", val: selectedCampaign.read_count ?? 0 },
                    { label: "Failed", val: selectedCampaign.failed_count ?? 0, danger: (selectedCampaign.failed_count ?? 0) > 0 },
                    { label: "Invalid No.", val: selectedCampaign.invalid_numbers_count ?? 0 },
                  ].map(({ label, val, danger }) => (
                    <div key={label} className="up-cd-stat-cell">
                      <div className="up-cd-stat-val" style={danger ? { color: "#d63939" } : {}}>{Number(val).toLocaleString()}</div>
                      <div className="up-cd-stat-lbl">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Progress */}
              <div className="up-cd-section">
                <div className="up-cd-section-title">Delivery Breakdown</div>
                {(() => {
                  const rec = selectedCampaign.total_recipients || 1;
                  const delPct = Math.min(100, Math.round(((selectedCampaign.delivered_count || 0) / rec) * 100));
                  const readPct = Math.min(100, Math.round(((selectedCampaign.read_count || 0) / rec) * 100));
                  const failPct = Math.min(100, Math.round(((selectedCampaign.failed_count || 0) / rec) * 100));
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {[
                        { label: "Delivered", pct: delPct, count: selectedCampaign.delivered_count || 0, color: "#2fb344" },
                        { label: "Read", pct: readPct, count: selectedCampaign.read_count || 0, color: "#206bc4" },
                        { label: "Failed", pct: failPct, count: selectedCampaign.failed_count || 0, color: "#d63939" },
                      ].map((item) => (
                        <div key={item.label}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                            <span style={{ color: "var(--muted)" }}>{item.label}</span>
                            <span style={{ fontWeight: "600", color: item.color }}>{item.count} ({item.pct}%)</span>
                          </div>
                          <div className="up-cd-progress-track">
                            <div className="up-cd-progress-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Timeline */}
              <div className="up-cd-section">
                <div className="up-cd-section-title">Timeline</div>
                {[
                  { label: "Created At", val: selectedCampaign.created_at },
                  { label: "Scheduled At", val: selectedCampaign.scheduled_at },
                  { label: "Started At", val: selectedCampaign.started_at },
                  { label: "Completed At", val: selectedCampaign.completed_at },
                  { label: "Updated At", val: selectedCampaign.updated_at },
                ]
                  .filter(({ val }) => val)
                  .map(({ label, val }) => (
                    <div key={label} className="up-cd-info-row">
                      <span className="up-cd-info-label">{label}</span>
                      <span className="up-cd-info-val">{formatPlanDateTime(val)}</span>
                    </div>
                  ))}
              </div>

              {/* Identifiers */}
              <div className="up-cd-section">
                <div className="up-cd-section-title">Identifiers</div>
                {[
                  { label: "Campaign ID", val: selectedCampaign.id },
                  { label: "Template ID", val: selectedCampaign.template_id },
                  { label: "Phone Number ID", val: selectedCampaign.phone_number_id },
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

