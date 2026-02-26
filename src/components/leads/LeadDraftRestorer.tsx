"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  getLeadDraft,
  getLastSavedLeadId,
} from "@/lib/leads/leadDraftStorage";

function restoreStep2(step2: import("@/lib/leads/leadDraftStorage").LeadDraftStep2) {
  const step2Pane = document.getElementById("step2");
  if (!step2Pane) return;

  if (step2.tripType) {
    const tripTypeValue =
      step2.tripType === "International" ? "triptypein" : "triptyped";
    const radio = step2Pane.querySelector(
      `input[name="triptype"][value="${tripTypeValue}"]`
    ) as HTMLInputElement | null;
    if (radio) {
      radio.checked = true;
    }
  }

  const tripNameLabel = Array.from(step2Pane.querySelectorAll("label")).find(
    (l) => l.textContent?.includes("Trip Name")
  );
  if (tripNameLabel && step2.tripName) {
    const tripNameInput = tripNameLabel.closest(".form-group")?.querySelector("input") as HTMLInputElement;
    if (tripNameInput) tripNameInput.value = String(step2.tripName);
  }

  const budgetLabel = Array.from(step2Pane.querySelectorAll("label")).find(
    (l) => l.textContent?.includes("Budget") && !l.textContent?.includes("Per Person")
  );
  if (budgetLabel && step2.totalBudget != null) {
    const b = budgetLabel.closest(".form-group")?.querySelector("input") as HTMLInputElement;
    if (b) b.value = String(step2.totalBudget);
  }

  const travelersLabel = Array.from(step2Pane.querySelectorAll("label")).find(
    (l) => l.textContent?.includes("No. of Travelers")
  );
  if (travelersLabel && step2.numberOfTravelers != null) {
    const t = travelersLabel.closest(".form-group")?.querySelector("input") as HTMLInputElement;
    if (t) t.value = String(step2.numberOfTravelers);
  }

  if (step2.tripScheduleType) {
    const scheduleValue =
      step2.tripScheduleType === "Fixed" ? "tripscheduledate" : "tripschedulem";
    const scheduleRadio = step2Pane.querySelector(
      `input[name="tripschedule"][value="${scheduleValue}"]`
    ) as HTMLInputElement | null;
    if (scheduleRadio) scheduleRadio.checked = true;
  }

  const checkInLabel = Array.from(step2Pane.querySelectorAll("label")).find(
    (l) => l.textContent?.includes("Check-In Date")
  );
  if (checkInLabel && step2.checkInDate) {
    const inputs = checkInLabel.closest(".form-group")?.querySelectorAll("input[type=date]");
    if (inputs?.[0]) (inputs[0] as HTMLInputElement).value = step2.checkInDate;
  }

  const checkOutLabel = Array.from(step2Pane.querySelectorAll("label")).find(
    (l) => l.textContent?.includes("Check-Out Date")
  );
  if (checkOutLabel && step2.checkOutDate) {
    const inputs = checkOutLabel.closest(".form-group")?.querySelectorAll("input[type=date]");
    if (inputs?.[0]) (inputs[0] as HTMLInputElement).value = step2.checkOutDate;
  }

  const nightsLabel = Array.from(step2Pane.querySelectorAll("label")).find(
    (l) => l.textContent?.includes("No. of Nights")
  );
  if (nightsLabel && step2.numberOfNights != null) {
    const n = nightsLabel.closest(".form-group")?.querySelector("input") as HTMLInputElement;
    if (n) n.value = String(step2.numberOfNights);
  }

  const quarterLabel = Array.from(step2Pane.querySelectorAll("label")).find(
    (l) => l.textContent?.includes("Quarter")
  );
  if (quarterLabel && step2.financialQuarter) {
    const q = quarterLabel.closest(".form-group")?.querySelector("input") as HTMLInputElement;
    if (q) q.value = step2.financialQuarter;
  }

  const budgetPerPersonLabel = Array.from(step2Pane.querySelectorAll("label")).find(
    (l) => l.textContent?.includes("Budget Per Person")
  );
  if (budgetPerPersonLabel && step2.budgetPerPerson != null) {
    const b = budgetPerPersonLabel.closest(".form-group")?.querySelector("input") as HTMLInputElement;
    if (b) b.value = String(step2.budgetPerPerson);
  }

  const turnoverLabel = Array.from(step2Pane.querySelectorAll("label")).find(
    (l) => l.textContent?.includes("Total Turnover")
  );
  if (turnoverLabel && step2.totalTurnover != null) {
    const tot = turnoverLabel.closest(".form-group")?.querySelector("input") as HTMLInputElement;
    if (tot) tot.value = String(step2.totalTurnover);
  }
}

