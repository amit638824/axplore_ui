"use client";

import React, { useEffect, useState } from "react";
import { redirectToLoginIfUnauthorized } from "@/lib/api/auth";
import { useUser } from "@/lib/contexts/UserContext";
import { getLeadDraft, getLastSavedLeadId } from "@/lib/leads/leadDraftStorage";

interface SalesRefUser {
  userId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  branch: {
    branchId: string;
    branchName: string;
    branchCode: string;
  };
}

interface SalesRefUsersResponse {
  success: boolean;
  message: string;
  data: {
    salesRefUsers: SalesRefUser[];
    branches: Array<{
      branchId: string;
      branchName: string;
      branchCode: string;
    }>;
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

export default function SalesPersonSelector({
  name = "salesPerson",
  value,
  onChange,
  onBranchChange,
}: {
  name?: string;
  value?: string;
  onChange?: (userId: string) => void;
  /** Called with the selected sales person's branchId when selection changes (for auto-select branch). */
  onBranchChange?: (branchId: string) => void;
}) {
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState<SalesRefUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>(value || "");

  const notifyBranchForUser = (userId: string) => {
    const user = users.find((u) => u.userId === userId);
    const branchId = user?.branch?.branchId ?? "";
    onBranchChange?.(branchId);
  };

  useEffect(() => {
    const fetchSalesRefUsers = async () => {
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
          throw new Error("Failed to fetch sales reference users");
        }

        const body = (await resp.json()) as SalesRefUsersResponse;

        // Handle response structure
        if (body.success && body.data?.salesRefUsers) {
          const salesRefUsers = body.data.salesRefUsers;
          setUsers(salesRefUsers);
          const draft = getLeadDraft(getLastSavedLeadId());
          const draftUserId = draft?.step1?.salesUserId;
          const hasDraftUser =
            draftUserId && salesRefUsers.some((u) => u.userId === draftUserId);
          if (hasDraftUser) {
            const user = salesRefUsers.find((u) => u.userId === draftUserId)!;
            setSelectedUser(draftUserId!);
            onChange?.(draftUserId!);
            onBranchChange?.(user.branch?.branchId ?? "");
          } else if (!value && salesRefUsers.length > 0) {
            const loginUserId = currentUser?.userId;
            const loginUserInList = loginUserId && salesRefUsers.some((u) => u.userId === loginUserId);
            const userIdToSelect = loginUserInList
              ? loginUserId!
              : salesRefUsers[0].userId;
            const user = salesRefUsers.find((u) => u.userId === userIdToSelect)!;
            setSelectedUser(userIdToSelect);
            onChange?.(userIdToSelect);
            onBranchChange?.(user.branch?.branchId ?? "");
          }
        } else {
          throw new Error("Invalid salesref users response");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load sales persons");
        console.error("SalesRef users fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesRefUsers();
  }, []);

  // When login user loads and is in the sales list, select them (if we don't have a draft and selection is still default)
  useEffect(() => {
    const loginUserId = currentUser?.userId;
    if (!loginUserId || users.length === 0) return;
    const loginUserInList = users.some((u) => u.userId === loginUserId);
    if (!loginUserInList) return;
    const draft = getLeadDraft(getLastSavedLeadId());
    if (draft?.step1?.salesUserId) return;
    const currentIsFirst = selectedUser === users[0]?.userId;
    if (selectedUser && !currentIsFirst) return;
    setSelectedUser(loginUserId);
    onChange?.(loginUserId);
    const user = users.find((u) => u.userId === loginUserId);
    onBranchChange?.(user?.branch?.branchId ?? "");
  }, [currentUser?.userId, users]);

  const handleUserChange = (userId: string) => {
    setSelectedUser(userId);
    onChange?.(userId);
    notifyBranchForUser(userId);
  };

  if (loading) {
    return (
      <div className="col-lg-9">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Loading sales persons...</span>
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
        aria-label="Select sales person"
        name={name}
        value={selectedUser}
        onChange={(e) => handleUserChange(e.target.value)}
      >
        <option value="">Select Sales Person</option>
        {users.map((user) => (
          <option key={user.userId} value={user.userId}>
            {user.firstName} {user.lastName} ({user.employeeCode})
          </option>
        ))}
      </select>
    </div>
  );
}
