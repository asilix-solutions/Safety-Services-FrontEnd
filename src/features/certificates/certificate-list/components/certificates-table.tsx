import React from "react";
import { ClientCertificate } from "@/domains/certificates/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/components/empty-state";
import { DataTable, ColumnDef } from "@/shared/tables/data-table";
import { Award, Eye, Download, XCircle } from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";
import { ActionMenu } from "@/shared/components/action-menu";
import { Badge } from "@/shared/ui/badge";
import {
  deriveCertificateDisplayStatus,
  getCertificateStatusBadgeVariant,
  getRemainingValidityText,
  canRevokeCertificate,
} from "../helpers/helpers";

interface CertificatesTableProps {
  certificates: ClientCertificate[];
  isAdmin: boolean;
  userRole: string;
  statusFilter: "all" | "active" | "expired" | "revoked";
  onStatusFilterChange: (filter: "all" | "active" | "expired" | "revoked") => void;
  onRevokeCertificate: (id: string) => void;
  onDownloadCertificate: (certificate: ClientCertificate) => void;
  onViewDetails: (certificate: ClientCertificate) => void;
}

export function CertificatesTable({
  certificates,
  isAdmin,
  userRole,
  statusFilter,
  onStatusFilterChange,
  onRevokeCertificate,
  onDownloadCertificate,
  onViewDetails,
}: CertificatesTableProps) {
  const { t } = useTranslation();
  const now = new Date();

  const filteredCertificates = certificates.filter((c) => {
    if (statusFilter === "all") return true;
    const displayStatus = deriveCertificateDisplayStatus(c.status, c.expiresAt);
    return displayStatus === statusFilter;
  });

  const counts = {
    all: certificates.length,
    active: certificates.filter(
      (c) => c.status === "active" && new Date(c.expiresAt) >= now
    ).length,
    expired: certificates.filter(
      (c) => c.status === "active" && new Date(c.expiresAt) < now
    ).length,
    revoked: certificates.filter((c) => c.status === "revoked").length,
  };

  const columns: ColumnDef<ClientCertificate>[] = [
    {
      header: t("common:certificates_id"),
      accessorKey: "id",
      render: (row) => <span className="font-mono text-xs font-bold text-primary">{row.id}</span>,
    },
    {
      header: t("common:certificateSummary.facilityName"),
      accessorKey: "facilityName",
      render: (row) => <span className="font-semibold text-foreground">{row.facilityName || row.title || "—"}</span>,
    },
    {
      header: t("common:certificateSummary.type"),
      accessorKey: "type",
      render: (row) => (
        <span>
          {row.type && ["safety", "installation", "maintenance"].includes(row.type)
            ? t(`common:certificateTypes.${row.type}`)
            : t("common:certificateTypes.safety")}
        </span>
      ),
    },
    {
      header: t("common:status") || "Status",
      render: (row) => {
        const displayStatus = deriveCertificateDisplayStatus(row.status, row.expiresAt);
        const transKey = `certificates_tab_${displayStatus}`;
        const variant = getCertificateStatusBadgeVariant(row.status, row.expiresAt);
        return (
          <Badge variant={variant} className="uppercase text-[10px]">
            {t(`common:${transKey}`).toUpperCase()}
          </Badge>
        );
      },
    },
    {
      header: t("common:certificateSummary.validityDays"),
      render: (row) => {
        const text = getRemainingValidityText(row.expiresAt, row.status, t);
        const displayStatus = deriveCertificateDisplayStatus(row.status, row.expiresAt);
        let variant: "default" | "secondary" | "warning" | "destructive" | "success" | "outline" = "default";
        if (displayStatus === "active") {
          const validityDays = (new Date(row.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          if (validityDays < 30) variant = "destructive";
          else if (validityDays < 90) variant = "warning";
          else variant = "success";
        } else {
          variant = "destructive";
        }
        return (
          <Badge variant={variant} className="uppercase text-[10px]">
            {text}
          </Badge>
        );
      },
    },
    {
      header: t("common:certificates_issued_at"),
      accessorKey: "issuedAt",
      render: (row) => (
        <span className="text-muted-foreground text-xs">
          {new Date(row.issuedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: t("common:certificates_expires_at"),
      accessorKey: "expiresAt",
      render: (row) => (
        <span className="text-muted-foreground text-xs">
          {new Date(row.expiresAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: t("common:actions") || "Actions",
      render: (row) => {
        const canRev = canRevokeCertificate(row, userRole);
        const menuItems = [
          {
            id: "view-details",
            label: t("common:certificates_audit_details_btn"),
            icon: Eye,
            onClick: () => onViewDetails(row),
          },
          {
            id: "download",
            label: t("common:certificates_download_btn"),
            icon: Download,
            onClick: () => onDownloadCertificate(row),
          },
          ...(canRev
            ? [
                {
                  id: "revoke",
                  label: t("common:certificates_revoke_action"),
                  icon: XCircle,
                  onClick: () => onRevokeCertificate(row.id),
                  destructive: true,
                  separatorBefore: true,
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
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          {isAdmin ? t("common:certificates_table_title_admin") : t("common:certificates_table_title_client")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {certificates.length > 0 && (
          <div className="flex flex-wrap gap-2 border-b border-border pb-3">
            <Button
              variant={statusFilter === "all" ? "default" : "ghost"}
              onClick={() => onStatusFilterChange("all")}
              size="sm"
              className="h-8 gap-1.5 text-xs cursor-pointer"
            >
              {t("common:certificates_tab_all")}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  statusFilter === "all"
                    ? "bg-primary-foreground text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {counts.all}
              </span>
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "ghost"}
              onClick={() => onStatusFilterChange("active")}
              size="sm"
              className="h-8 gap-1.5 text-xs cursor-pointer"
            >
              {t("common:certificates_tab_active")}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  statusFilter === "active"
                    ? "bg-primary-foreground text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {counts.active}
              </span>
            </Button>
            <Button
              variant={statusFilter === "expired" ? "default" : "ghost"}
              onClick={() => onStatusFilterChange("expired")}
              size="sm"
              className="h-8 gap-1.5 text-xs cursor-pointer"
            >
              {t("common:certificates_tab_expired")}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  statusFilter === "expired"
                    ? "bg-primary-foreground text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {counts.expired}
              </span>
            </Button>
            <Button
              variant={statusFilter === "revoked" ? "default" : "ghost"}
              onClick={() => onStatusFilterChange("revoked")}
              size="sm"
              className="h-8 gap-1.5 text-xs cursor-pointer"
            >
              {t("common:certificates_tab_revoked")}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  statusFilter === "revoked"
                    ? "bg-primary-foreground text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {counts.revoked}
              </span>
            </Button>
          </div>
        )}

        {certificates.length === 0 ? (
          <EmptyState
            title={t("common:certificates_empty_state_title")}
            description={
              isAdmin
                ? t("common:certificates_empty_state_desc_admin")
                : t("common:certificates_empty_state_desc_client")
            }
            icon={<Award className="h-6 w-6 text-muted-foreground" />}
          />
        ) : filteredCertificates.length === 0 ? (
          <EmptyState
            title={t("common:certificates_no_matching")}
            description={t("common:certificates_no_matching_desc")}
            icon={<Award className="h-6 w-6 text-muted-foreground" />}
          />
        ) : (
          <DataTable
            data={filteredCertificates}
            columns={columns}
            searchKey="title"
          />
        )}
      </CardContent>
    </Card>
  );
}
export default CertificatesTable;
