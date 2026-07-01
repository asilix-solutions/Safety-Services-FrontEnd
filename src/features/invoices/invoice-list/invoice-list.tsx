"use client";

import React from "react";
import { PageHeader } from "@/shared/components/page-header";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { useInvoiceList } from "./hooks/use-invoice-list";
import { InvoiceTable } from "./components/invoice-table";
import { InvoiceActions } from "./components/invoice-actions";
import { PaymentConfirmDialog } from "./components/payment-confirm-dialog";

export function InvoiceList() {
  const {
    user,
    invoices,
    alertMsg,
    setAlertMsg,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    selectedInvoice,
    setSelectedInvoice,
    handlePayInvoice,
    handleDownloadInvoice,
    hasLinkedProject,
    hasLinkedContract,
    hasLinkedQuotation,
    payingInvoice,
    isPayingConfirm,
    paymentSuccess,
    createdProjectId,
    handleCancelPayment,
    handleConfirmPayment,
    t,
  } = useInvoiceList();

  if (!user) return null;

  const hasAccess = ["Super Admin", "Company Admin", "Client"].includes(user.role);
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-xl font-bold text-destructive">{t("invoices_access_denied_title")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("invoices_access_denied_desc")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("invoices_title")}
        description={t("invoices_desc")}
      />

      {alertMsg && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border ${
            alertMsg.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/20 bg-destructive/5 text-destructive"
          }`}
        >
          {alertMsg.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-sm font-semibold">{alertMsg.text}</div>
          <button
            onClick={() => setAlertMsg(null)}
            className="text-xs opacity-75 hover:opacity-100 font-semibold cursor-pointer"
          >
            {t("dismiss")}
          </button>
        </div>
      )}

      <InvoiceTable
        invoices={invoices}
        userRole={user.role}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onPayInvoice={handlePayInvoice}
        onViewDetails={(inv) => setSelectedInvoice(inv)}
        onDownloadInvoice={handleDownloadInvoice}
      />

      <InvoiceActions
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onDownloadInvoice={handleDownloadInvoice}
        hasLinkedProject={hasLinkedProject}
        hasLinkedContract={hasLinkedContract}
        hasLinkedQuotation={hasLinkedQuotation}
      />

      {payingInvoice && (
        <PaymentConfirmDialog
          invoice={payingInvoice}
          isPaying={isPayingConfirm}
          isSuccess={paymentSuccess}
          createdProjectId={createdProjectId}
          onConfirm={handleConfirmPayment}
          onCancel={handleCancelPayment}
        />
      )}
    </div>
  );
}

export default InvoiceList;
