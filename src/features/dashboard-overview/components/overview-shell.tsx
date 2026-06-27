import React, { ReactNode } from "react";

interface OverviewShellProps {
  children: ReactNode;
}

export function OverviewShell({ children }: OverviewShellProps) {
  return (
    <div className="space-y-6">
      {children}
    </div>
  );
}
