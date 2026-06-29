"use client";

import React from "react";
import { Button } from "@/shared/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getProjectTemplateMetadata } from "@/domains/projects/storage";
import { useProjectWorkspace } from "./hooks/use-project-workspace";

// Layout Imports
import { WorkspaceLayout } from "./layouts/workspace-layout";
import { WorkspaceHeader } from "./layouts/workspace-header";
import { WorkspaceContent } from "./layouts/workspace-content";

// Tab Imports
import { OverviewTab } from "./tabs/overview-tab";
import { ExecutionTab } from "./tabs/execution-tab";
import { DocumentsTab } from "./tabs/documents-tab";
import { ObstaclesTab } from "./tabs/obstacles-tab";

export default function ProjectWorkspace() {
  const {
    user,
    projectId,
    project,
    setProject,
    request,
    setRequest,
    notes,
    setNotes,
    editingSilo,
    setEditingSilo,
    siloStatus,
    setSiloStatus,
    siloLabor,
    setSiloLabor,
    siloMaterials,
    setSiloMaterials,
    siloCost,
    setSiloCost,
    completionNotes,
    setCompletionNotes,
    readyForFinalInspection,
    setReadyForFinalInspection,
    activeTab,
    setActiveTab,
    isProcessing,
    loadData,
    handleApproveKickoff,
    handleStartExecution,
    handleStartSilo,
    handleCompleteSilo,
    handleCompleteExecution,
    handlePhaseTransition,
    startEditingSilo,
    handleSaveSilo,
    viewModel,
    t
  } = useProjectWorkspace();

  if (!user) return null;

  if (!project || !viewModel) {
    return (
      <div className="p-6 text-center text-muted-foreground space-y-4">
        <p>Project with reference {projectId} not found.</p>
        <Link href="/projects">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t("projects:details.back")}
          </Button>
        </Link>
      </div>
    );
  }

  const { isClient, isOperationalRole } = viewModel.roles;
  const projectProgramLabel = getProjectTemplateMetadata(project.workspaceTemplate || "installation_full", t).projectProgramLabel;

  return (
    <WorkspaceLayout>
      <WorkspaceHeader
        projectId={project.id}
        projectName={project.name}
        clientName={project.clientName}
        projectStatus={project.status}
        projectProgramLabel={projectProgramLabel}
        backText={t("projects:details.back")}
        workspaceTitle={t("projects:details.title") || "Project Workspace"}
      />

      <WorkspaceContent>
        {/* CLIENT VIEW SPLIT */}
        {isClient && (
          <OverviewTab
            project={project}
            setProject={setProject}
            request={request}
            setRequest={setRequest}
            viewModel={viewModel.overview}
            user={{ role: user.role, name: user.name || "" }}
            isProcessing={isProcessing}
            notes={notes}
            setNotes={setNotes}
            handleApproveKickoff={handleApproveKickoff}
            handleStartExecution={handleStartExecution}
            handlePhaseTransition={handlePhaseTransition}
            loadData={loadData}
            t={t}
          />
        )}

        {/* OPERATIONS WORKSPACE SPLIT */}
        {isOperationalRole && (
          <div className="space-y-6">
            {/* Tab Selector Buttons */}
            <div className="flex flex-wrap gap-2 border-b border-border pb-2">
              <Button
                variant={activeTab === "overview" ? "default" : "outline"}
                onClick={() => setActiveTab("overview")}
                className="text-xs h-8 font-bold"
              >
                {t("projects:tabs.overview")}
              </Button>
              <Button
                variant={activeTab === "execution" ? "default" : "outline"}
                onClick={() => setActiveTab("execution")}
                className="text-xs h-8 font-bold"
              >
                {t("projects:tabs.execution")}
              </Button>
              <Button
                variant={activeTab === "documents" ? "default" : "outline"}
                onClick={() => setActiveTab("documents")}
                className="text-xs h-8 font-bold"
              >
                {t("projects:tabs.documents")}
              </Button>
              <Button
                variant={activeTab === "obstacles" ? "default" : "outline"}
                onClick={() => setActiveTab("obstacles")}
                className="text-xs h-8 font-bold"
              >
                {t("projects:tabs.obstacles")}
              </Button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <OverviewTab
                project={project}
                setProject={setProject}
                request={request}
                setRequest={setRequest}
                viewModel={viewModel.overview}
                user={{ role: user.role, name: user.name || "" }}
                isProcessing={isProcessing}
                notes={notes}
                setNotes={setNotes}
                handleApproveKickoff={handleApproveKickoff}
                handleStartExecution={handleStartExecution}
                handlePhaseTransition={handlePhaseTransition}
                loadData={loadData}
                t={t}
              />
            )}

            {/* TAB 2: EXECUTION */}
            {activeTab === "execution" && (
              <ExecutionTab
                project={project}
                viewModel={viewModel.execution}
                user={{ role: user.role }}
                isProcessing={isProcessing}
                editingSilo={editingSilo}
                setEditingSilo={setEditingSilo}
                siloStatus={siloStatus}
                setSiloStatus={setSiloStatus}
                siloLabor={siloLabor}
                setSiloLabor={setSiloLabor}
                siloMaterials={siloMaterials}
                setSiloMaterials={setSiloMaterials}
                siloCost={siloCost}
                setSiloCost={setSiloCost}
                completionNotes={completionNotes}
                setCompletionNotes={setCompletionNotes}
                readyForFinalInspection={readyForFinalInspection}
                setReadyForFinalInspection={setReadyForFinalInspection}
                startEditingSilo={startEditingSilo}
                handleSaveSilo={handleSaveSilo}
                handleStartSilo={handleStartSilo}
                handleCompleteSilo={handleCompleteSilo}
                handleCompleteExecution={handleCompleteExecution}
                t={t}
              />
            )}

            {/* TAB 3: DOCUMENTS */}
            {activeTab === "documents" && (
              <DocumentsTab
                viewModel={viewModel.documents}
                t={t}
              />
            )}

            {/* TAB 4: OBSTACLES */}
            {activeTab === "obstacles" && (
              <ObstaclesTab
                viewModel={viewModel.obstacles}
                t={t}
              />
            )}
          </div>
        )}
      </WorkspaceContent>
    </WorkspaceLayout>
  );
}
