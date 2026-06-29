"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import { Textarea } from "@/shared/ui/textarea";
import { Select } from "@/shared/ui/select";
import { 
  ArrowLeft, 
  Send, 
  Link as LinkIcon, 
  ShieldAlert, 
  Activity, 
  Users, 
  FileText, 
  AlertTriangle, 
  Camera, 
  Settings, 
  CheckCircle,
  Clock,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation, useNamespaceTranslations } from "@/providers/i18n-provider";
import { Project, ProjectExecutionPhase, SiloExecutionData } from "@/types/project";
import { getProjects } from "@/domains/projects/storage";
import { LicensingRequest } from "@/domains/requests/types";
import { getMergedRequests } from "@/domains/requests/storage";
import { StatusBadge } from "@/shared/components/status-badge";
import { getCanonicalRequestTypeDisplayName, getReviewPathDisplayName } from "@/domains/requests/workflow";
import { 
  approveKickoff,
  startExecution,
  updateProjectSiloStatus,
  transitionProjectPhase,
  completeProjectExecution,
  startExecutionSilo,
  completeExecutionSilo
} from "@/domains/projects/workflow";
import { createDefaultWorkspace, buildProjectWorkspaceTemplate } from "@/domains/projects/storage";
import { USER_ROLES } from "@/constants/roles";
import { FinalInspectionPanel } from "@/features/projects/final-inspection";

// Helper to determine if current role is Client
const isClientRole = (role?: string) => role === USER_ROLES.CLIENT;

// Reusable Sub-Component: Linked Request Snapshot Card
function LinkedRequestSnapshotCard({ request, t }: { request: LicensingRequest; t: any }) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
          <LinkIcon className="h-4 w-4 text-indigo-500" />
          {t("projects:details.linkedRequest") || "Linked Safety Request"}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-3 pt-3"> 
        <div className="space-y-1">
          <span className="text-[10px] text-muted-foreground block uppercase">{t("projects:details.jobNumber")}</span>
          <span className="font-mono font-bold text-foreground">{request.jobNumber}</span>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-muted-foreground block uppercase">{t("projects:details.requestType") || "Request Type"}</span>
          <span className="font-semibold text-foreground">{getCanonicalRequestTypeDisplayName(request, t)}</span>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-muted-foreground block uppercase">{t("requests:details.reviewPathLabel") || "Review Path"}</span>
          <span className="font-semibold text-foreground">{getReviewPathDisplayName(request, t)}</span>
        </div>
        <div className="pt-2 border-t border-border">
          <Button asChild type="button" variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8 font-bold">
            <Link href={`/requests/${request.jobNumber}`}>
              {t("projects:details.viewRequest") || "View Original Request"}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Reusable Sub-Component: Project Completed Card
