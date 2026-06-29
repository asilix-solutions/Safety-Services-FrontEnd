import React from "react";
import { Button } from "@/shared/ui/button";
import { ClientCertificate } from "@/domains/certificates/types";

interface CertificatesCardProps {
  certificate: ClientCertificate | null;
  t: any;
}

export function CertificatesCard({ certificate, t }: CertificatesCardProps) {
  return (
    <div className="pt-3 border-t border-border/60">
      <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">
        {t("projects:documents.certificateDocument")}
      </h4>
      {certificate ? (
        <div className="p-3 border border-border rounded-lg bg-secondary/15 flex items-center justify-between hover:border-primary/20 transition-all">
          <div>
            <span className="font-semibold text-foreground block">Safety Compliance Certificate</span>
            <span className="text-[10px] text-muted-foreground font-mono">{certificate.id}</span>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs font-bold" onClick={() => alert(`Simulated download of certificate: ${certificate.id}`)}>
            Download
          </Button>
        </div>
      ) : (
        <p className="text-muted-foreground text-[10px] italic">No certificate issued yet.</p>
      )}
    </div>
  );
}
