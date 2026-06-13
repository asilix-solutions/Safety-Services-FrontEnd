"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { MOCK_REQUESTS } from "@/mock/requests";
import { LicensingRequest, RequestType, WorkflowStage } from "@/domains/requests/types";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { MapPin, ShieldAlert, ArrowLeft, CheckCircle2, Clock, Eye, Download, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "@/providers/i18n-provider";
import {
  WORKFLOW_STAGES,
  getQueueDisplayName,
  getClassificationDisplayName,
  getClassificationReason,
  mapStatusToStage
} from "@/domains/requests/workflow";

export default function RequestDetailsPage() {
  const { user } = useAuth();
  const params = useParams();
  const { t } = useTranslation();
  const [request, setRequest] = useState<LicensingRequest | null>(null);

  const jobNumber = params?.jobNumber as string;

  useEffect(() => {
    if (jobNumber) {
      let localList: LicensingRequest[] = [];
      try {
        const local = localStorage.getItem("SSLM_CLIENT_REQUESTS");
        if (local) {
          localList = JSON.parse(local);
        }
      } catch (err) {
        console.error("Failed to read requests", err);
      }

      // Map dynamic fallback for safety / type-safety on initial state sync
      const merged = [...localList, ...MOCK_REQUESTS].map((r) => ({
        ...r,
        currentStage: r.currentStage || mapStatusToStage(r.status),
        assignedQueue: r.assignedQueue || (r.classification === "high_hazard_review" ? "HIGH_HAZARD" : r.classification === "engineering_project" ? "ENGINEERING" : r.classification === "maintenance_strategy" ? "MAINTENANCE" : "FAST_TRACK")
      }));
      
      const found = merged.find((r) => r.jobNumber === jobNumber);
      if (found) {
        setRequest(found);
      }
    }
  }, [jobNumber]);

  if (!user) return null;

  if (!request) {
    return (
      <div className="p-6 text-center text-muted-foreground space-y-4">
        <p>Request with reference {jobNumber} not found.</p>
        <Link href="/requests">
          <Button variant="outline" size="sm">Back to Requests</Button>
        </Link>
      </div>
    );
  }

  const getRequestTypeLabel = (type: RequestType) => {
    const map: Record<RequestType, string> = {
      new_license: "New Safety License",
      maintenance_contract: "Maintenance Contract",
      engineering_blueprint: "Blueprint Review",
      technical_report: "Technical Safety Report",
    };
    return map[type] || type;
  };

  const getNextStepInstructions = (stage: WorkflowStage) => {
    switch (stage) {
      case "DRAFT":
        return "Please complete the wizard and submit the safety request to begin the compliance process.";
      case "SUBMITTED":
        return "Waiting for compliance coordinator check and engineer queue assignment.";
      case "UNDER_REVIEW":
        return "The compliance engineer is auditing the safety blueprints and planning materials.";
      case "QUOTATION":
        return "A quotation is prepared. Client payment verification is required to authorize the inspection.";
      case "PAYMENT_CONFIRMED":
        return "Payment confirmed successfully. The operations manager is initializing workflow tickets.";
      case "PROJECT_CREATED":
        return "Official compliance project initialized. Preparing safety inspector field credentials.";
      case "FIELD_EXECUTION":
        return "On-site safety systems installation and engineering testing in progress.";
      case "FINAL_INSPECTION":
        return "On-site final regulatory safety audit inspection scheduled.";
      case "COMPLETED":
        return "All safety regulations verified. Official compliance certificate issued.";
      default:
        return "In progress.";
    }
  };

  const isReplaceAllowed = (stage: WorkflowStage) => {
    if (stage === "DRAFT") return "ALLOWED";
    if (stage === "SUBMITTED") return "CONFIRM_REQUIRED";
    return "READ_ONLY";
  };

  const handleReplaceFile = (docIndex: number) => {
    const rule = isReplaceAllowed(request.currentStage);
    if (rule === "READ_ONLY") {
      alert("This request is currently under review. Uploaded files are locked and read-only to preserve compliance records.");
      return;
    }
    if (rule === "CONFIRM_REQUIRED") {
      const ok = window.confirm("Warning: This request has already been submitted for evaluation. Replacing documents may reset your review position. Do you want to proceed?");
      if (!ok) return;
    }
    
    const newFileName = prompt("Enter name of document file to replace:", request.documents[docIndex].fileName || "document.pdf");
    if (newFileName) {
      const updatedDocs = [...request.documents];
      updatedDocs[docIndex] = { ...updatedDocs[docIndex], uploaded: true, fileName: newFileName };
      const updatedRequest = { ...request, documents: updatedDocs };
      setRequest(updatedRequest);
      
      // Update in localStorage
      try {
        const local = localStorage.getItem("SSLM_CLIENT_REQUESTS");
        if (local) {
          const list: LicensingRequest[] = JSON.parse(local);
          const idx = list.findIndex(r => r.jobNumber === request.jobNumber);
          if (idx !== -1) {
            list[idx] = updatedRequest;
            localStorage.setItem("SSLM_CLIENT_REQUESTS", JSON.stringify(list));
          }
        }
      } catch(e) {
        console.error("Failed to sync file replacement to localStorage", e);
      }
      alert("File replaced successfully!");
    }
  };

  const currentStageIndex = WORKFLOW_STAGES.indexOf(request.currentStage);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/requests">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </Link>
        <PageHeader
          title={`${t("dashboard:request_details_title")}: ${request.jobNumber}`}
          description={t("dashboard:track_progress_desc")}
        />
      </div>

      {/* Next Action Card */}
      <Card className="border-indigo-500/20 bg-indigo-500/5 shadow-sm">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="p-2 bg-indigo-600/10 rounded-lg text-indigo-600">
            <Clock className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-xs text-foreground uppercase tracking-wide">Next Step / Action Required</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {getNextStepInstructions(request.currentStage)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Detail Specifications */}
        <div className="md:col-span-2 space-y-4">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-foreground">{t("dashboard:facility_location_metadata")}</CardTitle>
                <CardDescription className="text-muted-foreground">{t("dashboard:verified_municipal_desc")}</CardDescription>
              </div>
              <Badge variant="warning" className="capitalize">
                {request.status.replace("_", " ")}
              </Badge>
            </CardHeader>
            <CardContent className="divide-y divide-border text-xs space-y-1">
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">{t("dashboard:facility_name")}</span>
                <span className="col-span-2 font-semibold text-foreground">{request.facilityName}</span>
              </div>
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">{t("dashboard:commercial_cr")}</span>
                <span className="col-span-2 font-mono font-semibold text-foreground">{request.crNumber}</span>
              </div>
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">{t("dashboard:safety_activity_isic")}</span>
                <span className="col-span-2 font-semibold text-foreground">
                  {request.activityName} ({request.isicCode})
                </span>
              </div>
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">{t("dashboard:facility_area")}</span>
                <span className="col-span-2 font-semibold text-foreground">{request.area} m²</span>
              </div>
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Classification</span>
                <span className="col-span-2 font-semibold text-foreground">
                  {getClassificationDisplayName(request.classification, t)}
                </span>
              </div>
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Classification Reason</span>
                <span className="col-span-2 font-semibold text-foreground leading-relaxed">
                  {getClassificationReason(request, t)}
                </span>
              </div>
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Assigned Department</span>
                <span className="col-span-2 font-semibold text-foreground">
                  {getQueueDisplayName(request.assignedQueue, t)}
                </span>
              </div>
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">{t("dashboard:location_address")}</span>
                <span className="col-span-2 font-semibold text-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {request.city}, {request.district} - {request.addressDescription}
                </span>
              </div>
              <div className="py-2.5 grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">{t("dashboard:contact_representative")}</span>
                <span className="col-span-2 font-semibold text-foreground">
                  {request.contactName} ({request.contactPhone})
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Documents checklist */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground">{t("dashboard:uploaded_compliance_files")}</CardTitle>
              <CardDescription className="text-muted-foreground">{t("dashboard:submitted_certificates_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              {request.documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-border bg-secondary/15 rounded-lg">
                  <div>
                    <span className="font-semibold block text-foreground">{doc.name}</span>
                    <span className="text-[10px] text-muted-foreground">Formats: {doc.type.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.uploaded ? (
                      <div className="text-end mr-2">
                        <span className="text-emerald-500 font-bold block text-[10px]">✓ {t("dashboard:uploaded_label")}</span>
                        <span className="text-[9px] text-muted-foreground font-mono truncate max-w-[120px] block">
                          {doc.fileName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-amber-500 font-medium mr-2">{t("dashboard:pending_document")}</span>
                    )}

                    <div className="flex gap-1 shrink-0">
                      {doc.uploaded && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => alert(`Simulated View file: ${doc.fileName}`)}
                            title="View"
                          >
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => alert(`Simulated Download file: ${doc.fileName}`)}
                            title="Download"
                          >
                            <Download className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={isReplaceAllowed(request.currentStage) === "READ_ONLY"}
                        onClick={() => handleReplaceFile(idx)}
                        title="Replace"
                      >
                        <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right side tracking timeline */}
        <div className="space-y-4">
          {/* Workflow Stepper Timeline */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground">Workflow Stage Timeline</CardTitle>
              <CardDescription className="text-muted-foreground">Official lifecycle progress tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {WORKFLOW_STAGES.map((stage, idx) => {
                  const isCompleted = idx < currentStageIndex;
                  const isActive = idx === currentStageIndex;
                  
                  return (
                    <div key={stage} className="flex items-center gap-3 text-xs">
                      <div className="shrink-0">
                        {isCompleted ? (
                          <div className="h-5 w-5 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-[10px]">
                            ✓
                          </div>
                        ) : isActive ? (
                          <div className="h-5 w-5 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-[10px] animate-pulse">
                            ●
                          </div>
                        ) : (
                          <div className="h-5 w-5 bg-secondary border border-border text-muted-foreground rounded-full flex items-center justify-center font-bold text-[10px]">
                            ○
                          </div>
                        )}
                      </div>
                      <span className={`font-semibold ${isActive ? "text-indigo-600 dark:text-indigo-400 font-bold" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                        {stage.replace("_", " ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Activity History Timeline */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground">{t("dashboard:workflow_tracking")}</CardTitle>
              <CardDescription className="text-muted-foreground">{t("dashboard:safety_evaluation_timeline_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative border-s border-border ps-4 ms-2 space-y-6">
                {request.timeline.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -start-[21px] mt-1 h-2.5 w-2.5 rounded-full bg-indigo-600 ring-4 ring-background" />
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground capitalize">{event.status.replace("_", " ")}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{event.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* V2 Expand message */}
          <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-700 dark:text-indigo-400 text-xs flex gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-foreground">{t("dashboard:mvp_placeholder_node")}</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                {t("dashboard:mvp_placeholder_desc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
