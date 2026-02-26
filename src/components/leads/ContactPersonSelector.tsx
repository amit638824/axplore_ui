"use client";

import React, { useEffect, useState } from "react";
import { redirectToLoginIfUnauthorized } from "@/lib/api/auth";
import type { ContactPerson, CorporateResponse } from "@/lib/types/corporate";
import type {
  ContactPerson as SubDivisionContactPerson,
  SubDivisionResponse,
} from "@/lib/types/subDivision";

interface ContactPersonSelectorProps {
  name?: string;
  value?: string;
  subdivisionId?: string;
  onContactPersonChange?: (
    contactPerson: ContactPerson | SubDivisionContactPerson | null,
  ) => void;
}

export default function ContactPersonSelector({
  name = "contactPerson",
  value,
  subdivisionId,
  onContactPersonChange,
}: ContactPersonSelectorProps) {
  const [contactPersons, setContactPersons] = useState<
    (ContactPerson | SubDivisionContactPerson)[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContactPersonId, setSelectedContactPersonId] =
    useState<string>(value || "");

  useEffect(() => {
    if (value !== undefined && value !== selectedContactPersonId) {
      setSelectedContactPersonId(value);
    }
  }, [value]);

  // Fetch contact persons from subdivision if subdivisionId is provided
  useEffect(() => {
    const fetchContactPersonsFromSubDivision = async (subDivId: string) => {
      try {
        setLoading(true);
        setError(null);

        // Get divisionId from the subdivision select's parent division
        const divisionSelect = document.getElementById(
          "division",
        ) as HTMLSelectElement;
        if (!divisionSelect?.value) {
          throw new Error("Division not selected");
        }

        const resp = await fetch(
          `/api-next/corporateSubDivision/${divisionSelect.value}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          },
        );

        if (redirectToLoginIfUnauthorized(resp)) return;
        if (!resp.ok) {
          throw new Error("Failed to fetch sub-divisions");
        }

        const body = (await resp.json()) as SubDivisionResponse;
        let subDivisionsData: Array<{
          subDivisionId: string;
          contactPersons?: SubDivisionContactPerson[];
        }> = [];

        if (body.success && Array.isArray(body.data)) {
          subDivisionsData = body.data;
        } else if (Array.isArray(body.data)) {
          subDivisionsData = body.data;
        }

        // Find the selected subdivision
        const selectedSubDivision = subDivisionsData.find(
          (sd) => sd.subDivisionId === subDivId,
        );

        if (
          selectedSubDivision?.contactPersons &&
          Array.isArray(selectedSubDivision.contactPersons)
        ) {
          // Filter only active contact persons
          const activeContactPersons =
            selectedSubDivision.contactPersons.filter((cp) => cp.isActive);
          setContactPersons(activeContactPersons);

          // Auto-select primary contact person (first active one, or one marked as primary if field exists)
          if (activeContactPersons.length > 0) {
            // Try to find primary contact person, otherwise use first one
            const primaryContactPerson =
              activeContactPersons.find(
                (cp) => (cp as any).isPrimary === true,
              ) || activeContactPersons[0];

            setSelectedContactPersonId(primaryContactPerson.contactPersonId);
            onContactPersonChange?.(primaryContactPerson);
          } else {
            setContactPersons([]);
            setSelectedContactPersonId("");
            onContactPersonChange?.(null);
          }
        } else {
          setContactPersons([]);
          setSelectedContactPersonId("");
          onContactPersonChange?.(null);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load contact persons",
        );
        console.error("Contact persons fetch error:", err);
        setContactPersons([]);
        setSelectedContactPersonId("");
        onContactPersonChange?.(null);
      } finally {
        setLoading(false);
      }
    };

    if (subdivisionId) {
      fetchContactPersonsFromSubDivision(subdivisionId);
    } else {
      // Fallback to fetching from corporate if no subdivisionId
      const fetchContactPersons = async () => {
        try {
          setLoading(true);
          setError(null);

          const resp = await fetch("/api-next/corporate", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });

          if (redirectToLoginIfUnauthorized(resp)) return;
          if (!resp.ok) {
            throw new Error("Failed to fetch contact persons");
          }

          const body = (await resp.json()) as CorporateResponse;

          // Extract all contact persons from all corporates
          let allContactPersons: ContactPerson[] = [];
          if (body.success && Array.isArray(body.data)) {
            body.data.forEach((corporate) => {
              if (
                corporate.contactPersons &&
                Array.isArray(corporate.contactPersons)
              ) {
                // Filter only active contact persons
                const activeContactPersons = corporate.contactPersons.filter(
                  (cp) => cp.isActive,
                );
                allContactPersons = [
                  ...allContactPersons,
                  ...activeContactPersons,
                ];
              }
            });
          } else {
            throw new Error("Invalid contact persons response");
          }

          setContactPersons(allContactPersons);

          // Set first contact person as default if no value provided
          const currentSelectedId = selectedContactPersonId;
          if (!currentSelectedId && allContactPersons.length > 0) {
            const firstContactPersonId = allContactPersons[0].contactPersonId;
            setSelectedContactPersonId(firstContactPersonId);
            onContactPersonChange?.(allContactPersons[0]);
          } else if (currentSelectedId) {
            // If value is provided, find and notify the contact person
            const contactPerson = allContactPersons.find(
              (cp) => cp.contactPersonId === currentSelectedId,
            );
            if (contactPerson) {
              onContactPersonChange?.(contactPerson);
            }
          }
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load contact persons",
          );
          console.error("Contact persons fetch error:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchContactPersons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subdivisionId]);

  const handleContactPersonChange = (contactPersonId: string) => {
    setSelectedContactPersonId(contactPersonId);
    const contactPerson = contactPersons.find(
      (cp) => cp.contactPersonId === contactPersonId,
    );
    onContactPersonChange?.(contactPerson || null);
  };

  if (loading) {
    return (
      <div
        className="spinner-border spinner-border-sm text-primary"
        role="status"
      >
        <span className="visually-hidden">Loading contact persons...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-danger small">{error}</div>;
  }

  return (
    <select
      className="form-select"
      aria-label="Select contact person"
      name={name}
      value={selectedContactPersonId}
      onChange={(e) => handleContactPersonChange(e.target.value)}
    >
      <option value="">Select Contact Person</option>
      {contactPersons.map((contactPerson) => (
        <option
          key={contactPerson.contactPersonId}
          value={contactPerson.contactPersonId}
        >
          {contactPerson.firstName} {contactPerson.lastName}
          {contactPerson.designation ? ` - ${contactPerson.designation}` : ""}
        </option>
      ))}
    </select>
  );
}
