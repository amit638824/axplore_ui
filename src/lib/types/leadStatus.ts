// Lead Status API Response Types

export interface LeadStatus {
  leadStatusId: string;
  statusCode: string;
  statusName: string;
  description: string;
  displayOrder: number;
  createdAt: string;
}

export interface LeadStatusResponse {
  success: boolean;
  message: string;
  data: LeadStatus[];
}
