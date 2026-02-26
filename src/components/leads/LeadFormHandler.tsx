"use client";

import { useEffect } from "react";
import { redirectToLoginIfUnauthorized } from "@/lib/api/auth";
import { useUser } from "@/lib/contexts/UserContext";
import { getLastSavedLeadId, setLeadDraft } from "@/lib/leads/leadDraftStorage";

interface LeadFormData {
  leadSegmentId: string;
  corporateId: string;
  divisionId: string;
  subDivisionId: string;
  contactPersonId?: string;
  contactMobile: string;
  contactEmail: string;
  salesUserId: string;
  salesBranchId: string;
  contractingHeadUserId?: string;
  contractingTeamUserIds?: string[];
  leadStatusId: string;
  remarks?: string;
  requirementNotes?: string;
}

export default function LeadFormHandler() {
  const { user } = useUser();

  useEffect(() => {
    const handleStep1Next = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest("#step1Next");
      
      if (!button) return;

      // Prevent default navigation
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const step1ErrorsEl = document.getElementById("step1Errors");
      const btnEl = button as HTMLButtonElement;

      try {
        // Collect form data
        const formData: Partial<LeadFormData> = {};

        // Lead Segment
        const leadSegmentInput = document.querySelector('input[name="leadSegment"]:checked') as HTMLInputElement;
        if (leadSegmentInput) {
          formData.leadSegmentId = leadSegmentInput.value;
        }

        // Corporate
        const corporateSelect = document.getElementById("default") as HTMLSelectElement;
        if (corporateSelect) {
          formData.corporateId = corporateSelect.value;
        }

        // Division
        const divisionSelect = document.getElementById("division") as HTMLSelectElement;
        if (divisionSelect) {
          formData.divisionId = divisionSelect.value;
        }

        // Sub Division
        const subDivisionSelect = document.getElementById("subdivision") as HTMLSelectElement;
        if (subDivisionSelect) {
          formData.subDivisionId = subDivisionSelect.value;
        }

        // Contact Person (Point of Contact - dropdown)
        const contactPersonSelect = document.querySelector('select[name="contactPerson"]') as HTMLSelectElement;
        if (contactPersonSelect?.value) {
          formData.contactPersonId = contactPersonSelect.value;
        }

        // Contact Mobile
        const mobileInput = document.getElementById("contactMobile") as HTMLInputElement;
        if (mobileInput?.value) {
          formData.contactMobile = mobileInput.value;
        }

        // Contact Email
        const emailInput = document.getElementById("contactEmail") as HTMLInputElement;
        if (emailInput?.value) {
          formData.contactEmail = emailInput.value;
        }

        // Sales Person
        const salesPersonSelect = document.querySelector('select[name="salesPerson"]') as HTMLSelectElement;
        if (salesPersonSelect) {
          formData.salesUserId = salesPersonSelect.value;
        }

        // Branch
        const branchSelect = document.querySelector('select[name="branch"]') as HTMLSelectElement;
        if (branchSelect) {
          formData.salesBranchId = branchSelect.value;
        }

        // Contracting Head
        const contractingHeadSelect = document.querySelector('select[name="contractingHead"]') as HTMLSelectElement;
        if (contractingHeadSelect?.value) {
          formData.contractingHeadUserId = contractingHeadSelect.value;
        }

        // Contracting Team (multiple)
        const contractingTeamInputs = document.querySelectorAll('input[name="contractingTeam"]');
        if (contractingTeamInputs.length > 0) {
          const teamIds = Array.from(contractingTeamInputs)
            .map((input) => (input as HTMLInputElement).value)
            .filter(Boolean);
          if (teamIds.length > 0) {
            formData.contractingTeamUserIds = teamIds;
          }
        }

        // Lead Status
        const leadStatusInput = document.querySelector('input[name="leadstatus"]:checked') as HTMLInputElement;
        if (leadStatusInput) {
          formData.leadStatusId = leadStatusInput.value;
        }

        // Remarks
        const remarksTextarea = document.getElementById("txtAddress1Billing") as HTMLTextAreaElement;
        if (remarksTextarea?.value) {
          formData.remarks = remarksTextarea.value;
        }

        // Validate required fields
        const requiredFields = [
          "leadSegmentId",
          "corporateId",
          "divisionId",
          "subDivisionId",
          "salesUserId",
          "salesBranchId",
          "leadStatusId",
        ];

        const fieldLabels: Record<string, string> = {
          leadSegmentId: "Lead Segment",
          corporateId: "Main Corporate",
          divisionId: "Division",
          subDivisionId: "Sub Division",
          salesUserId: "Sales Person",
          salesBranchId: "Branch",
          leadStatusId: "Lead Status",
        };

        const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData]);
        
        if (missingFields.length > 0) {
          // Clear previous errors
          if (step1ErrorsEl) {
            step1ErrorsEl.style.display = "none";
            step1ErrorsEl.textContent = "";
          }
          requiredFields.forEach((field) => {
            const errEl = document.getElementById(`step1-error-${field}`);
            if (errEl) {
              errEl.style.display = "none";
              errEl.textContent = "";
            }
            const control = document.querySelector(
              field === "leadSegmentId" ? 'input[name="leadSegment"]' :
              field === "corporateId" ? "#default" :
              field === "divisionId" ? "#division" :
              field === "subDivisionId" ? "#subdivision" :
              field === "salesUserId" ? 'select[name="salesPerson"]' :
              field === "salesBranchId" ? 'select[name="branch"]' :
              field === "leadStatusId" ? 'input[name="leadstatus"]' : `#${field}`
            ) as HTMLSelectElement | HTMLInputElement | null;
            if (control) control.classList.remove("is-invalid");
          });
          // Show errors below each missing field
          missingFields.forEach((field) => {
            const errEl = document.getElementById(`step1-error-${field}`);
            if (errEl) {
              errEl.textContent = `${fieldLabels[field] || field} is required.`;
              errEl.style.display = "block";
            }
            const control = document.querySelector(
            field === "leadSegmentId" ? 'input[name="leadSegment"]' :
            field === "corporateId" ? "#default" :
            field === "divisionId" ? "#division" :
            field === "subDivisionId" ? "#subdivision" :
            field === "salesUserId" ? 'select[name="salesPerson"]' :
            field === "salesBranchId" ? 'select[name="branch"]' :
            field === "leadStatusId" ? 'input[name="leadstatus"]' : `#${field}`
          ) as HTMLSelectElement | HTMLInputElement | null;
            if (control) control.classList.add("is-invalid");
          });
          // Summary message
          if (step1ErrorsEl) {
            step1ErrorsEl.textContent = `Please fill the following required fields: ${missingFields.map((f) => fieldLabels[f] || f).join(", ")}`;
            step1ErrorsEl.style.display = "block";
          }
          return;
        }

        // Clear any previous errors
        if (step1ErrorsEl) {
          step1ErrorsEl.style.display = "none";
          step1ErrorsEl.textContent = "";
        }
        requiredFields.forEach((field) => {
          const errEl = document.getElementById(`step1-error-${field}`);
          if (errEl) {
            errEl.style.display = "none";
            errEl.textContent = "";
          }
          const control = document.querySelector(
            field === "leadSegmentId" ? 'input[name="leadSegment"]' :
            field === "corporateId" ? "#default" :
            field === "divisionId" ? "#division" :
            field === "subDivisionId" ? "#subdivision" :
            field === "salesUserId" ? 'select[name="salesPerson"]' :
            field === "salesBranchId" ? 'select[name="branch"]' :
            field === "leadStatusId" ? 'input[name="leadstatus"]' : `#${field}`
          ) as HTMLSelectElement | HTMLInputElement | null;
          if (control) control.classList.remove("is-invalid");
        });

        // Show loading state (use textContent to avoid innerHTML / XSS)
        const originalText = btnEl.textContent ?? "";
        btnEl.disabled = true;
        btnEl.textContent = "Saving...";

        const existingLeadId =
          typeof window !== "undefined" ? getLastSavedLeadId() : null;
        const isUpdate = !!existingLeadId;

        const response = await fetch(
          isUpdate ? "/api-next/leads/update/updateLead" : "/api-next/leads",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(
              isUpdate
                ? {
                    leadId: existingLeadId,
                    ...formData,
                    modifiedBy: user?.userId ?? undefined,
                  }
                : formData
            ),
          }
        );

        if (redirectToLoginIfUnauthorized(response)) return;
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || result.message || "Failed to save lead");
        }

        // Clear errors on success
        if (step1ErrorsEl) {
          step1ErrorsEl.style.display = "none";
          step1ErrorsEl.textContent = "";
        }
        ["leadSegmentId", "corporateId", "divisionId", "subDivisionId", "salesUserId", "salesBranchId", "leadStatusId"].forEach((field) => {
          const errEl = document.getElementById(`step1-error-${field}`);
          if (errEl) {
            errEl.style.display = "none";
            errEl.textContent = "";
          }
        });

        // Success - proceed to next step
        console.log(isUpdate ? "Lead updated successfully:" : "Lead saved successfully:", result);
        
        const leadId =
          isUpdate
            ? existingLeadId
            : (result.data?.leadId || result.leadId || result.data?.id);
        if (leadId) {
          localStorage.setItem("lastSavedLeadId", leadId);
          sessionStorage.setItem("lastSavedLeadId", leadId);
          // Persist draft for Lead Overview (labels) and page refresh
          const segmentChecked = document.querySelector('input[name="leadSegment"]:checked');
          const corporateSelect = document.getElementById("default") as HTMLSelectElement | null;
          const divisionSelect = document.getElementById("division") as HTMLSelectElement | null;
          const subDivisionSelect = document.getElementById("subdivision") as HTMLSelectElement | null;
          const salesSelect = document.querySelector('select[name="salesPerson"]') as HTMLSelectElement | null;
          const branchSelect = document.querySelector('select[name="branch"]') as HTMLSelectElement | null;
          const statusChecked = document.querySelector('input[name="leadstatus"]:checked');
          const remarksEl = document.getElementById("txtAddress1Billing") as HTMLTextAreaElement | null;
          const contactPersonSelect = document.querySelector('select[name="contactPerson"]') as HTMLSelectElement | null;
          let contactPersonName: string | undefined;
          if (contactPersonSelect?.value && formData.contactPersonId) {
            const selectedOpt = contactPersonSelect.selectedOptions?.[0]
              ?? Array.from(contactPersonSelect.options).find((o) => o.value === contactPersonSelect.value);
            contactPersonName = selectedOpt?.textContent?.trim() ?? selectedOpt?.text?.trim() ?? undefined;
          }
          const contractingHeadSelect = document.querySelector('select[name="contractingHead"]') as HTMLSelectElement | null;
          const contractingHeadName = contractingHeadSelect?.selectedOptions?.[0]?.textContent?.trim();
          const contractingTeamLabel = Array.from(document.querySelectorAll("label")).find((l) =>
            l.textContent?.includes("Contracting Team")
          );
          const teamBadges = contractingTeamLabel?.closest(".form-group")?.querySelectorAll(".badge.bg-primary");
          const contractingTeamDisplay =
            teamBadges && teamBadges.length > 0
              ? Array.from(teamBadges)
                  .map((b) => b.textContent?.replace(/\s*×\s*$/, "").trim())
                  .filter(Boolean)
                  .join(", ")
              : undefined;
          setLeadDraft(leadId, {
            step1: {
              ...formData,
              leadSegmentName: segmentChecked?.closest(".form-check")?.querySelector("label")?.textContent?.trim() ?? undefined,
              corporateName: corporateSelect?.selectedOptions?.[0]?.textContent?.trim() ?? undefined,
              divisionName: divisionSelect?.selectedOptions?.[0]?.textContent?.trim() ?? undefined,
              subDivisionName: subDivisionSelect?.selectedOptions?.[0]?.textContent?.trim() ?? undefined,
              contactPersonName: contactPersonName ?? undefined,
              salesPersonName: salesSelect?.selectedOptions?.[0]?.textContent?.trim() ?? undefined,
              branchName: branchSelect?.selectedOptions?.[0]?.textContent?.trim() ?? undefined,
              contractingHeadName: contractingHeadName ?? undefined,
              contractingTeamDisplay: contractingTeamDisplay ?? undefined,
              leadStatusName: statusChecked?.closest(".form-check")?.querySelector("label")?.textContent?.trim() ?? undefined,
              remarks: remarksEl?.value?.trim() ?? undefined,
            },
          });
        }
        
        // Trigger navigation to step2 (existing functionality)
        const step2Tab = document.getElementById("step2-tab");
        const step2Pane = document.getElementById("step2");
        const tabs = document.querySelectorAll("#nav-tab .nav-link");
        const panes = document.querySelectorAll("#nav-tabContent .tab-pane");

        tabs.forEach((t) => t.classList.remove("active"));
        panes.forEach((p) => p.classList.remove("active"));

        step2Tab?.classList.add("active");
        step2Pane?.classList.add("active");

        // Reset button state
        btnEl.disabled = false;
        btnEl.textContent = originalText;
      } catch (error) {
        console.error("Error saving lead:", error);
        const msg = error instanceof Error ? error.message : "Failed to save lead. Please try again.";
        if (step1ErrorsEl) {
          step1ErrorsEl.textContent = msg;
          step1ErrorsEl.style.display = "block";
        }
        // Reset button state
        btnEl.disabled = false;
        btnEl.textContent = "Save & Next";
      }
    };

    // Clear errors when user selects or types in any step1 field
    const clearStep1Errors = () => {
      const summaryEl = document.getElementById("step1Errors");
      if (summaryEl) {
        summaryEl.style.display = "none";
        summaryEl.textContent = "";
      }
      const fieldIds = ["leadSegmentId", "corporateId", "divisionId", "subDivisionId", "salesUserId", "salesBranchId", "leadStatusId"];
      fieldIds.forEach((field) => {
        const errEl = document.getElementById(`step1-error-${field}`);
        if (errEl) {
          errEl.style.display = "none";
          errEl.textContent = "";
        }
        const control = document.querySelector(
          field === "leadSegmentId" ? 'input[name="leadSegment"]' :
          field === "corporateId" ? "#default" :
          field === "divisionId" ? "#division" :
          field === "subDivisionId" ? "#subdivision" :
          field === "salesUserId" ? 'select[name="salesPerson"]' :
          field === "salesBranchId" ? 'select[name="branch"]' :
          field === "leadStatusId" ? 'input[name="leadstatus"]' : `#${field}`
        ) as HTMLSelectElement | HTMLInputElement | null;
        if (control) control.classList.remove("is-invalid");
      });
    };

    const handleStep1InputOrChange = (e: Event) => {
      const target = e.target as HTMLElement;
      if (document.getElementById("step1")?.contains(target)) {
        clearStep1Errors();
      }
    };

    document.addEventListener("click", handleStep1Next, true);
    document.addEventListener("change", handleStep1InputOrChange);
    document.addEventListener("input", handleStep1InputOrChange);

    return () => {
      document.removeEventListener("click", handleStep1Next, true);
      document.removeEventListener("change", handleStep1InputOrChange);
      document.removeEventListener("input", handleStep1InputOrChange);
    };
  }, []);

  return null;
}
