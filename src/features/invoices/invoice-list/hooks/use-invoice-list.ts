import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation, useNamespaceTranslations } from "@/providers/i18n-provider";
import { ClientInvoice } from "@/domains/invoices/types";
import { getMergedInvoices } from "@/domains/invoices/storage";
import { getMergedRequests } from "@/domains/requests/storage";
import { getProjects } from "@/domains/projects/storage";
import { getContracts } from "@/domains/contracts/storage";
import { getQuotations } from "@/domains/quotations/storage";
import { confirmMockPayment } from "@/domains/payments/workflow";

export function useInvoiceList() {
  const { user } = useAuth();
  const { t } = useTranslation();
  useNamespaceTranslations(["common", "dashboard", "projects", "requests"]);

  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // UI States
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<ClientInvoice | null>(null);

  const loadData = () => {
    if (!user) return;
    const allInvoices = getMergedInvoices();
    let userInvoices = allInvoices;

    if (user.role === "Client") {
      userInvoices = allInvoices.filter((i) => i.clientId === user.companyId);
    }
    setInvoices(userInvoices);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handlePayInvoice = (invoice: ClientInvoice) => {
    if (!user) return;
    try {
      const requests = getMergedRequests();
      const request = requests.find((r) => r.jobNumber === invoice.jobNumber);

      if (!request) {
        throw new Error("Associated safety request not found.");
      }

      confirmMockPayment({ request, invoice, paidBy: user.name || user.role });

      setAlertMsg({
        type: "success",
        text: `${t("invoices_payment_success")} (${invoice.id})`,
      });

      loadData();

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

  const handleDownloadInvoice = (invoice: ClientInvoice) => {
    alert(`${t("invoices_download_simulated")} (${invoice.id})`);
  };

  const hasLinkedProject = selectedInvoice
    ? getProjects().some((p) => p.jobNumber === selectedInvoice.jobNumber)
    : false;
  const hasLinkedContract = selectedInvoice
    ? getContracts().some((c) => c.jobNumber === selectedInvoice.jobNumber)
    : false;
  const hasLinkedQuotation = selectedInvoice
    ? getQuotations().some((q) => q.jobNumber === selectedInvoice.jobNumber)
    : false;

  return {
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
    t,
  };
}
