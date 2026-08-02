import { useTenantContext } from "@/hooks/use-tenant-context";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation, useNamespaceTranslations } from "@/providers/i18n-provider";
import { ClientCertificate } from "@/domains/certificates/types";
import { getScopedCertificates } from "@/domains/certificates/storage";
import { issueCertificateFromProject, revokeCertificate } from "@/domains/certificates/workflow";
import { getScopedProjects } from "@/domains/projects/storage";
import { checkProjectCertificateEligibility, CertificateEligibility } from "@/domains/workflow-validation/certificate.validators";
import { isRole, hasPermission } from "@/constants/permissions";

export function useCertificateList() {
  const { user } = useAuth();
  const tenantContext = useTenantContext();
  const { t } = useTranslation();
  useNamespaceTranslations(["common", "dashboard"]);

  const [certificates, setCertificates] = useState<ClientCertificate[]>([]);
  const [eligibleItems, setEligibleItems] = useState<CertificateEligibility[]>([]);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired" | "revoked">("all");
  const [selectedCertificate, setSelectedCertificate] = useState<ClientCertificate | null>(null);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [pendingRevokeCertificateId, setPendingRevokeCertificateId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState("");

  const loadData = () => {
    if (!user) return;

    const allCertificates = getScopedCertificates(tenantContext);
    let userCertificates = allCertificates;

    if (isRole(user.role, ["Client"])) {
      userCertificates = allCertificates.filter((c) => c.clientId === user.companyId);
    }
    setCertificates(userCertificates);

    const isAdmin = hasPermission(user.role, "certificates.manage");
    if (isAdmin) {
      // Scoped: the eligibility list drives issuance, so an unscoped list would
      // offer another tenant's completed projects as certifiable.
      const allProjects = getScopedProjects(tenantContext);
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
      // Scoped again at the point of the write, not just where the list is
      // built: the id travels through component state, so re-resolving it
      // unscoped here would reopen the hole the eligibility fix closes.
      const allProjects = getScopedProjects(tenantContext);
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
    setPendingRevokeCertificateId(certificateId);
    setRevokeReason(t("certificates_revoke_reason_default"));
    setRevokeDialogOpen(true);
  };

  const cancelRevoke = () => {
    setRevokeDialogOpen(false);
    setPendingRevokeCertificateId(null);
  };

  const confirmRevoke = () => {
    if (!user || !pendingRevokeCertificateId || !revokeReason.trim()) return;

    try {
      revokeCertificate(pendingRevokeCertificateId, user.name, revokeReason.trim());
      setAlertMsg({ type: "success", text: t("certificates_revoke_success") });
      loadData();
    } catch (err: any) {
      console.error("revokeCertificate failed:", err);
      setAlertMsg({ type: "error", text: t("common:error_generic_action_failed") });
    } finally {
      setRevokeDialogOpen(false);
      setPendingRevokeCertificateId(null);
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
    revokeDialogOpen,
    revokeReason,
    setRevokeReason,
    cancelRevoke,
    confirmRevoke,
  };
}
export default useCertificateList;
