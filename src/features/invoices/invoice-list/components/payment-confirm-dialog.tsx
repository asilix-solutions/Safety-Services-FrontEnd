"use client";

import React, { useEffect, useState } from "react";
import { ClientInvoice } from "@/domains/invoices/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { CheckCircle2, AlertTriangle, CreditCard, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/providers/i18n-provider";
import { formatCurrency as localFormatCurrency } from "@/lib/formatters";
import { getStatusLabel, getStatusBadgeVariant } from "../helpers/helpers";
import { SimulatedPaymentForm } from "./simulated-payment-form";

interface PaymentConfirmDialogProps {
  invoice: ClientInvoice | null;
  isPaying: boolean;
  isSuccess: boolean;
  createdProjectId?: string | null;
  onConfirm: (transactionReference: string) => void;
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
  const router = useRouter();
  const [displayInvoice, setDisplayInvoice] = useState<ClientInvoice | null>(null);

  useEffect(() => {
    if (invoice) setDisplayInvoice(invoice);
  }, [invoice]);

  /** Close the dialog first so Radix's close/cleanup effects (body pointer-events/scroll
   * lock) commit, THEN navigate on the next tick — navigating in the same event as the
   * unmount races Radix's cleanup and leaves the destination page unclickable. */
  const handleGoToProjects = () => {
    const destination = createdProjectId ? `/projects/${createdProjectId}` : "/projects";
    onCancel();
    setTimeout(() => router.push(destination), 0);
  };

  return (
    <Dialog open={!!invoice} onOpenChange={(open) => !open && !isPaying && onCancel()}>
      <DialogContent
        hideClose={isPaying}
        onEscapeKeyDown={(e) => isPaying && e.preventDefault()}
        className="max-w-lg max-h-[85vh] flex flex-col"
      >
        {!displayInvoice ? null : !isSuccess ? (
          <>
            <DialogHeader className="shrink-0">
              <DialogTitle>
                <CreditCard className="h-4 w-4 text-primary" />
                {t("common:invoices_pay_confirm_title")}
              </DialogTitle>
              <DialogDescription>{t("common:invoices_pay_confirm_desc")}</DialogDescription>
            </DialogHeader>

            <DialogBody className="overflow-y-auto">
              {/* Invoice Details */}
              <div className="space-y-2.5 bg-secondary/20 p-3 rounded-lg border border-border">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {t("common:invoices_pay_confirm_invoice_id")}
                  </span>
                  <span className="font-mono font-bold text-primary">{displayInvoice.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {t("common:invoices_pay_confirm_job_number")}
                  </span>
                  <span className="font-mono font-semibold text-foreground">
                    {displayInvoice.jobNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {t("common:invoices_pay_confirm_status")}
                  </span>
                  <Badge
                    variant={getStatusBadgeVariant(displayInvoice.status)}
                    className="uppercase text-[9px]"
                  >
                    {getStatusLabel(displayInvoice.status, t)}
                  </Badge>
                </div>
              </div>

              {/* Total Amount */}
              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 flex justify-between items-center">
                <span className="font-semibold text-foreground">
                  {t("common:invoices_pay_confirm_amount")}
                </span>
                <span className="text-base font-bold text-primary">
                  {localFormatCurrency(displayInvoice.grandTotal, locale, displayInvoice.currency)}
                </span>
              </div>

              {/* MVP Notice */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  {t("common:invoices_pay_confirm_mvp_notice")}
                </p>
              </div>

              <SimulatedPaymentForm
                invoiceId={displayInvoice.id}
                jobNumber={displayInvoice.jobNumber}
                amount={displayInvoice.grandTotal}
                currency={displayInvoice.currency}
                isPaying={isPaying}
                onPaySuccess={onConfirm}
                onCancel={onCancel}
              />
            </DialogBody>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                {t("common:invoices_pay_success_title")}
              </DialogTitle>
            </DialogHeader>

            <DialogBody>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("common:invoices_pay_success_desc")}
              </p>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  size="sm"
                  className="w-full h-9 text-xs gap-2"
                  onClick={handleGoToProjects}
                >
                  <Layers className="h-3.5 w-3.5" />
                  {t("common:invoices_pay_success_go_projects")}
                </Button>
                <Button variant="outline" size="sm" className="w-full h-9 text-xs" onClick={onCancel}>
                  {t("common:invoices_pay_success_go_invoices")}
                </Button>
              </div>
            </DialogBody>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PaymentConfirmDialog;
