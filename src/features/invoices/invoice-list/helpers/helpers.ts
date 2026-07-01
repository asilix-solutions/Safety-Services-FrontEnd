import { ClientInvoice } from "@/domains/invoices/types";

export function formatCurrency(amount: number, currency = "SAR"): string {
  return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function getStatusLabel(status: "unpaid" | "paid", t: (key: string) => string): string {
  if (status === "paid") {
    return t("invoices_status_paid");
  }
  return t("invoices_status_unpaid");
}

export function getStatusBadgeVariant(status: "unpaid" | "paid"): "success" | "destructive" | "warning" | "default" | "secondary" | "outline" {
  if (status === "paid") {
    return "success";
  }
  return "destructive";
}

export function filterBySearch(invoices: ClientInvoice[], query: string): ClientInvoice[] {
  if (!query) return invoices;
  const q = query.toLowerCase().trim();
  return invoices.filter(
    (inv) =>
      inv.id.toLowerCase().includes(q) ||
      inv.jobNumber.toLowerCase().includes(q)
  );
}

export function filterByStatus(invoices: ClientInvoice[], tab: "all" | "paid" | "unpaid"): ClientInvoice[] {
  if (tab === "all") return invoices;
  return invoices.filter((inv) => inv.status === tab);
}

// Dedicated permissions helpers (Rule 4)
export function canPay(invoice: ClientInvoice, userRole: string): boolean {
  return invoice.status === "unpaid" && ["Client", "Company Admin", "Super Admin"].includes(userRole);
}

export function canDownload(invoice: ClientInvoice): boolean {
  return true;
}
