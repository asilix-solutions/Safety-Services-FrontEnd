"use client";

import { useAuth } from "@/providers/AuthProvider";
import { CompanyList } from "@/features/companies";

export default function CompaniesPage() {
  const { user } = useAuth();
  if (!user) return null;
  return <CompanyList />;
}
