import { ClientInvoice } from "./types";

export function mapInvoiceToBill(invoice: ClientInvoice) {
  return {
    invoiceNumber: invoice.id,
    tenantRef: invoice.tenantId,
    amountDue: `${invoice.grandTotal.toLocaleString()} ${invoice.currency}`,
    statusLabel: invoice.status.toUpperCase(),
    dueOn: invoice.dueDate,
  };
}
