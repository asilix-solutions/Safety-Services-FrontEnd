"use client";

import React, { useState, useMemo } from "react";
import { SlidersHorizontal } from "lucide-react";
import { TableToolbar } from "./table-toolbar";
import { TablePagination } from "./table-pagination";
import { TableLoading } from "./table-loading";
import { TableEmpty } from "./table-empty";

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchKey?: keyof T;
  actions?: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  searchPlaceholder,
  searchKey,
  actions,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: "asc" | "desc" } | null>(null);

  // Handle sorting toggles
  const handleSort = (key: keyof T) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Local data filter
  const filteredData = useMemo(() => {
    if (!searchTerm || !searchKey) return data;

    return data.filter((item) => {
      const val = item[searchKey];
      if (val === undefined || val === null) return false;
      return String(val).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm, searchKey]);

  // Local data sorting
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    const { key, direction } = sortConfig;
    return [...filteredData].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination totals
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Sync index out of bounds
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  return (
    <div className="space-y-4">
      {/* Search & Actions Toolbar */}
      {searchKey && (
        <TableToolbar
          searchValue={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          searchPlaceholder={searchPlaceholder}
          actions={actions}
        />
      )}

      {/* Primary Table View */}
      <div className="overflow-x-auto rounded-xl border border-border/80 bg-card">
        <table className="w-full border-collapse text-left text-sm text-foreground">
          <thead>
            <tr className="border-b border-border bg-secondary/50 text-muted-foreground font-medium">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`p-4 font-semibold select-none ${
                    col.sortable && col.accessorKey ? "cursor-pointer hover:text-foreground" : ""
                  }`}
                  onClick={() => col.sortable && col.accessorKey && handleSort(col.accessorKey)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && col.accessorKey && (
                      <SlidersHorizontal className="h-3.5 w-3.5 opacity-60" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableLoading columnsCount={columns.length} rowsCount={pageSize} />
            ) : paginatedData.length === 0 ? (
              <TableEmpty columnsCount={columns.length} />
            ) : (
              paginatedData.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="border-b border-border/70 hover:bg-secondary/20 transition-colors last:border-0"
                >
                  {columns.map((col, cIdx) => {
                    const value = col.accessorKey ? row[col.accessorKey] : undefined;
                    return (
                      <td key={cIdx} className="p-4 font-medium text-muted-foreground/90">
                        {col.render ? col.render(row) : value !== undefined ? String(value) : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controller */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        isLoading={isLoading}
      />
    </div>
  );
}
export default DataTable;
