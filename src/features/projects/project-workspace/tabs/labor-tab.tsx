import React from "react";
import { HardHat } from "lucide-react";
import { EmptyState } from "@/shared/components/empty-state";

interface LaborTabProps {
  t: (key: string) => string;
}

export function LaborTab({ t }: LaborTabProps) {
  return (
    <EmptyState
      icon={<HardHat />}
      title={t("projects:labor.title")}
      description={t("projects:labor.empty")}
    />
  );
}
