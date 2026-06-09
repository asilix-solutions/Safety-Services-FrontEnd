"use client";

import React from "react";
import { MOCK_PROJECTS } from "@/mock/projects";
import { DataTable, ColumnDef } from "@/shared/components/data-table/data-table";
import { Badge } from "@/shared/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";

interface DashboardProjectRow {
  id: string;
  name: string;
  clientName: string;
  status: string;
  category: string;
}

export function RecentProjectsTable() {
  const columns: ColumnDef<DashboardProjectRow>[] = [
    {
      header: "Project",
      accessorKey: "name",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-200">{row.name}</p>
          <p className="text-[10px] text-muted-foreground">{row.category}</p>
        </div>
      ),
    },
    {
      header: "Client",
      accessorKey: "clientName",
    },
    {
      header: "Status",
      accessorKey: "status",
      render: (row) => {
        const variant =
          row.status === "Approved"
            ? "success"
            : row.status === "In Review" || row.status === "Pending Review"
            ? "warning"
            : row.status === "Action Required" || row.status === "Rejected"
            ? "destructive"
            : "secondary";
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
  ];

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Active Construction & Safety Logs</CardTitle>
        <CardDescription>Recent blueprint reviews and inspection status audits</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          data={MOCK_PROJECTS}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Search active logs..."
        />
      </CardContent>
    </Card>
  );
}
export default RecentProjectsTable;
