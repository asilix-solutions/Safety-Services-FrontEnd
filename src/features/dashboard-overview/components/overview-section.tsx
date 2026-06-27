import React, { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

interface OverviewSectionProps {
  title: ReactNode;
  description?: ReactNode;
  actionButton?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function OverviewSection({
  title,
  description,
  actionButton,
  children,
  className = "border-border bg-card shadow-sm h-full flex flex-col",
  contentClassName = "flex-1 p-6 pt-0 flex flex-col justify-start space-y-3",
}: OverviewSectionProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
        <div className="space-y-1.5 min-w-0">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 flex-wrap">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-xs text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </div>
        {actionButton && <div className="shrink-0">{actionButton}</div>}
      </CardHeader>
      <CardContent className={contentClassName}>
        {children}
      </CardContent>
    </Card>
  );
}
export default OverviewSection;
