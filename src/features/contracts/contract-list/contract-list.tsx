"use client";

import React from "react";
import { PageHeader } from "@/shared/components/page-header";
import { CheckCircle2 } from "lucide-react";
import { useContractList } from "./hooks/use-contract-list";
import { ReadyToGenerateSection } from "./components/ready-to-generate-section";
import { ContractTable } from "./components/contract-table";
import { ContractActions } from "./components/contract-actions";

export function ContractList() {
  const {
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
  } = useContractList();

  if (!user) return null;

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
          <button
            onClick={() => setAlertMsg(null)}
            className="text-xs opacity-75 hover:opacity-100 font-semibold cursor-pointer"
          >
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

      <ContractTable
        contracts={contracts}
        isAdmin={isAdmin}
        userRole={user.role}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onSignContract={handleSignContract}
        onArchiveContract={handleArchiveContract}
        onDownloadContract={handleDownloadContract}
        onViewDetails={(c) => setSelectedContract(c)}
      />

      <ContractActions
        contract={selectedContract}
        onClose={() => setSelectedContract(null)}
        onDownloadContract={handleDownloadContract}
      />
    </div>
  );
}
export default ContractList;
