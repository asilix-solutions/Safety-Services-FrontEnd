"use client";

import React from "react";
import { ClientInvoice } from "@/domains/invoices/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { CheckCircle2, X, AlertTriangle, CreditCard, Layers } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/providers/i18n-provider";
import { formatCurrency as localFormatCurrency } from "@/lib/formatters";
import { getStatusLabel, getStatusBadgeVariant } from "../helpers/helpers";

interface PaymentConfirmDialogProps {
  invoice: ClientInvoice;
  isPaying: boolean;
  isSuccess: boolean;
  createdProjectId?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PaymentConfirmDialog({
  invoice,
  isPaying,
  isSuccess,
  createdProjectId,
  onConfirm,
  onCancel,
}: PaymentConfirmDialogProps) {
  const { t, locale } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <Card className="max-w-md w-full border-border bg-card shadow-2xl overflow-hidden relative">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer z-10"
          disabled={isPaying}
        >
          <X className="h-4 w-4" />
        </button>

        {!isSuccess ? (
          <>
            <CardHeader className="border-b border-border pb-4 pr-10">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                {t("common:invoices_pay_confirm_title")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("common:invoices_pay_confirm_desc")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-4 text-xs">
              {/* Invoice Details */}
              <div className="space-y-2.5 bg-secondary/20 p-3 rounded-lg border border-border">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {t("common:invoices_pay_confirm_invoice_id")}
                  </span>
                  <span className="font-mono font-bold text-primary">{invoice.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {t("common:invoices_pay_confirm_job_number")}
                  </span>
                  <span className="font-mono font-semibold text-foreground">
                    {invoice.jobNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {t("common:invoices_pay_confirm_status")}
                  </span>
                  <Badge
                    variant={getStatusBadgeVariant(invoice.status)}
                    className="uppercase text-[9px]"
                  >
                    {getStatusLabel(invoice.status, t)}
                  </Badge>
                </div>
              </div>

              {/* Total Amount */}
              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 flex justify-between items-center">
                <span className="font-semibold text-foreground">
                  {t("common:invoices_pay_confirm_amount")}
                </span>
                <span className="text-base font-bold text-primary">
                  {localFormatCurrency(invoice.grandTotal, locale, invoice.currency)}
                </span>
              </div>

              {/* MVP Notice */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  {t("common:invoices_pay_confirm_mvp_notice")}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 text-xs"
                  onClick={onCancel}
                  disabled={isPaying}
                >
                  {t("common:invoices_pay_cancel_btn")}
                </Button>
                <Button
                  size="sm"
                  className="flex-1 h-9 text-xs bg-primary hover:bg-primary/90"
                  onClick={onConfirm}
                  disabled={isPaying}
                >
                  {isPaying ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                      {t("common:loading")}
                    </span>
                  ) : (
                    t("common:invoices_pay_confirm_btn")
                  )}
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="border-b border-border pb-4 pr-10">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                {t("common:invoices_pay_success_title")}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 pt-4 text-xs">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("common:invoices_pay_success_desc")}
              </p>

              <div className="flex flex-col gap-2 pt-2">
                <Link href={createdProjectId ? `/projects/${createdProjectId}` : "/projects"} className="w-full" onClick={onCancel}>
                  <Button size="sm" className="w-full h-9 text-xs gap-2">
                    <Layers className="h-3.5 w-3.5" />
                    {t("common:invoices_pay_success_go_projects")}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-9 text-xs"
                  onClick={onCancel}
                >
                  {t("common:invoices_pay_success_go_invoices")}
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}

export default PaymentConfirmDialog;
