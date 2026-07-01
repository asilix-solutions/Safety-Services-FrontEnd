import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation, useNamespaceTranslations } from "@/providers/i18n-provider";
import { ClientContract } from "@/domains/contracts/types";
import { getContracts } from "@/domains/contracts/storage";
import { ClientCertificate } from "@/domains/certificates/types";
import { getCertificates } from "@/domains/certificates/storage";
import { issueCertificate, revokeCertificate } from "@/domains/certificates/workflow";

export function useCertificateList() {
  const { user } = useAuth();
  const { t } = useTranslation();
  useNamespaceTranslations(["common", "dashboard"]);

  const [certificates, setCertificates] = useState<ClientCertificate[]>([]);
  const [archivedContractsWithoutCertificates, setArchivedContractsWithoutCertificates] = useState<ClientContract[]>([]);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired" | "revoked">("all");
  const [selectedCertificate, setSelectedCertificate] = useState<ClientCertificate | null>(null);

  const loadData = () => {
    if (!user) return;

    const allCertificates = getCertificates();
    let userCertificates = allCertificates;

    if (user.role === "Client") {
      userCertificates = allCertificates.filter((c) => c.clientId === user.companyId);
    }
    setCertificates(userCertificates);

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

  const handleIssueCertificate = (contract: ClientContract) => {
    if (!user) return;
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
    if (!user) return;
    const reason = prompt(t("certificates_revoke_reason_prompt"), "Administrative Revocation");
    if (reason === null) return;

    try {
      revokeCertificate(certificateId, user.name, reason);
      setAlertMsg({ type: "success", text: t("certificates_revoke_success") });
      loadData();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err.message || "Failed to revoke certificate" });
    }
  };

  const handleDownloadCertificate = (certificate: ClientCertificate) => {
    alert(`Downloading compliance certificate PDF for "${certificate.title}" (Simulated)`);
  };

  const isAdmin = user ? user.role === "Company Admin" || user.role === "Super Admin" : false;

  return {
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
  };
}
export default useCertificateList;
