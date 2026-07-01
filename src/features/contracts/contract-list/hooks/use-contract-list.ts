import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation, useNamespaceTranslations } from "@/providers/i18n-provider";
import { Project } from "@/types/project";
import { getProjects } from "@/domains/projects/storage";
import { getRequests } from "@/domains/requests/storage";
import { ClientContract } from "@/domains/contracts/types";
import { getContracts } from "@/domains/contracts/storage";
import { generateContractFromCompletedProject, signContract, archiveContract } from "@/domains/contracts/workflow";

export function useContractList() {
  const { user } = useAuth();
  const { t } = useTranslation();
  useNamespaceTranslations(["common", "dashboard", "projects", "requests"]);

  const [contracts, setContracts] = useState<ClientContract[]>([]);
  const [completedProjectsWithoutContracts, setCompletedProjectsWithoutContracts] = useState<Project[]>([]);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "generated" | "signed" | "archived">("all");
  const [selectedContract, setSelectedContract] = useState<ClientContract | null>(null);

  const loadData = () => {
    if (!user) return;

    const allContracts = getContracts();
    let userContracts = allContracts;

    if (user.role === "Client") {
      userContracts = allContracts.filter((c) => c.clientId === user.companyId);
    }
    setContracts(userContracts);

    const allProjects = getProjects();
    const completed = allProjects.filter((p) => p.status === "completed" || p.executionPhase === "completed");
    const withoutContracts = completed.filter((p) => !allContracts.some((c) => c.projectId === p.id));
    setCompletedProjectsWithoutContracts(withoutContracts);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleGenerateContract = (project: Project) => {
    if (!user) return;
    try {
      const requests = getRequests();
      const request = requests.find((r) => r.jobNumber === project.jobNumber) || null;
      generateContractFromCompletedProject(project, request);
      setAlertMsg({ type: "success", text: `Contract successfully generated for ${project.name}` });
      loadData();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: t(err.message) || "Failed to generate contract" });
    }
  };

  const handleSignContract = (contractId: string) => {
    if (!user) return;
    try {
      signContract(contractId, user.name);
      setAlertMsg({ type: "success", text: "Completion agreement signed successfully." });
      loadData();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: t(err.message) || "Failed to sign contract" });
    }
  };

  const handleArchiveContract = (contractId: string) => {
    if (!user) return;
    try {
      archiveContract(contractId, user.name);
      setAlertMsg({ type: "success", text: "Contract archived successfully." });
      loadData();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: t(err.message) || "Failed to archive contract" });
    }
  };

  const handleDownloadContract = (contract: ClientContract) => {
    alert(`Downloading completion agreement PDF for "${contract.title}" (Simulated)`);
  };

  const isAdmin = user ? user.role === "Company Admin" || user.role === "Super Admin" : false;

  return {
    user,
    contracts,
    completedProjectsWithoutContracts,
    alertMsg,
    setAlertMsg,
    statusFilter,
    setStatusFilter,
    selectedContract,
    setSelectedContract,
    handleGenerateContract,
    handleSignContract,
    handleArchiveContract,
    handleDownloadContract,
    isAdmin,
    t,
  };
}
export default useContractList;
