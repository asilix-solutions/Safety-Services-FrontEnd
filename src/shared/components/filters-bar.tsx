import React from "react";
import { cn } from "@/lib/utils";

interface FiltersBarProps {
  children: React.ReactNode;
  className?: string;
}

export function FiltersBar({ children, className }: FiltersBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm shadow-sm",
        className
      )}
    >
      <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {children}
      </div>
    </div>
  );
}
export default FiltersBar;
