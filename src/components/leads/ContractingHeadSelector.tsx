"use client";

import React, { useEffect, useState } from "react";
import { redirectToLoginIfUnauthorized } from "@/lib/api/auth";
import { getLeadDraft, getLastSavedLeadId } from "@/lib/leads/leadDraftStorage";

interface ContractingHead {
  userId: string;
  firstName: string;
  lastName: string;
}

interface SalesRefUsersResponse {
  success: boolean;
  message: string;
  data: {
    salesRefUsers: Array<{
      userId: string;
      employeeCode: string;
      firstName: string;
      lastName: string;
      branch: {
        branchId: string;
        branchName: string;
        branchCode: string;
      };
    }>;
    branches: Array<{
      branchId: string;
      branchName: string;
      branchCode: string;
    }>;
    contractingHeads: ContractingHead[];
    contractingTeams: Array<{
      userId: string;
      firstName: string;
      lastName: string;
    }>;
  };
}

export default function ContractingHeadSelector({
  name = "contractingHead",
  value,
  onChange,
}: {
  name?: string;
  value?: string;
  onChange?: (userId: string) => void;
}) {
  const [heads, setHeads] = useState<ContractingHead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHead, setSelectedHead] = useState<string>(value || "");

  useEffect(() => {
    const draft = getLeadDraft(getLastSavedLeadId());
    if (draft?.step1?.contractingHeadUserId) setSelectedHead(draft.step1.contractingHeadUserId);
    const onRestore = (e: CustomEvent<{ draft: { step1?: { contractingHeadUserId?: string } } }>) => {
      if (e.detail?.draft?.step1?.contractingHeadUserId != null)
        setSelectedHead(e.detail.draft.step1.contractingHeadUserId);
    };
    window.addEventListener("leadDraftRestore", onRestore as EventListener);
    return () => window.removeEventListener("leadDraftRestore", onRestore as EventListener);
  }, []);

  useEffect(() => {
    if (value != null && value !== selectedHead) setSelectedHead(value);
  }, [value]);

  useEffect(() => {
    const fetchContractingHeads = async () => {
      try {
        setLoading(true);
        setError(null);

        const resp = await fetch("/api-next/auth/salesref-users", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (redirectToLoginIfUnauthorized(resp)) return;
        if (!resp.ok) {
          throw new Error("Failed to fetch contracting heads");
        }

        const body = (await resp.json()) as SalesRefUsersResponse;

        // Handle response structure
        if (body.success && body.data?.contractingHeads) {
          setHeads(body.data.contractingHeads);
          // No default selection - user must select manually
        } else {
          throw new Error("Invalid contracting heads response");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load contracting heads");
        console.error("Contracting heads fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContractingHeads();
  }, []);

  const handleHeadChange = (userId: string) => {
    setSelectedHead(userId);
    onChange?.(userId);
  };

  if (loading) {
    return (
      <div className="col-lg-9">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Loading contracting heads...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-lg-9">
        <div className="text-danger small">{error}</div>
      </div>
    );
  }

  return (
    <div className="col-lg-9">
      <select
        className="form-select"
        aria-label="Select contracting head"
        name={name}
        value={selectedHead}
        onChange={(e) => handleHeadChange(e.target.value)}
      >
        <option value="">Select Contracting Head</option>
        {heads.map((head) => (
          <option key={head.userId} value={head.userId}>
            {head.firstName} {head.lastName}
          </option>
        ))}
      </select>
    </div>
  );
}
