export interface ClientPayment {
  id: string; // e.g. "PAY-XXXX"
  invoiceId: string;
  jobNumber: string;
  amountPaid: number;
  paymentMethod: "MOCK_PAYMENT";
  transactionReference: string;
  paidAt: string;
  status: "SUCCESS";
}
