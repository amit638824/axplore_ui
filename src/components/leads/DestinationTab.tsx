"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type {
  DestinationOption,
  DestinationSequence,
  SequenceType,
} from "@/lib/types/destination";
import toast from "react-hot-toast";
import { redirectToLoginIfUnauthorized } from "@/lib/api/auth";
import { updateDestination } from "@/lib/api/destination";

import {
  getLeadDraft,
  getLastSavedLeadId,
  setLeadDraft,
} from "@/lib/leads/leadDraftStorage";
import { useUser } from "@/lib/contexts/UserContext";
 
interface CountryOption {
  value: string;
  label: string;
}

interface CityOption {
  value: string;
  label: string;
}

function createEmptySequence(
  id: string,
  type: SequenceType = "normal",
  prefill?: Partial<DestinationSequence>
): DestinationSequence {
  return {
    id,
    fromCountry: prefill?.fromCountry ?? "",
    fromCity: prefill?.fromCity ?? "",
    toCountry: prefill?.toCountry ?? "",
    toCity: prefill?.toCity ?? "",
    travelers: prefill?.travelers ?? 1,
    travelDate:
      prefill?.travelDate ?? new Date().toISOString().slice(0, 10),
    type: prefill?.type ?? type,
  };
}

function isSequenceFilled(seq: DestinationSequence): boolean {
  return !!(
    seq.fromCountry &&
    seq.fromCity &&
    seq.toCountry &&
    seq.toCity &&
    seq.travelers >= 1 &&
    seq.travelDate
  );
}

function isOptionFilled(opt: DestinationOption): boolean {
  return opt.sequences.length > 0 && opt.sequences.every(isSequenceFilled);
}

const getInitialOptions = (): DestinationOption[] => [
  {
    id: "opt-1",
    sequences: [createEmptySequence("seq-1", "normal")],
  },
];

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

interface DestinationTabProps {
  onOpenServicesModal?: (leadDestinationId: string) => void;
}

