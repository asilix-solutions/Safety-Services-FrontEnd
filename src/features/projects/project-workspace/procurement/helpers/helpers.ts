import { InvoiceType, SiloTag } from "@/domains/procurement/types";

export const SILO_TAG_OPTIONS: SiloTag[] = ["alarm", "suppression", "ventilation"];

export const INVOICE_TYPE_OPTIONS: InvoiceType[] = ["taxable", "non_taxable"];

export function siloLabelKey(silo: SiloTag): string {
  return `procurement:silo.${silo}`;
}

export function invoiceTypeLabelKey(type: InvoiceType): string {
  return `procurement:invoiceType.${type}`;
}
