"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/components/empty-state";
import { DataTable, ColumnDef } from "@/shared/tables/data-table";
import { FileCheck2, FileSignature, Archive, Download, ShieldAlert, Plus, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";
import { Project } from "@/types/project";
import { getProjects } from "@/domains/projects/storage";
import { getRequests } from "@/domains/requests/storage";
import { ClientContract } from "@/domains/contracts/types";
import { getContracts, createOrUpdateContract } from "@/domains/contracts/storage";
import { generateContractFromCompletedProject, signContract, archiveContract } from "@/domains/contracts/workflow";
import { StatusBadge } from "@/shared/components/status-badge";

export default function ContractsDashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [contracts, setContracts] = useState<ClientContract[]>([]);
  const [completedProjectsWithoutContracts, setCompletedProjectsWithoutContracts] = useState<Project[]>([]);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = () => {
    if (!user) return;

    // Load contracts
    const allContracts = getContracts();
    let userContracts = allContracts;
    
    console.log("AUDIT - user:", {
      role: user.role,
      id: user.id,
      companyId: user.companyId,
      name: user.name,
      email: user.email
    });
    console.log("AUDIT - allContracts:", allContracts.map(c => ({
      id: c.id,
      title: c.title,
      clientId: c.clientId,
      projectId: c.projectId,
      jobNumber: c.jobNumber,
      status: c.status
    })));
    console.log("AUDIT - filter result:", allContracts.filter(c => c.clientId === user.companyId));

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

  // Columns for Existing Contracts Table
  const contractColumns: ColumnDef<ClientContract>[] = [
    {
      header: "Contract ID",
      accessorKey: "id",
      render: (row) => <span className="font-mono text-xs font-bold text-primary">{row.id}</span>,
    },
    {
      header: "Title",
      accessorKey: "title",
      render: (row) => <span className="font-semibold text-foreground">{row.title}</span>,
    },
    {
      header: "Value (SAR)",
      accessorKey: "value",
      render: (row) => <span>{row.value.toLocaleString()} SAR</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      render: (row) => {
        let color = "bg-secondary text-secondary-foreground";
        if (row.status === "signed") color = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
        if (row.status === "archived") color = "bg-muted text-muted-foreground";
        if (row.status === "generated") color = "bg-amber-500/10 text-amber-600 dark:text-amber-400";
        
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
            {row.status.toUpperCase()}
          </span>
        );
      },
    },
    {
      header: "Created Date",
      accessorKey: "createdAt",
      render: (row) => <span className="text-muted-foreground text-xs">{new Date(row.createdAt).toLocaleDateString()}</span>,
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          {row.status === "generated" && user.role === "Client" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSignContract(row.id)}
              className="h-8 gap-1 text-xs border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
            >
              <FileSignature className="h-3.5 w-3.5" />
              Sign & Approve
            </Button>
          )}
          {row.status === "signed" && isAdmin && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleArchiveContract(row.id)}
              className="h-8 gap-1 text-xs border-blue-500/30 text-blue-600 hover:bg-blue-500/10 hover:text-blue-700"
            >
              <Archive className="h-3.5 w-3.5" />
              Archive
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => simulateDownload(row)}
            className="h-8 gap-1 text-xs hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>
      ),
    },
  ];

  // Columns for Completed Projects without Contracts
  const projectColumns: ColumnDef<Project>[] = [
    {
      header: "Project ID",
      accessorKey: "id",
      render: (row) => <span className="font-mono text-xs font-bold text-primary">{row.id}</span>,
    },
    {
      header: "Project Name",
      accessorKey: "name",
      render: (row) => <span className="font-semibold text-foreground">{row.name}</span>,
    },
    {
      header: "Client Name",
      accessorKey: "clientName",
      render: (row) => <span>{row.clientName}</span>,
    },
    {
      header: "Completion Status",
      render: () => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          COMPLETED
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <Button
          size="sm"
          onClick={() => handleGenerateContract(row)}
          className="h-8 gap-1 text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          Generate Contract
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contracts & Completion Agreements"
        description="Review, sign, download, and archive post-completion compliance documentation."
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
          <button onClick={() => setAlertMsg(null)} className="text-xs opacity-75 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {isAdmin && completedProjectsWithoutContracts.length > 0 && (
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShieldAlert className="h-4.5 w-4.5 text-amber-500" />
              Projects Ready for Contract Generation
            </CardTitle>
            <CardDescription>
              These projects are completed but do not yet have signed completion contracts or legal closure agreements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={completedProjectsWithoutContracts}
              columns={projectColumns}
              searchKey="name"
            />
          </CardContent>
        </Card>
      )}

      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {isAdmin ? "All Compliance Agreements" : "My Agreements"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <EmptyState
              title="No agreements found"
              description={
                isAdmin
                  ? "Contracts will appear here once generated for completed projects."
                  : "No completion agreements have been issued to your account yet."
              }
              icon={<FileCheck2 className="h-6 w-6 text-muted-foreground" />}
            />
          ) : (
            <DataTable
              data={contracts}
              columns={contractColumns}
              searchKey="title"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
