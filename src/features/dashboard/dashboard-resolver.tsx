"use client";

import React from "react";
import { useAuth } from "@/providers/AuthProvider";
import { SuperAdminDashboard } from "./super-admin-dashboard";
import { CompanyAdminDashboard } from "./company-admin-dashboard";
import { ConsultingEngineerDashboard } from "./consulting-engineer-dashboard";
import { OperationsOfficerDashboard } from "./operations-officer-dashboard";
import { SalesAgentDashboard } from "./sales-agent-dashboard";
import { ClientDashboard } from "./client-dashboard";

export function DashboardResolver() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case "Super Admin":
      return <SuperAdminDashboard />;
    case "Company Admin":
      return <CompanyAdminDashboard />;
    case "Consulting Engineer":
      return <ConsultingEngineerDashboard />;
    case "Operations Officer":
      return <OperationsOfficerDashboard />;
    case "Sales Agent":
      return <SalesAgentDashboard />;
    case "Client":
      return <ClientDashboard />;
    default:
      return (
        <div className="p-6 text-center text-muted-foreground">
          Dashboard not configured for role: {user.role}
        </div>
      );
  }
}
export default DashboardResolver;
