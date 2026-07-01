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

/** Presentation-layer only extension — adds facilityName for display */
export type InvoiceWithFacility = ClientInvoice & { facilityName: string };

export function useInvoiceList() {
  const { user } = useAuth();
  const { t } = useTranslation();
  useNamespaceTranslations(["common", "dashboard", "projects", "requests"]);

  const [invoices, setInvoices] = useState<InvoiceWithFacility[]>([]);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // UI States
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<ClientInvoice | null>(null);

  // Payment dialog states
  const [payingInvoice, setPayingInvoice] = useState<ClientInvoice | null>(null);
  const [isPayingConfirm, setIsPayingConfirm] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  const loadData = () => {
    if (!user) return;
    const allInvoices = getMergedInvoices();
    const allRequests = getMergedRequests();

    // Enrich invoices with facilityName from linked request (presentation layer only)
    const enriched: InvoiceWithFacility[] = allInvoices.map((inv) => {
      const req = allRequests.find((r) => r.jobNumber === inv.jobNumber);
      return { ...inv, facilityName: req?.facilityName || "—" };
    });

    let userInvoices = enriched;
    if (user.role === "Client") {
      userInvoices = enriched.filter((i) => i.clientId === user.companyId);
    }
    setInvoices(userInvoices);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  /** Opens the confirmation dialog — does NOT execute payment */
  const handlePayInvoice = (invoice: ClientInvoice) => {
    setPaymentSuccess(false);
    setCreatedProjectId(null);
    setPayingInvoice(invoice);
  };

  /** Closes the dialog and resets all dialog state */
  const handleCancelPayment = () => {
    setPayingInvoice(null);
    setIsPayingConfirm(false);
    setPaymentSuccess(false);
    setCreatedProjectId(null);
  };

  /** Executes the actual domain payment after user confirms in dialog */
  const handleConfirmPayment = () => {
    if (!user || !payingInvoice) return;
    setIsPayingConfirm(true);
    try {
      const requests = getMergedRequests();
      const request = requests.find((r) => r.jobNumber === payingInvoice.jobNumber);

      if (!request) {
        throw new Error("Associated safety request not found.");
      }

      const result = confirmMockPayment({ request, invoice: payingInvoice, paidBy: user.name || user.role });

      // Retrieve the generated project to get its exact ID
      const projectsList = getProjects();
      const generatedProject = projectsList.find((p) => p.jobNumber === payingInvoice.jobNumber);
      if (generatedProject) {
        setCreatedProjectId(generatedProject.id);
      }

      setPaymentSuccess(true);
      loadData();

      if (selectedInvoice && selectedInvoice.id === payingInvoice.id) {
        const updatedInvoices = getMergedInvoices();
        const updated = updatedInvoices.find((i) => i.id === payingInvoice.id) || null;
        setSelectedInvoice(updated);
      }
    } catch (err: any) {
      setAlertMsg({
        type: "error",
        text: `${t("invoices_payment_failed")}${err.message || "Unknown error"}`,
      });
      setPayingInvoice(null);
    } finally {
      setIsPayingConfirm(false);
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
    // dialog
    payingInvoice,
    isPayingConfirm,
    paymentSuccess,
    createdProjectId,
    handleCancelPayment,
    handleConfirmPayment,
    t,
  };
}