export default function LeadDraftRestorer() {
  const pathname = usePathname();
  const isCreatePage = pathname === "/leads/create";

  useEffect(() => {
    if (!isCreatePage) return;
    const leadId = getLastSavedLeadId();
    if (!leadId) return;
    const draft = getLeadDraft(leadId);
    if (!draft) return;

    const runRestore = () => {
      const d = getLeadDraft(getLastSavedLeadId());
      if (!d) return;

      if (d.step1) {
        const remarks = document.getElementById("txtAddress1Billing") as HTMLTextAreaElement | null;
        if (remarks && d.step1.remarks != null) remarks.value = d.step1.remarks;

        const requirementNotes = document.getElementById("leadRequirementNotes") as HTMLTextAreaElement | null;
        if (requirementNotes && d.step1.requirementNotes != null) requirementNotes.value = d.step1.requirementNotes;

        const salesSelect = document.querySelector('select[name="salesPerson"]') as HTMLSelectElement | null;
        if (salesSelect && d.step1.salesUserId) {
          salesSelect.value = d.step1.salesUserId;
          salesSelect.dispatchEvent(new Event("change", { bubbles: true }));
        }

        const branchSelect = document.querySelector('select[name="branch"]') as HTMLSelectElement | null;
        if (branchSelect && d.step1.salesBranchId) {
          branchSelect.value = d.step1.salesBranchId;
          branchSelect.dispatchEvent(new Event("change", { bubbles: true }));
        }

        const contractingHead = document.querySelector('select[name="contractingHead"]') as HTMLSelectElement | null;
        if (contractingHead && d.step1.contractingHeadUserId) {
          contractingHead.value = d.step1.contractingHeadUserId;
          contractingHead.dispatchEvent(new Event("change", { bubbles: true }));
        }

        const contractingTeamInputs = document.querySelectorAll('input[name="contractingTeam"]');
        if (d.step1.contractingTeamUserIds?.length) {
          contractingTeamInputs.forEach((input) => {
            const el = input as HTMLInputElement;
            el.checked = d.step1!.contractingTeamUserIds!.includes(el.value);
          });
        }

        const contactMobileInput = document.getElementById("contactMobile") as HTMLInputElement | null;
        if (contactMobileInput && d.step1.contactMobile != null) {
          contactMobileInput.value = d.step1.contactMobile;
        }
        const contactEmailInput = document.querySelector('input[name="contactEmail"]') as HTMLInputElement | null;
        if (contactEmailInput && d.step1.contactEmail != null) {
          contactEmailInput.value = d.step1.contactEmail;
        }

        const contactPersonSelect = document.querySelector('select[name="contactPerson"]') as HTMLSelectElement | null;
        const contactPersonId = d.step1.contactPersonId;
        if (contactPersonSelect && contactPersonId) {
          const trySetContactPerson = (attempt = 0) => {
            const maxAttempts = 10;
            const hasOption = Array.from(contactPersonSelect.options).some((o) => o.value === contactPersonId);
            if (hasOption) {
              contactPersonSelect.value = contactPersonId;
              contactPersonSelect.dispatchEvent(new Event("change", { bubbles: true }));
              return;
            }
            if (attempt < maxAttempts) {
              setTimeout(() => trySetContactPerson(attempt + 1), 400);
            }
          };
          trySetContactPerson(0);
        }
      }

      if (d.step2) restoreStep2(d.step2);

      window.dispatchEvent(
        new CustomEvent("leadDraftRestore", { detail: { draft: d } })
      );
    };

    const t = setTimeout(runRestore, 1500);
    return () => clearTimeout(t);
  }, [isCreatePage]);

  return null;
}
