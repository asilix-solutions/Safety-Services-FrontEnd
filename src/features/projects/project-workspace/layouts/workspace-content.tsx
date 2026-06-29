import React from "react";

interface WorkspaceContentProps {
  children: React.ReactNode;
}

export function WorkspaceContent({ children }: WorkspaceContentProps) {
  return <div className="space-y-6">{children}</div>;
}
