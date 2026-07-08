import React from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { EmptyState } from "@/shared/components/empty-state";
import { Construction } from "lucide-react";

interface PlaceholderWidgetCardProps {
  titleKey: string;
  descriptionKey: string;
  t: (key: string) => string;
}

/** Renders an empty-state placeholder for a role-relevant widget whose backing data isn't built yet (P3). */
export function PlaceholderWidgetCard({ titleKey, descriptionKey, t }: PlaceholderWidgetCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-0">
        <EmptyState title={t(titleKey)} description={t(descriptionKey)} icon={<Construction className="h-5 w-5" />} />
      </CardContent>
    </Card>
  );
}
