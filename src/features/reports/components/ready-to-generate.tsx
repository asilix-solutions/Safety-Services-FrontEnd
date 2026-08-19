import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { DataTable, ColumnDef } from "@/shared/tables/data-table";
import { ActionButton } from "@/shared/components/action-button";
import { Plus, Award } from "lucide-react";
import { ReadyToGenerateItem } from "../hooks/use-reports-hub";

import { getReportTypeDisplayName } from "@/domains/reports/helpers";

interface ReadyToGenerateProps {
  items: ReadyToGenerateItem[];
  onGenerate: (item: ReadyToGenerateItem) => void;
  t: (key: string) => string;
}

export function ReadyToGenerate({ items, onGenerate, t }: ReadyToGenerateProps) {
  if (items.length === 0) return null;

  const columns: ColumnDef<ReadyToGenerateItem>[] = [
    {
      header: t("reports:fieldReportNumber") || "Source Ref",
      accessorKey: "sourceId",
      render: (row) => <span className="font-mono text-xs font-bold text-primary">{row.sourceId}</span>,
    },
    {
      header: t("reports:reportTitle") || "Title",
      accessorKey: "title",
      render: (row) => <span className="font-semibold text-foreground">{t(row.title) || row.title}</span>,
    },
    {
      header: t("reports:fieldSource") || "Type",
      accessorKey: "type",
      render: (row) => (
        <span className="text-xs px-2 py-0.5 rounded bg-muted font-medium">
          {getReportTypeDisplayName(row.type, t)}
        </span>
      ),
    },
    {
      header: t("reports:fieldClient") || "Customer",
      accessorKey: "clientName",
      render: (row) => <span className="text-xs text-muted-foreground">{row.clientName}</span>,
    },
    {
      header: t("reports:fieldActions") || "Actions",
      render: (row) => (
        <ActionButton
          label={t("reports:btnGenerate")}
          icon={Plus}
          onClick={() => onGenerate(row)}
          className="h-8 text-xs bg-success text-success-foreground hover:bg-success/90 shadow-sm border-none cursor-pointer"
        />
      ),
    },
  ];

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Award className="h-4.5 w-4.5 text-success" />
          {t("reports:readyToGenerateTitle")}
        </CardTitle>
        <CardDescription>
          {t("reports:readyToGenerateDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          data={items}
          columns={columns}
          searchKey="title"
        />
      </CardContent>
    </Card>
  );
}
export default ReadyToGenerate;
