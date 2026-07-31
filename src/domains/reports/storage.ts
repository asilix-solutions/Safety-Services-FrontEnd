import { Report } from "./types";
import { MOCK_REPORTS } from "@/mock/reports";

export { MOCK_REPORTS };

export function getReports(): Report[] {
  if (typeof window === "undefined") return MOCK_REPORTS;
  try {
    const raw = localStorage.getItem("SSLM_REPORTS_V2");
    if (raw) {
      return JSON.parse(raw);
    }
    localStorage.setItem("SSLM_REPORTS_V2", JSON.stringify(MOCK_REPORTS));
  } catch (err) {
    console.error("Failed to load reports from storage", err);
  }
  return MOCK_REPORTS;
}

export function saveReports(reports: Report[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("SSLM_REPORTS_V2", JSON.stringify(reports));
  } catch (err) {
    console.error("Failed to save reports to storage", err);
  }
}

export function createOrUpdateReport(report: Report): void {
  const reports = getReports();
  const index = reports.findIndex((r) => r.id === report.id);
  if (index !== -1) {
    reports[index] = report;
  } else {
    reports.push(report);
  }
  saveReports(reports);
}

export function getReportById(id: string): Report | null {
  const reports = getReports();
  return reports.find((r) => r.id === id) || null;
}
