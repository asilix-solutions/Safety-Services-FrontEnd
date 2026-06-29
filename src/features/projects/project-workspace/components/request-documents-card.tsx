import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { FileText } from "lucide-react";
import { RequiredDocument } from "@/domains/requests/types";

interface RequestDocumentsCardProps {
  documents: RequiredDocument[];
  t: any;
}

export function RequestDocumentsCard({ documents, t }: RequestDocumentsCardProps) {
  if (documents.length === 0) return null;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2 border-b border-border">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <FileText className="h-4 w-4 text-indigo-500" />
          {t("projects:documents.linkedRequestFiles")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-2 text-xs">
        {documents.map((doc, idx) => (
          <div key={idx} className="flex justify-between items-center p-2.5 border border-border rounded bg-secondary/15 hover:bg-secondary/25 transition-all">
            <span className="font-semibold text-foreground">{doc.name}</span>
            {doc.uploaded ? (
              <span className="text-[10px] text-success font-semibold font-mono">{doc.fileName || "Uploaded"}</span>
            ) : (
              <span className="text-[10px] text-muted-foreground">Not Uploaded</span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
