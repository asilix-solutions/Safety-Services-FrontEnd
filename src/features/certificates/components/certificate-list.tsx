"use client";

import React from "react";
import { PageHeader } from "@/shared/components/page-header";
import { CheckCircle2 } from "lucide-react";
import { useCertificateList } from "../hooks/use-certificate-list";
import { ReadyToIssueSection } from "./ready-to-issue-section";
import { CertificatesTable } from "./certificates-table";
import { CertificateActions } from "./certificate-actions";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/shared/ui/alert-dialog";

export function CertificateList() {
  const {
    user,
    certificates,
    eligibleItems,
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
    revokeDialogOpen,
    revokeReason,
    setRevokeReason,
    cancelRevoke,
    confirmRevoke,
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
              ? "border-success/20 bg-success/5 text-success"
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
          eligibleItems={eligibleItems}
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

      <AlertDialog open={revokeDialogOpen} onOpenChange={(open) => !open && cancelRevoke()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("certificates_revoke_dialog_title")}</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="revoke-reason">{t("certificates_revoke_reason_prompt")}</Label>
            <Textarea
              id="revoke-reason"
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelRevoke}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!revokeReason.trim()}
              onClick={confirmRevoke}
            >
              {t("certificates_revoke_action")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
export default CertificateList;
