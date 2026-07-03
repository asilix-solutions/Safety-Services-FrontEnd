import React from "react";
import { useTranslation } from "@/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Textarea } from "@/shared/ui/textarea";

interface EngineeringNotesCardProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function EngineeringNotesCard({ value, onChange, disabled }: EngineeringNotesCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-foreground">
          {t("requests:blueprintReview.workspace.engineeringNotes")}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {t("requests:blueprintReview.workspace.engineeringNotesDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={8}
          placeholder={t("requests:blueprintReview.workspace.engineeringNotesPlaceholder")}
          className="bg-background border-border text-foreground text-xs resize-y min-h-[160px]"
        />
      </CardContent>
    </Card>
  );
}
