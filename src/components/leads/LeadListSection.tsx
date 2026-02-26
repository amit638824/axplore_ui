"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/lib/contexts/UserContext";

/** Lead row from POST /api/leads/getLeads - matches backend response with nested objects */
interface LeadRow {
  leadId?: string;
  contactMobile?: string;
  contactEmail?: string;
  division?: { divisionName?: string };
  subDivision?: { subDivisionName?: string };
  corporate?: { corporateName?: string };
  contactPerson?: { firstName?: string; lastName?: string };
  salesBranch?: { branchName?: string };
  leadStatus?: { statusName?: string; statusCode?: string; description?: string };
  tripInfo?: { tripType?: string; tripName?: string; specificTravelDate?: string } | null;
  salesUser?: { firstName?: string; lastName?: string };
  createdAt?: string;
  tripDate?: string;
  [key: string]: unknown;
}

function str(val: unknown): string {
  if (val == null) return "—";
  if (typeof val === "string") return val.trim() || "—";
  if (typeof val === "number") return String(val);
  return "—";
}

function contactName(cp?: { firstName?: string; lastName?: string }): string {
  if (!cp) return "—";
  const name = [cp.firstName, cp.lastName].filter(Boolean).join(" ").trim();
  return name || "—";
}

function getStatusBadgeClass(status?: string): string {
  if (!status) return "badge-soft-secondary";
  const s = status.toLowerCase();
  if (s.includes("converted")) return "badge-soft-success";
  if (s.includes("lost")) return "badge-soft-danger";
  if (s.includes("follow")) return "badge-soft-primary";
  if (s.includes("new")) return "badge-soft-purple";
  if (s.includes("hot")) return "badge-soft-danger";
  if (s.includes("warm")) return "badge-soft-warning";
  if (s.includes("cold")) return "badge-soft-info";
  return "badge-soft-secondary";
}

function formatDate(val?: string): string {
  if (!val) return "—";
  try {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return val;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return val;
  }
}

