"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axiosInstance";
import "./campaigns.css"
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
