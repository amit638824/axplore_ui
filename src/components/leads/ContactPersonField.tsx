"use client";

import React, { useState, useEffect } from "react";
import ContactPersonSelector from "./ContactPersonSelector";
import type { ContactPerson } from "@/lib/types/corporate";
import type { ContactPerson as SubDivisionContactPerson } from "@/lib/types/subDivision";
import { getLeadDraft, getLastSavedLeadId, setLeadDraft } from "@/lib/leads/leadDraftStorage";

type ContactPersonUnion = ContactPerson | SubDivisionContactPerson;

function getMobile(cp: ContactPersonUnion | null): string {
  if (!cp) return "";
  const r = cp as unknown as Record<string, unknown>;
  const val = r.mobile ?? r.contactMobile ?? r.mobileNumber ?? "";
  return String(val ?? "");
}

function getEmail(cp: ContactPersonUnion | null): string {
  if (!cp) return "";
  const r = cp as unknown as Record<string, unknown>;
  const val = r.email ?? r.contactEmail ?? r.emailAddress ?? "";
  return String(val ?? "");
}

export default function ContactPersonField({
  onContactDataChange,
}: {
  onContactDataChange?: (mobile: string, email: string) => void;
} = {}) {
  const [selectedContactPerson, setSelectedContactPerson] = useState<ContactPersonUnion | null>(null);
  const [mobile, setMobile] = useState("");
  const [subdivisionId, setSubdivisionId] = useState<string>("");

  useEffect(() => {
    const draft = getLeadDraft(getLastSavedLeadId());
    if (draft?.step1?.contactMobile != null) setMobile(String(draft.step1.contactMobile));
    const onRestore = (e: CustomEvent<{ draft: { step1?: { contactMobile?: string } } }>) => {
      if (e.detail?.draft?.step1?.contactMobile != null)
        setMobile(String(e.detail.draft.step1.contactMobile));
    };
    window.addEventListener("leadDraftRestore", onRestore as EventListener);
    return () => window.removeEventListener("leadDraftRestore", onRestore as EventListener);
  }, []);

  // Listen to subdivision changes
  useEffect(() => {
    const subdivisionSelect = document.getElementById("subdivision") as HTMLSelectElement;
    if (!subdivisionSelect) {
      // Retry after a short delay if element not found yet
      const timeoutId = setTimeout(() => {
        const retrySelect = document.getElementById("subdivision") as HTMLSelectElement;
        if (retrySelect && retrySelect.value) {
          setSubdivisionId(retrySelect.value);
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }

    const handleSubDivisionChange = (e: Event) => {
      const target = e.target as HTMLSelectElement;
      const subDivId = target.value;
      setSubdivisionId(subDivId);
    };

    subdivisionSelect.addEventListener("change", handleSubDivisionChange);
    
    // Set initial value if already selected
    if (subdivisionSelect.value) {
      setSubdivisionId(subdivisionSelect.value);
    }

    return () => {
      subdivisionSelect.removeEventListener("change", handleSubDivisionChange);
    };
  }, []);

  const handleContactPersonChange = (contactPerson: ContactPersonUnion | null) => {
    setSelectedContactPerson(contactPerson);
    const mobileVal = getMobile(contactPerson);
    const emailVal = getEmail(contactPerson);
    setMobile(mobileVal);
    onContactDataChange?.(mobileVal, emailVal);
    const leadId = getLastSavedLeadId();
    if (leadId) {
      const cp = contactPerson as { contactPersonId?: string; firstName?: string; lastName?: string } | null;
      const contactPersonName = cp ? [cp.firstName, cp.lastName].filter(Boolean).join(" ").trim() : undefined;
      setLeadDraft(leadId, {
        step1: {
          contactPersonId: cp?.contactPersonId,
          contactPersonName: contactPersonName || undefined,
          contactMobile: mobileVal || undefined,
          contactEmail: emailVal || undefined,
        },
      });
    }
  };

  return (
    <>
      <div className="row">
        <div className="col-md-7">
          <ContactPersonSelector
            name="contactPerson"
            subdivisionId={subdivisionId}
            onContactPersonChange={handleContactPersonChange}
          />
        </div>
        <div className="col-md-5">
          <div className="form-group row">
            <label
              htmlFor="contactMobile"
              className="col-lg-3 col-form-label text-end"
              style={{ paddingLeft: 0, paddingRight: 0 }}
            >
              Mobile
            </label>
            <div className="col-lg-9">
              <input
                id="contactMobile"
                name="contactMobile"
                type="text"
                className="form-control"
                value={mobile}
                onChange={(e) => {
                  const v = e.target.value;
                  setMobile(v);
                  const leadId = getLastSavedLeadId();
                  if (leadId) setLeadDraft(leadId, { step1: { contactMobile: v || undefined } });
                }}
                readOnly={!!selectedContactPerson}
                style={selectedContactPerson ? { backgroundColor: "#f8f9fa", cursor: "not-allowed" } : {}}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
