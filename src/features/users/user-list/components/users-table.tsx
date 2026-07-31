import React from "react";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { useTranslation } from "@/providers/i18n-provider";
import { EmptyState } from "@/shared/components/empty-state";
import { UserRow } from "../view-models/user-list.viewmodel";
import { ActivateDeactivateControl } from "./activate-deactivate-control";

interface UsersTableProps {
  rows: UserRow[];
  canManage: boolean;
  onActivate: (id: string) => Promise<unknown>;
  onDeactivate: (id: string) => Promise<unknown>;
  isBusy: boolean;
}

export function UsersTable({ rows, canManage, onActivate, onDeactivate, isBusy }: UsersTableProps) {
  const { t } = useTranslation();

  if (rows.length === 0) {
    return (
      <EmptyState title={t("users:table.empty_title")} description={t("users:table.empty_desc")} />
    );
  }

  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full border-collapse text-start text-xs text-foreground">
        <thead>
          <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
            <th className="p-4">{t("users:table.name")}</th>
            <th className="p-4">{t("users:table.role")}</th>
            <th className="p-4">{t("users:table.company")}</th>
            <th className="p-4">{t("users:table.status")}</th>
            {canManage && <th className="p-4">{t("users:table.actions")}</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-secondary/10 transition-colors">
              <td className="p-4 flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{row.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-semibold text-foreground block">{row.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{row.id}</span>
                </div>
              </td>
              <td className="p-4">
                <Badge variant="outline">{t(row.roleLabelKey)}</Badge>
              </td>
              <td className="p-4 text-muted-foreground">
                {row.companyName ?? t("users:table.no_company")}
              </td>
              <td className="p-4">
                <Badge variant={row.statusBadgeVariant}>{t(row.statusLabelKey)}</Badge>
              </td>
              {canManage && (
                <td className="p-4">
                  <ActivateDeactivateControl
                    row={row}
                    canManage={canManage}
                    onActivate={onActivate}
                    onDeactivate={onDeactivate}
                    isBusy={isBusy}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
