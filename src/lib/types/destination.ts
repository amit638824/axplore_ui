export type SequenceType = "normal" | "return" | "extended";

export interface DestinationSequence {
  id: string;
  /** Set after create/load; used for update API */
  leadDestinationId?: string;
  fromCountry: string;
  fromCity: string;
  toCountry: string;
  toCity: string;
  travelers: number;
  travelDate: string;
  type: SequenceType;
}

export interface DestinationOption {
  id: string;
  sequences: DestinationSequence[];
}

export interface DestinationPayload {
  options: DestinationOption[];
  leadId?: string;
}

/** Single item for create/update destination service (POST /api-next/destination/createService). */
export interface DestinationServiceItem {
  leadDestinationServiceId?: string;
  leadDestinationId: string;
  serviceCategoryId: string;
  serviceTypeId: string;
  serviceLevelId: string;
  remarks?: string;
  createdBy: string;
  quantity: number;
  displayOrder: number;
  endDate?: string;
}