export default function DestinationTab({ onOpenServicesModal }: DestinationTabProps) {
  const { user } = useUser();
  const [options, setOptions] = useState<DestinationOption[]>(getInitialOptions);
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);
  const [cityOptionsByCountryId, setCityOptionsByCountryId] = useState<
    Record<string, CityOption[]>
  >({});
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [citiesLoadingByCountryId, setCitiesLoadingByCountryId] = useState<
    Record<string, boolean>
  >({});
  const cityOptionsRef = useRef<Record<string, CityOption[]>>({});
  cityOptionsRef.current = cityOptionsByCountryId;

  const fetchCountries = useCallback(async () => {
    try {
      setCountriesLoading(true);
      const resp = await fetch("/api-next/country", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (redirectToLoginIfUnauthorized(resp)) return;
      if (!resp.ok) throw new Error("Failed to fetch countries");
      const body = await resp.json();
      const data = Array.isArray(body?.data) ? body.data : [];
      setCountryOptions(
        data.map((c: { countryId: string; name: string; isoCode: string }) => ({
          value: c.countryId,
          label: c.name,
        }))
      );
    } catch {
      toast.error("Failed to load countries");
    } finally {
      setCountriesLoading(false);
    }
  }, []);

  const fetchCitiesForCountry = useCallback(async (countryId: string) => {
    if (!countryId || cityOptionsRef.current[countryId] !== undefined) return;
    setCitiesLoadingByCountryId((prev) => ({ ...prev, [countryId]: true }));
    try {
      const resp = await fetch(`/api-next/city/${countryId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (redirectToLoginIfUnauthorized(resp)) return;
      if (!resp.ok) throw new Error("Failed to fetch cities");
      const body = await resp.json();
      const data = Array.isArray(body?.data) ? body.data : [];
      setCityOptionsByCountryId((prev) => ({
        ...prev,
        [countryId]: data.map((c: { cityId: string; name: string }) => ({
          value: c.cityId,
          label: c.name,
        })),
      }));
    } catch {
      setCityOptionsByCountryId((prev) => ({ ...prev, [countryId]: [] }));
    } finally {
      setCitiesLoadingByCountryId((prev) => ({ ...prev, [countryId]: false }));
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  // Restore destination options from draft after refresh
  useEffect(() => {
    const leadId = getLastSavedLeadId();
    if (!leadId) return;
    const draft = getLeadDraft(leadId);
    if (draft?.step3?.options?.length) {
      setOptions(
        draft.step3.options.map((o) => ({
          id: o.id,
          sequences: o.sequences.map((s) => ({
            id: s.id,
            leadDestinationId: s.leadDestinationId,
            fromCountry: s.fromCountry ?? "",
            fromCity: s.fromCity ?? "",
            toCountry: s.toCountry ?? "",
            toCity: s.toCity ?? "",
            travelers: s.travelers ?? 1,
            travelDate: s.travelDate ?? new Date().toISOString().slice(0, 10),
            type: (s.type as SequenceType) || "normal",
          })),
        }))
      );
    }
  }, []);

  const getCityOptions = useCallback(
    (countryId: string): CityOption[] => {
      if (!countryId) return [];
      return cityOptionsByCountryId[countryId] ?? [];
    },
    [cityOptionsByCountryId]
  );

  useEffect(() => {
    options.forEach((opt) => {
      opt.sequences.forEach((seq) => {
        if (
          seq.fromCountry &&
          cityOptionsByCountryId[seq.fromCountry] === undefined &&
          !citiesLoadingByCountryId[seq.fromCountry]
        ) {
          fetchCitiesForCountry(seq.fromCountry);
        }
        if (
          seq.toCountry &&
          cityOptionsByCountryId[seq.toCountry] === undefined &&
          !citiesLoadingByCountryId[seq.toCountry]
        ) {
          fetchCitiesForCountry(seq.toCountry);
        }
      });
    });
  }, [
    options,
    cityOptionsByCountryId,
    citiesLoadingByCountryId,
    fetchCitiesForCountry,
  ]);

  const addOption = useCallback(() => {
    const last = options[options.length - 1];
    if (options.length === 1 && (!last || !isOptionFilled(last))) {
      toast.error("Please fill all sequences in the current option before adding another option.");
      return;
    }
    setOptions((prev) => [
      ...prev,
      {
        id: `opt-${Date.now()}`,
        sequences: [createEmptySequence(`seq-${Date.now()}`, "normal")],
      },
    ]);
  }, [options]);

  const addSequence = useCallback(
    (optionId: string, type: "return" | "extended", afterSequenceIndex: number) => {
      setOptions((prev) =>
        prev.map((opt) => {
          if (opt.id !== optionId) return opt;
          const seqs = [...opt.sequences];
          const prevSeq = seqs[afterSequenceIndex];
          if (!prevSeq) return opt;
          if (type === "return" && !isSequenceFilled(prevSeq)) {
            toast.error("Please fill this sequence before adding return.");
            return opt;
          }
          const newSeq =
            type === "return"
              ? createEmptySequence(`seq-${Date.now()}`, "return", {
                fromCountry: prevSeq.toCountry,
                fromCity: prevSeq.toCity,
                toCountry: "",
                toCity: "",
                travelers: prevSeq.travelers,
                travelDate: prevSeq.travelDate,
              })
              : createEmptySequence(`seq-${Date.now()}`, "extended");
          const next = [...seqs];
          next.splice(afterSequenceIndex + 1, 0, newSeq);
          return { ...opt, sequences: next };
        })
      );
    },
    []
  );

  const removeSequence = useCallback(
    (optionId: string, sequenceId: string) => {
      setOptions((prev) => {
        const opt = prev.find((o) => o.id === optionId);
        if (!opt) return prev;
        const isLastSequence = opt.sequences.length <= 1;
        if (isLastSequence) {
          if (prev.length <= 1) {
            toast.error("At least one option is required.");
            return prev;
          }
          return prev.filter((o) => o.id !== optionId);
        }
        return prev.map((o) => {
          if (o.id !== optionId) return o;
          return {
            ...o,
            sequences: o.sequences.filter((s) => s.id !== sequenceId),
          };
        });
      });
    },
    []
  );

  const removeOption = useCallback((optionId: string) => {
    if (options.length <= 1) {
      toast.error("At least one option is required.");
      return;
    }
    setOptions((prev) => prev.filter((o) => o.id !== optionId));
  }, [options.length]);

  const updateSequence = useCallback(
    (
      optionId: string,
      sequenceId: string,
      field: keyof DestinationSequence,
      value: string | number
    ) => {
      setOptions((prev) =>
        prev.map((opt) => {
          if (opt.id !== optionId) return opt;
          const next = opt.sequences.map((s) => {
            if (s.id !== sequenceId) return s;
            const updated = { ...s, [field]: value };
            if (field === "fromCountry" && typeof value === "string") {
              const opts = getCityOptions(value);
              if (!opts.some((c) => c.value === s.fromCity)) updated.fromCity = "";
            }
            if (field === "toCountry" && typeof value === "string") {
              const opts = getCityOptions(value);
              if (!opts.some((c) => c.value === s.toCity)) updated.toCity = "";
            }
            return updated;
          });
          return { ...opt, sequences: next };
        })
      );
    },
    [getCityOptions]
  );

  const formatTravelDateForUpdate = useCallback((dateStr: string) => {
    if (!dateStr) return "";
    if (/^\d{4}-\d{2}-\d{2}\s/.test(dateStr)) return dateStr;
    return `${dateStr} 00:00:00.000`;
  }, []);

  const handleSaveAndNext = useCallback(async () => {
    const allFilled = options.every(isOptionFilled);
    if (!allFilled) {
      toast.error("Please fill all required fields in every option and sequence.");
      return;
    }
    const leadId =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("lastSavedLeadId") || sessionStorage.getItem("lastSavedLeadId")
        : null;
    if (!leadId) {
      toast.error("Please save the lead first (Step 1) before saving destination.");
      return;
    }

    const modifiedBy = user?.userId ?? "";

    // Existing sequences (have leadDestinationId) → update API
    const updatePayload = options.flatMap((opt, optIndex) =>
      opt.sequences
        .map((seq, seqIndex) => ({ seq, seqIndex }))
        .filter(({ seq }) => !!seq.leadDestinationId)
        .map(({ seq, seqIndex }) => ({
          leadDestinationId: seq.leadDestinationId!,
          leadId,
          optionNo: optIndex + 1,
          sequenceNo: seqIndex + 1,
          fromCountryId: seq.fromCountry,
          fromCityId: seq.fromCity,
          toCountryId: seq.toCountry,
          toCityId: seq.toCity,
          numberOfTravelers: seq.travelers,
          travelDate: formatTravelDateForUpdate(seq.travelDate),
          idExtendedTrip: seq.type === "extended" ? "true" : "false",
          modifiedBy,
        }))
    );

    // New sequences (no leadDestinationId) → create/add API with actual optionNo/sequenceNo to avoid duplicate key
    const createItems: Array<{
      optionNo: number;
      sequenceNo: number;
      fromCountry: string;
      fromCity: string;
      toCountry: string;
      toCity: string;
      travelers: number;
      travelDate: string;
      type: string;
    }> = [];
    const createIndices: { optIndex: number; seqIndex: number }[] = [];
    options.forEach((opt, optIndex) => {
      opt.sequences.forEach((seq, seqIndex) => {
        if (!seq.leadDestinationId) {
          createIndices.push({ optIndex, seqIndex });
          createItems.push({
            optionNo: optIndex + 1,
            sequenceNo: seqIndex + 1,
            fromCountry: seq.fromCountry,
            fromCity: seq.fromCity,
            toCountry: seq.toCountry,
            toCity: seq.toCity,
            travelers: seq.travelers,
            travelDate: seq.travelDate,
            type: seq.type,
          });
        }
      });
    });

    let createResponse: unknown = null;
    try {
      if (updatePayload.length > 0) {
        const res = await updateDestination(updatePayload);
        if (redirectToLoginIfUnauthorized(res)) return;
        const data = await res.json();
        if (!res.ok) {
          toast.error(data?.error ?? data?.message ?? "Failed to update destination");
          return;
        }
      }

      if (createItems.length > 0) {
        const payload = {
          leadId,
          items: createItems,
          ...(modifiedBy && { createdBy: modifiedBy }),
        };
        const res = await fetch("/api-next/leads/destination", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (redirectToLoginIfUnauthorized(res)) return;
        const raw = await res.json();
        if (!res.ok) {
          toast.error(raw?.error ?? raw?.message ?? "Failed to save new destination");
          return;
        }
        const createdArray = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : null;
        createResponse = createdArray;
        if (createdArray?.length > 0) {
          const items = createdArray as Array<{ leadDestinationId?: string; optionNo?: number; sequenceNo?: number }>;
          setOptions((prev) =>
            prev.map((opt, optIndex) => ({
              ...opt,
              sequences: opt.sequences.map((seq, seqIndex) => {
                const item = items.find(
                  (it) => it.optionNo === optIndex + 1 && it.sequenceNo === seqIndex + 1
                );
                const lid = item?.leadDestinationId ?? seq.leadDestinationId;
                return lid ? { ...seq, leadDestinationId: lid } : seq;
              }),
            }))
          );
        }
      }

      const createdItems = Array.isArray(createResponse) && createResponse.length > 0
        ? (createResponse as Array<{ leadDestinationId?: string; optionNo?: number; sequenceNo?: number }>)
        : null;
      const optionsForDraft =
        createdItems && createdItems.length > 0
          ? options.map((opt, optIndex) => ({
            ...opt,
            sequences: opt.sequences.map((seq, seqIndex) => {
              const item = createdItems.find(
                (it) => it.optionNo === optIndex + 1 && it.sequenceNo === seqIndex + 1
              );
              const lid = item?.leadDestinationId ?? seq.leadDestinationId;
              return lid ? { ...seq, leadDestinationId: lid } : seq;
            }),
          }))
          : options;

      const getCountryLabel = (id: string) =>
        countryOptions.find((c) => c.value === id)?.label ?? id;
      const getCityLabel = (cityId: string, countryId: string) => {
        const opts = cityOptionsByCountryId[countryId] ?? [];
        return opts.find((c) => c.value === cityId)?.label ?? cityId;
      };
      const summaries: string[] = [];
      optionsForDraft.forEach((opt) => {
        opt.sequences.forEach((seq) => {
          const fromC = getCountryLabel(seq.fromCountry);
          const fromCity = getCityLabel(seq.fromCity, seq.fromCountry);
          const toC = getCountryLabel(seq.toCountry);
          const toCity = getCityLabel(seq.toCity, seq.toCountry);
          summaries.push(
            `${fromCity}, ${fromC} → ${toCity}, ${toC} (${seq.travelers} travelers, ${seq.travelDate})`
          );
        });
      });

      setLeadDraft(leadId, {
        step3: {
          summaries,
          options: optionsForDraft.map((o) => ({
            id: o.id,
            sequences: o.sequences.map((s) => ({
              id: s.id,
              leadDestinationId: s.leadDestinationId,
              fromCountry: s.fromCountry,
              fromCity: s.fromCity,
              toCountry: s.toCountry,
              toCity: s.toCity,
              travelers: s.travelers,
              travelDate: s.travelDate,
              type: s.type,
            })),
          })),
        },
      });
      const didUpdate = updatePayload.length > 0;
      const didCreate = createItems.length > 0;
      toast.success(
        didUpdate && didCreate
          ? "Destination updated and new options saved"
          : didUpdate
            ? "Destination updated"
            : "Destination saved"
      );
      activateStep("step4");
    } catch {
      toast.error("Failed to save destination");
    }
  }, [options, user?.userId, countryOptions, cityOptionsByCountryId, formatTravelDateForUpdate]);

  const handlePrev = useCallback(() => {
    activateStep("step2");
  }, []);

  return (
    <div className="tab-pane destination-tab-pane" id="step3" role="tabpanel" aria-labelledby="step3-tab">
      <div className="firstBlock destination-tab-content">
        <h4 className="card-title mt-3 mb-1">Destination</h4>
        <div className="row">
          <div className="col-md-12 mb-2">
            <button
              type="button"
              className="btn btn-primary float-end"
              onClick={addOption}
            >
              Add Option
            </button>
          </div>
        </div>

        <div className="myCustomExtended" id="desinationDivparent">
          {options.map((opt, optIndex) => (
            <div key={opt.id} className="destination-option-block mb-4">
              <h4 className="card-title mt-3 mb-1">Option {optIndex + 1}</h4>
              {opt.sequences.map((seq, seqIndex) => (
                <div
                  key={seq.id}
                  className={`destination-sequence-row ${seq.type === "return"
                      ? "destination-sequence-return"
                      : seq.type === "extended"
                        ? "destination-sequence-extended"
                        : ""
                    }`}
                >
                  <div className="row align-items-end">
                    <div className="col-md-2 fromCity">
                      <label className="form-label">
                        From Country<span className="redastrick">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={seq.fromCountry}
                        onChange={(e) =>
                          updateSequence(opt.id, seq.id, "fromCountry", e.target.value)
                        }
                        disabled={countriesLoading}
                      >
                        <option value="">Select</option>
                        {countryOptions.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-2 fromCity">
                      <label className="form-label">
                        From City<span className="redastrick">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={seq.fromCity}
                        onChange={(e) =>
                          updateSequence(opt.id, seq.id, "fromCity", e.target.value)
                        }
                        disabled={!!(seq.fromCountry && citiesLoadingByCountryId[seq.fromCountry])}
                      >
                        <option value="">Select</option>
                        {seq.fromCountry &&
                          getCityOptions(seq.fromCountry).map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="col-md-2 fromCity">
                      <label className="form-label">
                        To Country<span className="redastrick">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={seq.toCountry}
                        onChange={(e) =>
                          updateSequence(opt.id, seq.id, "toCountry", e.target.value)
                        }
                        disabled={countriesLoading}
                      >
                        <option value="">Select</option>
                        {countryOptions.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-2 fromCity">
                      <label className="form-label">
                        To City<span className="redastrick">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={seq.toCity}
                        onChange={(e) =>
                          updateSequence(opt.id, seq.id, "toCity", e.target.value)
                        }
                        disabled={!!(seq.toCountry && citiesLoadingByCountryId[seq.toCountry])}
                      >
                        <option value="">Select</option>
                        {seq.toCountry &&
                          getCityOptions(seq.toCountry).map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="col-md-1 TravellersWidth">
                      <div className="form-group">
                        <label className="form-label">
                          Travelers<span className="redastrick">*</span>
                        </label>
                        <input
                          className="form-control"
                          type="number"
                          min={1}
                          value={seq.travelers}
                          onChange={(e) =>
                            updateSequence(
                              opt.id,
                              seq.id,
                              "travelers",
                              parseInt(e.target.value, 10) || 1
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-2 travedateWidth">
                      <div className="form-group">
                        <label className="form-label">
                          Travel Date<span className="redastrick">*</span>
                        </label>
                        <input
                          className="form-control"
                          type="date"
                          value={seq.travelDate}
                          onChange={(e) =>
                            updateSequence(opt.id, seq.id, "travelDate", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-1 ActionItemsBtn flex-shrink-0">
                      <div className="dropdown d-inline-block">
                        <Link
                          className="dropdown-toggle arrow-none"
                          href="#"
                          role="button"
                          data-bs-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false"
                        >
                          <i className="las la-ellipsis-v font-20" />
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end dropdown-menu-lg destination-actions-dropdown">
                          <div className="destination-actions-menu">
                            <button
                              type="button"
                              className="destination-action-btn plus border-0 bg-transparent p-0"
                              title="Add return"
                              onClick={(e) => {
                                e.preventDefault();
                                addSequence(opt.id, "return", seqIndex);
                              }}
                            >
                              <i className="fa fa-plus" />
                            </button>
                            <Link href="#" title="Edit" className="destination-action-btn edit">
                              <i className="fa fa-pen" />
                            </Link>
                            <button
                              type="button"
                              className="destination-action-btn minus border-0 bg-transparent p-0"
                              title="Remove sequence"
                              onClick={() => removeSequence(opt.id, seq.id)}
                            >
                              <i className="fa fa-minus" />
                            </button>
                            <button
                              type="button"
                              title="Services"
                              className="destination-action-btn services border-0 bg-transparent p-0"
                              onClick={(e) => {
                                e.preventDefault();
                                if (!seq.leadDestinationId) {
                                  toast.error("Save the destination first to add services.");
                                  return;
                                }
                                onOpenServicesModal?.(seq.leadDestinationId);
                              }}
                            >
                              <i className="fa fa-puzzle-piece" />
                            </button>
                            <button
                              type="button"
                              className="destination-action-btn extendedTrip border-0 bg-transparent p-0"
                              title="Extended"
                              onClick={(e) => {
                                e.preventDefault();
                                addSequence(opt.id, "extended", seqIndex);
                              }}
                            >
                              <i className="fa fa-share-square" />
                            </button>

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="buttonBlock">
          <button
            type="button"
            id="step3Prev"
            className="btn btn-secondary float-start"
            onClick={handlePrev}
          >
            Previous
          </button>
          <button
            type="button"
            id="step3Finish"
            className="btn btn-primary float-end"
            onClick={handleSaveAndNext}
          >
            Save &amp; Next
          </button>
        </div>
      </div>
    </div>
  );
}
