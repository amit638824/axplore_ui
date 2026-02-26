"use client";

import { useEffect, useRef, useState } from "react";
import { redirectToLoginIfUnauthorized } from "@/lib/api/auth";
import { useUser } from "@/lib/contexts/UserContext";
import { getLeadDraft, getLastSavedLeadId, setLeadDraft } from "@/lib/leads/leadDraftStorage";

interface TripFormData {
  leadId: string;
  tripType: string;
  tripName: string;
  totalBudget: number;
  numberOfTravelers: number;
  tripScheduleType: string;
  specificTravelDate?: string;
  travelMonth?: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  financialQuarter: string;
  budgetPerPerson?: number;
  totalTurnover?: number;
  createdBy: string;
}

export default function TripFormHandler() {
  const { user } = useUser();
  const userRef = useRef(user);
  userRef.current = user;
  const [savedLeadId, setSavedLeadId] = useState<string | null>(null);

  useEffect(() => {
    // Get leadId from localStorage or sessionStorage (set after lead is saved)
    const storedLeadId = localStorage.getItem("lastSavedLeadId") || sessionStorage.getItem("lastSavedLeadId");
    if (storedLeadId) {
      setSavedLeadId(storedLeadId);
    }

    const handleStep2Next = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest("#step2Next");
      
      if (!button) return;

      // Prevent default navigation
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const step2ErrorsEl = document.getElementById("step2Errors");
      const btnEl = button as HTMLButtonElement;

      try {
        // Get leadId from storage or use saved one
        const leadId = localStorage.getItem("lastSavedLeadId") || sessionStorage.getItem("lastSavedLeadId") || savedLeadId;
        
        if (!leadId) {
          if (step2ErrorsEl) {
            step2ErrorsEl.textContent = "Please save the lead first (complete Step 1 and click Save & Next) before proceeding to trip information.";
            step2ErrorsEl.style.display = "block";
          }
          return;
        }

        // Clear previous errors
        if (step2ErrorsEl) {
          step2ErrorsEl.style.display = "none";
          step2ErrorsEl.textContent = "";
        }

        // Collect form data
        const formData: Partial<TripFormData> = {
          leadId: leadId,
        };

        // Trip Type
        const tripTypeInput = document.querySelector('input[name="triptype"]:checked') as HTMLInputElement;
        if (tripTypeInput) {
          const tripTypeValue = tripTypeInput.value;
          formData.tripType = tripTypeValue === "triptypein" ? "International" : tripTypeValue === "triptyped" ? "Domestic" : tripTypeValue;
        }

        // Trip Name - find by label context
        const tripNameLabel = Array.from(document.querySelectorAll("label")).find(
          (label) => label.textContent?.includes("Trip Name")
        );
        const tripNameInput = tripNameLabel?.closest(".form-group")?.querySelector('input[type="text"]') as HTMLInputElement;
        if (tripNameInput?.value) {
          formData.tripName = tripNameInput.value;
        }

        // Budget - find by label context
        const budgetLabel = Array.from(document.querySelectorAll("label")).find(
          (label) => label.textContent?.includes("Budget") && !label.textContent?.includes("Per Person")
        );
        const budgetInput = budgetLabel?.closest(".form-group")?.querySelector('input[type="text"]') as HTMLInputElement;
        if (budgetInput?.value) {
          formData.totalBudget = parseFloat(budgetInput.value) || 0;
        }

        // Number of Travelers - find by label context
        const travelersLabel = Array.from(document.querySelectorAll("label")).find(
          (label) => label.textContent?.includes("No. of Travelers")
        );
        const travelersInput = travelersLabel?.closest(".form-group")?.querySelector('input[type="text"]') as HTMLInputElement;
        if (travelersInput?.value) {
          formData.numberOfTravelers = parseInt(travelersInput.value) || 0;
        }

        // Trip Schedule Type
        const tripScheduleInput = document.querySelector('input[name="tripschedule"]:checked') as HTMLInputElement;
        if (tripScheduleInput) {
          const scheduleValue = tripScheduleInput.value;
          formData.tripScheduleType = scheduleValue === "tripscheduledate" ? "Fixed" : scheduleValue === "tripschedulem" ? "Month" : scheduleValue;
        }

        // Check-In Date - find by label context
        const checkInLabel = Array.from(document.querySelectorAll("label")).find(
          (label) => label.textContent?.includes("Check-In Date")
        );
        const checkInInput = checkInLabel?.closest(".form-group")?.querySelector('input[type="date"]') as HTMLInputElement;
        if (checkInInput?.value) {
          formData.checkInDate = checkInInput.value;
          
          // If trip schedule is Fixed, use check-in date as specific travel date
          if (formData.tripScheduleType === "Fixed") {
            formData.specificTravelDate = checkInInput.value;
          }
        }

        // Check-Out Date - find by label context
        const checkOutLabel = Array.from(document.querySelectorAll("label")).find(
          (label) => label.textContent?.includes("Check-Out Date")
        );
        const checkOutInput = checkOutLabel?.closest(".form-group")?.querySelector('input[type="date"]') as HTMLInputElement;
        if (checkOutInput?.value) {
          formData.checkOutDate = checkOutInput.value;
        }

        // Number of Nights - find by label context
        const nightsLabel = Array.from(document.querySelectorAll("label")).find(
          (label) => label.textContent?.includes("No. of Nights")
        );
        const nightsInput = nightsLabel?.closest(".form-group")?.querySelector('input[type="text"]') as HTMLInputElement;
        if (nightsInput?.value) {
          formData.numberOfNights = parseInt(nightsInput.value) || 0;
        }

        // Quarter - find by label context
        const quarterLabel = Array.from(document.querySelectorAll("label")).find(
          (label) => label.textContent?.includes("Quarter")
        );
        const quarterInput = quarterLabel?.closest(".form-group")?.querySelector('input[type="text"]') as HTMLInputElement;
        if (quarterInput?.value) {
          formData.financialQuarter = quarterInput.value;
        }

        // Budget Per Person - find by label context
        const budgetPerPersonLabel = Array.from(document.querySelectorAll("label")).find(
          (label) => label.textContent?.includes("Budget Per Person")
        );
        const budgetPerPersonInput = budgetPerPersonLabel?.closest(".form-group")?.querySelector('input[type="text"]') as HTMLInputElement;
        if (budgetPerPersonInput?.value) {
          formData.budgetPerPerson = parseFloat(budgetPerPersonInput.value) || 0;
        }

        // Total Turnover - find by label context
        const turnoverLabel = Array.from(document.querySelectorAll("label")).find(
          (label) => label.textContent?.includes("Total Turnover")
        );
        const turnoverInput = turnoverLabel?.closest(".form-group")?.querySelector('input[type="text"]') as HTMLInputElement;
        if (turnoverInput?.value) {
          formData.totalTurnover = parseFloat(turnoverInput.value) || 0;
        }

        // Travel Month - if trip schedule is Month
        if (formData.tripScheduleType === "Month" && checkInInput?.value) {
          const date = new Date(checkInInput.value);
          const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
          formData.travelMonth = monthNames[date.getMonth()];
        }

        // Get createdBy from sales person (same as lead creation)
        const salesPersonSelect = document.querySelector('select[name="salesPerson"]') as HTMLSelectElement;
        if (salesPersonSelect?.value) {
          formData.createdBy = salesPersonSelect.value;
        }

        // Validate required fields
        const requiredFields = [
          "tripType",
          "tripName",
          "totalBudget",
          "numberOfTravelers",
          "tripScheduleType",
          "checkInDate",
          "checkOutDate",
          "numberOfNights",
          "financialQuarter",
        ];

        const fieldLabels: Record<string, string> = {
          tripType: "Trip Type",
          tripName: "Trip Name",
          totalBudget: "Budget",
          numberOfTravelers: "No. of Travelers",
          tripScheduleType: "Trip Schedule",
          checkInDate: "Check-In Date",
          checkOutDate: "Check-Out Date",
          numberOfNights: "No. of Nights",
          financialQuarter: "Quarter",
        };

        const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData]);
        
        if (missingFields.length > 0) {
          if (step2ErrorsEl) {
            step2ErrorsEl.textContent = `Please fill the following required fields: ${missingFields.map((f) => fieldLabels[f] || f).join(", ")}`;
            step2ErrorsEl.style.display = "block";
          }
          return;
        }

        // Show loading state (use textContent to avoid innerHTML / XSS)
        const originalText = btnEl.textContent ?? "";
        btnEl.disabled = true;
        btnEl.textContent = "Saving...";

        const modifiedBy = userRef.current?.userId ?? "";
        const draft = getLeadDraft(leadId);
        const isUpdate = !!(draft?.step2?.tripCreated);

        const createPayload = {
          leadId: formData.leadId,
          tripType: formData.tripType,
          tripName: formData.tripName,
          totalBudget: formData.totalBudget,
          numberOfTravelers: formData.numberOfTravelers,
          tripScheduleType: formData.tripScheduleType,
          specificTravelDate: formData.specificTravelDate,
          travelMonth: formData.travelMonth,
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          numberOfNights: formData.numberOfNights,
          financialQuarter: formData.financialQuarter,
          budgetPerPerson: formData.budgetPerPerson,
          totalTurnover: formData.totalTurnover,
          ...(modifiedBy && { createdBy: modifiedBy }),
        };

        let tripSaved = false;
        if (isUpdate) {
          const updatePayload = { ...createPayload, modifiedBy };
          const response = await fetch("/api-next/trip/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(updatePayload),
          });
          if (redirectToLoginIfUnauthorized(response)) return;
          const result = await response.json();
          if (response.ok) {
            tripSaved = true;
            console.log("Trip updated successfully:", result);
          } else {
            const errMsg = (result?.message || result?.error || "").toLowerCase();
            if (errMsg.includes("not found") || errMsg.includes("leadtrip not found")) {
              const addRes = await fetch("/api-next/trip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(createPayload),
              });
              if (redirectToLoginIfUnauthorized(addRes)) return;
              const addResult = await addRes.json();
              if (!addRes.ok) {
                throw new Error(addResult.error || addResult.message || "Failed to save trip");
              }
              tripSaved = true;
              console.log("Trip saved (add after not found):", addResult);
            } else {
              throw new Error(result.error || result.message || "Failed to update trip");
            }
          }
        }
        if (!tripSaved) {
          const response = await fetch("/api-next/trip", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(createPayload),
          });
          if (redirectToLoginIfUnauthorized(response)) return;
          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.error || result.message || "Failed to save trip");
          }
          console.log("Trip saved successfully:", result);
        }

        // Clear errors on success
        if (step2ErrorsEl) {
          step2ErrorsEl.style.display = "none";
          step2ErrorsEl.textContent = "";
        }

        setLeadDraft(leadId, {
          step2: {
            tripCreated: true,
            tripType: formData.tripType,
            tripName: formData.tripName,
            totalBudget: formData.totalBudget,
            numberOfTravelers: formData.numberOfTravelers,
            tripScheduleType: formData.tripScheduleType,
            checkInDate: formData.checkInDate,
            checkOutDate: formData.checkOutDate,
            numberOfNights: formData.numberOfNights,
            financialQuarter: formData.financialQuarter,
            budgetPerPerson: formData.budgetPerPerson,
            totalTurnover: formData.totalTurnover,
          },
        });
        
        // Trigger navigation to step3 (existing functionality)
        const step3Tab = document.getElementById("step3-tab");
        const step3Pane = document.getElementById("step3");
        const tabs = document.querySelectorAll("#nav-tab .nav-link");
        const panes = document.querySelectorAll("#nav-tabContent .tab-pane");

        tabs.forEach((t) => t.classList.remove("active"));
        panes.forEach((p) => p.classList.remove("active"));

        step3Tab?.classList.add("active");
        step3Pane?.classList.add("active");

        // Reset button state
        btnEl.disabled = false;
        btnEl.textContent = originalText;
      } catch (error) {
        console.error("Error saving trip:", error);
        const msg = error instanceof Error ? error.message : "Failed to save trip. Please try again.";
        if (step2ErrorsEl) {
          step2ErrorsEl.textContent = msg;
          step2ErrorsEl.style.display = "block";
        }
        // Reset button state
        btnEl.disabled = false;
        btnEl.textContent = "Save & Next";
      }
    };

    // Clear errors when user selects or types in any step2 field
    const clearStep2Errors = () => {
      const errEl = document.getElementById("step2Errors");
      if (errEl) {
        errEl.style.display = "none";
        errEl.textContent = "";
      }
    };

    const handleStep2InputOrChange = (e: Event) => {
      const target = e.target as HTMLElement;
      if (document.getElementById("step2")?.contains(target)) {
        clearStep2Errors();
      }
    };

    document.addEventListener("click", handleStep2Next, true);
    document.addEventListener("change", handleStep2InputOrChange);
    document.addEventListener("input", handleStep2InputOrChange);

    return () => {
      document.removeEventListener("click", handleStep2Next, true);
      document.removeEventListener("change", handleStep2InputOrChange);
      document.removeEventListener("input", handleStep2InputOrChange);
    };
  }, [savedLeadId]);

  return null;
}
