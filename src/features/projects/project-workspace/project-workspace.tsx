"use client";

import React from "react";
import { Button } from "@/shared/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getProjectTemplateMetadata } from "@/domains/projects/storage";
import { useProjectWorkspace } from "./hooks/use-project-workspace";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { ProjectWorkspaceTab } from "@/constants/permissions";

// Layout Imports
import { WorkspaceLayout } from "./layouts/workspace-layout";
import { WorkspaceHeader } from "./layouts/workspace-header";
import { WorkspaceContent } from "./layouts/workspace-content";

// Tab Imports
import { OverviewTab } from "./tabs/overview-tab";
import { TimelineTab } from "./tabs/timeline-tab";
import { SystemsTab } from "./tabs/systems-tab";
import { ProcurementTab } from "./tabs/procurement-tab";
import { LaborTab } from "./tabs/labor-tab";
import { SiteVisitsTab } from "./tabs/site-visits-tab";
import { ObstaclesTab } from "./tabs/obstacles-tab";
import { AttachmentsTab } from "./tabs/attachments-tab";
import { PhotosTab } from "./tabs/photos-tab";
import { InspectionTab } from "./tabs/inspection-tab";
import { CompletionTab } from "./tabs/completion-tab";
import { PROJECT_TABS } from "./constants/project-tabs";

export default function ProjectWorkspace() {
  const {
    user,
    projectId,
    project,
    setProject,
    request,
    setRequest,
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
    handleStartExecution,
    handleStartSilo,
    handleCompleteSilo,
    handleCompleteExecution,
    startEditingSilo,
    handleSaveSilo,
    viewModel,
    t,
    dir
  } = useProjectWorkspace();

  if (!user) return null;

  if (!project || !viewModel) {
    return (
      <div className="p-6 text-center text-muted-foreground space-y-4">
        <p>Project with reference {projectId} not found.</p>
        <Link href="/projects">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 me-2" />
            {t("projects:details.back")}
          </Button>
        </Link>
      </div>
    );
  }

  const workspaceUser = { role: user.role, name: user.name || "" };
  const projectProgramLabel = getProjectTemplateMetadata(project.workspaceTemplate || "installation_full", t).projectProgramLabel;
  const visibleTabs = PROJECT_TABS.filter((tab) => viewModel.access.visibleTabs.includes(tab.id));

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
        <Tabs
          dir={dir}
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ProjectWorkspaceTab)}
        >
          <TabsList>
            {visibleTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {t(tab.labelKey)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab
              project={project}
              request={request}
              documents={viewModel.documents}
              viewModel={viewModel.overview}
              isProcessing={isProcessing}
              handleStartExecution={handleStartExecution}
              t={t}
            />
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineTab timeline={viewModel.overview.timeline} t={t} />
          </TabsContent>

          <TabsContent value="systems">
            <SystemsTab
              project={project}
              viewModel={viewModel.execution}
              user={workspaceUser}
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
          </TabsContent>

          <TabsContent value="procurement">
            <ProcurementTab projectId={project.id} />
          </TabsContent>

          <TabsContent value="labor">
            <LaborTab projectId={project.id} />
          </TabsContent>

          <TabsContent value="siteVisits">
            <SiteVisitsTab
              project={project}
              setProject={setProject}
              user={workspaceUser}
              isProcessing={isProcessing}
              loadData={loadData}
              t={t}
            />
          </TabsContent>

          <TabsContent value="obstacles">
            <ObstaclesTab viewModel={viewModel.obstacles} t={t} />
          </TabsContent>

          <TabsContent value="attachments">
            <AttachmentsTab viewModel={viewModel.documents} t={t} />
          </TabsContent>

          <TabsContent value="photos">
            <PhotosTab projectId={project.id} />
          </TabsContent>

          <TabsContent value="inspection">
            <InspectionTab
              project={project}
              request={request}
              setProject={setProject}
              setRequest={setRequest}
              user={workspaceUser}
              loadData={loadData}
              t={t}
            />
          </TabsContent>

          <TabsContent value="completion">
            <CompletionTab project={project} t={t} />
          </TabsContent>
        </Tabs>
      </WorkspaceContent>
    </WorkspaceLayout>
  );
}
