/**
 * Lead draft persisted in localStorage until final submit.
 * Used for Lead Overview preview and to restore data after page refresh.
 */

const STORAGE_KEY_PREFIX = "axplore_lead_draft_";

export interface LeadDraftStep1 {
  leadSegmentId?: string;
  leadSegmentName?: string;
  corporateId?: string;
  corporateName?: string;
  divisionId?: string;
  divisionName?: string;
  subDivisionId?: string;
  subDivisionName?: string;
  contactPersonId?: string;
  /** Display name for Lead Overview (Point of Contact) */
  contactPersonName?: string;
  contactMobile?: string;
  contactEmail?: string;
  salesUserId?: string;
  salesPersonName?: string;
  salesBranchId?: string;
  branchName?: string;
  contractingHeadUserId?: string;
  contractingHeadName?: string;
  contractingTeamUserIds?: string[];
  /** Comma-separated or single display name for overview */
  contractingTeamDisplay?: string;
  leadStatusId?: string;
  leadStatusName?: string;
  remarks?: string;
  requirementNotes?: string;
}

export interface LeadDraftStep2 {
  /** Set to true after first successful trip create so next save uses update API */
  tripCreated?: boolean;
  tripType?: string;
  tripName?: string;
  totalBudget?: number;
  numberOfTravelers?: number;
  tripScheduleType?: string;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfNights?: number;
  financialQuarter?: string;
  budgetPerPerson?: number;
  totalTurnover?: number;
}

/** Destination (step3) – summary for overview + raw options for form restore */
export interface LeadDraftStep3Sequence {
  id: string;
  leadDestinationId?: string;
  fromCountry: string;
  fromCity: string;
  toCountry: string;
  toCity: string;
  travelers: number;
  travelDate: string;
  type: string;
}

export interface LeadDraftStep3Option {
  id: string;
  sequences: LeadDraftStep3Sequence[];
}

export interface LeadDraftStep3 {
  /** e.g. ["Delhi, India → Dubai, UAE (2 travelers, 2026-02-02)"] */
  summaries: string[];
  /** Raw options to restore Destination tab form after refresh */
  options?: LeadDraftStep3Option[];
}

export interface LeadDraft {
  leadId: string;
  step1?: LeadDraftStep1;
  step2?: LeadDraftStep2;
  step3?: LeadDraftStep3;
  updatedAt: number;
}

function getStorageKey(leadId: string): string {
  return `${STORAGE_KEY_PREFIX}${leadId}`;
}

export function getLeadDraft(leadId: string | null): LeadDraft | null {
  if (typeof window === "undefined" || !leadId) return null;
  try {
    const raw = localStorage.getItem(getStorageKey(leadId));
    if (!raw) return null;
    return JSON.parse(raw) as LeadDraft;
  } catch {
    return null;
  }
}

export function setLeadDraft(leadId: string, data: Partial<Omit<LeadDraft, "leadId" | "updatedAt">>): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getLeadDraft(leadId);
    const draft: LeadDraft = {
      leadId,
      step1: { ...existing?.step1, ...data.step1 },
      step2: { ...existing?.step2, ...data.step2 },
      step3: data.step3 !== undefined ? data.step3 : existing?.step3,
      updatedAt: Date.now(),
    };
    localStorage.setItem(getStorageKey(leadId), JSON.stringify(draft));
    window.dispatchEvent(new CustomEvent("leadDraftUpdated", { detail: { leadId } }));
  } catch {
    // ignore
  }
}

export function clearLeadDraft(leadId: string | null): void {
  if (typeof window === "undefined") return;
  if (leadId) {
    try {
      localStorage.removeItem(getStorageKey(leadId));
    } catch {
      // ignore
    }
  }
  const current = localStorage.getItem("lastSavedLeadId") || sessionStorage.getItem("lastSavedLeadId");
  if (current === leadId) {
    try {
      localStorage.removeItem("lastSavedLeadId");
      sessionStorage.removeItem("lastSavedLeadId");
    } catch {
      // ignore
    }
  }
  window.dispatchEvent(new CustomEvent("leadDraftUpdated", { detail: { leadId: null } }));
}

export function getLastSavedLeadId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lastSavedLeadId") || sessionStorage.getItem("lastSavedLeadId");
}

/**
 * Clear all lead-related data from localStorage and sessionStorage.
 * Call when user opens "Create Lead" so the form starts fresh.
 */
export function clearAllLeadData(): void {
  if (typeof window === "undefined") return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) keysToRemove.push(key);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem("lastSavedLeadId");
    sessionStorage.removeItem("lastSavedLeadId");
    window.dispatchEvent(new CustomEvent("leadDraftUpdated", { detail: { leadId: null } }));
  } catch {
    // ignore
  }
}
