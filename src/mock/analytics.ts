import { DashboardStats } from "@/types/analytics";

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  activeProjects: 148,
  pendingReviews: 29,
  issuedLicenses: 1204,
  complianceRate: 96.8,
  revenueTrend: [
    { label: "Jan", value: 45000, secondaryValue: 85 },
    { label: "Feb", value: 58000, secondaryValue: 88 },
    { label: "Mar", value: 69000, secondaryValue: 91 },
    { label: "Apr", value: 81000, secondaryValue: 94 },
    { label: "May", value: 95000, secondaryValue: 96 },
    { label: "Jun", value: 112000, secondaryValue: 98 },
  ],
  categoryDistribution: [
    { name: "Fire Safety", value: 400 },
    { name: "Structural", value: 300 },
    { name: "Electrical", value: 300 },
    { name: "Mechanical", value: 200 },
    { name: "Plumbing", value: 100 },
  ],
};
