import React from "react";
import { Button } from "@/shared/ui/button";
import { ClientContract } from "@/domains/contracts/types";

interface ContractsCardProps {
  contract: ClientContract | null;
  t: any;
}

export function ContractsCard({ contract, t }: ContractsCardProps) {
  return (
    <div>
      <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">
        {t("projects:documents.contractDocument")}
      </h4>
      {contract ? (
        <div className="p-3 border border-border rounded-lg bg-secondary/15 flex items-center justify-between hover:border-primary/20 transition-all">
          <div>
            <span className="font-semibold text-foreground block">{contract.title || "Execution Contract Agreement"}</span>
            <span className="text-[10px] text-muted-foreground font-mono">{contract.id} ({contract.status})</span>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs font-bold" onClick={() => alert(`Simulated download of contract: ${contract.id}`)}>
            Download
          </Button>
        </div>
      ) : (
        <p className="text-muted-foreground text-[10px] italic">No contract generated yet.</p>
      )}
    </div>
  );
}
