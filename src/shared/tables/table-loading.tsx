import React from "react";

interface TableLoadingProps {
  columnsCount: number;
  rowsCount?: number;
}

export function TableLoading({ columnsCount, rowsCount = 5 }: TableLoadingProps) {
  return (
    <>
      {Array.from({ length: rowsCount }).map((_, rIdx) => (
        <tr key={rIdx} className="border-b border-border last:border-0">
          {Array.from({ length: columnsCount }).map((_, cIdx) => (
            <td key={cIdx} className="p-4">
              <div className="h-4 w-full animate-pulse rounded bg-secondary" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
export default TableLoading;
