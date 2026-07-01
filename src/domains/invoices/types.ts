export interface ClientInvoice {
  id: string; // e.g., "INV-XXXX"
  tenantId: string;
  clientId: string;
  jobNumber: string; // Reference to the request jobNumber
  quotationJobNumber?: string; // Reference to the quotation's jobNumber
  subtotal: number;
  vatAmount: number;
  grandTotal: number;
  currency: "SAR";
  status: "unpaid" | "paid";
  dueDate: string;
  issuedAt: string;
  paidAt?: string;
}
