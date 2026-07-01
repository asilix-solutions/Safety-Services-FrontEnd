import React from "react";
import { ClientInvoice } from "@/domains/invoices/types";
import { InvoiceWithFacility } from "../hooks/use-invoice-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/components/empty-state";
import { DataTable, ColumnDef } from "@/shared/tables/data-table";
import { Badge } from "@/shared/ui/badge";
import {
  FileText,
  Eye,
  CreditCard,
  Download,
  CheckCircle2,
  AlertCircle,
  Layers,
  Building2,
} from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";
import { SearchInput } from "@/shared/components/search-input";
import { ActionMenu } from "@/shared/components/action-menu";
import {
  formatCurrency as localFormatCurrency,
  formatDate as localFormatDate,
} from "@/lib/formatters";
import {
  getStatusLabel,
  filterBySearch,
  filterByStatus,
  canPay,
} from "../helpers/helpers";

interface InvoiceTableProps {
  invoices: InvoiceWithFacility[];
  userRole: string;
  statusFilter: "all" | "paid" | "unpaid";
  onStatusFilterChange: (filter: "all" | "paid" | "unpaid") => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onPayInvoice: (invoice: ClientInvoice) => void;
  onViewDetails: (invoice: ClientInvoice) => void;
  onDownloadInvoice: (invoice: ClientInvoice) => void;
}

