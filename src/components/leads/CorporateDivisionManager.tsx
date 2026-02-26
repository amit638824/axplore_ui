"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Corporate, Division } from "@/lib/types/corporate";
import type { SubDivision } from "@/lib/types/subDivision";
import { redirectToLoginIfUnauthorized } from "@/lib/api/auth";
import {
  getLeadDraft,
  getLastSavedLeadId,
} from "@/lib/leads/leadDraftStorage";

// Extend Window interface for Selectr
declare global {
  interface Window {
    Selectr?: new (
      selector: string,
      options?: { multiple?: boolean },
    ) => {
      destroy?: () => void;
      set?: (value: string) => void;
      refresh?: () => void;
    };
  }
}

/**
 * Component that manages corporate and division dropdowns.
 * Updates existing select elements with IDs "default" and "division".
 * Works with Selectr for enhanced dropdown functionality.
 */
export default function CorporateDivisionManager() {
  const pathname = usePathname();
  const isCreatePage = pathname === "/leads/create";

  const [corporates, setCorporates] = useState<Corporate[]>([]);
  const [selectedCorporateId, setSelectedCorporateId] = useState<string>("");
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");
  const [subDivisions, setSubDivisions] = useState<SubDivision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isCreatePage) {
      setLoading(false);
      return;
    }

    const fetchCorporates = async () => {
      if (typeof window === "undefined") return;
      try {
        setLoading(true);
        setError(null);

        const resp = await fetch("/api-next/corporate", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (redirectToLoginIfUnauthorized(resp)) {
          setLoading(false);
          return;
        }
        if (!resp.ok) {
          const statusText = resp.statusText || `HTTP ${resp.status}`;
          throw new Error(`Failed to fetch corporates: ${statusText}`);
        }

        let body: unknown;
        try {
          body = await resp.json();
        } catch {
          throw new Error("Invalid response from corporates API");
        }
        console.log("Corporate API response:", body);

        // Handle response: { success, data: [...] } or direct array
        let corporatesData: Corporate[] = [];
        if (body && typeof body === "object" && "data" in body && Array.isArray((body as { data: unknown }).data)) {
          corporatesData = (body as { data: Corporate[] }).data;
        } else if (Array.isArray(body)) {
          corporatesData = body as Corporate[];
        } else {
          console.error("Invalid corporates response structure:", body);
          throw new Error("Invalid corporates response");
        }

        if (corporatesData.length === 0) {
          console.warn("No corporates found in API response");
        }

        setCorporates(corporatesData);

        // Wait for DOM and Selectr to be ready, then populate selects
        const waitAndPopulate = (attempt = 0) => {
          const corporateSelect = document.getElementById("default");
          const divisionSelect = document.getElementById("division");
          const subDivisionSelect = document.getElementById("subdivision");

          // Selects only exist on /leads/create; if we're not on that page, skip silently
          if (!corporateSelect || !divisionSelect || !subDivisionSelect) {
            if (attempt < 50) {
              setTimeout(() => waitAndPopulate(attempt + 1), 100);
            }
            return;
          }

          // Wait a bit more to ensure SelectrInitializer has run
          // Then populate the selects
          setTimeout(() => {
            console.log(
              "Populating corporate select with",
              corporatesData.length,
              "corporates",
            );
            populateCorporateSelect(corporatesData);

            // Set default or restore from draft
            if (corporatesData.length > 0) {
              const draft = getLeadDraft(getLastSavedLeadId());
              const draftCorpId = draft?.step1?.corporateId;
              const draftCorporateId =
                draftCorpId &&
                corporatesData.some((c) => c.corporateId === draftCorpId)
                  ? draftCorpId
                  : corporatesData[0].corporateId;
              const selectedCorporate = corporatesData.find(
                (c) => c.corporateId === draftCorporateId
              );
              const activeDivisions = (
                selectedCorporate?.divisions || []
              ).filter((d) => d.isActive);
              setSelectedCorporateId(draftCorporateId);
              setDivisions(activeDivisions);
              populateDivisionSelect(activeDivisions);
              setSubDivisions([]);
              populateSubDivisionSelect([]);

              setTimeout(() => {
                const select = document.getElementById(
                  "default",
                ) as HTMLSelectElement;
                if (select) {
                  select.value = draftCorporateId;
                  select.dispatchEvent(new Event("change", { bubbles: true }));
                  updateSelectrValue("#default", draftCorporateId);
                }
                const draftDivisionId = draft?.step1?.divisionId;
                if (draftDivisionId && activeDivisions.length > 0) {
                  setTimeout(() => {
                    const divSelect = document.getElementById(
                      "division",
                    ) as HTMLSelectElement;
                    if (
                      divSelect &&
                      activeDivisions.some(
                        (d) => d.divisionId === draftDivisionId
                      )
                    ) {
                      divSelect.value = draftDivisionId;
                      divSelect.dispatchEvent(
                        new Event("change", { bubbles: true })
                      );
                      updateSelectrValue("#division", draftDivisionId);
                    }
                  }, 400);
                }
              }, 200);
            }
          }, 500); // Wait 500ms to ensure SelectrInitializer has initialized
        };

        waitAndPopulate();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load corporates",
        );
        console.error("Corporates fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCorporates();
  }, [isCreatePage]);

  const destroySelectr = (selector: string) => {
    if (typeof window === "undefined" || !window.Selectr) return;

    const element = document.querySelector(selector);
    if (!element) return;

    const selectrInstance = (element as any).selectr;
    if (selectrInstance && typeof selectrInstance.destroy === "function") {
      try {
        selectrInstance.destroy();
      } catch (err) {
        console.warn("Error destroying Selectr:", err);
      }
    }
  };

  const initializeSelectr = (selector: string) => {
    if (typeof window === "undefined" || !window.Selectr) return;

    const element = document.querySelector(selector);
    if (!element) return;

    try {
      // Check if already initialized
      if ((element as any).selectr) {
        return;
      }
      new window.Selectr(selector);
    } catch (err) {
      console.warn("Error initializing Selectr:", err);
    }
  };

  const populateCorporateSelect = (corps: Corporate[]) => {
    const select = document.getElementById("default") as HTMLSelectElement;
    if (!select) {
      console.warn("Corporate select element (#default) not found");
      return;
    }

    console.log(
      "Populating corporate select, found",
      corps.length,
      "corporates",
    );

    // Destroy Selectr instance if it exists
    destroySelectr("#default");

    // Clear existing options
    while (select.options.length > 0) {
      select.remove(0);
    }

    // Add placeholder option
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = "Select Corporate";
    select.appendChild(placeholderOption);

    // Add corporate options
    corps.forEach((corporate) => {
      const option = document.createElement("option");
      option.value = corporate.corporateId;
      option.textContent = corporate.corporateName;
      select.appendChild(option);
      console.log(
        "Added corporate option:",
        corporate.corporateName,
        corporate.corporateId,
      );
    });

    console.log("Corporate select now has", select.options.length, "options");

    // Re-initialize Selectr after a short delay
    setTimeout(() => {
      initializeSelectr("#default");
      console.log("Re-initialized Selectr for corporate select");
    }, 100);
  };

  const populateDivisionSelect = (divs: Division[]) => {
    const select = document.getElementById("division") as HTMLSelectElement;
    if (!select) {
      console.warn("Division select element (#division) not found");
      return;
    }

    console.log("Populating division select, found", divs.length, "divisions");

    // Destroy Selectr instance if it exists
    destroySelectr("#division");

    // Clear existing options
    while (select.options.length > 0) {
      select.remove(0);
    }

    // Add placeholder option
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = "Select Division";
    select.appendChild(placeholderOption);

    // Add division options
    divs.forEach((division) => {
      const option = document.createElement("option");
      option.value = division.divisionId;
      option.textContent = division.divisionName;
      select.appendChild(option);
      console.log(
        "Added division option:",
        division.divisionName,
        division.divisionId,
      );
    });

    // Reset value
    select.value = "";

    console.log("Division select now has", select.options.length, "options");

    // Re-initialize Selectr after a short delay
    setTimeout(() => {
      initializeSelectr("#division");
      console.log("Re-initialized Selectr for division select");
    }, 100);
  };

  const updateSelectrValue = (selector: string, value: string) => {
    if (typeof window === "undefined" || !window.Selectr) return;

    const element = document.querySelector(selector);
    if (!element) return;

    const selectrInstance = (element as any).selectr;
    if (selectrInstance) {
      // Try different methods to set value
      if (typeof selectrInstance.set === "function") {
        selectrInstance.set(value);
      } else if (typeof selectrInstance.setValue === "function") {
        selectrInstance.setValue(value);
      } else {
        // Fallback: directly set the select value
        const select = element as HTMLSelectElement;
        if (select) {
          select.value = value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    }
  };

  const fetchSubDivisions = async (divisionId: string) => {
    if (!divisionId) {
      setSubDivisions([]);
      populateSubDivisionSelect([]);
      return;
    }

    try {
      console.log("Fetching sub-divisions for division:", divisionId);
      const resp = await fetch(`/api-next/corporateSubDivision/${divisionId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (redirectToLoginIfUnauthorized(resp)) return;
      if (!resp.ok) {
        throw new Error("Failed to fetch sub-divisions");
      }

      const body = await resp.json();
      console.log("Sub-Division API response:", body);

      let subDivisionsData: SubDivision[] = [];
      if (body.success && Array.isArray(body.data)) {
        subDivisionsData = body.data;
      } else if (Array.isArray(body.data)) {
        subDivisionsData = body.data;
      } else {
        console.error("Invalid sub-divisions response structure:", body);
        throw new Error("Invalid sub-divisions response");
      }

      console.log("Found", subDivisionsData.length, "sub-divisions");
      setSubDivisions(subDivisionsData);
      populateSubDivisionSelect(subDivisionsData);
      const draft = getLeadDraft(getLastSavedLeadId());
      const draftSubDivisionId = draft?.step1?.subDivisionId;
      if (
        draftSubDivisionId &&
        subDivisionsData.some(
          (s) => s.subDivisionId === draftSubDivisionId
        )
      ) {
        setTimeout(() => {
          const subSelect = document.getElementById(
            "subdivision",
          ) as HTMLSelectElement;
          if (subSelect) {
            subSelect.value = draftSubDivisionId;
            subSelect.dispatchEvent(new Event("change", { bubbles: true }));
            updateSelectrValue("#subdivision", draftSubDivisionId);
          }
        }, 200);
      }
    } catch (err) {
      console.error("Sub-divisions fetch error:", err);
      setSubDivisions([]);
      populateSubDivisionSelect([]);
    }
  };

  const populateSubDivisionSelect = (subDivs: SubDivision[]) => {
    const select = document.getElementById("subdivision") as HTMLSelectElement;
    if (!select) {
      console.warn("Sub-division select element (#subdivision) not found");
      return;
    }

    console.log(
      "Populating sub-division select, found",
      subDivs.length,
      "sub-divisions",
    );

    // Destroy Selectr instance if it exists
    destroySelectr("#subdivision");

    // Clear existing options
    while (select.options.length > 0) {
      select.remove(0);
    }

    // Add placeholder option
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = "Select Sub Division";
    select.appendChild(placeholderOption);

    // Add sub-division options
    subDivs.forEach((subDivision) => {
      const option = document.createElement("option");
      option.value = subDivision.subDivisionId;
      option.textContent = subDivision.subDivisionName;
      select.appendChild(option);
      console.log(
        "Added sub-division option:",
        subDivision.subDivisionName,
        subDivision.subDivisionId,
      );
    });

    // Reset value
    select.value = "";

    console.log(
      "Sub-division select now has",
      select.options.length,
      "options",
    );

    // Re-initialize Selectr after a short delay
    setTimeout(() => {
      initializeSelectr("#subdivision");
      console.log("Re-initialized Selectr for sub-division select");
    }, 100);
  };

  // Handle corporate selection change
  useEffect(() => {
    const corporateSelect = document.getElementById("default");
    if (!corporateSelect) return;

    const handleChange = (e: Event) => {
      const target = e.target as HTMLSelectElement;
      const corporateId = target.value;
      setSelectedCorporateId(corporateId);

      // Find selected corporate and set its divisions
      const selectedCorporate = corporates.find(
        (c) => c.corporateId === corporateId,
      );
      if (selectedCorporate) {
        const activeDivisions = (selectedCorporate.divisions || []).filter(
          (d) => d.isActive,
        );
        setDivisions(activeDivisions);
        populateDivisionSelect(activeDivisions);

        // Clear sub-divisions when corporate changes
        setSelectedDivisionId("");
        setSubDivisions([]);
        populateSubDivisionSelect([]);
      } else {
        setDivisions([]);
        populateDivisionSelect([]);
        setSelectedDivisionId("");
        setSubDivisions([]);
        populateSubDivisionSelect([]);
      }
    };

    corporateSelect.addEventListener("change", handleChange);
    return () => {
      corporateSelect.removeEventListener("change", handleChange);
    };
  }, [corporates]);

  // Handle division selection change
  useEffect(() => {
    const divisionSelect = document.getElementById("division");
    if (!divisionSelect) return;

    const handleChange = (e: Event) => {
      const target = e.target as HTMLSelectElement;
      const divisionId = target.value;
      setSelectedDivisionId(divisionId);

      // Fetch sub-divisions for the selected division
      if (divisionId) {
        fetchSubDivisions(divisionId);
      } else {
        setSubDivisions([]);
        populateSubDivisionSelect([]);
      }
    };

    divisionSelect.addEventListener("change", handleChange);
    return () => {
      divisionSelect.removeEventListener("change", handleChange);
    };
  }, []);

  // This component doesn't render anything - it just manages the select elements
  return null;
}