function exportCurrentPageCSV(rows: LeadRow[]): void {
  const headers = [
    "Corporate", "Division", "Sub Division", "Point of Contact", "Mobile", "Email",
    "Trip Type", "Sales Rep", "Branch", "Status", "Trip Date",
  ];
  const escape = (v: string) => (v.includes(";") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v);
  const rowToCells = (lead: LeadRow) => [
    str(lead.corporate?.corporateName),
    str(lead.division?.divisionName),
    str(lead.subDivision?.subDivisionName),
    contactName(lead.contactPerson),
    str(lead.contactMobile),
    str(lead.contactEmail),
    str(lead.tripInfo?.tripType),
    contactName(lead.salesUser),
    str(lead.salesBranch?.branchName),
    str(lead.leadStatus?.statusName),
    formatDate(lead.tripInfo?.specificTravelDate ?? lead.tripDate ?? lead.createdAt),
  ].map(escape).join(";");
  const csv = [headers.join(";"), ...rows.map(rowToCells)].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `leads-page-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

const PAGE_SIZE_OPTIONS = [10, 20, 25, 50];

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Lead list table section. Fetches from GET /api-next/leads (proxied to POST http://localhost:4000/api/leads/getLeads).
 * Uses server-side pagination via query params page & limit.
 */
export default function LeadListSection() {
  const pathname = usePathname();
  const { user, loading: userLoading } = useUser();
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const shouldFetch = Boolean(user && (pathname === "/leads" || pathname?.startsWith("/leads/")));

  useEffect(() => {
    if (!shouldFetch) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    fetch(`/api-next/leads?${params}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 401 ? "Unauthorized" : "Failed to load leads");
        return res.json();
      })
      .then((data: unknown) => {
        if (cancelled) return;
        const res = data as { data?: LeadRow[]; pagination?: PaginationInfo };
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(data) ? data : [];
        setLeads(list);
        if (res?.pagination) {
          setPagination(res.pagination);
        } else {
          setPagination({
            page,
            limit,
            total: list.length,
            totalPages: 1,
          });
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load leads");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [shouldFetch, page, limit, user, userLoading]);

  const showUserLoading = userLoading || (!user && !error);
  const showSpinner = showUserLoading || (shouldFetch && loading);

  const displayLeads = leads;
  const pag = pagination;
  const totalPages = pag?.totalPages ?? 1;
  const total = pag?.total ?? 0;
  const from = total === 0 ? 0 : (pag?.page ?? 1) * (pag?.limit ?? limit) - (pag?.limit ?? limit) + 1;
  const to = Math.min((pag?.page ?? 1) * (pag?.limit ?? limit), total);

  const goToPage = (p: number) => {
    const next = Math.max(1, Math.min(p, totalPages));
    setPage(next);
  };

  const onLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value) || 10;
    setLimit(val);
    setPage(1);
  };

  return (
    <div className="row">
      <div className="col-12">
        <div className="card lead-list-card">
          <div className="card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div>
              <h4 className="card-title mb-1">All Leads</h4>
              <p className="text-muted mb-0">
                View, filter, and take action on leads with ease.
              </p>
            </div>
            {!showSpinner && !error && (
              <div className="lead-list-export-buttons">
                <button
                  type="button"
                  className="btn btn-sm btn-primary csv"
                  title="Export current page as CSV"
                  onClick={() => exportCurrentPageCSV(displayLeads)}
                >
                  <i className="far fa-file-excel me-1" aria-hidden />
                  CSV
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-primary pdf"
                  title="Export PDF (current page)"
                  disabled
                  aria-label="PDF export not available with server pagination"
                >
                  <i className="far fa-file-pdf me-1" aria-hidden />
                  PDF
                </button>
              </div>
            )}
          </div>
          <div className="card-body">
            {showSpinner && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">
                  {showUserLoading ? "Loading..." : "Loading leads..."}
                </p>
              </div>
            )}
            {error && (
              <div className="alert alert-danger mb-0">
                {error}
              </div>
            )}
            {!showSpinner && !error && (
              <div className="table-responsive lead-list-table-wrap">
                <table className="table table-hover" id="datatable_2" data-table-ready="true" data-pagination="server">
                  <thead className="thead-light">
                    <tr>
                      <th>Corporate</th>
                      <th>Division</th>
                      <th>Sub Division</th>
                      <th>Point of Contact</th>
                      <th>Mobile</th>
                      <th>Email</th>
                      <th>Trip Type</th>
                      <th>Sales Rep</th>
                      <th>Branch</th>
                      <th>Status</th>
                      <th data-type="date" data-format="DD/MM/YYYY">
                        Trip Date
                      </th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayLeads.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="text-center text-muted py-4">
                          No leads found.
                        </td>
                      </tr>
                    ) : (
                      displayLeads.map((lead, idx) => {
                        const status = str(lead.leadStatus?.statusName);
                        const editHref = lead.leadId != null ? `/leads/create?id=${lead.leadId}` : "#";
                        return (
                          <tr key={lead.leadId ?? idx}>
                            <td>{str(lead.corporate?.corporateName)}</td>
                            <td>{str(lead.division?.divisionName)}</td>
                            <td>{str(lead.subDivision?.subDivisionName)}</td>
                            <td>{contactName(lead.contactPerson)}</td>
                            <td>{str(lead.contactMobile)}</td>
                            <td>{str(lead.contactEmail)}</td>
                            <td>{str(lead.tripInfo?.tripType)}</td>
                            <td>{contactName(lead.salesUser)}</td>
                            <td>{str(lead.salesBranch?.branchName)}</td>
                            <td>
                              <span className={`badge badge-md ${getStatusBadgeClass(status)}`}>
                                {status}
                              </span>
                            </td>
                            <td>{formatDate(lead.tripInfo?.specificTravelDate ?? lead.tripDate ?? lead.createdAt)}</td>
                            <td className="text-end">
                              <div className="dropdown d-inline-block">
                                <a
                                  className="dropdown-toggle arrow-none"
                                  id={`dLabel-${lead.leadId ?? idx}`}
                                  data-bs-toggle="dropdown"
                                  href="#"
                                  role="button"
                                  aria-haspopup="false"
                                  aria-expanded="false"
                                >
                                  <i className="las la-ellipsis-v font-20 text-muted"></i>
                                </a>
                                <div
                                  className="dropdown-menu dropdown-menu-end"
                                  aria-labelledby={`dLabel-${lead.leadId ?? idx}`}
                                >
                                  <Link className="dropdown-item" href={editHref}>
                                    Edit / Archive
                                  </Link>
                                  <Link className="dropdown-item" href="#">
                                    Documents
                                  </Link>
                                  <Link className="dropdown-item" href="#">
                                    Cost Sheets
                                  </Link>
                                  <Link className="dropdown-item" href="#">
                                    Proposals
                                  </Link>
                                  <Link className="dropdown-item" href="#">
                                    Agreements
                                  </Link>
                                  <Link className="dropdown-item" href="#">
                                    Invoices
                                  </Link>
                                  <Link className="dropdown-item" href="#">
                                    Project
                                  </Link>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {!showSpinner && !error && (totalPages > 1 || total > limit) && (
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3 pt-3 border-top">
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted font-13">
                    Showing {from} to {to} of {total} entries
                  </span>
                  <select
                    className="form-select form-select-sm w-auto"
                    value={limit}
                    onChange={onLimitChange}
                    aria-label="Rows per page"
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <span className="text-muted font-13">per page</span>
                </div>
                <nav aria-label="Lead list pagination">
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => goToPage(page - 1)}
                        disabled={page <= 1}
                        aria-label="Previous"
                      >
                        <i className="ti ti-chevron-left" aria-hidden />
                      </button>
                    </li>
                    {(() => {
                      const pages: number[] = [];
                      if (totalPages <= 7) {
                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                      } else {
                        pages.push(1);
                        let lo = Math.max(2, page - 2);
                        let hi = Math.min(totalPages - 1, page + 2);
                        if (lo > 2) pages.push(-1);
                        for (let i = lo; i <= hi; i++) if (i !== 1 && i !== totalPages) pages.push(i);
                        if (hi < totalPages - 1) pages.push(-2);
                        if (totalPages > 1) pages.push(totalPages);
                      }
                      return pages.map((p) =>
                        p < 0 ? (
                          <li key={p} className="page-item disabled">
                            <span className="page-link">…</span>
                          </li>
                        ) : (
                          <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
                            <button
                              type="button"
                              className="page-link"
                              onClick={() => goToPage(p)}
                              aria-current={p === page ? "page" : undefined}
                            >
                              {p}
                            </button>
                          </li>
                        )
                      );
                    })()}
                    <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => goToPage(page + 1)}
                        disabled={page >= totalPages}
                        aria-label="Next"
                      >
                        <i className="ti ti-chevron-right" aria-hidden />
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
