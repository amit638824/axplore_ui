// Segment API Response Types

export interface Segment {
  leadSegmentId: string;
  segmentCode: string;
  segmentName: string;
  description: string;
  displayOrder: number;
  createdAt: string;
}

export interface SegmentsResponse {
  success: boolean;
  message: string;
  data: Segment[];
}
