"use client";

import React from "react";
import { PageHeader } from "@/shared/components/page-header";
import { CheckCircle2, ShieldAlert, ShieldCheck, RefreshCw, FileCheck2 } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { hasPermission, isRole } from "@/constants/permissions";
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
    chainStatus,
    vatSummary,
    isVerifyingChain,
    verifyLedgerNow,
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

  const hasAccess = hasPermission(user.role, "invoices.view");
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
              ? "border-success/20 bg-success/5 text-success"
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

      {/* ZATCA Phase 2 Cryptographic Ledger & VAT Summary (Admin / Accounting View) */}
      {!isRole(user.role, ["Client"]) && (chainStatus || vatSummary) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cryptographic SHA-256 Ledger Chain Card */}
          <div className="md:col-span-1 rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    className={`h-4 w-4 ${
                      chainStatus?.isIntact ? "text-emerald-500" : "text-destructive"
                    }`}
                  />
                  <span className="text-xs font-bold text-foreground">
                    سجل الفواتير المشفر (ZATCA SHA-256)
                  </span>
                </div>
                <Badge
                  variant={chainStatus?.isIntact ? "success" : "destructive"}
                  className="text-[10px] px-2 py-0.5"
                >
                  {chainStatus?.isIntact ? "السلسلة سليمة وموثقة" : "تتطلب مراجعة"}
                </Badge>
              </div>
              <div className="py-2.5 space-y-1">
                <div className="text-xs text-muted-foreground">
                  الفواتير المعتمدة والمربوطة:{" "}
                  <span className="font-bold text-foreground font-mono">
                    {chainStatus?.invoicesVerified ?? 0}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                  ربط تتابعي معتمد وموقع تشفيرياً وفق متطلبات المرحلة الثانية لهيئة الزكاة والضريبة والجمارك.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={verifyLedgerNow}
              disabled={isVerifyingChain}
              className="w-full text-xs h-8 gap-1.5 cursor-pointer mt-1"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isVerifyingChain ? "animate-spin" : ""}`} />
              التحقق اللحظي من السلسلة
            </Button>
          </div>

          {/* VAT Return Position Summary */}
          {vatSummary && (
            <div className="md:col-span-2 rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">
                      الموقف والوعاء الضريبي (VAT Summary)
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {vatSummary.currencyCode || "SAR"} (15% ضريبة القيمة المضافة)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 py-2.5 text-center">
                  <div className="rounded-lg bg-secondary/20 p-2">
                    <span className="text-[10px] text-muted-foreground block mb-0.5">
                      المبيعات الخاضعة للضريبة
                    </span>
                    <span className="text-sm font-bold text-foreground font-mono">
                      {vatSummary.outputTaxableAmount?.toLocaleString()} ر.س
                    </span>
                  </div>
                  <div className="rounded-lg bg-primary/5 border border-primary/10 p-2">
                    <span className="text-[10px] text-primary block mb-0.5">
                      ضريبة المخرجات المستحقة
                    </span>
                    <span className="text-sm font-bold text-primary font-mono">
                      {vatSummary.outputVat?.toLocaleString()} ر.س
                    </span>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mb-0.5">
                      صافي الضريبة المسجلة
                    </span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {vatSummary.netVatPayable?.toLocaleString()} ر.س
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground flex justify-between items-center pt-2 border-t border-border/30">
                <span>عدد الفواتير الضريبية المصدرة: {vatSummary.invoicesIssued}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  مطابق للإقرار الضريبي
                </span>
              </div>
            </div>
          )}
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

      <PaymentConfirmDialog
        invoice={payingInvoice}
        isPaying={isPayingConfirm}
        isSuccess={paymentSuccess}
        createdProjectId={createdProjectId}
        onConfirm={handleConfirmPayment}
        onCancel={handleCancelPayment}
      />
    </div>
  );
}

export default InvoiceList;
