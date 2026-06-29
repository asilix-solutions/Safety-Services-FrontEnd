import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useParams } from "next/navigation";
import { useTranslation } from "@/providers/i18n-provider";
import { Project, ProjectExecutionPhase, SiloExecutionData } from "@/types/project";
import { getProjects } from "@/domains/projects/storage";
import { LicensingRequest } from "@/domains/requests/types";
import { getMergedRequests } from "@/domains/requests/storage";
import { getContracts } from "@/domains/contracts/storage";
import { getCertificateByProjectId } from "@/domains/certificates/storage";
import { 
  approveKickoff,
  startExecution,
  updateProjectSiloStatus,
  transitionProjectPhase,
  completeProjectExecution,
  startExecutionSilo,
  completeExecutionSilo
} from "@/domains/projects/workflow";
import { createDefaultWorkspace } from "@/domains/projects/storage";
import { prepareProjectWorkspaceViewModel, ProjectWorkspaceViewModel } from "../view-models/project-workspace.viewmodel";
import { ClientContract } from "@/domains/contracts/types";
import { ClientCertificate } from "@/domains/certificates/types";

export function useProjectWorkspace() {
  const { user } = useAuth();
  const params = useParams();
  const { t } = useTranslation();

  const [project, setProject] = useState<Project | null>(null);
  const [request, setRequest] = useState<LicensingRequest | null>(null);
  
  // Kickoff form states
  const [inspector, setInspector] = useState("");
  const [notes, setNotes] = useState("");
  const [isApproved, setIsApproved] = useState(false);

  // Silo custom editing state
  const [editingSilo, setEditingSilo] = useState<string | null>(null);
  const [siloStatus, setSiloStatus] = useState<SiloExecutionData["status"]>("pending");
  const [siloLabor, setSiloLabor] = useState<number>(0);
  const [siloMaterials, setSiloMaterials] = useState<number>(0);
  const [siloCost, setSiloCost] = useState<number>(0);

  // Completion form states
  const [completionNotes, setCompletionNotes] = useState("");
  const [readyForFinalInspection, setReadyForFinalInspection] = useState(false);

  // Tab and Document states
  const [activeTab, setActiveTab] = useState<"overview" | "execution" | "obstacles" | "documents">("overview");
  const [contract, setContract] = useState<ClientContract | null>(null);
  const [certificate, setCertificate] = useState<ClientCertificate | null>(null);


  const [isProcessing, setIsProcessing] = useState(false);

  const projectId = params?.projectId as string;

  const loadData = () => {
    if (projectId) {
      const list = getProjects();
      const foundProject = list.find((p) => p.id === projectId);
      if (foundProject) {
        if (!foundProject.workspace) {
          foundProject.workspace = createDefaultWorkspace();
        }
        
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

        setInspector(foundProject.workspace.kickoff.assignedInspector || "");
        setNotes(foundProject.workspace.kickoff.notes || "");
        setIsApproved(foundProject.workspace.kickoff.approved || false);

        setCompletionNotes(foundProject.workspace.completion.notes || "");
        setReadyForFinalInspection(foundProject.workspace.completion.readyForFinalInspection || false);

        const mergedRequests = getMergedRequests();
        const foundRequest = mergedRequests.find((r) => r.jobNumber === foundProject.jobNumber);
        if (foundRequest) {
          setRequest(foundRequest);
        }

        try {
          const allContracts = getContracts();
          const linkedContract = allContracts.find((c) => c.projectId === foundProject.id);
          setContract(linkedContract || null);
        } catch (e) {
          console.error("Failed to load contract:", e);
        }

        try {
          const linkedCert = getCertificateByProjectId(foundProject.id);
          setCertificate(linkedCert || null);
        } catch (e) {
          console.error("Failed to load certificate:", e);
        }
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleApproveKickoff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
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
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to approve kickoff.";
      alert(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartExecution = () => {
    if (!project || isProcessing) return;
    setIsProcessing(true);
    try {
      const updated = startExecution({
        project,
        startedBy: user?.name || user?.role || "Operations Officer",
      });
      setProject(updated);
      alert(t("projects:details.alertExecutionStarted") || "Execution started successfully!");
      loadData();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to start execution.";
      alert(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartSilo = (siloId: "alarm" | "suppression" | "ventilation") => {
    if (!project || isProcessing) return;
    setIsProcessing(true);
    try {
      const updated = startExecutionSilo({
        project,
        siloId,
        startedBy: user?.name || user?.role || "Operations Officer",
      });
      setProject(updated);
      alert(t("projects:execution.moduleStarted") || "Silo execution started!");
      loadData();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to start silo execution.";
      alert(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteSilo = (siloId: "alarm" | "suppression" | "ventilation", notes: string) => {
    if (!project || isProcessing) return;
    setIsProcessing(true);
    try {
      const updated = completeExecutionSilo({
        project,
        siloId,
        completedBy: user?.name || user?.role || "Operations Officer",
        notes,
      });
      setProject(updated);
      alert(t("projects:execution.moduleCompleted") || "Silo execution completed!");
      loadData();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to complete silo execution.";
      alert(message);
    } finally {
      setIsProcessing(false);
    }
  };



  const handleCompleteExecution = () => {
    if (!project || isProcessing || !completionNotes.trim() || !readyForFinalInspection) return;
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
    if (!project) return;
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
    if (!project) return;
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

  const viewModel = project 
    ? prepareProjectWorkspaceViewModel(project, request, contract, certificate, user?.role || "")
    : null;

  return {
    user,
    projectId,
    project,
    setProject,
    request,
    setRequest,
    inspector,
    setInspector,
    notes,
    setNotes,
    isApproved,
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
    contract,
    certificate,
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
  };
}
