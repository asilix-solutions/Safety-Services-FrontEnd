import React from "react";
import { Report } from "@/domains/reports/types";
import { getReportStatusDisplayName, getReportTypeDisplayName } from "@/domains/reports/helpers";
import { BrandingSettings, CompanyProfileSettings } from "@/domains/settings/types";

/**
 * Shape stored in `Report.contentSnapshot` (a serialised JSON string).
 * Every string may itself be an i18n key — the seeded records store keys, and
 * authored records store literals — so all of it goes through `t()`, which
 * returns the input unchanged when there is no matching key.
 */
interface ReportContentSnapshot {
  generalInfo?: {
    facilityName?: string;
    locationDetails?: string;
    scopeOfWork?: string;
  };
  observations?: string[];
  findings?: string[];
  recommendations?: string[];
}

interface ReportDocumentProps {
  report: Report;
  branding: BrandingSettings;
  company: CompanyProfileSettings;
  t: (key: string) => string;
}

function parseSnapshot(raw: string): ReportContentSnapshot {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ReportContentSnapshot;
  } catch {
    // A corrupt snapshot must not take the whole sheet down — the letterhead
    // and the registry metadata are still a valid, printable record.
    return {};
  }
}

function DocumentSection({
  heading,
  items,
  t,
}: {
  heading: string;
  items?: string[];
  t: (key: string) => string;
}) {
  if (!items || items.length === 0) return null;
  return (
    <section className="mt-6">
      <h2 className="border-b border-slate-300 pb-1 text-sm font-bold uppercase tracking-wide text-slate-900">
        {heading}
      </h2>
      <ul className="mt-2 space-y-1.5 ps-5 text-[13px] leading-relaxed text-slate-800 list-disc">
        {items.map((item, index) => (
          <li key={index}>{t(item) || item}</li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Isolates a Latin/numeric token inside an Arabic run.
 *
 * Without this the bidi algorithm reorders identifiers that start or end with
 * punctuation or digits — a report number prints as "0001-2026-TSR-REP", and a
 * phone number loses its leading "+" to the end of the line. `dir="ltr"` alone
 * is not enough inside a flow of RTL text; the isolation is what stops the token
 * from being re-ordered against its neighbours.
 */
function Ltr({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span dir="ltr" className={`inline-block [unicode-bidi:isolate] ${className ?? ""}`}>
      {children}
    </span>
  );
}

function MetaRow({
  label,
  value,
  code,
}: {
  label: string;
  value?: string;
  /** Identifiers, numbers and dates — isolated so RTL cannot reorder them. */
  code?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-slate-200 py-1">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900 text-end">
        {code ? <Ltr>{value}</Ltr> : value}
      </span>
    </div>
  );
}

/**
 * The official, printable technical safety report (SRS FR-CON-05).
 *
 * Hidden on screen and revealed only for print — the on-screen review surface is
 * the drawer, and this sheet is the artifact. `#report-print-root` is the anchor
 * the `@media print` block in globals.css uses to suppress the rest of the app.
 *
 * Colours are literal slate/white rather than theme tokens, deliberately and as
 * the one place the no-hardcoded-colour rule does not apply: paper is white in
 * both themes, and a token would print the dark palette onto the sheet.
 */
export function ReportDocument({ report, branding, company, t }: ReportDocumentProps) {
  const content = parseSnapshot(report.contentSnapshot);
  const general = content.generalInfo ?? {};

  const formatDate = (value: string): string => {
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return value;
    }
  };

  return (
    <div
      id="report-print-root"
      className="hidden print:block bg-white text-slate-900"
    >
      {/* Letterhead — FR-CON-05 binds the report to the issuing tenant */}
      <header className="flex items-start justify-between gap-6 border-b-2 border-slate-900 pb-4">
        <div className="flex items-center gap-3">
          {branding.logoUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={branding.logoUrl}
              alt={company.companyName}
              className="h-14 w-14 object-contain"
            />
          )}
          <div>
            <div className="text-lg font-bold leading-tight text-slate-900">
              {company.companyName}
            </div>
            <div className="mt-0.5 text-[11px] leading-snug text-slate-600">
              {[company.address, company.city, company.country].filter(Boolean).join(" — ")}
            </div>
            <div className="text-[11px] leading-snug text-slate-600">
              <Ltr>{company.phone}</Ltr> · <Ltr>{company.email}</Ltr>
            </div>
          </div>
        </div>

        <div className="text-[11px] leading-snug text-slate-600 text-end">
          <div>
            {t("reports:docCommercialRegistration")}:{" "}
            <Ltr>{company.commercialRegistration}</Ltr>
          </div>
          <div>
            {t("reports:docTaxNumber")}: <Ltr>{company.taxNumber}</Ltr>
          </div>
          <div>
            {t("reports:docLicenseNumber")}: <Ltr>{company.licenseNumber}</Ltr>
          </div>
        </div>
      </header>

      {/* Document identity */}
      <div className="mt-5 text-center">
        <h1 className="text-xl font-bold text-slate-900">{t("reports:docTitle")}</h1>
        <div className="mt-1 text-sm text-slate-600">
          {getReportTypeDisplayName(report.reportType, t)}
        </div>
        <div className="mt-1 font-mono text-sm font-bold text-slate-900">
          <Ltr>{report.reportNumber}</Ltr>
        </div>
      </div>

      {/* Registry metadata */}
      <section className="mt-6 grid grid-cols-2 gap-x-10 text-[12px]">
        <div>
          <MetaRow label={t("reports:fieldClient")} value={report.clientId} code />
          <MetaRow label={t("reports:fieldRequest")} value={report.jobNumber} code />
          <MetaRow label={t("reports:fieldProject")} value={report.projectId} code />
        </div>
        <div>
          <MetaRow label={t("reports:fieldAuthor")} value={report.authorName} />
          <MetaRow label={t("reports:fieldDate")} value={formatDate(report.createdAt)} code />
          <MetaRow
            label={t("reports:status")}
            value={getReportStatusDisplayName(report.status, t)}
          />
        </div>
      </section>

      {/* Facility */}
      <section className="mt-6">
        <h2 className="border-b border-slate-300 pb-1 text-sm font-bold uppercase tracking-wide text-slate-900">
          {t("reports:docFacilityTitle")}
        </h2>
        <div className="mt-2 space-y-1 text-[13px] text-slate-800">
          <MetaRow
            label={t("reports:docFacilityName")}
            value={general.facilityName ? t(general.facilityName) || general.facilityName : undefined}
          />
          <MetaRow
            label={t("reports:docLocation")}
            value={
              general.locationDetails ? t(general.locationDetails) || general.locationDetails : undefined
            }
          />
          <MetaRow
            label={t("reports:docScopeOfWork")}
            value={general.scopeOfWork ? t(general.scopeOfWork) || general.scopeOfWork : undefined}
          />
        </div>
      </section>

      {/* Summary */}
      <section className="mt-6">
        <h2 className="border-b border-slate-300 pb-1 text-sm font-bold uppercase tracking-wide text-slate-900">
          {t("reports:fieldSummary")}
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-800">
          {t(report.summary) || report.summary}
        </p>
      </section>

      <DocumentSection
        heading={t("reports:fieldObservations")}
        items={content.observations}
        t={t}
      />
      <DocumentSection heading={t("reports:fieldFindings")} items={content.findings} t={t} />
      <DocumentSection
        heading={t("reports:fieldRecommendations")}
        items={content.recommendations}
        t={t}
      />

      {/* Signature + verification seal (FR-CON-05). The seal is a printed mark of
          the issuing tenant, not a cryptographic signature. */}
      <footer className="mt-10 flex items-end justify-between gap-8 border-t border-slate-300 pt-4">
        <div className="text-[12px] text-slate-800">
          <div className="font-semibold">{t("reports:docPreparedBy")}</div>
          <div className="mt-1">{report.authorName}</div>
          <div className="mt-6 w-56 border-t border-slate-400 pt-1 text-[11px] text-slate-500">
            {t("reports:docSignature")}
          </div>
        </div>

        <div
          className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 p-2 text-center text-[9px] font-bold uppercase leading-tight"
          style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}
        >
          {t("reports:docVerificationSeal")}
        </div>
      </footer>

      <div className="mt-4 text-center text-[10px] text-slate-500">
        {t("reports:docGeneratedOn")}: <Ltr>{formatDate(new Date().toISOString())}</Ltr> ·{" "}
        <Ltr>{report.reportNumber}</Ltr>
      </div>
    </div>
  );
}

export default ReportDocument;
