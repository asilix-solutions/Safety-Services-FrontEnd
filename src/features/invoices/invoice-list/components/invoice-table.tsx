import React from "react";
import { ClientInvoice } from "@/domains/invoices/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/components/empty-state";
import { DataTable, ColumnDef } from "@/shared/tables/data-table";
import { FileText, Eye, CreditCard } from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";
import { SearchInput } from "@/shared/components/search-input";
import { ActionMenu } from "@/shared/components/action-menu";
import {
  formatCurrency,
  formatDate,
  getStatusLabel,
  getStatusBadgeVariant,
  filterBySearch,
  filterByStatus,
  canPay,
} from "../helpers/helpers";

interface InvoiceTableProps {
  invoices: ClientInvoice[];
  userRole: string;
  statusFilter: "all" | "paid" | "unpaid";
  onStatusFilterChange: (filter: "all" | "paid" | "unpaid") => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onPayInvoice: (invoice: ClientInvoice) => void;
  onViewDetails: (invoice: ClientInvoice) => void;
}

export function InvoiceTable({
  invoices,
  userRole,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  onPayInvoice,
  onViewDetails,
}: InvoiceTableProps) {
  const { t } = useTranslation();

  const searchedInvoices = filterBySearch(invoices, searchQuery);
  const filteredInvoices = filterByStatus(searchedInvoices, statusFilter);

  const counts = {
    all: invoices.length,
    paid: invoices.filter((i) => i.status === "paid").length,
    unpaid: invoices.filter((i) => i.status === "unpaid").length,
  };

  const columns: ColumnDef<ClientInvoice>[] = [
    {
      header: t("invoices_table_id"),
      accessorKey: "id",
      render: (row) => (
        <span className="font-mono text-xs font-bold text-primary">{row.id}</span>
      ),
    },
    {
      header: t("invoices_table_job"),
      accessorKey: "jobNumber",
      render: (row) => (
        <span className="font-medium text-foreground">{row.jobNumber}</span>
      ),
    },
    {
      header: t("invoices_table_amount"),
      accessorKey: "grandTotal",
      render: (row) => (
        <span className="font-semibold">{formatCurrency(row.grandTotal, row.currency)}</span>
      ),
    },
    {
      header: t("invoices_table_due"),
      accessorKey: "dueDate",
      render: (row) => (
        <span className="text-muted-foreground text-xs">{formatDate(row.dueDate)}</span>
      ),
    },
    {
      header: t("invoices_table_status"),
      accessorKey: "status",
      render: (row) => {
        const variant = getStatusBadgeVariant(row.status);
        return (
          <Badge variant={variant} className="uppercase text-[10px]">
            {getStatusLabel(row.status, t)}
          </Badge>
        );
      },
    },
    {
      header: t("invoices_table_actions"),
      render: (row) => {
        const actionLabel = userRole === "Client" ? t("invoices_pay_client") : t("invoices_pay_admin");

        const menuItems = [
          {
            id: "view-details",
            label: t("invoices_view_details"),
            icon: Eye,
            onClick: () => onViewDetails(row),
          },
          ...(canPay(row, userRole)
            ? [
                {
                  id: "pay-invoice",
                  label: actionLabel,
                  icon: CreditCard,
                  onClick: () => onPayInvoice(row),
                },
              ]
            : []),
        ];

        return <ActionMenu items={menuItems} />;
      },
    },
  ];

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {t("invoices_title")}
            </CardTitle>
          </div>
          <div className="w-full md:w-72">
            <SearchInput
              value={searchQuery}
              onChange={onSearchQueryChange}
              placeholder={t("invoices_search_placeholder")}
            />
          </div>
        </div>

        <div className="flex border-b border-border mt-4">
          {(["all", "paid", "unpaid"] as const).map((tab) => {
            const isActive = statusFilter === tab;
            const count = counts[tab];
            let label = t(`invoices_status_${tab}`);
            return (
              <button
                key={tab}
                onClick={() => onStatusFilterChange(tab)}
                className={`py-2 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent>
        {filteredInvoices.length === 0 ? (
          <EmptyState
            title={t("invoices_empty_title")}
            description={t("invoices_empty_desc")}
            icon={<FileText className="h-8 w-8 text-muted-foreground" />}
          />
        ) : (
          <DataTable
            data={filteredInvoices}
            columns={columns}
            isLoading={false}
          />
        )}
      </CardContent>
    </Card>
  );
}
export default InvoiceTable;
