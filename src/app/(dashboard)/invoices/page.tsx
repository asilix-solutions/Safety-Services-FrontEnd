"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation, useNamespaceTranslations } from "@/providers/i18n-provider";
import { PageHeader } from "@/shared/components/page-header";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { ClientInvoice } from "@/domains/invoices/types";
import { getMergedInvoices } from "@/domains/invoices/storage";
import { getMergedRequests } from "@/domains/requests/storage";
import { getProjects } from "@/domains/projects/storage";
import { getContracts } from "@/domains/contracts/storage";
import { getQuotations } from "@/domains/quotations/storage";
import { confirmMockPaymentAndInitializeProject } from "@/domains/payments/workflow";

import {
  InvoicesTable,
  InvoiceAuditDialog,
} from "@/features/invoices";

export default function InvoicesDashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  useNamespaceTranslations(["common", "dashboard", "projects", "requests"]);

  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // UI States
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<ClientInvoice | null>(null);

  // Load and sync data
  const loadData = () => {
    if (!user) return;

    const allInvoices = getMergedInvoices();
    let userInvoices = allInvoices;

    // Client role can only view their company's invoices
    if (user.role === "Client") {
      userInvoices = allInvoices.filter((i) => i.tenantId === user.companyId);
    }

    setInvoices(userInvoices);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (!user) return null;

  // Role restriction guard (Super Admin, Company Admin, and Client have access)
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

  // Payment Confirmation Action (Both Pay & Mark as Paid trigger this same workflow)
  const handlePayInvoice = (invoice: ClientInvoice) => {
    try {
      const requests = getMergedRequests();
      const request = requests.find((r) => r.jobNumber === invoice.jobNumber);

      if (!request) {
        throw new Error("Associated safety request not found.");
      }

      // Executes the domain-level workflow (Mark invoice as paid, create payment record, initialize project)
      confirmMockPaymentAndInitializeProject({ request, invoice });
      
      setAlertMsg({
        type: "success",
        text: `${t("invoices_payment_success")} (${invoice.id})`,
      });

      // Reload data to reflect state updates
      loadData();
      
      // Update active selected invoice in modal if open
      if (selectedInvoice && selectedInvoice.id === invoice.id) {
        const updatedInvoices = getMergedInvoices();
        const updated = updatedInvoices.find((i) => i.id === invoice.id) || null;
        setSelectedInvoice(updated);
      }
    } catch (err: any) {
      setAlertMsg({
        type: "error",
        text: `${t("invoices_payment_failed")}${err.message || "Unknown error"}`,
      });
    }
  };

  // Simulated Invoice Download Action
  const handleDownloadInvoice = (invoice: ClientInvoice) => {
    alert(`${t("invoices_download_simulated")} (${invoice.id})`);
  };

  // Helper values to check relationship existence for the selected invoice
  const hasLinkedProject = selectedInvoice
    ? getProjects().some((p) => p.jobNumber === selectedInvoice.jobNumber)
    : false;
  const hasLinkedContract = selectedInvoice
    ? getContracts().some((c) => c.jobNumber === selectedInvoice.jobNumber)
    : false;
  const hasLinkedQuotation = selectedInvoice
    ? getQuotations().some((q) => q.jobNumber === selectedInvoice.jobNumber)
    : false;

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
          <button onClick={() => setAlertMsg(null)} className="text-xs opacity-75 hover:opacity-100 font-semibold cursor-pointer">
            {t("dismiss")}
          </button>
        </div>
      )}

      <InvoicesTable
        invoices={invoices}
        userRole={user.role}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onPayInvoice={handlePayInvoice}
        onViewDetails={(inv) => setSelectedInvoice(inv)}
      />

      <InvoiceAuditDialog
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onDownloadInvoice={handleDownloadInvoice}
        hasLinkedProject={hasLinkedProject}
        hasLinkedContract={hasLinkedContract}
        hasLinkedQuotation={hasLinkedQuotation}
      />
    </div>
  );
}
