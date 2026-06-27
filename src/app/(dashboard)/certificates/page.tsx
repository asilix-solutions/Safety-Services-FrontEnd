"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/shared/components/page-header";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";
import { ClientContract } from "@/domains/contracts/types";
import { getContracts } from "@/domains/contracts/storage";
import { ClientCertificate } from "@/domains/certificates/types";
import { getCertificates } from "@/domains/certificates/storage";
import { issueCertificate, revokeCertificate } from "@/domains/certificates/workflow";

import {
  ReadyToIssueSection,
  CertificatesTable,
  CertificateAuditDialog,
} from "@/features/certificates";

export default function CertificatesDashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [certificates, setCertificates] = useState<ClientCertificate[]>([]);
  const [archivedContractsWithoutCertificates, setArchivedContractsWithoutCertificates] = useState<ClientContract[]>([]);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired" | "revoked">("all");
  const [selectedCertificate, setSelectedCertificate] = useState<ClientCertificate | null>(null);

  const loadData = () => {
    if (!user) return;

    // Load certificates
    const allCertificates = getCertificates();
    let userCertificates = allCertificates;

    if (user.role === "Client") {
      userCertificates = allCertificates.filter((c) => c.clientId === user.companyId);
    }
    setCertificates(userCertificates);

    // Load archived contracts without certificates (Admins only)
    const isAdmin = user.role === "Company Admin" || user.role === "Super Admin";
    if (isAdmin) {
      const allContracts = getContracts();
      const archived = allContracts.filter((c) => c.status === "archived");
      const withoutCertificates = archived.filter(
        (contract) => !allCertificates.some((cert) => cert.contractId === contract.id)
      );
      setArchivedContractsWithoutCertificates(withoutCertificates);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (!user) return null;

  // Role restriction guard
  const hasAccess = ["Super Admin", "Company Admin", "Client"].includes(user.role);
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-xl font-bold text-destructive">{t("certificates_access_denied_title")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("certificates_access_denied_desc")}
        </p>
      </div>
    );
  }

  const isAdmin = user.role === "Company Admin" || user.role === "Super Admin";

  const handleIssueCertificate = (contract: ClientContract) => {
    try {
      issueCertificate(contract, user.name);
      setAlertMsg({
        type: "success",
        text: `${t("certificates_issue_success")} "${contract.title}"`,
      });
      loadData();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err.message || "Failed to issue certificate" });
    }
  };

  const handleRevokeCertificate = (certificateId: string) => {
    const reason = prompt(t("certificates_revoke_reason_prompt"), "Administrative Revocation");
    if (reason === null) return; // User cancelled the prompt

    try {
      revokeCertificate(certificateId, user.name, reason);
      setAlertMsg({ type: "success", text: t("certificates_revoke_success") });
      loadData();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err.message || "Failed to revoke certificate" });
    }
  };

  const simulateDownload = (certificate: ClientCertificate) => {
    alert(`Downloading compliance certificate PDF for "${certificate.title}" (Simulated)`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("certificates_title")}
        description={t("certificates_desc")}
      />

      {alertMsg && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border ${
            alertMsg.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/20 bg-destructive/5 text-destructive"
          }`}
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div className="flex-1 text-sm font-semibold">{alertMsg.text}</div>
          <button onClick={() => setAlertMsg(null)} className="text-xs opacity-75 hover:opacity-100 font-semibold">
            {t("dismiss")}
          </button>
        </div>
      )}

      {isAdmin && (
        <ReadyToIssueSection
          contracts={archivedContractsWithoutCertificates}
          onIssueCertificate={handleIssueCertificate}
        />
      )}

      <CertificatesTable
        certificates={certificates}
        isAdmin={isAdmin}
        userRole={user.role}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onRevokeCertificate={handleRevokeCertificate}
        onDownloadCertificate={simulateDownload}
        onViewDetails={(cert) => setSelectedCertificate(cert)}
      />

      <CertificateAuditDialog
        certificate={selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
        onDownloadCertificate={simulateDownload}
      />
    </div>
  );
}
