import React from "react";
import { ClientInvoice } from "@/domains/invoices/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { FileText, Download, X, ArrowRight, Layers, FileCheck, Landmark, ClipboardList } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/providers/i18n-provider";
import { formatCurrency, formatDate, getStatusBadgeVariant, getStatusLabel } from "../helpers/helpers";

interface InvoiceAuditDialogProps {
  invoice: ClientInvoice | null;
  onClose: () => void;
  onDownloadInvoice: (invoice: ClientInvoice) => void;
  hasLinkedProject?: boolean;
  hasLinkedContract?: boolean;
  hasLinkedQuotation?: boolean;
}

export function InvoiceAuditDialog({
  invoice,
  onClose,
  onDownloadInvoice,
  hasLinkedProject = false,
  hasLinkedContract = false,
  hasLinkedQuotation = false,
}: InvoiceAuditDialogProps) {
  const { t } = useTranslation();

  if (!invoice) return null;

  const isPaid = invoice.status === "paid";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <Card className="max-w-md w-full border-border bg-card shadow-2xl overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <CardHeader className="border-b border-border pb-4 pr-10">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-primary" />
            {t("invoices_dialog_title")}
          </CardTitle>
          <CardDescription className="text-xs">
            {t("invoices_dialog_desc")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4 text-xs max-h-[75vh] overflow-y-auto">
          {/* 1. General Info & Status Badge */}
          <div className="space-y-3 bg-secondary/20 p-3 rounded-lg border border-border">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs font-bold text-primary">{invoice.id}</span>
              <Badge variant={getStatusBadgeVariant(invoice.status)} className="uppercase text-[9px]">
                {getStatusLabel(invoice.status, t)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("invoices_dialog_issued")}</span>
                <span className="font-semibold text-foreground">{formatDate(invoice.issuedAt)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">{t("invoices_dialog_due")}</span>
                <span className="font-semibold text-foreground">{formatDate(invoice.dueDate)}</span>
              </div>
              {isPaid && invoice.paidAt && (
                <div className="col-span-2">
                  <span className="text-muted-foreground block mb-0.5">{t("invoices_dialog_paid")}</span>
                  <span className="font-semibold text-foreground">{formatDate(invoice.paidAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* 2. Financial Totals */}
          <div className="p-3 bg-secondary/10 rounded-lg border border-border/50 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("invoices_dialog_subtotal")}</span>
              <span className="font-medium text-foreground">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("invoices_dialog_vat")}</span>
              <span className="font-medium text-foreground">{formatCurrency(invoice.vatAmount, invoice.currency)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-bold text-sm">
              <span className="text-foreground">{t("invoices_dialog_total")}</span>
              <span className="text-primary">{formatCurrency(invoice.grandTotal, invoice.currency)}</span>
            </div>
          </div>

          {/* 3. Invoice Timeline */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[10px] text-muted-foreground tracking-wider uppercase">
              {t("invoices_dialog_timeline")}
            </h4>
            <div className="relative pl-6 rtl:pl-0 rtl:pr-6 border-l rtl:border-l-0 rtl:border-r border-border space-y-4 py-1">
              {/* Step 1: Issued */}
              <div className="relative">
                <div className="absolute -left-[30px] rtl:-right-[30px] top-0 h-4.5 w-4.5 rounded-full bg-primary flex items-center justify-center border-4 border-card">
                  <div className="h-1.5 w-1.5 rounded-full bg-card" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{t("invoices_timeline_issued")}</p>
                  <p className="text-[10px] text-muted-foreground">{formatDate(invoice.issuedAt)}</p>
                </div>
              </div>

              {/* Step 2: Paid */}
              <div className="relative">
                <div
                  className={`absolute -left-[30px] rtl:-right-[30px] top-0 h-4.5 w-4.5 rounded-full flex items-center justify-center border-4 border-card ${
                    isPaid ? "bg-emerald-500" : "bg-muted"
                  }`}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-card" />
                </div>
                <div>
                  <p className={`font-semibold ${isPaid ? "text-foreground" : "text-muted-foreground"}`}>
                    {t("invoices_timeline_paid")}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isPaid && invoice.paidAt ? formatDate(invoice.paidAt) : t("certificates_milestone_not_reached")}
                  </p>
                </div>
              </div>

              {/* Step 3: Project Initialized */}
              <div className="relative">
                <div
                  className={`absolute -left-[30px] rtl:-right-[30px] top-0 h-4.5 w-4.5 rounded-full flex items-center justify-center border-4 border-card ${
                    isPaid ? "bg-indigo-500" : "bg-muted"
                  }`}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-card" />
                </div>
                <div>
                  <p className={`font-semibold ${isPaid ? "text-foreground" : "text-muted-foreground"}`}>
                    {t("invoices_timeline_project")}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isPaid && invoice.paidAt ? formatDate(invoice.paidAt) : t("certificates_milestone_not_reached")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Relationship Navigation Links */}
          <div className="space-y-2">
            <h4 className="font-semibold text-[10px] text-muted-foreground tracking-wider uppercase">
              {t("invoices_dialog_relations")}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Link href={`/requests/${invoice.jobNumber}`} className="w-full">
                <Button variant="outline" size="xs" className="w-full justify-start text-[10px] h-8 gap-1.5 font-normal">
                  <ClipboardList className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{t("invoices_relation_request")}</span>
                </Button>
              </Link>

              {hasLinkedProject && (
                <Link href="/projects" className="w-full">
                  <Button variant="outline" size="xs" className="w-full justify-start text-[10px] h-8 gap-1.5 font-normal">
                    <Layers className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate">{t("invoices_relation_project")}</span>
                  </Button>
                </Link>
              )}

              {hasLinkedContract && (
                <Link href="/contracts" className="w-full">
                  <Button variant="outline" size="xs" className="w-full justify-start text-[10px] h-8 gap-1.5 font-normal">
                    <FileCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{t("invoices_relation_contract")}</span>
                  </Button>
                </Link>
              )}

              {hasLinkedQuotation && (
                <Link href="/quotations" className="w-full">
                  <Button variant="outline" size="xs" className="w-full justify-start text-[10px] h-8 gap-1.5 font-normal">
                    <Landmark className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{t("invoices_relation_quotation")}</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-4 flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button size="sm" className="flex items-center gap-1.5" onClick={() => onDownloadInvoice(invoice)}>
              <Download className="h-4 w-4" />
              <span>{t("invoices_download")}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default InvoiceAuditDialog;
