import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { Quotation } from "@/domains/quotations/types";
import { TFunction } from "./types";

interface QuotationSummaryCardProps {
  quotation: Quotation | null;
  t: TFunction;
}

export function QuotationSummaryCard({ quotation, t }: QuotationSummaryCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2 border-b border-border">
        <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
          <FileSpreadsheet className="h-4 w-4 text-indigo-500" />
          {t("projects:overview.quotation.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 space-y-2 text-xs">
        {quotation ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("projects:overview.quotation.grandTotal")}</span>
              <span className="font-bold font-mono">{quotation.grandTotal.toFixed(2)} SAR</span>
            </div>
            <Badge variant={quotation.quotationStatus === "APPROVED" ? "success" : "warning"}>
              {t(`projects:overview.quotation.status.${quotation.quotationStatus}`)}
            </Badge>
            <div className="pt-2">
              <Button asChild variant="outline" size="sm" className="w-full h-8 text-xs font-bold">
                <Link href={`/quotations/${quotation.jobNumber}`}>
                  {t("projects:overview.quotation.view")}
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">{t("projects:overview.quotation.none")}</p>
        )}
      </CardContent>
    </Card>
  );
}
