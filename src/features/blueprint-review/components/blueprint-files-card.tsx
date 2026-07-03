import React from "react";
import { useTranslation } from "@/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  FileText,
  AlertTriangle,
  FileCode,
  FileSpreadsheet,
  FileImage,
  Layers,
  ShieldCheck,
  Calendar,
  User,
  Download,
  ExternalLink
} from "lucide-react";
import { BlueprintReviewViewModel } from "../helpers/blueprint-review-view-model";

interface BlueprintFilesCardProps {
  request: BlueprintReviewViewModel;
}

export function BlueprintFilesCard({ request }: BlueprintFilesCardProps) {
  const { t } = useTranslation();

  const getFileCategory = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("blueprint") || lowerName.includes("drawings")) return "Blueprint";
    if (lowerName.includes("permit")) return "Building Permit";
    if (lowerName.includes("registration") || lowerName.includes("cr")) return "Commercial Registration";
    if (lowerName.includes("lease") || lowerName.includes("agreement")) return "Lease Contract";
    if (lowerName.includes("alarm") || lowerName.includes("photos")) return "Inspection Photos";
    return "Supporting Document";
  };

  const getFileIcon = (fileName?: string, name?: string) => {
    const ext = fileName?.toLowerCase().split(".").pop();
    const cat = getFileCategory(name || "");

    if (ext === "dwg" || ext === "dxf") {
      return <FileCode className="h-5 w-5 text-indigo-500" />;
    }
    if (ext === "png" || ext === "jpg" || ext === "jpeg") {
      return <FileImage className="h-5 w-5 text-emerald-500" />;
    }
    if (cat === "Building Permit") {
      return <Layers className="h-5 w-5 text-cyan-500" />;
    }
    if (cat === "Lease Contract" || cat === "Commercial Registration") {
      return <FileText className="h-5 w-5 text-amber-500" />;
    }
    return <FileText className="h-5 w-5 text-primary" />;
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-foreground">
          {t("requests:blueprintReview.files.title")}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Uploaded compliance files and technical attachments (scrollable)
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 max-h-[350px] overflow-y-auto space-y-3 ps-4 pe-2">
        {request.documents.length > 0 ? (
          <div className="space-y-3 font-sans text-xs">
            {request.documents.map((doc, idx) => (
              <div
                key={idx}
                className={`p-3 border rounded-xl space-y-2.5 transition-colors ${
                  doc.uploaded ? "bg-secondary/15 border-border" : "bg-rose-500/5 border-rose-500/10"
                }`}
              >
                {/* File Title Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {getFileIcon(doc.fileName, doc.name)}
                    </div>
                    <div>
                      <span className="font-bold text-foreground block truncate max-w-[170px]" title={doc.fileName || doc.name}>
                        {doc.fileName || doc.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground block font-medium">
                        {doc.name}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={doc.uploaded ? "secondary" : "destructive"}
                    className={`text-[9px] font-semibold border-none ${
                      doc.uploaded ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : ""
                    }`}
                  >
                    {doc.uploaded ? t("dashboard:uploaded_label") : t("requests:wizard.uploads.pending")}
                  </Badge>
                </div>

                {/* File Metadata Details Grid */}
                {doc.uploaded && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 p-2 bg-background/50 rounded-lg border border-border/40 text-[9px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Layers className="h-3 w-3 shrink-0" />
                      <span>Category: <strong className="text-foreground">{getFileCategory(doc.name)}</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 shrink-0" />
                      <span>Security: <strong className="text-foreground">Cleared</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>Date: <strong className="text-foreground">{new Date(request.createdAt).toLocaleDateString()}</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 shrink-0" />
                      <span>Uploaded by: <strong className="text-foreground">Client</strong></span>
                    </div>
                  </div>
                )}

                {/* Action Row */}
                {doc.uploaded && (
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[10px] px-2.5 text-muted-foreground flex items-center gap-1 border-border bg-card"
                      onClick={() => alert(`${t("requests:details.simulatedView").replace("{{fileName}}", doc.fileName || "")}`)}
                    >
                      <ExternalLink className="h-3 w-3" />
                      {t("common:view")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[10px] px-2.5 text-muted-foreground flex items-center gap-1 border-border bg-card"
                      onClick={() => alert(`${t("requests:details.simulatedDownload").replace("{{fileName}}", doc.fileName || "")}`)}
                    >
                      <Download className="h-3 w-3" />
                      {t("requests:engineeringWorkspace.download")}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            {t("requests:blueprintReview.files.missingWarning")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
