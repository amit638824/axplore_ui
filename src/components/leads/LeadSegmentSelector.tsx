"use client";

import React, { useEffect, useState } from "react";
import type { Segment } from "@/lib/types/segment";
import { redirectToLoginIfUnauthorized } from "@/lib/api/auth";
import { getLeadDraft, getLastSavedLeadId } from "@/lib/leads/leadDraftStorage";

export default function LeadSegmentSelector({
  name = "leadSegment",
  value,
  onChange,
}: {
  name?: string;
  value?: string;
  onChange?: (segmentId: string) => void;
}) {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<string>(
    value || "",
  );

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        setLoading(true);
        setError(null);

        const resp = await fetch("/api-next/segments", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (redirectToLoginIfUnauthorized(resp)) return;
        if (!resp.ok) {
          throw new Error("Failed to fetch segments");
        }

        const body = await resp.json();

        // Handle response structure: { success: true, message: "...", data: [...] }
        if (body.success && Array.isArray(body.data)) {
          const sortedSegments = [...body.data].sort(
            (a, b) => a.displayOrder - b.displayOrder,
          );
          setSegments(sortedSegments);
          const draft = getLeadDraft(getLastSavedLeadId());
          const draftSegmentId = draft?.step1?.leadSegmentId;
          const hasDraftSegment =
            draftSegmentId &&
            sortedSegments.some((s) => s.leadSegmentId === draftSegmentId);
          if (hasDraftSegment) {
            setSelectedSegment(draftSegmentId!);
            onChange?.(draftSegmentId!);
          } else if (!selectedSegment && sortedSegments.length > 0) {
            const firstSegmentId = sortedSegments[0].leadSegmentId;
            setSelectedSegment(firstSegmentId);
            onChange?.(firstSegmentId);
          }
        } else if (Array.isArray(body.data)) {
          const sortedSegments = [...body.data].sort(
            (a, b) => a.displayOrder - b.displayOrder,
          );
          setSegments(sortedSegments);
          const draft = getLeadDraft(getLastSavedLeadId());
          const draftSegmentId = draft?.step1?.leadSegmentId;
          const hasDraftSegment =
            draftSegmentId &&
            sortedSegments.some((s) => s.leadSegmentId === draftSegmentId);
          if (hasDraftSegment) {
            setSelectedSegment(draftSegmentId!);
            onChange?.(draftSegmentId!);
          } else if (!selectedSegment && sortedSegments.length > 0) {
            const firstSegmentId = sortedSegments[0].leadSegmentId;
            setSelectedSegment(firstSegmentId);
            onChange?.(firstSegmentId);
          }
        } else {
          throw new Error("Invalid segments response");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load segments");
        console.error("Segments fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSegments();
  }, []);

  const handleSegmentChange = (segmentId: string) => {
    setSelectedSegment(segmentId);
    onChange?.(segmentId);
  };

  if (loading) {
    return (
      <div className="col-lg-9 d-flex align-items-center gap-20px">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Loading segments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-lg-9 d-flex align-items-center gap-20px">
        <div className="text-danger small">{error}</div>
      </div>
    );
  }

  return (
    <div className="col-lg-9 d-flex align-items-center gap-20px">
      {segments.map((segment, index) => {
        const inputId = `segment-${segment.leadSegmentId}`;
        const isChecked = selectedSegment === segment.leadSegmentId;

        return (
          <div key={segment.leadSegmentId} className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name={name}
              id={inputId}
              value={segment.leadSegmentId}
              checked={isChecked}
              onChange={() => handleSegmentChange(segment.leadSegmentId)}
            />
            <label className="form-check-label" htmlFor={inputId}>
              {segment.segmentName}
            </label>
          </div>
        );
      })}
    </div>
  );
}
