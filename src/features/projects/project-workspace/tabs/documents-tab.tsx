import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { FileText, Link as LinkIcon } from "lucide-react";
import { ResolvedDocuments } from "../helpers/documents";

// Component Imports
import { RequestDocumentsCard } from "../components/request-documents-card";
import { ContractsCard } from "../components/contracts-card";
import { CertificatesCard } from "../components/certificates-card";

interface DocumentsTabProps {
  viewModel: ResolvedDocuments;
  t: any;
}

export function DocumentsTab({ viewModel, t }: DocumentsTabProps) {
  const hasDocs = viewModel.requestDocuments.length > 0 || viewModel.contract || viewModel.certificate;

  return (
    <div className="space-y-6">
      {/* Linked Request Documents */}
      {hasDocs ? (
        <div className="grid gap-6 md:grid-cols-2">
          <RequestDocumentsCard documents={viewModel.requestDocuments} t={t} />

          <Card className="border-border bg-card">
            <CardHeader className="pb-2 border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-indigo-500" />
                Contracts & Certificates
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <ContractsCard contract={viewModel.contract} t={t} />
              <CertificatesCard certificate={viewModel.certificate} t={t} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center text-muted-foreground text-xs space-y-2">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground/60" />
            <p>{t("projects:empty.noDocuments")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
