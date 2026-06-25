"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
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
import { getRequestTypeDisplayName, getClassificationDisplayName } from "@/domains/requests/workflow";
import { 
  startProjectExecution,
  updateProjectKickoffDetails,
  updateProjectSiloStatus,
  transitionProjectPhase
} from "@/domains/projects/workflow";
import { createDefaultWorkspace } from "@/domains/projects/storage";

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

  const [isProcessing, setIsProcessing] = useState(false);

  const projectId = params?.projectId as string;

  const loadData = () => {
    if (projectId) {
      const list = getProjects();
      const foundProject = list.find((p) => p.id === projectId);
      if (foundProject) {
        // Enforce default workspace if not present
        if (!foundProject.workspace) {
          foundProject.workspace = createDefaultWorkspace();
        }
        if (!foundProject.executionPhase) {
          foundProject.executionPhase = foundProject.status === "active" ? "active_execution" : "created";
        }
        setProject(foundProject);

        // Populate kickoff form
        setInspector(foundProject.workspace.assignedInspector || "");
        setNotes(foundProject.workspace.kickoffNotes || "");
        setIsApproved(foundProject.workspace.kickoffApproved || false);

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

  const handleSaveKickoff = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const updated = updateProjectKickoffDetails({
        project,
        assignedInspector: inspector,
        kickoffNotes: notes,
        kickoffApproved: isApproved,
      });
      setProject(updated);
      alert(t("projects:kickoff.savedSuccess") || "Kickoff settings saved!");
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartProject = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const { updatedProject, updatedRequest } = startProjectExecution({ project, request });
      setProject(updatedProject);
      if (updatedRequest) {
        setRequest(updatedRequest);
      }
      alert("Project execution started and request transitioned to field execution!");
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

  const isClient = user.role === "Client";
  const isOperationalRole = user.role === "Operations Officer" || user.role === "Consulting Engineer";

  // Calculate totals from silos
  const silos = project.workspace?.silos || [];
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
        <div className="flex items-center gap-2">
          <StatusBadge status={project.status} type="project" />
        </div>
      </div>

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
                    disabled={!isOperationalRole}
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

      {/* Section Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left/Middle Column - Operational Workspace (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Kickoff Section */}
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
              <form onSubmit={handleSaveKickoff} className="space-y-4 text-xs">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">{t("projects:kickoff.inspector") || "Assigned Inspector"}</label>
                    <input
                      type="text"
                      disabled={!isOperationalRole}
                      value={inspector}
                      onChange={(e) => setInspector(e.target.value)}
                      placeholder="e.g. Eng. Ahmad Salem"
                      className="w-full bg-secondary/50 border border-border rounded p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">{t("projects:kickoff.downPayment") || "Down Payment"}</label>
                    <div className="p-2 border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 rounded font-semibold flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      100% {t("projects:kickoff.approved") || "Confirmed (Invoice Paid)"}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">{t("projects:kickoff.notes") || "Kickoff Directions & Notes"}</label>
                  <textarea
                    disabled={!isOperationalRole}
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide execution guidelines, hazard warnings, or initial setup notes..."
                    className="w-full bg-secondary/50 border border-border rounded p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {isOperationalRole && (
                  <div className="flex items-center justify-between gap-4 pt-2 flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isApproved}
                        onChange={(e) => setIsApproved(e.target.checked)}
                        className="rounded border-border text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span className="font-semibold text-foreground">
                        {t("projects:kickoff.approved") || "Approve project kickoff"}
                      </span>
                    </label>
                    <Button 
                      type="submit" 
                      size="sm" 
                      disabled={isProcessing}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                    >
                      {t("projects:kickoff.save") || "Save Settings"}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Project Silos section */}
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
                                <select 
                                  value={siloStatus} 
                                  onChange={(e) => setSiloStatus(e.target.value)}
                                  className="w-full bg-background border border-border rounded p-1 text-foreground"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="ready">Ready</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                  <option value="blocked">Blocked</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[9px] text-muted-foreground">Labor Count</label>
                                <input 
                                  type="number" 
                                  value={siloLabor} 
                                  onChange={(e) => setSiloLabor(Number(e.target.value))}
                                  className="w-full bg-background border border-border rounded p-1 text-foreground"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              <div>
                                <label className="block text-[9px] text-muted-foreground">Materials</label>
                                <input 
                                  type="number" 
                                  value={siloMaterials} 
                                  onChange={(e) => setSiloMaterials(Number(e.target.value))}
                                  className="w-full bg-background border border-border rounded p-1 text-foreground"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-muted-foreground">Cost (SAR)</label>
                                <input 
                                  type="number" 
                                  value={siloCost} 
                                  onChange={(e) => setSiloCost(Number(e.target.value))}
                                  className="w-full bg-background border border-border rounded p-1 text-foreground"
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

                      {isOperationalRole && (
                        <div className="p-2 bg-secondary/35 border-t border-border flex justify-end">
                          {isEditing ? (
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 text-[9px] px-2"
                                onClick={() => setEditingSilo(null)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                size="sm" 
                                className="h-6 text-[9px] px-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                onClick={() => handleSaveSilo(silo.id)}
                              >
                                Save
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-6 text-[9px] px-2"
                              onClick={() => startEditingSilo(silo)}
                            >
                              Edit Silo
                            </Button>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Consolidated Operations (Procurement & Labor) Snapshots */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Procurement Summary Card */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("projects:procurement.title") || "Procurement & Materials Management"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">{t("projects:procurement.totalCost") || "Est. Materials Cost"}</span>
                  <span className="font-bold text-foreground">{totalMaterialsCost.toLocaleString()} SAR</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">{t("projects:procurement.invoices") || "Linked Material Invoices"}</span>
                  <span className="font-semibold text-foreground">1 Invoice</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">{t("projects:procurement.pending") || "Pending Items"}</span>
                  <span className="font-semibold text-foreground">{totalMaterialsCount} items</span>
                </div>
              </CardContent>
            </Card>

            {/* Labor Snapshot Card */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("projects:labor.title") || "Field Workforce & Hours"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">{t("projects:labor.crewSize") || "On-Site Technicians"}</span>
                  <span className="font-bold text-foreground">{totalLabor} Techs</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">{t("projects:labor.fieldStatus") || "Field execution status"}</span>
                  <span className="font-semibold text-foreground capitalize">{project.status}</span>
                </div>
                <div className="flex flex-col py-1">
                  <span className="text-muted-foreground block mb-1">{t("projects:labor.fieldNotes") || "Daily Operations Log"}</span>
                  <p className="p-2 bg-secondary/25 border border-border rounded text-[10px] text-muted-foreground italic">
                    {project.workspace?.kickoffNotes || "No notes logged."}
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

        {/* Right Sidebar Column - Linked Request Details & Operational Actions (1 col) */}
        <div className="space-y-6">
          
          {/* Linked request snapshot */}
          {request && (
            <Card className="border-border bg-card">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <LinkIcon className="h-4 w-4 text-indigo-500" />
                  {t("projects:details.linkedRequest") || "Linked Safety Request"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-3 pt-3"> 
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block uppercase">Request ID</span>
                  <span className="font-mono font-bold text-foreground">{request.jobNumber}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block uppercase">{t("projects:details.requestType") || "Request Type"}</span>
                  <span className="font-semibold text-foreground">{getRequestTypeDisplayName(request.requestType, t)}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block uppercase">{t("projects:details.classification") || "Classification"}</span>
                  <span className="font-semibold text-foreground">{getClassificationDisplayName(request.classification, t)}</span>
                </div>
                <div className="pt-2 border-t border-border">
                  <Link href={`/requests/${request.jobNumber}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8 font-bold">
                      {t("projects:details.viewRequest") || "View Original Request"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Operational action card */}
          {isOperationalRole && project.status === "planning" && (
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
                <Button
                  onClick={handleStartProject}
                  disabled={isProcessing || !project.workspace?.kickoffApproved}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 h-9"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isProcessing 
                    ? (t("projects:actions.activating") || "Activating...") 
                    : !project.workspace?.kickoffApproved
                    ? "Awaiting Kickoff Approval"
                    : (t("projects:actions.startProject") || "Start Project")
                  }
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Client-facing information */}
          {isClient && (
            <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-700 dark:text-indigo-400 text-xs flex gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Project Stage Details</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                  Your safety licensing project is monitored by engineering and operational divisions. Check updates on individual operational silos.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

