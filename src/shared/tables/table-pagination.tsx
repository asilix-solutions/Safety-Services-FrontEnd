"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "@/providers/i18n-provider";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
}

export function TablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}: TablePaginationProps) {
  const { t, dir } = useTranslation();
  const isRtl = dir === "rtl";

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground px-2">
      <div className="flex items-center gap-2">
        <span>{t("common:rowsPerPage")}</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded border border-border bg-card px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary text-xs font-semibold cursor-pointer text-foreground"
        >
          {[5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="ms-4">
          {t("common:showing")}{" "}
          {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}{" "}
          {t("common:to")}{" "}
          {Math.min(currentPage * pageSize, totalItems)}{" "}
          {t("common:of")}{" "}
          {totalItems}{" "}
          {t("common:entries")}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || isLoading}
        >
          <PrevIcon className="h-3.5 w-3.5 me-1" />
          {t("common:previous")}
        </Button>
        <span className="px-2 font-semibold">
          {t("common:page")} {currentPage} {t("common:of")} {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || isLoading}
        >
          {t("common:next")}
          <NextIcon className="h-3.5 w-3.5 ms-1" />
        </Button>
      </div>
    </div>
  );
}

export default TablePagination;
