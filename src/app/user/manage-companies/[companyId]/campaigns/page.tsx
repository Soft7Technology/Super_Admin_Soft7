"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axiosInstance";

interface Campaign {
  id: string;
  company_id: string;
  user_id: string;
  phone_number_id: string;
  template_id: string;
  name: string;
  description: string | null;
  status: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  invalid_numbers_count: number;
  total_cost: string;
  failure_reason: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString();
}

function getCampaignStatus(status: string) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "completed" || normalized === "success") {
    return {
      label: normalized === "success" ? "Success" : "Completed",
      className: "success",
    };
  }

  if (normalized === "failed" || normalized === "error") {
    return { label: "Failed", className: "failed" };
  }

  if (normalized === "running" || normalized === "in_progress") {
    return { label: "Running", className: "running" };
  }

  if (normalized === "scheduled") {
    return { label: "Scheduled", className: "scheduled" };
  }

  return {
    label: status || "Unknown",
    className: "other",
  };
}

export default function CampaignsPage() {
  const params = useParams();
  const router = useRouter();

  const companyId = params?.companyId as string;

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 25,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(pagination.total / pagination.limit)),
    [pagination.total, pagination.limit],
  );

  useEffect(() => {
    if (!companyId) return;

    const fetchCampaigns = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get(
          `/v1/super-admin/companies/${companyId}/campaign`,
          {
            params: {
              page: pagination.page,
              limit: pagination.limit,
            },
          },
        );

        const payload = response.data?.data ?? response.data;
        const items = Array.isArray(payload?.items) ? payload.items : [];

        setCampaigns(items);

        setPagination((current) => ({
          ...current,
          page: Number(payload?.pagination?.page ?? current.page),
          limit: Number(payload?.pagination?.limit ?? current.limit),
          total: Number(payload?.pagination?.total ?? 0),
        }));
      } catch (err: any) {
        console.error("GET CAMPAIGNS ERROR =>", err);

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to load campaigns.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [companyId, pagination.page, pagination.limit]);

  return (
    <div className="full-list-page">
      <style jsx>{`
        .full-list-page {
          min-height: 100vh;
          padding: 24px 28px;
          background: var(--bg, #f0f7f3);
          color: var(--text, #1b2d27);
        }

        .full-list-container {
          max-width: 100%;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 22px;
        }

        .back-button {
          border: 0;
          background: transparent;
          padding: 0;
          color: var(--primary, #087f5b);
          font-weight: 700;
          cursor: pointer;
          margin-bottom: 10px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.2s;
        }

        .back-button:hover {
          opacity: 0.8;
        }

        .page-header h1 {
          margin: 0;
          color: var(--title-color, #13231e);
          font-size: 26px;
          font-weight: 800;
        }

        .page-header p {
          margin: 7px 0 0;
          color: var(--muted, #70807a);
          font-size: 14px;
        }

        .count-pill {
          padding: 8px 14px;
          border: 1px solid var(--border, #d8e7e1);
          border-radius: 999px;
          background: var(--card-bg, #ffffff);
          color: var(--text-sub, #4f625b);
          font-weight: 700;
          white-space: nowrap;
          font-size: 13px;
        }

        .list-card {
          overflow: hidden;
          border: 1px solid var(--border, #e0ebe7);
          border-radius: 16px;
          background: var(--card-bg, #ffffff);
          box-shadow: var(--shadow-card, 0 5px 20px rgba(0, 0, 0, 0.06));
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 0;
          table-layout: fixed;
          border-collapse: collapse;
        }

        th,
        td {
          padding: 12px 14px;
          border-bottom: 1px solid var(--border, #edf2f0);
          text-align: left;
          white-space: nowrap;
        }

        th {
          background: var(--surf2, #f7faf9);
          color: var(--muted, #71827c);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-weight: 700;
        }

        td {
          color: var(--text-sub, #4c5d57);
          font-size: 13px;
        }

        tbody tr:hover {
          background: var(--row-hover, rgba(8, 127, 91, 0.05));
        }

        .campaign-name {
          display: block;
          overflow: hidden;
          color: var(--title-color, #182923);
          font-weight: 700;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .status-badge::before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .success {
          color: var(--success, #087f5b);
          background: rgba(16, 185, 129, 0.15);
        }

        .failed {
          color: var(--danger, #d92d20);
          background: rgba(239, 68, 68, 0.15);
        }

        .running {
          color: var(--warn, #b77900);
          background: rgba(245, 158, 11, 0.15);
        }

        .scheduled,
        .other {
          color: var(--primary, #087f5b);
          background: rgba(8, 127, 91, 0.15);
        }

        .loading,
        .error-state {
          padding: 50px 24px;
          text-align: center;
          color: var(--muted, #71827c);
          font-size: 14px;
        }

        .error-state {
          color: var(--danger, #c92a2a);
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 12px 14px;
          border-top: 1px solid var(--border, #edf2f0);
        }

        .pagination-info {
          color: var(--muted, #71827c);
          font-size: 14px;
        }

        .pagination-actions {
          display: flex;
          gap: 8px;
        }

        .pagination-button {
          min-width: 74px;
          padding: 9px 13px;
          border: 1px solid var(--border, #d5e3de);
          border-radius: 9px;
          background: var(--card-bg, #ffffff);
          color: var(--text, #315048);
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s, background 0.2s, border-color 0.2s;
        }

        .pagination-button:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }

        @media (max-width: 700px) {
          .full-list-page {
            padding: 18px;
          }

          .page-header {
            flex-direction: column;
          }

          .pagination {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="full-list-container">
        <header className="page-header">
          <div>
            <button
              type="button"
              className="back-button"
              onClick={() => router.push(`/user/manage-companies/${companyId}`)}
            >
              ← Back to Company Details
            </button>

            <h1>Campaigns</h1>
            <p>
              All campaigns and their delivery performance for this company.
            </p>
          </div>

          <span className="count-pill">
            {pagination.total.toLocaleString("en-IN")} campaigns
          </span>
        </header>

        <section className="list-card">
          {loading ? (
            <div className="loading">Loading campaigns...</div>
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : campaigns.length === 0 ? (
            <div className="loading">No campaigns found.</div>
          ) : (
            <>
              <div className="table-wrapper">
                <table>
                  <colgroup>
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "9%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "13%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Campaign</th>
                      <th>Status</th>
                      <th>Created / Updated</th>
                      <th>Sent</th>
                      <th>Delivered</th>
                      <th>Failed</th>
                      <th>Read</th>
                      <th>Invalid</th>
                    </tr>
                  </thead>

                  <tbody>
                    {campaigns.map((campaign) => {
                      const status = getCampaignStatus(campaign.status);

                      return (
                        <tr key={campaign.id}>
                          <td>
                            <span className="campaign-name">
                              {campaign.name || "—"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`status-badge ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>

                          <td>
                            {formatDateTime(
                              campaign.updated_at || campaign.created_at,
                            )}
                          </td>

                          <td>
                            {Number(campaign.sent_count ?? 0).toLocaleString(
                              "en-IN",
                            )}
                          </td>
                          <td>
                            {Number(
                              campaign.delivered_count ?? 0,
                            ).toLocaleString("en-IN")}
                          </td>
                          <td>
                            {Number(campaign.failed_count ?? 0).toLocaleString(
                              "en-IN",
                            )}
                          </td>
                          <td>
                            {Number(campaign.read_count ?? 0).toLocaleString(
                              "en-IN",
                            )}
                          </td>
                          <td>
                            {Number(
                              campaign.invalid_numbers_count ?? 0,
                            ).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <span className="pagination-info">
                  Page {pagination.page} of {totalPages}
                </span>

                <div className="pagination-actions">
                  <button
                    type="button"
                    className="pagination-button"
                    disabled={pagination.page <= 1 || loading}
                    onClick={() =>
                      setPagination((current) => ({
                        ...current,
                        page: current.page - 1,
                      }))
                    }
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    className="pagination-button"
                    disabled={pagination.page >= totalPages || loading}
                    onClick={() =>
                      setPagination((current) => ({
                        ...current,
                        page: current.page + 1,
                      }))
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
