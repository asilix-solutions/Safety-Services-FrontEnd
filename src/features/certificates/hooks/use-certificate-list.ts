import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation, useNamespaceTranslations } from "@/providers/i18n-provider";
import { ClientCertificate } from "@/domains/certificates/types";
import { getCertificates } from "@/domains/certificates/storage";
import { issueCertificateFromProject, revokeCertificate } from "@/domains/certificates/workflow";
import { getProjects } from "@/domains/projects/storage";
import { checkProjectCertificateEligibility, CertificateEligibility } from "@/domains/workflow-validation/certificate.validators";
import { isRole, hasPermission } from "@/constants/permissions";

export function useCertificateList() {
  const { user } = useAuth();
  const { t } = useTranslation();
  useNamespaceTranslations(["common", "dashboard"]);

  const [certificates, setCertificates] = useState<ClientCertificate[]>([]);
  const [eligibleItems, setEligibleItems] = useState<CertificateEligibility[]>([]);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired" | "revoked">("all");
  const [selectedCertificate, setSelectedCertificate] = useState<ClientCertificate | null>(null);

  const loadData = () => {
    if (!user) return;

    const allCertificates = getCertificates();
    let userCertificates = allCertificates;

    if (isRole(user.role, ["Client"])) {
      userCertificates = allCertificates.filter((c) => c.clientId === user.companyId);
    }
    setCertificates(userCertificates);

    const isAdmin = hasPermission(user.role, "certificates.manage");
    if (isAdmin) {
      const allProjects = getProjects();
      const eligible = allProjects
        .map((proj) => checkProjectCertificateEligibility(proj, allCertificates))
        .filter((item) => item.eligible);
      setEligibleItems(eligible);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleIssueCertificate = (item: CertificateEligibility) => {
    if (!user) return;
    try {
      const allProjects = getProjects();
      const targetProject = allProjects.find((p) => p.id === item.sourceId);
      if (!targetProject) {
        throw new Error("Target project not found.");
      }

      issueCertificateFromProject(targetProject, user.name);
      setAlertMsg({
        type: "success",
        text: `${t("certificates_issue_success")} "${item.title}"`,
      });
      loadData();
    } catch (err: any) {
      console.error("issueCertificateFromProject failed:", err);
      setAlertMsg({ type: "error", text: t("common:error_generic_action_failed") });
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
      console.error("revokeCertificate failed:", err);
      setAlertMsg({ type: "error", text: t("common:error_generic_action_failed") });
    }
  };

  const handleDownloadCertificate = (certificate: ClientCertificate) => {
    toast.info(t("common:certificates_download_simulated", { title: certificate.title }));
  };

  const isAdmin = user ? hasPermission(user.role, "certificates.manage") : false;

  return {
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
  };
}
export default useCertificateList;
