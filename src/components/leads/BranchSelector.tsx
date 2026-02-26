"use client";

import React, { useEffect, useState } from "react";
import { redirectToLoginIfUnauthorized } from "@/lib/api/auth";
import { getLeadDraft, getLastSavedLeadId } from "@/lib/leads/leadDraftStorage";

interface Branch {
  branchId: string;
  branchName: string;
  branchCode: string;
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
      branch: Branch;
    }>;
    branches: Branch[];
    contractingHeads: Array<{
      userId: string;
      firstName: string;
      lastName: string;
    }>;
    contractingTeams: Array<{
      userId: string;
      firstName: string;
      lastName: string;
    }>;
  };
}

export default function BranchSelector({
  name = "branch",
  value,
  onChange,
}: {
  name?: string;
  value?: string;
  onChange?: (branchId: string) => void;
}) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>(value || "");

  useEffect(() => {
    if (value !== undefined && value !== selectedBranch) {
      setSelectedBranch(value);
    }
  }, [value]);

  useEffect(() => {
    const fetchBranches = async () => {
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
          throw new Error("Failed to fetch branches");
        }

        const body = (await resp.json()) as SalesRefUsersResponse;

        // Handle response structure
        if (body.success && body.data?.branches) {
          const branchesList = body.data.branches;
          setBranches(branchesList);
          const draft = getLeadDraft(getLastSavedLeadId());
          const draftBranchId = draft?.step1?.salesBranchId;
          const hasDraftBranch =
            draftBranchId &&
            branchesList.some((b) => b.branchId === draftBranchId);
          if (hasDraftBranch) {
            setSelectedBranch(draftBranchId!);
            onChange?.(draftBranchId!);
          } else if (!selectedBranch && branchesList.length > 0) {
            const firstBranchId = branchesList[0].branchId;
            setSelectedBranch(firstBranchId);
            onChange?.(firstBranchId);
          }
        } else {
          throw new Error("Invalid branches response");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load branches");
        console.error("Branches fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const handleBranchChange = (branchId: string) => {
    setSelectedBranch(branchId);
    onChange?.(branchId);
  };

  if (loading) {
    return (
      <div className="col-lg-9">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Loading branches...</span>
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
        aria-label="Select branch"
        name={name}
        value={selectedBranch}
        onChange={(e) => handleBranchChange(e.target.value)}
      >
        <option value="">Select Branch</option>
        {branches.map((branch) => (
          <option key={branch.branchId} value={branch.branchId}>
            {branch.branchName}
          </option>
        ))}
      </select>
    </div>
  );
}
