"use client";

import { useEffect } from "react";
import { clearLeadDraft, getLastSavedLeadId } from "@/lib/leads/leadDraftStorage";

function activateStep(step: string) {
  const tab = document.getElementById(`${step}-tab`);
  const pane = document.getElementById(step);
  const tabs = document.querySelectorAll("#nav-tab .nav-link");
  const panes = document.querySelectorAll("#nav-tabContent .tab-pane");

  tabs.forEach((t) => t.classList.remove("active"));
  panes.forEach((p) => p.classList.remove("active"));

  tab?.classList.add("active");
  pane?.classList.add("active");
}

function getActiveStepId() {
  const activePane = document.querySelector(
    "#nav-tabContent .tab-pane.active",
  ) as HTMLElement | null;
  return activePane?.id ?? null;
}

export default function LeadsClientEnhancements() {

  // Wizard + Extended Trip row clone (template behavior)
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Extended trip cloning (matches inline jQuery in template)
      const extended = target.closest?.("#extendedTripRow") as HTMLElement | null;
      if (extended) {
        e.preventDefault();

        const parentBlock = extended.closest(".myCustomExtended") as HTMLElement | null;
        if (!parentBlock) return;
        const originalRow = parentBlock.querySelector(
          "#desinationDivparent",
        ) as HTMLElement | null;
        if (!originalRow) return;

        const clone = originalRow.cloneNode(true) as HTMLElement;
        clone.removeAttribute("id");
        originalRow.insertAdjacentElement("afterend", clone);
        parentBlock.classList.add("yellow");
        return;
      }

      // Wizard navigation (matches assets/js/pages/form-wizard.js intent)
      const id = target.closest?.("button")?.id;
      switch (id) {
        case "step1Next":
          activateStep("step2");
          break;
        case "step2Prev":
          activateStep("step1");
          break;
        case "step2Next":
          activateStep("step3");
          break;
        case "step3Prev":
          activateStep("step2");
          break;
        case "step3Finish":
          activateStep("step4");
          break;
        case "step4Prev":
          switch (getActiveStepId()) {
            case "step4":
              activateStep("step3");
              break;
            case "step6":
              activateStep("step4");
              break;
            case "step7":
              activateStep("step6");
              break;
            case "step8":
              activateStep("step7");
              break;
            case "step5":
              activateStep("step8");
              break;
            case "step9":
              activateStep("step5");
              break;
            default:
              activateStep("step3");
              break;
          }
          break;
        case "step4Next":
          activateStep("step6");
          break;
        case "step4Finish": {
          const activeStep = getActiveStepId();
          if (activeStep === "step8") {
            const leadId = getLastSavedLeadId();
            clearLeadDraft(leadId);
          }
          switch (activeStep) {
            case "step6":
              activateStep("step7");
              break;
            case "step7":
              activateStep("step8");
              break;
            case "step8":
              activateStep("step5");
              break;
            case "step5":
              activateStep("step9");
              break;
            default:
              break;
          }
          break;
        }
        default:
          break;
      }
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}

