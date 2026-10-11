import { http } from "@/services/http";

export enum BackendQuotationStatus {
  Draft = 1,
  Issued = 2,
  ClientAccepted = 3,
  ClientRejected = 4,
  Cancelled = 5,
}

export interface QuotationLineInput {
  description: string;
  unitOfMeasurement: string;
  quantity: number;
  unitRate: number;
  unitCost?: number;
}

export interface QuotationDetailLineDto {
  description: string;
  unitOfMeasurement: string;
  quantity: number;
  unitRate: number;
  unitCost: number;
  lineSubtotal: number;
}

export interface QuotationSummaryDto {
  id: string;
  quotationNumber: string;
  status: BackendQuotationStatus;
  subtotalAmount: number;
  vatRateApplied: number;
  vatAmount: number;
  grandTotalAmount: number;
  estimatedCostAmount: number;
  projectedNetMargin: number;
  marginFloorPercent: number;
  isBelowMarginFloor: boolean;
  currencyCode: string;
}

export interface QuotationFullDetailDto extends QuotationSummaryDto {
  lines: QuotationDetailLineDto[];
  belowMarginJustification?: string | null;
  issuedAtUtc?: string | null;
}

export const quotationsApi = {
  /**
   * Creates or updates the draft quotation with itemized lines.
   * PUT /api/v1/workflow-instances/{instanceId}/quotation
   */
  async saveQuotation(instanceId: string, lines: QuotationLineInput[]) {
    return http.put<QuotationSummaryDto>(
      `/workflow-instances/${instanceId}/quotation`,
      { lines }
    );
  },

  /**
   * Retrieves full internal commercial detail of a job's quotation.
   * GET /api/v1/workflow-instances/{instanceId}/quotation
   */
  async getQuotation(instanceId: string) {
    return http.get<QuotationFullDetailDto>(
      `/workflow-instances/${instanceId}/quotation`
    );
  },

  /**
   * Authorizes draft quotation and issues it to the client.
   * POST /api/v1/workflow-instances/{instanceId}/quotation/authorize
   */
  async authorizeQuotation(instanceId: string, belowMarginJustification?: string) {
    return http.post<QuotationSummaryDto>(
      `/workflow-instances/${instanceId}/quotation/authorize`,
      { belowMarginJustification }
    );
  },
};
