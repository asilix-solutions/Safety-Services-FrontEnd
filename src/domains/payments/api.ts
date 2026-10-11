import { http } from "@/services/http";

export enum ProjectPaymentMethod {
  ElectronicCard = 1,
  BankTransferReceipt = 2,
  CashOnSite = 3,
}

export enum ProjectPaymentStatus {
  Pending = 1,
  Confirmed = 2,
  Rejected = 3,
}

export enum ProjectExpenseStatus {
  Approved = 1,
  PendingCeilingClearance = 2,
  Rejected = 3,
}

export interface ProjectPaymentItemDto {
  id: string;
  amount: number;
  method: ProjectPaymentMethod;
  status: ProjectPaymentStatus;
  reference?: string | null;
  receiptUrl?: string | null;
  recordedAtUtc: string;
  confirmedAtUtc?: string | null;
  confirmedByName?: string | null;
  rejectionReason?: string | null;
}

export interface ProjectPaymentStatementDto {
  instanceId: string;
  jobNumber?: string;
  contractNet: number;
  vatAmount: number;
  totalQuotedAmount: number;
  confirmedTotal: number;
  pendingTotal: number;
  outstandingAmount: number;
  requiredDepositAmount: number;
  isDepositSatisfied: boolean;
  isFullyPaid: boolean;
  payments: ProjectPaymentItemDto[];
}

export interface ProjectPaymentRecordedDto {
  paymentId: string;
  status: ProjectPaymentStatus;
  checkoutUrl?: string | null;
  message?: string;
}

export interface ProjectExpenseDto {
  id: string;
  vendorName: string;
  vendorTaxNumber?: string | null;
  invoiceReferenceNumber: string;
  description: string;
  subtotalAmount: number;
  vatAmount: number;
  isVatDeductible: boolean;
  totalAmount: number;
  costToProject: number;
  status: ProjectExpenseStatus;
  cumulativeSpendAtEntry: number;
  spendingCeilingApplied: number;
  clearanceNotes?: string | null;
  clearedByName?: string | null;
  clearedAtUtc?: string | null;
  createdAt: string;
}

export interface ProjectLaborEntryDto {
  id: string;
  fieldWorkerId: string;
  workerName?: string | null;
  workerTypeApplied: number;
  workedOnUtc: string;
  units: number;
  rateUnit: number;
  rateApplied: number;
  chargedAmount: number;
  notes?: string | null;
}

export interface ProjectLedgerDto {
  instanceId: string;
  jobNumber?: string;
  contractNet: number;
  materialCost: number;
  outsourcedLaborCost: number;
  equipmentCost: number;
  commissionCost: number;
  totalCost: number;
  netMarginAmount: number;
  netMarginPercent: number;
  isLossMaking: boolean;
  spendingCeiling: number;
  cumulativeSpend: number;
  expensesAwaitingClearance: number;
  currencyCode: string;
  expenses: ProjectExpenseDto[];
  labor: ProjectLaborEntryDto[];
}

export interface RecordExpensePayload {
  vendorName: string;
  vendorTaxNumber?: string;
  invoiceReferenceNumber: string;
  description: string;
  subtotalAmount: number;
  vatAmount: number;
  isVatDeductible?: boolean;
}

export interface RecordLaborPayload {
  fieldWorkerId: string;
  fieldTaskId?: string;
  units: number;
  notes?: string;
}

export const paymentsApi = {
  // Staff Project Cost Ledger
  async getProjectLedger(instanceId: string) {
    return http.get<ProjectLedgerDto>(`/workflow-instances/${instanceId}/ledger`);
  },

  async recordExpense(instanceId: string, payload: RecordExpensePayload) {
    return http.post<ProjectExpenseDto>(
      `/workflow-instances/${instanceId}/ledger/expenses`,
      payload
    );
  },

  async clearExpense(expenseId: string, approve: boolean, notes?: string) {
    return http.post<ProjectExpenseDto>(`/project-expenses/${expenseId}/clearance`, {
      approve,
      notes,
    });
  },

  async recordLabor(instanceId: string, payload: RecordLaborPayload) {
    return http.post<ProjectLaborEntryDto>(
      `/workflow-instances/${instanceId}/ledger/labor`,
      payload
    );
  },

  // Staff Project Payments
  async getProjectPayments(instanceId: string) {
    return http.get<ProjectPaymentStatementDto>(
      `/workflow-instances/${instanceId}/payments`
    );
  },

  async recordCashPayment(instanceId: string, amount: number, reference?: string) {
    return http.post<ProjectPaymentRecordedDto>(
      `/workflow-instances/${instanceId}/payments/cash`,
      { amount, reference }
    );
  },

  async reviewPayment(
    instanceId: string,
    paymentId: string,
    approve: boolean,
    rejectionReason?: string
  ) {
    return http.post<ProjectPaymentStatementDto>(
      `/workflow-instances/${instanceId}/payments/${paymentId}/review`,
      { approve, rejectionReason }
    );
  },

  // Client Portal Payments
  async getClientPaymentStatement(requestId: string) {
    return http.get<ProjectPaymentStatementDto>(`/my-requests/${requestId}/payments`);
  },

  async payByCard(requestId: string, amount: number) {
    return http.post<ProjectPaymentRecordedDto>(
      `/my-requests/${requestId}/payments/card`,
      { amount }
    );
  },

  async confirmCardPayment(requestId: string, paymentId: string) {
    return http.post<ProjectPaymentStatementDto>(
      `/my-requests/${requestId}/payments/${paymentId}/confirm`,
      {}
    );
  },

  async payByBankTransfer(
    requestId: string,
    file: File,
    amount: number,
    transactionReference?: string
  ) {
    const formData = new FormData();
    formData.append("receipt", file);
    formData.append("amount", amount.toString());
    if (transactionReference) {
      formData.append("transactionReference", transactionReference);
    }

    return http.post<ProjectPaymentRecordedDto>(
      `/my-requests/${requestId}/payments/bank-transfer`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },
};
