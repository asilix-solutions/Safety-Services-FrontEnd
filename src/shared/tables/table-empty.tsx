import React from "react";
import { useTranslation } from "@/providers/i18n-provider";

interface TableEmptyProps {
  columnsCount: number;
  message?: string;
  subMessage?: string;
}

export function TableEmpty({ columnsCount, message, subMessage }: TableEmptyProps) {
  const { t } = useTranslation();
  const emptyMessage = message || t("common:noRecords");
  const emptySubMessage = subMessage || t("common:noRecordsSubMessage");

  return (
    <tr>
      <td colSpan={columnsCount} className="p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-1.5">
          <p className="font-semibold text-muted-foreground text-sm">{emptyMessage}</p>
          <p className="text-xs text-muted-foreground/70">{emptySubMessage}</p>
        </div>
      </td>
    </tr>
  );
}

export default TableEmpty;
