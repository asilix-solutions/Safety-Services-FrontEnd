"use client";

import React from "react";
import { FileUpload } from "@/shared/components/file-upload";
import { Button } from "@/shared/ui/button";
import { RequiredDocument, RequestType } from "@/domains/requests/types";
import { DEFAULT_REQUIRED_DOCUMENTS } from "@/domains/requests/constants";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface DocumentsStepProps {
  requestType: RequestType;
  documents: RequiredDocument[];
  onDocumentUploaded: (index: number, fileName: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function DocumentsStep({ requestType, documents, onDocumentUploaded, onNext, onPrev }: DocumentsStepProps) {
  // Safe fallback to default requirements if empty
  const defaultDocs = DEFAULT_REQUIRED_DOCUMENTS[requestType] || [];

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto space-y-1.5">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Upload Required Documents</h2>
        <p className="text-xs text-muted-foreground">
          SaaS compliance workflows require the following certificates to verify facility dimensions.
        </p>
      </div>

      <div className="space-y-4">
        {documents.map((doc, index) => {
          return (
            <Card key={index} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 md:max-w-xs">
                  <div className="flex items-center gap-1.5">
                    {doc.uploaded ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-slate-850 dark:text-slate-100">{doc.name}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Expected formats: {doc.type.toUpperCase()}. Verification is completed instantly by the system.
                  </p>
                </div>

                <div className="flex-1 max-w-sm">
                  {doc.uploaded ? (
                    <div className="p-2.5 rounded-lg border border-emerald-500/10 bg-emerald-500/5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                      <span className="font-semibold truncate max-w-xs">✓ Loaded: {doc.fileName}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] text-rose-500 hover:bg-rose-500/10 hover:text-rose-500"
                        onClick={() => onDocumentUploaded(index, "")}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <FileUpload
                      accept={doc.type.split(",").map((t) => "." + t.trim()).join(",")}
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
          Back
        </Button>
        <Button type="button" size="sm" onClick={onNext}>
          Continue to Auto Classification
        </Button>
      </div>
    </div>
  );
}
export default DocumentsStep;
