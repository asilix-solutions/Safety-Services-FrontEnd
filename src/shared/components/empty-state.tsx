import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  compact?: boolean;
}

export function EmptyState({ title, description, actionLabel, onAction, icon, compact = false }: EmptyStateProps) {
  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center p-2 text-center w-full min-h-[80px] flex-1">
        <div className="mx-auto flex items-center justify-center text-muted-foreground/60 mb-1.5">
          {icon && React.isValidElement(icon) ? (
            React.cloneElement(icon as React.ReactElement<any>, { className: "h-5 w-5 shrink-0" })
          ) : (
            <FolderOpen className="h-5 w-5 shrink-0" />
          )}
        </div>
        <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border/80 bg-card/40 backdrop-blur-sm min-h-[300px]">
      <div className="mx-auto h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-4">
        {icon || <FolderOpen className="h-6 w-6" />}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
export default EmptyState;
