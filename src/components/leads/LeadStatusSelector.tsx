"use client";

import React, { useEffect, useState } from "react";
import type { LeadStatus } from "@/lib/types/leadStatus";
import { redirectToLoginIfUnauthorized } from "@/lib/api/auth";
import { useUser } from "@/lib/contexts/UserContext";
import {
  getLeadDraft,
  getLastSavedLeadId,
  setLeadDraft,
} from "@/lib/leads/leadDraftStorage";
import toast from "react-hot-toast";

export default function LeadStatusSelector({
  name = "leadstatus",
  value,
  onChange,
}: {
  name?: string;
  value?: string;
  onChange?: (statusId: string) => void;
}) {
  const { user } = useUser();
  const [statuses, setStatuses] = useState<LeadStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>(
    value || "",
  );

  useEffect(() => {
    const fetchLeadStatuses = async () => {
      try {
        setLoading(true);
        setError(null);

        const resp = await fetch("/api-next/leadstatus", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (redirectToLoginIfUnauthorized(resp)) return;
        if (!resp.ok) {
          throw new Error("Failed to fetch lead status");
        }

        const body = await resp.json();

        // Handle response structure: { success: true, message: "...", data: [...] }
        if (body.success && Array.isArray(body.data)) {
          const sortedStatuses = [...body.data].sort(
            (a, b) => a.displayOrder - b.displayOrder,
          );
          setStatuses(sortedStatuses);
          const draft = getLeadDraft(getLastSavedLeadId());
          const draftStatusId = draft?.step1?.leadStatusId;
          const hasDraftStatus =
            draftStatusId &&
            sortedStatuses.some((s) => s.leadStatusId === draftStatusId);
          if (hasDraftStatus) {
            setSelectedStatus(draftStatusId!);
            onChange?.(draftStatusId!);
          } else if (!selectedStatus && sortedStatuses.length > 0) {
            const firstStatusId = sortedStatuses[0].leadStatusId;
            setSelectedStatus(firstStatusId);
            onChange?.(firstStatusId);
          }
        } else if (Array.isArray(body.data)) {
          const sortedStatuses = [...body.data].sort(
            (a, b) => a.displayOrder - b.displayOrder,
          );
          setStatuses(sortedStatuses);
          const draft = getLeadDraft(getLastSavedLeadId());
          const draftStatusId = draft?.step1?.leadStatusId;
          const hasDraftStatus =
            draftStatusId &&
            sortedStatuses.some((s) => s.leadStatusId === draftStatusId);
          if (hasDraftStatus) {
            setSelectedStatus(draftStatusId!);
            onChange?.(draftStatusId!);
          } else if (!selectedStatus && sortedStatuses.length > 0) {
            const firstStatusId = sortedStatuses[0].leadStatusId;
            setSelectedStatus(firstStatusId);
            onChange?.(firstStatusId);
          }
        } else {
          throw new Error("Invalid lead status response");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load lead status");
        console.error("Lead Status fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadStatuses();
  }, []);

  const handleStatusChange = async (statusId: string) => {
    setSelectedStatus(statusId);
    onChange?.(statusId);

    const leadId =
      typeof window !== "undefined"
        ? localStorage.getItem("lastSavedLeadId") ||
          sessionStorage.getItem("lastSavedLeadId")
        : null;
    if (!leadId) return;

    try {
      const resp = await fetch("/api-next/leads/status/updateLeadStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          leadId,
          modifiedBy: user?.userId ?? undefined,
          leadStatusId: statusId,
        }),
      });
      if (redirectToLoginIfUnauthorized(resp)) return;
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        toast.error(data?.message ?? data?.error ?? "Failed to update lead status");
      } else {
        const statusName = statuses.find((s) => s.leadStatusId === statusId)?.statusName;
        setLeadDraft(leadId, { step1: { leadStatusId: statusId, leadStatusName: statusName } });
      }
    } catch {
      toast.error("Failed to update lead status");
    }
  };

  if (loading) {
    return (
      <div className="col-lg-9 d-flex align-items-center" style={{ gap: '40px' }}>
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Loading status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-lg-9 d-flex align-items-center" style={{ gap: '40px' }}>
        <div className="text-danger small">{error}</div>
      </div>
    );
  }

  return (
    <div
      className="col-lg-9 d-flex align-items-center flex-wrap"
      style={{ gap: "0.75rem 2rem" }}
    >
      {statuses.map((status) => {
        const inputId = `status-${status.leadStatusId}`;
        const isChecked = selectedStatus === status.leadStatusId;

        return (
          <div key={status.leadStatusId} className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name={name}
              id={inputId}
              value={status.leadStatusId}
              checked={isChecked}
              onChange={() => handleStatusChange(status.leadStatusId)}
            />
            <label className="form-check-label" htmlFor={inputId}>
              {status.statusName}
            </label>
          </div>
        );
      })}
    </div>
  );
}
