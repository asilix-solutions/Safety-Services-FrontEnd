export interface TimeSeriesDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface DashboardStats {
  activeProjects: number;
  pendingReviews: number;
  issuedLicenses: number;
  complianceRate: number;
  revenueTrend: TimeSeriesDataPoint[];
  categoryDistribution: { name: string; value: number }[];
}
