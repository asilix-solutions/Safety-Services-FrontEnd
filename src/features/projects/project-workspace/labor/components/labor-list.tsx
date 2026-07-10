"use client";

import React from "react";
import { HardHat, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/components/empty-state";
import { DataTable, ColumnDef } from "@/shared/tables/data-table";
import { Badge } from "@/shared/ui/badge";
import { useTranslation } from "@/providers/i18n-provider";
import { LaborRowViewModel, LaborViewModel } from "../view-models/labor.viewmodel";
import { SettlementConfirm } from "./settlement-confirm";

interface LaborListProps {
  viewModel: LaborViewModel;
  isLoading: boolean;
  canEdit: boolean;
  onConfirmSettlement: (id: string) => Promise<unknown>;
  isSettling: boolean;
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

export function LaborList({ viewModel, isLoading, canEdit, onConfirmSettlement, isSettling }: LaborListProps) {
  const { t } = useTranslation();

  const columns: ColumnDef<LaborRowViewModel>[] = [
    {
      header: t("labor:list.worker"),
      render: (row) => <span className="text-sm font-medium text-foreground text-start block">{row.workerName}</span>,
    },
    {
      header: t("labor:list.role"),
      render: (row) => <span className="text-xs text-muted-foreground text-start block">{row.fieldRole}</span>,
    },
    {
      header: t("labor:list.category"),
      render: (row) => (
        <Badge variant="outline" className="text-[11px]">
          {t(row.legalCategoryLabelKey)}
        </Badge>
      ),
    },
    {
      header: t("labor:list.cost"),
      render: (row) => <span className="text-sm font-bold tabular-nums text-start block">{row.costLabel}</span>,
    },
    {
      header: t("labor:list.status"),
      render: (row) => {
        if (row.settled) {
          return (
            <div className="flex flex-col gap-0.5">
              <Badge variant="success" className="text-[10px] w-fit">
                {t("labor:list.settledBadge")}
              </Badge>
              <span className="text-[10px] text-muted-foreground tabular-nums">{row.settledAtLabel}</span>
            </div>
          );
        }
        if (row.canSettle && canEdit) {
          return (
            <SettlementConfirm
              workerName={row.workerName}
              onConfirm={() => onConfirmSettlement(row.id)}
              isSettling={isSettling}
            />
          );
        }
        return <span className="text-xs text-muted-foreground">{t("labor:list.noSettlement")}</span>;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <SummaryStat label={t("labor:summary.headcount")} value={String(viewModel.summary.headcount)} accent />
        <SummaryStat label={t("labor:summary.internalCount")} value={String(viewModel.summary.internalCount)} />
        <SummaryStat label={t("labor:summary.outsourceCount")} value={String(viewModel.summary.outsourceCount)} />
        <SummaryStat label={t("labor:summary.totalOutsourceCost")} value={viewModel.summary.totalOutsourceCostLabel} />
        <SummaryStat
          label={t("labor:summary.unsettledOutsourceCount")}
          value={String(viewModel.summary.unsettledOutsourceCount)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            {t("labor:list.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewModel.rows.length === 0 ? (
            <EmptyState
              icon={<HardHat className="h-8 w-8 text-muted-foreground" />}
              title={t("labor:title")}
              description={t("labor:empty")}
            />
          ) : (
            <DataTable data={viewModel.rows} columns={columns} isLoading={isLoading} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default LaborList;
