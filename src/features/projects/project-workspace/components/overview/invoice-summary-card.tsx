import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Receipt } from "lucide-react";
import Link from "next/link";
import { ClientInvoice } from "@/domains/invoices/types";
import { TFunction } from "./types";

interface InvoiceSummaryCardProps {
  invoice: ClientInvoice | null;
  t: TFunction;
}

export function InvoiceSummaryCard({ invoice, t }: InvoiceSummaryCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2 border-b border-border">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Receipt className="h-4 w-4 text-primary" />
          {t("projects:overview.invoice.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 space-y-2 text-xs">
        {invoice ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("projects:overview.invoice.grandTotal")}</span>
              <span className="font-bold font-mono">{invoice.grandTotal.toFixed(2)} SAR</span>
            </div>
            <Badge variant={invoice.status === "paid" ? "success" : "warning"}>
              {t(`projects:overview.invoice.status.${invoice.status}`)}
            </Badge>
            <div className="pt-2">
              <Button asChild variant="outline" size="sm" className="w-full h-8 text-xs font-bold">
                <Link href="/invoices">{t("projects:overview.invoice.view")}</Link>
              </Button>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">{t("projects:overview.invoice.none")}</p>
        )}
      </CardContent>
    </Card>
  );
}
