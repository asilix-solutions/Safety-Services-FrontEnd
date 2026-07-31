import React, { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  FileText,
  FileCode,
  ImageIcon,
  ExternalLink,
  Download,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { BlueprintReviewViewModel } from "../helpers/blueprint-review-view-model";

interface BlueprintViewerProps {
  request: BlueprintReviewViewModel;
}

export function BlueprintViewer({ request }: BlueprintViewerProps) {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);

  // Find primary blueprint document
  const primaryDoc = request.documents.find((doc) => {
    if (!doc.uploaded || !doc.fileName) return false;
    const lower = doc.fileName.toLowerCase();
    return [".pdf", ".dwg", ".dxf", ".png", ".jpg", ".jpeg"].some((ext) => lower.endsWith(ext));
  });

  const getFileInfo = (fileName?: string) => {
    if (!fileName) return { ext: "", isCad: false, isImg: false, isPdf: false };
    const lower = fileName.toLowerCase();
    const ext = lower.substring(lower.lastIndexOf("."));
    return {
      ext,
      isCad: ext === ".dwg" || ext === ".dxf",
      isImg: ext === ".png" || ext === ".jpg" || ext === ".jpeg",
      isPdf: ext === ".pdf",
    };
  };

  const fileInfo = getFileInfo(primaryDoc?.fileName);

  return (
    <Card className="border-border bg-card h-full flex flex-col justify-between overflow-hidden shadow-sm">
      <CardHeader className="pb-2 border-b border-border bg-secondary/5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              {t("requests:engineeringWorkspace.blueprintPreview")}
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground truncate max-w-[300px]">
              {primaryDoc ? primaryDoc.fileName : t("requests:engineeringWorkspace.noBlueprint")}
            </CardDescription>
          </div>
          {primaryDoc && (
            <div className="flex items-center gap-1.5 self-end sm:self-auto font-mono text-[10px] text-muted-foreground">
              <span>{t("requests:blueprintReview.viewer.category")}:</span>
              <Badge variant="outline" className="text-[9px] py-0 px-1 text-foreground bg-background">
                {t("requests:blueprintReview.viewer.blueprints")}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between pt-3 space-y-3 bg-secondary/5">
        {primaryDoc ? (
          <div className="space-y-3 flex-1 flex flex-col justify-between">
            {/* Professional Workstation Document Toolbar */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-background border border-border shadow-xs">
              {/* Page Controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="text-[10px] font-semibold font-mono text-muted-foreground w-16 text-center">
                  {t("requests:blueprintReview.viewer.page").replace("{{page}}", String(page)).replace("{{total}}", "4")}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={page >= 4}
                  onClick={() => setPage((p) => Math.min(4, p + 1))}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setZoom((z) => Math.max(50, z - 25))}
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <span className="text-[10px] font-bold font-mono text-muted-foreground w-10 text-center">
                  {zoom}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setZoom((z) => Math.min(200, z + 25))}
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Actions */}
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => toast.info(t("common:blueprint_fullscreen_notice"))}
                >
                  <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Document Vector Frame Viewport */}
            <div className="flex-1 min-h-[260px] rounded-xl border border-border bg-slate-950 flex flex-col items-center justify-center p-6 text-center shadow-inner relative overflow-hidden">
              {/* Vector Grid Background Simulation */}
              <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

              {fileInfo.isCad ? (
                <div className="space-y-3 z-10">
                  <div className="mx-auto h-12 w-12 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center border border-indigo-500/20">
                    <FileCode className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-100 block">
                      {t("requests:blueprintReview.viewer.cadViewerTitle")} ({fileInfo.ext.toUpperCase()})
                    </span>
                    <span className="text-[10px] text-slate-400 block max-w-[220px] mx-auto leading-relaxed">
                      {t("requests:blueprintReview.viewer.cadNotice")}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 z-10">
                  <div className="mx-auto h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center border border-primary/20">
                    {fileInfo.isImg ? <ImageIcon className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-100 block">
                      {t("requests:blueprintReview.viewer.previewTitle")}
                    </span>
                    <span
                      className="text-[10px] text-slate-300 block max-w-[220px] mx-auto truncate"
                      title={primaryDoc.fileName}
                    >
                      {primaryDoc.fileName}
                    </span>
                    <span className="text-[10px] text-slate-400 block max-w-[220px] mx-auto leading-relaxed">
                      {t("requests:blueprintReview.viewer.previewNotice")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* File Metadata */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-secondary/10 border border-border text-[10px] font-sans">
              <div>
                <span className="text-muted-foreground block">{t("requests:blueprintReview.viewer.format")}</span>
                <span className="font-semibold text-foreground">{fileInfo.ext.toUpperCase() || "N/A"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">{t("requests:blueprintReview.viewer.size")}</span>
                <span className="font-semibold text-foreground">
                  {fileInfo.isCad ? "14.2 MB" : "3.8 MB"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">{t("requests:blueprintReview.viewer.status")}</span>
                <span className="font-semibold text-emerald-500">{t("requests:blueprintReview.viewer.verified")}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">{t("requests:blueprintReview.viewer.category")}</span>
                <span className="font-semibold text-foreground">{t("requests:blueprintReview.viewer.blueprints")}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1 h-8 px-3.5 border-border bg-background text-foreground"
                onClick={() => toast.info(`${t("requests:details.simulatedView").replace("{{fileName}}", primaryDoc.fileName || "")}`)}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {t("common:view")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1 h-8 px-3.5 border-border bg-background text-foreground"
                onClick={() => toast.info(`${t("requests:details.simulatedDownload").replace("{{fileName}}", primaryDoc.fileName || "")}`)}
              >
                <Download className="h-3.5 w-3.5" />
                {t("requests:engineeringWorkspace.download")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center space-y-3 py-14">
            <div className="mx-auto h-12 w-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-foreground block">
                {t("requests:blueprintReview.files.missingWarning")}
              </span>
              <span className="text-[10px] text-muted-foreground block max-w-[220px] mx-auto leading-relaxed">
                {t("requests:blueprintReview.viewer.noFilesNotice")}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
