"use client";

import React from "react";
import { PageHeader } from "@/shared/components/page-header";
import { CheckCircle2 } from "lucide-react";
import { useCertificateList } from "./hooks/use-certificate-list";
import { ReadyToIssueSection } from "./components/ready-to-issue-section";
import { CertificatesTable } from "./components/certificates-table";
import { CertificateActions } from "./components/certificate-actions";

export function CertificateList() {
  const {
    user,
    certificates,
    archivedContractsWithoutCertificates,
    alertMsg,
    setAlertMsg,
    statusFilter,
    setStatusFilter,
    selectedCertificate,
    setSelectedCertificate,
    handleIssueCertificate,
    handleRevokeCertificate,
    handleDownloadCertificate,
    isAdmin,
    t,
  } = useCertificateList();

  if (!user) return null;

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
          <button
            onClick={() => setAlertMsg(null)}
            className="text-xs opacity-75 hover:opacity-100 font-semibold cursor-pointer"
          >
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
        onDownloadCertificate={handleDownloadCertificate}
        onViewDetails={(c) => setSelectedCertificate(c)}
      />

      <CertificateActions
        certificate={selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
        onDownloadCertificate={handleDownloadCertificate}
      />
    </div>
  );
}
export default CertificateList;
