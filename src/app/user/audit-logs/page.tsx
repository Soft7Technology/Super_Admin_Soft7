"use client";

import { useEffect, useState } from "react";

import { Download, MoreHorizontal, RefreshCw } from "lucide-react";

import { axiosInstance } from "@/lib/axiosInstance";
import "./audit-logs.css";

interface ActivityLog {
  id: string;

  company_id: string;

  user_id: string | null;

  action: string;

  entity_type: string;

  entity_id: string | null;

  description: string;

  status: string;

  created_at: string;
}

interface ActivitiesResponse {
  success: boolean;

  message: string;

  data: {
    items: ActivityLog[];

    pagination: {
      page: number;

      limit: number;

      total: number;
    };
  };
}

const formatDateTime = (date: string) => {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "—";

  return value.toLocaleString(undefined, {
    month: "short",

    day: "numeric",

    year: "numeric",

    hour: "numeric",

    minute: "2-digit",
  });
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [userFilter, setUserFilter] = useState("");

  const [typeFilter, setTypeFilter] = useState("");

  const [actionFilter, setActionFilter] = useState("");

  const [dateFilter, setDateFilter] = useState("");

  const [page, setPage] = useState(1);

  const [limit, setLimit] = useState(25);

  const [totalItems, setTotalItems] = useState(0);

  const [menuOpen, setMenuOpen] = useState(false);

  const [clearModalOpen, setClearModalOpen] = useState(false);

  const [clearInput, setClearInput] = useState("");

  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search.trim());
  }, 1000);

  return () => clearTimeout(timer);
}, [search]);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);

      try {
       const response = await axiosInstance.get("/v1/super-admin/activities", {
         params: {
           page,
           limit,
           ...(debouncedSearch ? { search: debouncedSearch } : {}),
         },
       });

        const data = response.data?.data;

        setLogs(data?.items ?? []);

        setTotalItems(data?.pagination?.total ?? 0);
      } catch (error) {
        console.error("Failed to fetch activity logs:", error);

        setLogs([]);

        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [page, limit, refreshKey, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const exportCSV = () => {
    const headers = [
      "action",

      "entity_type",

      "description",

      "status",

      "created_at",
    ];

    const escapeCSV = (value: unknown) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = logs.map((log) =>
      [log.action, log.entity_type, log.description, log.status, log.created_at]

        .map(escapeCSV)

        .join(","),
    );

    const csv = [headers.join(","), ...rows].join("\n");

    const link = document.createElement("a");

    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;

    link.download = "activity-logs.csv";

    link.click();
  };

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey((value) => value + 1);
  };

  const handleClearLogs = () => {
    // Connect this action to the backend clear-logs API

    // once the backend endpoint is provided. This currently clears only

    // the records displayed in the current frontend state.

    setLogs([]);

    setTotalItems(0);

    setClearInput("");

    setClearModalOpen(false);
  };

  const pageButtons: (number | "…")[] = [];

  for (let i = 1; i <= totalPages; i += 1) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pageButtons.push(i);
    } else if (pageButtons[pageButtons.length - 1] !== "…") {
      pageButtons.push("…");
    }
  }

  const firstItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;

  const lastItem = Math.min(page * limit, totalItems);

  return (
    <div className="al-page">
      <div className="wrap">
        <div className="head">
          <div>
            <h1>Activity logs</h1>

            <div className="sub">
              Monitor system activities and user actions
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              className="btn"
              onClick={exportCSV}
              style={{ display: "inline-flex", alignItems: "center", gap: 7 }}
            >
              <Download size={15} strokeWidth={2.5} />
              Export CSV
            </button>

            <div className="menu">
              <button
                className="btn"
                onClick={() => setMenuOpen((value) => !value)}
                style={{ padding: "9px 12px" }}
              >
                <MoreHorizontal size={17} strokeWidth={2.5} />
              </button>

              <div className={`pop ${menuOpen ? "open" : ""}`}>
                <button
                  className="red"
                  onClick={() => {
                    setMenuOpen(false);

                    setClearModalOpen(true);
                  }}
                >
                  Clear logs…
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bar">
          <input
            placeholder="Search activity…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />

          <select
            value={userFilter}
            onChange={(event) => setUserFilter(event.target.value)}
          >
            <option value="">All users</option>
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="">All types</option>
          </select>

          <select
            value={actionFilter}
            onChange={(event) => setActionFilter(event.target.value)}
          >
            <option value="">All actions</option>
          </select>

          <select
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
          >
            <option value="">All dates</option>
          </select>

          <button
            type="button"
            className="crm-refresh-btn"
            onClick={handleRefresh}
            title="Refresh"
            aria-label="Refresh activity logs"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="tbl">
          <div className="scroll">
            <div
              className="th"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(240px, 1fr) minmax(320px, 1.4fr) 220px",
                alignItems: "center",
              }}
            >
              <div>Activity</div>
              <div style={{ textAlign: "center" }}>Description</div>
              <div style={{ textAlign: "right", paddingRight: 28 }}>Time</div>
            </div>
            <div className="tbl-body">
              {loading ? (
                Array.from({ length: Math.min(limit, 6) }).map((_, index) => (
                  <div className="row" key={index}>
                    <div className="sk" />

                    <div className="sk" />

                    <div className="sk" />
                  </div>
                ))
              ) : logs.length === 0 ? (
                <div className="empty">
                  <b>No activity found</b>
                  <br />
                  There are no activity records to display.
                </div>
              ) : (
                logs.map((log) => {
                  const title =
                    [log.action, log.entity_type].filter(Boolean).join(" · ") ||
                    "Activity";

                  return (
                    <div
                      className="row"
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "minmax(240px, 1fr) minmax(320px, 1.4fr) 220px",
                        alignItems: "center",
                      }}
                    >
                      <div className="act" style={{ minWidth: 0 }}>
                        <div
                          className="activity-title"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            gap: 7,
                            minWidth: 0,
                          }}
                        >
                          <span className="t1">{title}</span>
                          <span
                            className={`status-badge ${
                              log.status?.toLowerCase() === "success"
                                ? "status-success"
                                : "status-default"
                            }`}
                          >
                            {log.status || "—"}
                          </span>
                        </div>
                      </div>

                      <div
                        className="t1"
                        style={{
                          minWidth: 0,
                          textAlign: "center",
                          overflow: "hidden",

                          textOverflow: "ellipsis",

                          whiteSpace: "nowrap",
                        }}
                        title={log.description || undefined}
                      >
                        {log.description || "—"}
                      </div>

                      <div
                        className="time"
                        style={{
                          textAlign: "right",
                          paddingRight: 28,
                          justifySelf: "end",
                          width: "100%",
                        }}
                        title={new Date(log.created_at).toLocaleString()}
                      >
                        {formatDateTime(log.created_at)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="foot">
          <div>
            Showing <b>{firstItem}</b>-<b>{lastItem}</b> of <b>{totalItems}</b>{" "}
            activities
          </div>

          <div className="pg">
            <div
              style={{
                display: "flex",

                alignItems: "center",

                gap: "8px",

                marginRight: "16px",
              }}
            >
              Rows per page
              <select
                className="ib"
                style={{
                  padding: "4px 8px",

                  marginLeft: "4px",

                  outline: "none",

                  border: "none",

                  background: "transparent",

                  fontWeight: 500,
                }}
                value={limit}
                onChange={(event) => {
                  setLimit(Number(event.target.value));

                  setPage(1);
                }}
              >
                <option value={10}>10</option>

                <option value={25}>25</option>

                <option value={50}>50</option>
              </select>
            </div>

            <div
              style={{
                display: "flex",

                alignItems: "center",

                gap: "8px",

                marginRight: "16px",
              }}
            >
              Go to page
              <input
                type="number"
                min={1}
                max={totalPages}
                className="ib"
                style={{ width: "50px", padding: "4px 8px", outline: "none" }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;

                  const value = Number(
                    (event.target as HTMLInputElement).value,
                  );

                  if (value >= 1 && value <= totalPages) setPage(value);
                }}
              />
            </div>

            <button
              className="text-btn"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              ‹ Prev
            </button>

            {pageButtons.map((value, index) =>
              value === "…" ? (
                <span key={`ellipsis-${index}`}>…</span>
              ) : (
                <button
                  key={value}
                  className={`num-btn ${value === page ? "on" : ""}`}
                  onClick={() => setPage(value)}
                >
                  {value}
                </button>
              ),
            )}

            <button
              className="text-btn"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next ›
            </button>
          </div>
        </div>
      </div>

      <div
        className={`ov ${selectedLog || clearModalOpen ? "open" : ""}`}
        style={{ zIndex: 99998 }}
        onClick={() => {
          setSelectedLog(null);

          setClearModalOpen(false);
        }}
      />

      <aside
        className={`dr ${selectedLog ? "open" : ""}`}
        style={{ zIndex: 99999 }}
      >
        {selectedLog && (
          <>
            <div
              style={{
                display: "flex",

                justifyContent: "space-between",

                alignItems: "center",
              }}
            >
              <span className="badge">{selectedLog.status || "—"}</span>

              <button className="btn" onClick={() => setSelectedLog(null)}>
                Close
              </button>
            </div>

            <h3 style={{ margin: "16px 0 4px" }}>
              {[selectedLog.action, selectedLog.entity_type]

                .filter(Boolean)

                .join(" · ") || "Activity"}
            </h3>

            <div className="sub">{formatDateTime(selectedLog.created_at)}</div>

            <div className="kv">
              <span>Description</span>

              <div>{selectedLog.description || "—"}</div>

              <span>Action</span>

              <div>{selectedLog.action || "—"}</div>

              <span>Type</span>

              <div>{selectedLog.entity_type || "—"}</div>

              <span>Status</span>

              <div>{selectedLog.status || "—"}</div>

              <span>Created at</span>

              <div>{formatDateTime(selectedLog.created_at)}</div>
            </div>
          </>
        )}
      </aside>

      <div className={`modal ${clearModalOpen ? "open" : ""}`}>
        <h3 style={{ margin: "0 0 8px" }}>Clear all logs?</h3>

        <div className="sub">
          This currently clears the activity records shown in the frontend. A
          backend clear-logs API is still required for permanent deletion. Type{" "}
          <b>CLEAR</b> to confirm.
        </div>

        <input
          placeholder="CLEAR"
          value={clearInput}
          onChange={(event) => setClearInput(event.target.value)}
        />

        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
        >
          <button
            className="btn"
            onClick={() => {
              setClearModalOpen(false);

              setClearInput("");
            }}
          >
            Cancel
          </button>

          <button
            className="btn dg"
            disabled={clearInput !== "CLEAR"}
            onClick={handleClearLogs}
          >
            Clear logs
          </button>
        </div>
      </div>
    </div>
  );
}
