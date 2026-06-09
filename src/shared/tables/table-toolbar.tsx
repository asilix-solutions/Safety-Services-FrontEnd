"use client";

import React from "react";
import { SearchInput } from "../components/search-input";
import { useTranslation } from "@/providers/i18n-provider";

interface TableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
}

export function TableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  actions,
}: TableToolbarProps) {
  const { t } = useTranslation();
  const placeholderText = searchPlaceholder || t("common:searchRecords");

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-1">
      <div className="w-full sm:max-w-xs">
        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder={placeholderText}
        />
      </div>
      {actions && (
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {actions}
        </div>
      )}
    </div>
  );
}

export default TableToolbar;
