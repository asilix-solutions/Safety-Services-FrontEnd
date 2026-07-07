import React from "react";
import { ShoppingCart } from "lucide-react";
import { EmptyState } from "@/shared/components/empty-state";

interface ProcurementTabProps {
  t: (key: string) => string;
}

export function ProcurementTab({ t }: ProcurementTabProps) {
  return (
    <EmptyState
      icon={<ShoppingCart />}
      title={t("projects:procurement.title")}
      description={t("projects:procurement.empty")}
    />
  );
}
