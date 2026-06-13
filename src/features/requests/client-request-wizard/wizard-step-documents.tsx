"use client";

import React from "react";
import { FileUpload } from "@/shared/components/file-upload";
import { Button } from "@/shared/ui/button";
import { RequiredDocument, RequestType } from "@/domains/requests/types";
import { DEFAULT_REQUIRED_DOCUMENTS } from "@/domains/requests/constants";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";

interface DocumentsStepProps {
  requestType: RequestType;
  documents: RequiredDocument[];
  onDocumentUploaded: (index: number, fileName: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function DocumentsStep({ requestType, documents, onDocumentUploaded, onNext, onPrev }: DocumentsStepProps) {
  const { t } = useTranslation();
  const getAcceptedExtensions = (typeStr: string): string => {
    const parts = typeStr.split(",");
    const extensions: string[] = [];
    parts.forEach((part) => {
      const trimmed = part.trim().toLowerCase();
      if (trimmed === "image") {
        extensions.push(".jpg", ".jpeg", ".png", ".webp");
      } else if (trimmed === "pdf") {
        extensions.push(".pdf");
      } else if (trimmed === "zip") {
        extensions.push(".zip");
      } else if (trimmed === "text") {
        extensions.push(".txt", ".doc", ".docx", ".pdf");
      } else if (trimmed === "dwg") {
        extensions.push(".dwg", ".dxf");
      } else {
        extensions.push("." + trimmed);
      }
    });
    return extensions.join(",");
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto space-y-1.5">
        <h2 className="text-xl font-bold text-foreground">
          {t("requests:wizard.documents.title")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("requests:wizard.documents.subtitle")}
        </p>
      </div>

      <div className="space-y-4">
        {documents.map((doc, index) => {
          return (
            <Card
              key={index}
              className={`transition-all duration-200 border-dashed ${
                doc.uploaded
                  ? "border-emerald-500/30 bg-emerald-500/[0.03] dark:bg-emerald-950/[0.08]"
                  : "border-border bg-card hover:bg-muted/30"
              }`}
            >
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-1.5 md:max-w-xs">
                  <div className="flex items-center gap-2">
                    {doc.uploaded ? (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                        <AlertCircle className="h-3.5 w-3.5 animate-pulse" />
                      </span>
                    )}
                    <span className="text-sm font-semibold text-foreground tracking-tight">{doc.name}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed pl-7 rtl:pl-0 rtl:pr-7">
                    {t("requests:wizard.documents.expectedFormats").replace("{{formats}}", doc.type.toUpperCase())}
                  </p>
                </div>

                <div className="flex-1 max-w-sm">
                  {doc.uploaded ? (
                    <div className="p-3 rounded-lg border border-emerald-500/15 bg-background shadow-sm flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-emerald-500 font-medium whitespace-nowrap">
                          {t("requests:wizard.uploads.uploaded")}:
                        </span>
                        <span className="font-mono font-medium truncate text-foreground/80">
                          {doc.fileName}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                        onClick={() => onDocumentUploaded(index, "")}
                      >
                        {t("requests:wizard.documents.remove")}
                      </Button>
                    </div>
                  ) : (
                    <FileUpload
                      accept={getAcceptedExtensions(doc.type)}
                      onFileSelect={(file) => onDocumentUploaded(index, file.name)}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between pt-4 border-t border-border/80">
        <Button type="button" variant="outline" size="sm" onClick={onPrev}>
          {t("requests:wizard.buttons.previous")}
        </Button>
        <Button type="button" size="sm" onClick={onNext}>
          {t("requests:wizard.documents.continueToClassification")}
        </Button>
      </div>
    </div>
  );
}
export default DocumentsStep;