function ProjectCompletedCard({ project, t }: { project: Project; t: any }) {
  const inspection = project.workspace?.inspection;
  const decisionBy = inspection?.decisionBy || "Consulting Engineer";
  const notes = inspection?.notes || "Compliance checks passed successfully.";
  const completedAt = inspection?.completedAt 
    ? new Date(inspection.completedAt).toLocaleDateString() 
    : new Date().toLocaleDateString();

  return (
    <Card className="border-emerald-500/20 bg-emerald-500/[0.03] dark:bg-emerald-950/[0.08]">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          {t("projects:completed.title") || "Project Completed & Approved"}
        </CardTitle>
        <CardDescription className="text-xs">
          {t("projects:completed.desc") || "This compliance project has been officially inspected and certified."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-xs pt-4">
        <div className="p-3 bg-secondary/35 rounded-lg border border-border space-y-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground block uppercase">{t("projects:inspection.decisionBy") || "Approved By"}</span>
              <span className="font-semibold text-foreground">{decisionBy}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground block uppercase">{t("projects:inspection.completedAt") || "Completion Date"}</span>
              <span className="font-semibold text-foreground">{completedAt}</span>
            </div>
          </div>
          <div className="pt-2.5 border-t border-border">
            <span className="text-[10px] text-muted-foreground block uppercase mb-1">{t("projects:inspection.notesLabel") || "Inspection Decision Notes"}</span>
            <p className="font-mono text-[10px] text-foreground leading-relaxed bg-background p-2.5 rounded border border-border">
              {notes}
            </p>
          </div>
          {project.jobNumber && (
            <div className="pt-2.5 border-t border-border">
              <span className="text-[10px] text-muted-foreground block uppercase">{t("projects:details.jobNumber") || "Job Number"}</span>
              <span className="font-mono font-bold text-foreground text-xs">{project.jobNumber}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


export default function ProjectDetailsPage() {
  const { user } = useAuth();
  const params = useParams();
  const { t } = useTranslation();
  useNamespaceTranslations(["projects", "requests", "common"]);

  const [project, setProject] = useState<Project | null>(null);
  const [request, setRequest] = useState<LicensingRequest | null>(null);
  
  // Kickoff form states
  const [inspector, setInspector] = useState("");
  const [notes, setNotes] = useState("");
  const [isApproved, setIsApproved] = useState(false);

  // Silo custom editing state
  const [editingSilo, setEditingSilo] = useState<string | null>(null);
  const [siloStatus, setSiloStatus] = useState<any>({});
  const [siloLabor, setSiloLabor] = useState<number>(0);
  const [siloMaterials, setSiloMaterials] = useState<number>(0);
  const [siloCost, setSiloCost] = useState<number>(0);

  // Completion form states
  const [completionNotes, setCompletionNotes] = useState("");
  const [readyForFinalInspection, setReadyForFinalInspection] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);

  const projectId = params?.projectId as string;

  const loadData = () => {
    if (projectId) {
      const list = getProjects();
      const foundProject = list.find((p) => p.id === projectId);
      if (foundProject) {
        // Enforce default workspace if not present (migration & safety)
        if (!foundProject.workspace) {
          foundProject.workspace = createDefaultWorkspace();
        }
        
        // Dynamic template compilation for compatibility
        if (!foundProject.workspaceTemplate) {
          if (foundProject.projectType === "license") {
            foundProject.workspaceTemplate = "installation_full";
          } else if (foundProject.projectType === "maintenance") {
            foundProject.workspaceTemplate = "maintenance";
          } else {
            foundProject.workspaceTemplate = "compliance_followup";
          }
        }
        
        if (!foundProject.executionPhase) {
          foundProject.executionPhase = foundProject.status === "active" ? "active_execution" : "created";
        }
        setProject(foundProject);

        // Populate kickoff form
        setInspector(foundProject.workspace.kickoff.assignedInspector || "");
        setNotes(foundProject.workspace.kickoff.notes || "");
        setIsApproved(foundProject.workspace.kickoff.approved || false);

        // Populate completion form
        setCompletionNotes(foundProject.workspace.completion.notes || "");
        setReadyForFinalInspection(foundProject.workspace.completion.readyForFinalInspection || false);

        // Fetch parent request
        const mergedRequests = getMergedRequests();
        const foundRequest = mergedRequests.find((r) => r.jobNumber === foundProject.jobNumber);
        if (foundRequest) {
          setRequest(foundRequest);
        }
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  if (!user) return null;

  if (!project) {
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

  const handleApproveKickoff = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const updated = approveKickoff({
        project,
        notes,
        approvedBy: user?.name || user?.role || "Operations Officer",
      });
      setProject(updated);
      alert(t("projects:kickoff.savedSuccess") || "Kickoff approved successfully!");
      loadData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to approve kickoff.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartExecution = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const updated = startExecution({
        project,
        startedBy: user?.name || user?.role || "Operations Officer",
      });
      setProject(updated);
      alert(t("projects:details.alertExecutionStarted") || "Execution started successfully!");
      loadData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to start execution.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartSilo = (siloId: "alarm" | "suppression" | "ventilation") => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const updated = startExecutionSilo({
        project,
        siloId,
        startedBy: user?.name || user?.role || "Operations Officer",
      });
      setProject(updated);
      alert(t("projects.execution.moduleStarted") || "Silo execution started!");
      loadData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to start silo execution.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteSilo = (siloId: "alarm" | "suppression" | "ventilation", notes: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const updated = completeExecutionSilo({
        project,
        siloId,
        completedBy: user?.name || user?.role || "Operations Officer",
        notes,
      });
      setProject(updated);
      alert(t("projects.execution.moduleCompleted") || "Silo execution completed!");
      loadData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to complete silo execution.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteExecution = () => {
    if (isProcessing || !completionNotes.trim() || !readyForFinalInspection) return;
    setIsProcessing(true);
    try {
      const { updatedProject, updatedRequest } = completeProjectExecution({
        project,
        request,
        completionNotes,
      });
      setProject(updatedProject);
      if (updatedRequest) {
        setRequest(updatedRequest);
      }
      alert(t("projects:details.alertExecutionCompleted"));
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePhaseTransition = (phase: ProjectExecutionPhase) => {
    try {
      const updated = transitionProjectPhase({ project, phase });
      setProject(updated);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const startEditingSilo = (silo: SiloExecutionData) => {
    setEditingSilo(silo.id);
    setSiloStatus(silo.status);
    setSiloLabor(silo.laborCount);
    setSiloMaterials(silo.materialsCount);
    setSiloCost(silo.costSAR);
  };

  const handleSaveSilo = (siloId: "alarm" | "suppression" | "ventilation") => {
    try {
      const updated = updateProjectSiloStatus({
        project,
        siloId,
        status: siloStatus,
        laborCount: siloLabor,
        materialsCount: siloMaterials,
        costSAR: siloCost,
      });
      setProject(updated);
      setEditingSilo(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const isClient = isClientRole(user.role);
  const isOperationalRole = !isClient && (user.role === "Operations Officer" || user.role === "Consulting Engineer" || user.role === "Super Admin");

  const silos = project.workspace?.execution?.silos || [];
  const totalLabor = silos.reduce((sum, s) => sum + s.laborCount, 0);
  const totalMaterialsCost = silos.reduce((sum, s) => sum + s.costSAR, 0);
  const totalMaterialsCount = silos.reduce((sum, s) => sum + s.materialsCount, 0);

  const internalPhases: { id: ProjectExecutionPhase; labelKey: string }[] = [
    { id: "created", labelKey: "projects:phases.created" },
    { id: "kickoff_ready", labelKey: "projects:phases.kickoff_ready" },
    { id: "active_execution", labelKey: "projects:phases.active_execution" },
    { id: "ready_for_final_inspection", labelKey: "projects:phases.ready_for_final_inspection" },
    { id: "completed", labelKey: "projects:phases.completed" }
  ];

  const currentPhaseIndex = internalPhases.findIndex((p) => p.id === (project.executionPhase || "created"));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Link href="/projects">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </Link>
          <PageHeader
            title={`${t("projects:details.title") || "Project Workspace"}: ${project.id}`}
            description={`${project.name} (${project.clientName})`}
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold px-2 py-1 rounded">
            {(() => {
              const { getProjectTemplateMetadata } = require("@/domains/projects/storage");
              return getProjectTemplateMetadata(project.workspaceTemplate || "installation_full", t).projectProgramLabel;
            })()}
          </span>
          <StatusBadge status={project.status} type="project" />
        </div>
      </div>

      {/* CLIENT VIEW SPLIT */}
      {isClient && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground">
                  {t("projects:clientView.title") || "Compliance Project Status"}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  {t("projects:clientView.desc") || "Monitor progress milestones for your safety licensing and inspections."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase text-muted-foreground tracking-wider">
                    {t("projects:clientView.progress") || "Project Milestone Pathway"}
                  </h4>
                  
                  {/* Client Simplified Timeline */}
                  <div className="relative border-s border-border ps-4 ms-2 space-y-6 text-xs">
                    {project.workspaceTemplate === "maintenance" ? (
                      <>
                        <div className="relative">
                          <div className={`absolute -start-[21px] mt-1 h-2.5 w-2.5 rounded-full ring-4 ring-background ${currentPhaseIndex >= 0 ? "bg-emerald-500" : "bg-muted"}`} />
                          <div className="font-bold text-foreground">{t("projects:milestones.maintenance.created.title") || "Maintenance Plan Initialized"}</div>
                          <p className="text-[10px] text-muted-foreground">{t("projects:milestones.maintenance.created.desc") || "Maintenance program setup created and assigned."}</p>
                        </div>
                        <div className="relative">
                          <div className={`absolute -start-[21px] mt-1 h-2.5 w-2.5 rounded-full ring-4 ring-background ${currentPhaseIndex >= 2 ? "bg-emerald-500" : currentPhaseIndex === 1 ? "bg-indigo-600 animate-pulse" : "bg-muted"}`} />
                          <div className="font-bold text-foreground">{t("projects:milestones.maintenance.active.title") || "Maintenance Operations Active"}</div>
                          <p className="text-[10px] text-muted-foreground">{t("projects:milestones.maintenance.active.desc") || "Scheduled technician maintenance check visits are active."}</p>
                        </div>
                        <div className="relative">
                          <div className={`absolute -start-[21px] mt-1 h-2.5 w-2.5 rounded-full ring-4 ring-background ${currentPhaseIndex >= 3 ? "bg-emerald-500" : currentPhaseIndex === 3 ? "bg-indigo-600 animate-pulse" : "bg-muted"}`} />
                          <div className="font-bold text-foreground">{t("projects:milestones.maintenance.inspection.title") || "Final Maintenance Review"}</div>
                          <p className="text-[10px] text-muted-foreground">{t("projects:milestones.maintenance.inspection.desc") || "Annual compliance review and valve diagnostic audit checks."}</p>
                        </div>
                        <div className="relative">
                          <div className={`absolute -start-[21px] mt-1 h-2.5 w-2.5 rounded-full ring-4 ring-background ${currentPhaseIndex >= 4 ? "bg-emerald-500" : "bg-muted"}`} />
                          <div className="font-bold text-foreground">{t("projects:milestones.maintenance.completed.title") || "Completed"}</div>
                          <p className="text-[10px] text-muted-foreground">{t("projects:milestones.maintenance.completed.desc") || "All maintenance operations certified and records archived."}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative">
                          <div className={`absolute -start-[21px] mt-1 h-2.5 w-2.5 rounded-full ring-4 ring-background ${currentPhaseIndex >= 0 ? "bg-emerald-500" : "bg-muted"}`} />
                          <div className="font-bold text-foreground">{t("projects:phases.created")}</div>
                          <p className="text-[10px] text-muted-foreground">Project has been initialized and is under review.</p>
                        </div>
                        <div className="relative">
                          <div className={`absolute -start-[21px] mt-1 h-2.5 w-2.5 rounded-full ring-4 ring-background ${currentPhaseIndex >= 2 ? "bg-emerald-500" : currentPhaseIndex === 1 ? "bg-indigo-600 animate-pulse" : "bg-muted"}`} />
                          <div className="font-bold text-foreground">{t("projects:phases.active_execution")}</div>
                          <p className="text-[10px] text-muted-foreground">Silo operations and installation are actively prepared or ongoing on-site.</p>
                        </div>
                        <div className="relative">
                          <div className={`absolute -start-[21px] mt-1 h-2.5 w-2.5 rounded-full ring-4 ring-background ${currentPhaseIndex >= 3 ? "bg-emerald-500" : currentPhaseIndex === 3 ? "bg-indigo-600 animate-pulse" : "bg-muted"}`} />
                          <div className="font-bold text-foreground">{t("projects:phases.ready_for_final_inspection")}</div>
                          <p className="text-[10px] text-muted-foreground">Installation completed, awaiting final official compliance check.</p>
                        </div>
                        <div className="relative">
                          <div className={`absolute -start-[21px] mt-1 h-2.5 w-2.5 rounded-full ring-4 ring-background ${currentPhaseIndex >= 4 ? "bg-emerald-500" : "bg-muted"}`} />
                          <div className="font-bold text-foreground">{t("projects:phases.completed")}</div>
                          <p className="text-[10px] text-muted-foreground">All tests passed and certificates issued.</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t("projects:clientView.finalPhotos") || "Upload Completion Photos"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-center py-6 border border-dashed border-border rounded-lg m-4 space-y-2">
                   <Camera className="h-6 w-6 text-muted-foreground mx-auto" />
                  <p className="text-[10px] text-muted-foreground">{t("projects:clientView.uploadDesc")}</p>
                  <Button variant="outline" size="sm" className="h-7 text-[10px]">{t("projects:clientView.uploadBtn")}</Button>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t("projects:clientView.finalDocs") || "Issued Certificates & Licensing"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-center py-6 border border-dashed border-border rounded-lg m-4 space-y-2">
                  <FileText className="h-6 w-6 text-muted-foreground mx-auto" />
                  <p className="text-[10px] text-muted-foreground">{t("projects:clientView.downloadDesc")}</p>
                  <Button variant="outline" size="sm" className="h-7 text-[10px]" disabled>{t("projects:clientView.noDocs")}</Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            {request && <LinkedRequestSnapshotCard request={request} t={t} />}
          </div>
        </div>
      )}

      {/* OPERATIONS WORKSPACE SPLIT */}
      {isOperationalRole && (
        <>
          {/* Internal Stepper Timeline */}
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                {t("projects:phases.title") || "Internal Execution Phase"}
              </h3>
              <div className="grid grid-cols-5 gap-2 relative">
                {internalPhases.map((phase, idx) => {
                  const isPassed = idx < currentPhaseIndex;
                  const isCurrent = idx === currentPhaseIndex;
                  return (
                    <div key={phase.id} className="flex flex-col items-center text-center space-y-2 relative">
                      <button
                        onClick={() => handlePhaseTransition(phase.id)}
                        className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-all z-10 ${
                          isPassed 
                            ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                            : isCurrent 
                            ? "bg-indigo-600 text-white ring-4 ring-indigo-500/20" 
                            : "bg-secondary border border-border text-muted-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {isPassed ? "✓" : idx + 1}
                      </button>
                      <span className={`text-[10px] sm:text-xs font-semibold ${isCurrent ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-muted-foreground"}`}>
                        {t(phase.labelKey) || phase.id.replace("_", " ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left/Middle Column */}
            <div className="lg:col-span-2 space-y-6">
              {project.executionPhase === "completed" ? (
                <ProjectCompletedCard project={project} t={t} />
              ) : project.executionPhase === "ready_for_final_inspection" ? (
                <FinalInspectionPanel
                  project={project}
                  request={request}
                  userRole={user.role}
                  userName={user.name}
                  onSuccess={(updatedProject, updatedRequest) => {
                    setProject(updatedProject);
                    if (updatedRequest) {
                      setRequest(updatedRequest);
                    }
                    loadData();
                  }}
                />
              ) : (
                <>
                  {/* Kickoff Section */}
                  {user.role === USER_ROLES.OPERATIONS_OFFICER && project.executionPhase === "created" && (
                    <Card className="border-border bg-card">
                      <CardHeader className="pb-3 border-b border-border">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <Settings className="h-4 w-4 text-indigo-500" />
                          {t("projects:kickoff.title") || "Project Setup & Kickoff"}
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          {t("projects:kickoff.desc") || "Operational setup before active execution."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <form onSubmit={handleApproveKickoff} className="space-y-4 text-xs">
                          <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground block">{t("projects.kickoff.kickoffNotes") || "Kickoff Directions & Notes"}</label>
                            <Textarea
                              rows={3}
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder={t("projects:kickoff.notesPlaceholder") || "Enter kickoff instructions..."}
                              className="bg-secondary/50 min-h-[80px]"
                            />
                          </div>

                          <div className="flex justify-end pt-2">
                            <Button 
                              type="submit" 
                              size="sm" 
                              disabled={isProcessing}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                            >
                              {t("projects.kickoff.approveKickoff") || "Approve Kickoff"}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}

              {/* Template Render Logic */}
              
              {/* Template: installation_full / installation_fast */}
              {(project.workspaceTemplate === "installation_full" || project.workspaceTemplate === "installation_fast") && (
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3 border-b border-border">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-indigo-500" />
                      {t("projects:silos.title") || "Project Operational Silos"}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {t("projects:silos.desc") || "Manage systems, installation scopes, and resources."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      {silos.map((silo) => {
                        const isEditing = editingSilo === silo.id;
                        const name = t(`projects:silos.${silo.id}.name`) || silo.id.toUpperCase();
                        const desc = t(`projects:silos.${silo.id}.desc`) || "";

                        return (
                          <Card key={silo.id} className="border-border bg-secondary/10 relative overflow-hidden flex flex-col justify-between">
                            <div className="p-3.5 space-y-3">
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-bold text-xs text-foreground block">{name}</span>
                                <span className="shrink-0">
                                  <StatusBadge status={isEditing ? siloStatus : silo.status} type="project" />
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-relaxed">{desc}</p>
                              
                              {isEditing ? (
                                <div className="space-y-2 pt-2 border-t border-border text-[10px]">
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <div>
                                      <label className="block text-[9px] text-muted-foreground">Status</label>
                                      <Select 
                                        value={siloStatus} 
                                        onChange={(e) => setSiloStatus(e.target.value)}
                                        className="h-8 bg-background"
                                      >
                                        <option value="pending">Pending</option>
                                        <option value="ready">Ready</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="blocked">Blocked</option>
                                      </Select>
                                    </div>
                                    <div>
                                      <label className="block text-[9px] text-muted-foreground">Labor Count</label>
                                      <Input 
                                        type="number" 
                                        value={siloLabor} 
                                        onChange={(e) => setSiloLabor(Number(e.target.value))}
                                        className="h-8 bg-background"
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <div>
                                      <label className="block text-[9px] text-muted-foreground">Materials</label>
                                      <Input 
                                        type="number" 
                                        value={siloMaterials} 
                                        onChange={(e) => setSiloMaterials(Number(e.target.value))}
                                        className="h-8 bg-background"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] text-muted-foreground">Cost (SAR)</label>
                                      <Input 
                                        type="number" 
                                        value={siloCost} 
                                        onChange={(e) => setSiloCost(Number(e.target.value))}
                                        className="h-8 bg-background"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-y-2 gap-x-1 pt-2 border-t border-border text-[10px]">
                                  <div className="flex flex-col">
                                    <span className="text-muted-foreground">{t("projects:silos.labor") || "Labor"}</span>
                                    <span className="font-bold text-foreground">{silo.laborCount} Crew</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-muted-foreground">{t("projects:silos.materials") || "Materials"}</span>
                                    <span className="font-bold text-foreground">{silo.materialsCount} items</span>
                                  </div>
                                  <div className="flex flex-col col-span-2">
                                    <span className="text-muted-foreground">{t("projects:silos.cost") || "Estimated Cost"}</span>
                                    <span className="font-bold text-foreground">{silo.costSAR.toLocaleString()} SAR</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="p-2 bg-secondary/35 border-t border-border flex justify-between items-center text-[10px]">
                              {user.role === USER_ROLES.OPERATIONS_OFFICER && project.executionPhase === "active_execution" ? (
                                <div className="w-full flex justify-end">
                                  {(silo.status === "pending" || silo.status === "ready") && (
                                    <Button
                                      size="sm"
                                      className="h-7 text-[10px] px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                      onClick={() => handleStartSilo(silo.id)}
                                      disabled={isProcessing}
                                    >
                                      {t("projects.execution.startModule") || "Start"}
                                    </Button>
                                  )}
                                  {silo.status === "in_progress" && (
                                    <div className="flex gap-1.5 items-center w-full">
                                      <Input
                                        type="text"
                                        placeholder={t("projects.execution.completionNotes") || "Completion notes..."}
                                        id={`notes-${silo.id}`}
                                        className="h-7 text-[10px] bg-background flex-1"
                                      />
                                      <Button
                                        size="sm"
                                        className="h-7 text-[10px] px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                        onClick={() => {
                                          const inputEl = document.getElementById(`notes-${silo.id}`) as HTMLInputElement;
                                          handleCompleteSilo(silo.id, inputEl?.value || "");
                                        }}
                                        disabled={isProcessing}
                                      >
                                        {t("projects.execution.completeModule") || "Complete"}
                                      </Button>
                                    </div>
                                  )}
                                  {silo.status === "completed" && (
                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                      {t("projects.execution.completed") || "Completed"}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="w-full flex justify-between items-center text-[10px]">
                                  <span className="text-muted-foreground">
                                    {t("projects:silos.status") || "Status"}:
                                  </span>
                                  <span className="font-semibold text-foreground uppercase">
                                    {silo.status}
                                  </span>
                                </div>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Template: maintenance */}
              {project.workspaceTemplate === "maintenance" && (
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Activity className="h-4 w-4 text-indigo-500" />
                      {t("projects:maintenance.checks") || "Periodic Maintenance Service Log"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-3">
                    <div className="divide-y divide-border">
                      <div className="py-2.5 flex justify-between items-center">
                        <div>
                          <span className="font-bold block text-foreground">{t("projects:maintenance.visits.visit1.title")}</span>
                          <span className="text-[10px] text-muted-foreground">{t("projects:maintenance.visits.scheduledDate").replace("{{date}}", "2026-07-10")}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500">{t("projects:maintenance.status.scheduled")}</span>
                      </div>
                      <div className="py-2.5 flex justify-between items-center">
                        <div>
                          <span className="font-bold block text-foreground">{t("projects:maintenance.visits.visit2.title")}</span>
                          <span className="text-[10px] text-muted-foreground">{t("projects:maintenance.visits.scheduledDate").replace("{{date}}", "2026-08-15")}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500">{t("projects:maintenance.status.scheduled")}</span>
                      </div>
                      <div className="py-2.5 flex justify-between items-center">
                        <div>
                          <span className="font-bold block text-foreground">{t("projects:maintenance.visits.visit3.title")}</span>
                          <span className="text-[10px] text-muted-foreground">{t("projects:maintenance.visits.scheduledDate").replace("{{date}}", "2026-09-20")}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground">{t("projects:maintenance.status.pending")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Template: compliance_followup */}
              {project.workspaceTemplate === "compliance_followup" && (
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-indigo-500" />
                      {t("projects:compliance.checklist") || "Inspection Checklist & Compliance Evaluation"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-3">
                    <div className="divide-y divide-border">
                      <div className="py-2.5 flex justify-between items-center">
                        <div>
                          <span className="font-bold block text-foreground">{t("projects:compliance.items.exitRouteSignage.title")}</span>
                          <span className="text-[10px] text-muted-foreground">{t("projects:compliance.items.exitRouteSignage.desc")}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">{t("projects:compliance.status.pass")}</span>
                      </div>
                      <div className="py-2.5 flex justify-between items-center">
                        <div>
                          <span className="font-bold block text-foreground">{t("projects:compliance.items.extinguisherPressure.title")}</span>
                          <span className="text-[10px] text-muted-foreground">{t("projects:compliance.items.extinguisherPressure.desc")}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500">{t("projects:compliance.status.awaiting")}</span>
                      </div>
                      <div className="py-2.5 flex justify-between items-center">
                        <div>
                          <span className="font-bold block text-foreground">{t("projects:compliance.items.emergencyLightingBattery.title")}</span>
                          <span className="text-[10px] text-muted-foreground">{t("projects:compliance.items.emergencyLightingBattery.desc")}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground">{t("projects:compliance.status.pending")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Execution Completion / Readiness - Operations Only */}
              {project.executionPhase === "active_execution" && (
                <Card className="border-indigo-500/35 bg-card">
                  <CardHeader className="pb-3 border-b border-border">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-indigo-500" />
                      {t("projects:completion.title")}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {t("projects:completion.desc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-muted-foreground block">
                        {t("projects:completion.notesLabel")}
                      </label>
                      <Textarea
                        rows={3}
                        value={completionNotes}
                        onChange={(e) => setCompletionNotes(e.target.value)}
                        placeholder={t("projects:completion.notesPlaceholder")}
                        className="bg-secondary/50 min-h-[80px] text-xs font-sans"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between gap-4 pt-2 flex-wrap">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={readyForFinalInspection}
                          onChange={(e) => setReadyForFinalInspection(e.target.checked)}
                          className="focus:ring-indigo-500 h-4 w-4"
                        />
                        <span className="font-semibold text-foreground">
                          {t("projects:completion.readyCheckbox")}
                        </span>
                      </label>
                      <Button
                        onClick={handleCompleteExecution}
                        disabled={isProcessing || !completionNotes.trim() || !readyForFinalInspection}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                      >
                        {isProcessing ? t("projects:completion.submitting") : t("projects:completion.submitBtn")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
                </>
              )}

              {/* Consolidated Operations (Procurement & Labor) Snapshots */}
              <div className="grid gap-6 md:grid-cols-2">
                
                {/* Procurement Summary Card */}
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t("projects:procurement.title") || "Procurement & Materials"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">{t("projects:procurement.totalCost") || "Est. Materials Cost"}</span>
                      <span className="font-bold text-foreground">{totalMaterialsCost.toLocaleString()} SAR</span>
                    </div>
                    {totalMaterialsCount > 0 ? (
                      <>
                        <div className="flex justify-between py-1 border-b border-border">
                          <span className="text-muted-foreground">{t("projects:procurement.invoices") || "Procurement Invoices"}</span>
                          <span className="font-semibold text-foreground">{t("requests:details.invoicesCount").replace("{{count}}", "1")}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">{t("projects:procurement.pending") || "Pending Items"}</span>
                          <span className="font-semibold text-foreground">{t("requests:details.itemsCount").replace("{{count}}", String(totalMaterialsCount))}</span>
                        </div>
                      </>
                    ) : (
                      <div className="pt-2 text-muted-foreground text-[10px] italic">
                        <p>{t("projects:procurement.noInvoices") || "No procurement invoices logged yet."}</p>
                        <p className="mt-1">{t("projects:procurement.noMaterials") || "No materials logged yet."}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Labor Snapshot Card */}
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t("projects:labor.title") || "Field Workforce"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2">
                    {totalLabor > 0 ? (
                      <>
                        <div className="flex justify-between py-1 border-b border-border">
                          <span className="text-muted-foreground">{t("projects:labor.crewSize") || "On-Site Technicians"}</span>
                          <span className="font-bold text-foreground">{t("requests:details.techsCount").replace("{{count}}", String(totalLabor))}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-border">
                          <span className="text-muted-foreground">{t("projects:labor.fieldStatus") || "Execution Status"}</span>
                          <span className="font-semibold text-foreground capitalize">{t(`projects:status.${project.status}`) || project.status}</span>
                        </div>
                      </>
                    ) : (
                      <div className="pt-1 text-muted-foreground text-[10px] italic pb-2">
                        {t("projects:labor.noStaff") || "No field technician staff allocated to this site yet."}
                      </div>
                    )}
                    <div className="flex flex-col py-1">
                      <span className="text-muted-foreground block mb-1">{t("projects:labor.fieldNotes") || "Daily Operations Log"}</span>
                      <p className="p-2 bg-secondary/25 border border-border rounded text-[10px] text-muted-foreground italic">
                        {project.workspace?.kickoff?.notes || t("requests:details.noNotes")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Obstacles & Photos Placeholder section */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t("projects:obstacles.title") || "Obstacles & Documentation"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs grid gap-4 sm:grid-cols-2">
                  <div className="p-3 border border-dashed border-border bg-secondary/5 rounded-lg text-center space-y-2">
                    <AlertTriangle className="h-5 w-5 mx-auto text-amber-500" />
                    <span className="font-bold text-foreground block">{t("projects:obstacles.log") || "Obstacles Log"}</span>
                    <p className="text-[10px] text-muted-foreground">
                      {t("projects:obstacles.noObstacles") || "No obstacles registered."}
                    </p>
                  </div>

                  <div className="p-3 border border-dashed border-border bg-secondary/5 rounded-lg text-center space-y-2">
                    <Camera className="h-5 w-5 mx-auto text-indigo-500" />
                    <span className="font-bold text-foreground block">{t("projects:obstacles.photos") || "Site Photos"}</span>
                    <p className="text-[10px] text-muted-foreground">
                      {t("projects:obstacles.noPhotos") || "No verification photos uploaded."}
                    </p>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Right Sidebar Column */}
            <div className="space-y-6">
              {request && <LinkedRequestSnapshotCard request={request} t={t} />}

              {/* Operational action card */}
              {user.role === USER_ROLES.OPERATIONS_OFFICER && (
                <Card className="border-indigo-500/20 bg-indigo-500/5 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {t("projects:actions.opsCard") || "Operations Actions"}
                    </CardTitle>
                    <CardDescription className="text-[10px] text-muted-foreground leading-normal">
                      {t("projects:actions.opsDesc") || "Transition this project to active field execution."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    {project.executionPhase === "created" && (
                      <div className="text-xs text-muted-foreground py-2 text-center font-semibold">
                        {t("projects.kickoff.awaitingApproval") || "Awaiting Kickoff Approval"}
                      </div>
                    )}
                    {project.executionPhase === "kickoff_ready" && (
                      <Button
                        onClick={handleStartExecution}
                        disabled={isProcessing}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 h-9"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {isProcessing 
                          ? (t("projects:actions.activating") || "Activating...") 
                          : (t("projects.kickoff.startExecution") || "Start Execution")
                        }
                      </Button>
                    )}
                    {project.executionPhase === "active_execution" && (
                      <div className="p-2 border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 rounded font-semibold text-center text-xs flex items-center justify-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        {t("projects.kickoff.executionStarted") || "Execution Started"}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


