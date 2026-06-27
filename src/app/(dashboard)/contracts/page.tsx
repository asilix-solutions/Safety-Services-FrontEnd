"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/shared/components/page-header";
import { CheckCircle2 } from "lucide-react";
import { useTranslation, useNamespaceTranslations } from "@/providers/i18n-provider";
import { Project } from "@/types/project";
import { getProjects } from "@/domains/projects/storage";
import { getRequests } from "@/domains/requests/storage";
import { ClientContract } from "@/domains/contracts/types";
import { getContracts } from "@/domains/contracts/storage";
import { generateContractFromCompletedProject, signContract, archiveContract } from "@/domains/contracts/workflow";

import {
  ReadyToGenerateSection,
  ContractsTable,
  ContractAuditDialog,
} from "@/features/contracts";

export default function ContractsDashboardPage() {
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

    // Load contracts
    const allContracts = getContracts();
    let userContracts = allContracts;

    if (user.role === "Client") {
      userContracts = allContracts.filter((c) => c.clientId === user.companyId);
    }
    setContracts(userContracts);

    // Load completed projects without contracts
    const allProjects = getProjects();
    const completed = allProjects.filter((p) => p.status === "completed" || p.executionPhase === "completed");
    const withoutContracts = completed.filter((p) => !allContracts.some((c) => c.projectId === p.id));
    setCompletedProjectsWithoutContracts(withoutContracts);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (!user) return null;

  const isAdmin = user.role === "Company Admin" || user.role === "Super Admin";

  const handleGenerateContract = (project: Project) => {
    try {
      const requests = getRequests();
      const request = requests.find((r) => r.jobNumber === project.jobNumber) || null;
      generateContractFromCompletedProject(project, request);
      setAlertMsg({ type: "success", text: `Contract successfully generated for ${project.name}` });
      loadData();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err.message || "Failed to generate contract" });
    }
  };

  const handleSignContract = (contractId: string) => {
    try {
      signContract(contractId, user.name);
      setAlertMsg({ type: "success", text: "Completion agreement signed successfully." });
      loadData();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err.message || "Failed to sign contract" });
    }
  };

  const handleArchiveContract = (contractId: string) => {
    try {
      archiveContract(contractId, user.name);
      setAlertMsg({ type: "success", text: "Contract archived successfully." });
      loadData();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err.message || "Failed to archive contract" });
    }
  };

  const simulateDownload = (contract: ClientContract) => {
    alert(`Downloading completion agreement PDF for "${contract.title}" (Simulated)`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("common:contracts_title")}
        description={t("common:contracts_desc")}
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
          <button onClick={() => setAlertMsg(null)} className="text-xs opacity-75 hover:opacity-100 font-semibold cursor-pointer">
            {t("common:dismiss")}
          </button>
        </div>
      )}

      {isAdmin && (
        <ReadyToGenerateSection
          projects={completedProjectsWithoutContracts}
          onGenerateContract={handleGenerateContract}
        />
      )}

      <ContractsTable
        contracts={contracts}
        isAdmin={isAdmin}
        userRole={user.role}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onSignContract={handleSignContract}
        onArchiveContract={handleArchiveContract}
        onDownloadContract={simulateDownload}
        onViewDetails={(contract) => setSelectedContract(contract)}
      />

      <ContractAuditDialog
        contract={selectedContract}
        onClose={() => setSelectedContract(null)}
        onDownloadContract={simulateDownload}
      />
    </div>
  );
}
