export interface ClientInvoice {
  id: string;
  tenantId: string;
  contractId: string;
  amount: number;
  status: "unpaid" | "paid" | "overdue";
  dueDate: string;
  issuedAt: string;
}
