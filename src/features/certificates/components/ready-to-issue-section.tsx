import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { DataTable, ColumnDef } from "@/shared/tables/data-table";
import { ActionButton } from "@/shared/components/action-button";
import { Plus, Award } from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";
import { CertificateEligibility } from "@/domains/workflow-validation/certificate.validators";

interface ReadyToIssueSectionProps {
  eligibleItems: CertificateEligibility[];
  onIssueCertificate: (item: CertificateEligibility) => void;
}

export function ReadyToIssueSection({
  eligibleItems,
  onIssueCertificate,
}: ReadyToIssueSectionProps) {
  const { t } = useTranslation();

  if (eligibleItems.length === 0) return null;

  const columns: ColumnDef<CertificateEligibility>[] = [
    {
      header: t("common:certificates_project_id") || "Project ID",
      accessorKey: "sourceId",
      render: (row) => <span className="font-mono text-xs font-bold text-primary">{row.sourceId}</span>,
    },
    {
      header: t("common:title") || "Title",
      accessorKey: "title",
      render: (row) => <span className="font-semibold text-foreground">{row.title}</span>,
    },
    {
      header: t("common:certificates_job_number") || "Job Number",
      accessorKey: "jobNumber",
      render: (row) => <span className="font-mono text-xs">{row.jobNumber || "—"}</span>,
    },
    {
      header: t("common:status") || "Status",
      render: () => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          {(t("common:certificates_eligible") || "Eligible").toUpperCase()}
        </span>
      ),
    },
    {
      header: t("common:actions") || "Actions",
      render: (row) => (
        <ActionButton
          label={t("common:certificates_issue_btn")}
          icon={Plus}
          onClick={() => onIssueCertificate(row)}
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
          {t("common:certificates_eligible_section_title") || "Eligible Compliance Certificates"}
        </CardTitle>
        <CardDescription>
          {t("common:certificates_eligible_section_desc") || "The following projects have completed physical inspections and safety validations. You can now register compliance certificates."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          data={eligibleItems}
          columns={columns}
          searchKey="title"
        />
      </CardContent>
    </Card>
  );
}
export default ReadyToIssueSection;
