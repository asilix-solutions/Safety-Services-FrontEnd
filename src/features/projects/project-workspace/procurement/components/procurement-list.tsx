"use client";

import React from "react";
import { Layers, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/components/empty-state";
import { DataTable, ColumnDef } from "@/shared/tables/data-table";
import { Badge } from "@/shared/ui/badge";
import { useTranslation } from "@/providers/i18n-provider";
import { ProcurementRowViewModel, ProcurementViewModel } from "../view-models/procurement.viewmodel";

interface ProcurementListProps {
  viewModel: ProcurementViewModel;
  isLoading: boolean;
}

function SummaryStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-3 flex flex-col gap-1 ${
        accent ? "border-primary/30 bg-primary/5" : "border-border bg-card"
      }`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`text-lg font-bold tabular-nums ${accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

export function ProcurementList({ viewModel, isLoading }: ProcurementListProps) {
  const { t } = useTranslation();

  const columns: ColumnDef<ProcurementRowViewModel>[] = [
    {
      header: t("procurement:list.supplier"),
      accessorKey: "supplierName",
      render: (row) => (
        <span className="text-sm font-medium text-foreground text-start block">{row.supplierName}</span>
      ),
    },
    {
      header: t("procurement:list.silo"),
      render: (row) => (
        <Badge variant="outline" className="text-[11px]">
          {t(row.siloLabelKey)}
        </Badge>
      ),
    },
    {
      header: t("procurement:list.invoiceType"),
      render: (row) => (
        <span className="text-xs text-muted-foreground text-start block">{t(row.invoiceTypeLabelKey)}</span>
      ),
    },
    {
      header: t("procurement:list.preTax"),
      render: (row) => <span className="text-xs tabular-nums text-start block">{row.preTaxValueLabel}</span>,
    },
    {
      header: t("procurement:list.vat"),
      render: (row) => <span className="text-xs tabular-nums text-start block">{row.vatAmountLabel}</span>,
    },
    {
      header: t("procurement:list.total"),
      render: (row) => (
        <span className="text-sm font-bold tabular-nums text-start block">{row.totalValueLabel}</span>
      ),
    },
    {
      header: t("procurement:list.date"),
      render: (row) => (
        <span className="text-xs text-muted-foreground tabular-nums text-start block">{row.createdAtLabel}</span>
      ),
    },
    {
      header: t("procurement:list.receipt"),
      render: (row) => (
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={row.receiptImage}
            alt={t("procurement:receipt.previewAlt")}
            className="h-10 w-10 rounded-md object-cover border border-border"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryStat label={t("procurement:summary.count")} value={String(viewModel.summary.count)} />
        <SummaryStat label={t("procurement:summary.totalTaxable")} value={viewModel.summary.totalTaxableLabel} />
        <SummaryStat label={t("procurement:summary.totalVat")} value={viewModel.summary.totalVatLabel} />
        <SummaryStat
          label={t("procurement:summary.totalSpend")}
          value={viewModel.summary.totalSpendLabel}
          accent
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            {t("procurement:list.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewModel.rows.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart className="h-8 w-8 text-muted-foreground" />}
              title={t("procurement:title")}
              description={t("procurement:empty")}
            />
          ) : (
            <DataTable data={viewModel.rows} columns={columns} isLoading={isLoading} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProcurementList;
