"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useNamespaceTranslations } from "@/providers/i18n-provider";
import { CompanyList } from "@/features/companies";

export default function CompaniesPage() {
  const { user } = useAuth();
  useNamespaceTranslations(["common", "companies"]);

  if (!user) return null;
  return <CompanyList />;
}
