"use client";

import React, { useEffect, useState, useRef } from "react";
import { redirectToLoginIfUnauthorized } from "@/lib/api/auth";
import { getLeadDraft, getLastSavedLeadId } from "@/lib/leads/leadDraftStorage";

interface ContractingTeam {
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
    contractingHeads: Array<{
      userId: string;
      firstName: string;
      lastName: string;
    }>;
    contractingTeams: ContractingTeam[];
  };
}

export default function ContractingTeamSelector({
  name = "contractingTeam",
  value,
  onChange,
}: {
  name?: string;
  value?: string[];
  onChange?: (userIds: string[]) => void;
}) {
  const [teams, setTeams] = useState<ContractingTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeams, setSelectedTeams] = useState<string[]>(value || []);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const draft = getLeadDraft(getLastSavedLeadId());
    if (draft?.step1?.contractingTeamUserIds?.length) setSelectedTeams(draft.step1.contractingTeamUserIds);
    const onRestore = (e: CustomEvent<{ draft: { step1?: { contractingTeamUserIds?: string[] } } }>) => {
      if (e.detail?.draft?.step1?.contractingTeamUserIds != null)
        setSelectedTeams(e.detail.draft.step1.contractingTeamUserIds);
    };
    window.addEventListener("leadDraftRestore", onRestore as EventListener);
    return () => window.removeEventListener("leadDraftRestore", onRestore as EventListener);
  }, []);

  useEffect(() => {
    if (Array.isArray(value) && JSON.stringify(value) !== JSON.stringify(selectedTeams))
      setSelectedTeams(value);
  }, [value]);

  useEffect(() => {
    const fetchContractingTeams = async () => {
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
          throw new Error("Failed to fetch contracting teams");
        }

        const body = (await resp.json()) as SalesRefUsersResponse;

        // Handle response structure
        if (body.success && body.data?.contractingTeams) {
          setTeams(body.data.contractingTeams);
        } else {
          throw new Error("Invalid contracting teams response");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load contracting teams");
        console.error("Contracting teams fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContractingTeams();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleTeam = (userId: string) => {
    const newSelected = selectedTeams.includes(userId)
      ? selectedTeams.filter((id) => id !== userId)
      : [...selectedTeams, userId];
    
    setSelectedTeams(newSelected);
    onChange?.(newSelected);
  };

  const removeTeam = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = selectedTeams.filter((id) => id !== userId);
    setSelectedTeams(newSelected);
    onChange?.(newSelected);
  };

  const getSelectedTeamNames = () => {
    return selectedTeams
      .map((userId) => {
        const team = teams.find((t) => t.userId === userId);
        return team ? `${team.firstName} ${team.lastName}` : "";
      })
      .filter(Boolean);
  };

  if (loading) {
    return (
      <div className="col-lg-9">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Loading contracting teams...</span>
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

  const selectedTeamNames = getSelectedTeamNames();
  const availableTeams = teams.filter((team) => !selectedTeams.includes(team.userId));

  return (
    <div className="col-lg-9">
      {/* Hidden inputs for form submission - one for each selected team */}
      {selectedTeams.map((userId) => (
        <input key={userId} type="hidden" name={name} value={userId} />
      ))}
      
      <div className="position-relative" ref={dropdownRef}>
        {/* Multi-select container */}
        <div
          className="form-control"
          style={{
            minHeight: "38px",
            padding: selectedTeams.length > 0 ? "4px 8px" : "6px 12px",
            cursor: "pointer",
            display: "flex",
            flexWrap: "wrap",
            gap: "4px",
            alignItems: "center",
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedTeams.length === 0 ? (
            <span className="text-muted">Select Contracting Teams</span>
          ) : (
            selectedTeamNames.map((name, index) => {
              const userId = selectedTeams[index];
              return (
                <span
                  key={userId}
                  className="badge bg-primary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 8px",
                    fontSize: "12px",
                  }}
                >
                  {name}
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    style={{
                      fontSize: "10px",
                      width: "12px",
                      height: "12px",
                      padding: "0",
                      marginLeft: "4px",
                    }}
                    onClick={(e) => removeTeam(userId, e)}
                    aria-label="Remove"
                  />
                </span>
              );
            })
          )}
          <span
            style={{
              marginLeft: "auto",
              fontSize: "12px",
              color: "#6c757d",
            }}
          >
            ▼
          </span>
        </div>

        {/* Dropdown menu */}
        {isOpen && (
          <div
            className="border rounded"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 1000,
              backgroundColor: "white",
              maxHeight: "200px",
              overflowY: "auto",
              marginTop: "4px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            {availableTeams.length === 0 ? (
              <div className="p-2 text-muted text-center">All teams selected</div>
            ) : (
              availableTeams.map((team) => (
                <div
                  key={team.userId}
                  className="p-2"
                  style={{
                    cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                  onClick={() => toggleTeam(team.userId)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                >
                  {team.firstName} {team.lastName}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