/** Semantic status pill — replaces plain Badge with visual consistency */
function StatusPill({ status }: { status: "paid" | "unpaid" }) {
  const { t } = useTranslation();
  if (status === "paid") {
    return (
      <Badge variant="success" className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold">
        <CheckCircle2 className="h-3 w-3" />
        {getStatusLabel(status, t)}
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold">
      <AlertCircle className="h-3 w-3" />
      {getStatusLabel(status, t)}
    </Badge>
  );
}

/** Single stat card */
function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "emerald" | "red" | "primary";
}) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-emerald-500/20",
    red: "text-red-600 dark:text-red-400 bg-red-500/5 border-red-500/20",
    primary: "text-primary bg-primary/5 border-primary/20",
  };
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${colorMap[accent]}`}>
      <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">{label}</span>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}

/** Mobile card for a single invoice row */
function InvoiceMobileCard({
  invoice,
  userRole,
  onViewDetails,
  onPayInvoice,
  onDownloadInvoice,
  t,
  locale,
}: {
  invoice: InvoiceWithFacility;
  userRole: string;
  onViewDetails: (inv: ClientInvoice) => void;
  onPayInvoice: (inv: ClientInvoice) => void;
  onDownloadInvoice: (inv: ClientInvoice) => void;
  t: (key: string) => string;
  locale: any;
}) {
  const isPaid = invoice.status === "paid";
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-xs font-bold text-primary">{invoice.id}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{invoice.jobNumber}</p>
        </div>
        <StatusPill status={invoice.status} />
      </div>

      {invoice.facilityName && invoice.facilityName !== "—" && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span>{invoice.facilityName}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-border">
        <div>
          <p className="text-[10px] text-muted-foreground">{t("invoices_table_amount")}</p>
          <p className="text-sm font-bold text-foreground">
            {localFormatCurrency(invoice.grandTotal, locale, invoice.currency)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground">{t("invoices_table_due")}</p>
          <p className="text-xs font-medium text-foreground">
            {localFormatDate(invoice.dueDate, locale, { dateStyle: "medium" })}
          </p>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onViewDetails(invoice)}
          className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold border border-border rounded-lg py-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5" />
          {t("invoices_view_details")}
        </button>
        {!isPaid && canPay(invoice, userRole) && (
          <button
            onClick={() => onPayInvoice(invoice)}
            className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold rounded-lg py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <CreditCard className="h-3.5 w-3.5" />
            {t("invoices_pay_client")}
          </button>
        )}
        {isPaid && (
          <button
            onClick={() => onDownloadInvoice(invoice)}
            className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold border border-border rounded-lg py-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            {t("invoices_download_invoice")}
          </button>
        )}
      </div>
    </div>
  );
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
  onDownloadInvoice,
}: InvoiceTableProps) {
  const { t, locale } = useTranslation();

  const searchedInvoices = filterBySearch(invoices, searchQuery);
  const filteredInvoices = filterByStatus(searchedInvoices, statusFilter) as InvoiceWithFacility[];

  const counts = {
    all: invoices.length,
    paid: invoices.filter((i) => i.status === "paid").length,
    unpaid: invoices.filter((i) => i.status === "unpaid").length,
  };

  const columns: ColumnDef<InvoiceWithFacility>[] = [
    {
      header: t("invoices_table_id"),
      accessorKey: "id",
      render: (row) => (
        <span className="font-mono text-xs font-bold text-primary tracking-wide text-start block">{row.id}</span>
      ),
    },
    {
      header: t("invoices_table_facility"),
      accessorKey: "facilityName",
      render: (row) => {
        const hasFacility = row.facilityName && row.facilityName !== "—" && row.facilityName.trim() !== "";
        return (
          <div className="text-start">
            <p className="text-sm font-medium text-foreground leading-snug">
              {hasFacility ? row.facilityName : row.jobNumber}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {hasFacility ? row.jobNumber : t("requests:facilityInfo.facilityNamePlaceholder") || "Facility details not available"}
            </p>
          </div>
        );
      },
    },
    {
      header: t("invoices_table_amount"),
      accessorKey: "grandTotal",
      render: (row) => (
        <span className="text-sm font-bold text-foreground tabular-nums text-start block">
          {localFormatCurrency(row.grandTotal, locale, row.currency)}
        </span>
      ),
    },
    {
      header: t("invoices_table_due"),
      accessorKey: "dueDate",
      render: (row) => (
        <span className="text-xs text-muted-foreground tabular-nums text-start block">
          {localFormatDate(row.dueDate, locale, { dateStyle: "medium" })}
        </span>
      ),
    },
    {
      header: t("invoices_table_status"),
      accessorKey: "status",
      render: (row) => (
        <div className="flex justify-center items-center">
          <StatusPill status={row.status} />
        </div>
      ),
    },
    {
      header: t("invoices_table_actions"),
      render: (row) => {
        const isPaid = row.status === "paid";
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
                  label: t("invoices_pay_client"),
                  icon: CreditCard,
                  onClick: () => onPayInvoice(row),
                },
              ]
            : []),
          ...(isPaid
            ? [
                {
                  id: "download-invoice",
                  label: t("invoices_download_invoice"),
                  icon: Download,
                  onClick: () => onDownloadInvoice(row),
                },
              ]
            : []),
        ];
        return (
          <div className="flex justify-center items-center">
            <ActionMenu items={menuItems} />
          </div>
        );
      },
    },
  ];

  const showEmptyUnpaid = statusFilter === "unpaid" && filteredInvoices.length === 0;

  return (
    <div className="space-y-4">
      {/* Table Card */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {t("invoices_title")}
            </CardTitle>
            <div className="w-full md:w-72">
              <SearchInput
                value={searchQuery}
                onChange={onSearchQueryChange}
                placeholder={t("invoices_search_placeholder")}
              />
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex border-b border-border mt-4" role="tablist">
            {(["all", "paid", "unpaid"] as const).map((tab) => {
              const isActive = statusFilter === tab;
              const count = counts[tab];
              const label = t(`invoices_status_${tab}`);
              return (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={isActive}
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
          {/* Mobile card layout */}
          <div className="sm:hidden space-y-3">
            {filteredInvoices.length === 0 ? (
              <EmptyState
                title={showEmptyUnpaid ? t("invoices_empty_unpaid") : t("invoices_empty_title")}
                description={
                  showEmptyUnpaid ? t("invoices_empty_unpaid_desc") : t("invoices_empty_desc")
                }
                icon={
                  showEmptyUnpaid ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  ) : (
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  )
                }
              />
            ) : (
              filteredInvoices.map((inv) => (
                <InvoiceMobileCard
                  key={inv.id}
                  invoice={inv}
                  userRole={userRole}
                  onViewDetails={onViewDetails}
                  onPayInvoice={onPayInvoice}
                  onDownloadInvoice={onDownloadInvoice}
                  t={t}
                  locale={locale}
                />
              ))
            )}
          </div>

          {/* Desktop table layout */}
          <div className="hidden sm:block">
            {filteredInvoices.length === 0 ? (
              <EmptyState
                title={showEmptyUnpaid ? t("invoices_empty_unpaid") : t("invoices_empty_title")}
                description={
                  showEmptyUnpaid ? t("invoices_empty_unpaid_desc") : t("invoices_empty_desc")
                }
                icon={
                  showEmptyUnpaid ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  ) : (
                    <Layers className="h-8 w-8 text-muted-foreground" />
                  )
                }
              />
            ) : (
              <DataTable data={filteredInvoices} columns={columns} isLoading={false} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default InvoiceTable;
