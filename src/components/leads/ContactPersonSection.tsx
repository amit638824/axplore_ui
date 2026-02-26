"use client";

import React, { useState, useEffect } from "react";
import ContactPersonField from "./ContactPersonField";
import { getLeadDraft, getLastSavedLeadId, setLeadDraft } from "@/lib/leads/leadDraftStorage";

export default function ContactPersonSection() {
  const [contactEmail, setContactEmail] = useState("");

  useEffect(() => {
    const draft = getLeadDraft(getLastSavedLeadId());
    if (draft?.step1?.contactEmail != null) setContactEmail(String(draft.step1.contactEmail));
    const onRestore = (e: CustomEvent<{ draft: { step1?: { contactEmail?: string } } }>) => {
      if (e.detail?.draft?.step1?.contactEmail != null)
        setContactEmail(String(e.detail.draft.step1.contactEmail));
    };
    window.addEventListener("leadDraftRestore", onRestore as EventListener);
    return () => window.removeEventListener("leadDraftRestore", onRestore as EventListener);
  }, []);

  return (
    <>
      <div className="row">
        <div className="col-md-6">
          <div className="form-group row mb-2">
            <label htmlFor="contactPerson" className="col-lg-3 col-form-label text-end">
              Point of Contact
            </label>
            <div className="col-lg-9">
              <ContactPersonField
                onContactDataChange={(_mobile, email) => setContactEmail(email ?? "")}
              />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-group row mb-2">
            <label htmlFor="contactEmail" className="col-lg-3 col-form-label text-end">
              Email
            </label>
            <div className="col-lg-9">
              <input
                id="contactEmail"
                name="contactEmail"
                type="text"
                className="form-control"
                value={contactEmail}
                onChange={(e) => {
                  const v = e.target.value;
                  setContactEmail(v);
                  const leadId = getLastSavedLeadId();
                  if (leadId) setLeadDraft(leadId, { step1: { contactEmail: v || undefined } });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
