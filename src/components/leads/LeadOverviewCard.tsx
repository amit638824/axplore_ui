"use client";

import { useEffect, useState } from "react";
import {
  getLeadDraft,
  getLastSavedLeadId,
  type LeadDraft,
} from "@/lib/leads/leadDraftStorage";

function DetailRow({
  label,
  value,
  hidden = false,
}: {
  label: string;
  value: string | number | undefined | null;
  hidden?: boolean;
}) {
  const display = value != null && String(value).trim() !== "" ? String(value) : "—";
  return (
    <div className={`row mb-2 ${hidden ? "d-none" : ""}`}>
      <div className="col-5 col-form-label text-muted small">{label}</div>
      <div className="col-7">
        <span className="text-dark">{display}</span>
      </div>
    </div>
  );
}

export default function LeadOverviewCard() {
  const [draft, setDraft] = useState<LeadDraft | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);

  const refresh = () => {
    if (typeof window === "undefined") return;
    const id = getLastSavedLeadId();
    setLeadId(id);
    setDraft(id ? getLeadDraft(id) : null);
  };

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("leadDraftUpdated", onUpdate);
    return () => window.removeEventListener("leadDraftUpdated", onUpdate);
  }, []);

  const step1 = draft?.step1;
  const step2 = draft?.step2;
  const step3 = draft?.step3;
  const hasAny =
    step1 &&
    (step1.leadSegmentName ||
      step1.corporateName ||
      step1.divisionName ||
      step1.subDivisionName ||
      step1.leadStatusName ||
      step1.requirementNotes ||
      step1.contactPersonName ||
      step1.contactMobile ||
      step1.contactEmail ||
      step1.salesPersonName ||
      step1.branchName ||
      step1.contractingHeadName ||
      step1.contractingTeamDisplay ||
      step1.remarks) ||
    (step2 &&
      (step2.tripName ||
        step2.tripType ||
        step2.totalBudget != null ||
        step2.numberOfTravelers != null ||
        step2.checkInDate ||
        step2.checkOutDate)) ||
    (step3?.summaries?.length ?? 0) > 0;

  return (
    <div className="card-body">
      {!leadId ? (
        <p className="text-muted mb-0 small">No lead selected. Save a lead to see overview.</p>
      ) : !hasAny ? (
        <p className="text-muted mb-0 small">
          Lead <strong>{leadId}</strong> saved. Fill tabs and save to see key details here.
        </p>
      ) : (
        <div className="lead-overview-inner small rounded border border-light border-start border-3 border-primary bg-light bg-opacity-50 p-3">
          <dl className="row mb-0">
            {step1 && (
              <>
                <dt className="col-sm-5 text-muted fw-normal mb-1">Lead Segment</dt>
                <dd className="col-sm-7 mb-1 ps-sm-2">{step1.leadSegmentName || "—"}</dd>

                <dt className="col-sm-5 text-muted fw-normal mb-1">Corporate</dt>
                <dd className="col-sm-7 mb-1 ps-sm-2">{step1.corporateName || "—"}</dd>

                <dt className="col-sm-5 text-muted fw-normal mb-1">Division</dt>
                <dd className="col-sm-7 mb-1 ps-sm-2">{step1.divisionName || "—"}</dd>

                <dt className="col-sm-5 text-muted fw-normal mb-1">Sub Division</dt>
                <dd className="col-sm-7 mb-1 ps-sm-2">{step1.subDivisionName || "—"}</dd>

                <dt className="col-sm-5 text-muted fw-normal mb-1">Point of Contact</dt>
                <dd className="col-sm-7 mb-1 ps-sm-2">{step1.contactPersonName || "—"}</dd>

                <dt className="col-sm-5 text-muted fw-normal mb-1">Contact Mobile</dt>
                <dd className="col-sm-7 mb-1 ps-sm-2">{step1.contactMobile || "—"}</dd>
              </>
            )}
            {step2 && (
              <>
                <dt className="col-sm-5 text-muted fw-normal mb-1">Trip Type</dt>
                <dd className="col-sm-7 mb-1 ps-sm-2">{step2.tripType || "—"}</dd>

                <dt className="col-sm-5 text-muted fw-normal mb-1">Trip Name</dt>
                <dd className="col-sm-7 mb-1 ps-sm-2">{step2.tripName || "—"}</dd>

                <dt className="col-sm-5 text-muted fw-normal mb-1">Budget</dt>
                <dd className="col-sm-7 mb-1 ps-sm-2">
                  {step2.totalBudget != null && step2.totalBudget > 0 ? `₹${step2.totalBudget}` : "—"}
                </dd>

                <dt className="col-sm-5 text-muted fw-normal mb-1">No. of Travelers</dt>
                <dd className="col-sm-7 mb-1 ps-sm-2">
                  {step2.numberOfTravelers != null && step2.numberOfTravelers > 0
                    ? step2.numberOfTravelers
                    : "—"}
                </dd>

                <dt className="col-sm-5 text-muted fw-normal mb-1">Check-In</dt>
                <dd className="col-sm-7 mb-1 ps-sm-2">{step2.checkInDate || "—"}</dd>

                <dt className="col-sm-5 text-muted fw-normal mb-1">Check-Out</dt>
                <dd className="col-sm-7 mb-1 ps-sm-2">{step2.checkOutDate || "—"}</dd>
              </>
            )}
          </dl>

          {/* Hidden fields – kept in DOM, not removed (display: none) */}
          {step1 && (
            <div className="d-none">
              <DetailRow label="Lead Status" value={step1.leadStatusName} hidden />
              <DetailRow label="Contact Email" value={step1.contactEmail} hidden />
              <DetailRow label="Sales Person" value={step1.salesPersonName} hidden />
              <DetailRow label="Branch" value={step1.branchName} hidden />
              <DetailRow label="Contracting Head" value={step1.contractingHeadName} hidden />
              <DetailRow label="Contracting Team" value={step1.contractingTeamDisplay} hidden />
              <DetailRow label="Remarks" value={step1.remarks} hidden />
              <DetailRow label="Requirement Notes" value={step1.requirementNotes} hidden />
            </div>
          )}
          {step2 && (
            <div className="d-none">
              <DetailRow label="Nights" value={step2.numberOfNights ?? undefined} hidden />
              <DetailRow label="Quarter" value={step2.financialQuarter} hidden />
            </div>
          )}
          {step3?.summaries?.length ? (
            <div className="d-none">
              <div className="row mb-2">
                <div className="col-12">
                  <span className="col-form-label text-muted small">Destination</span>
                </div>
              </div>
              {step3.summaries.map((line, i) => (
                <div key={i} className="row mb-1">
                  <div className="col-12">
                    <span className="text-dark small">{line}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
