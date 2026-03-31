"use client";

import { Pagination, Skeleton } from "antd";
import type { ReactNode } from "react";

type SkeletonColumn = {
  key?: string;
  title: ReactNode;
};

type TableSkeletonProps = {
  columns: SkeletonColumn[];
  rowCount?: number;
  showPagination?: boolean;
  className?: string;
};

export function TableSkeleton({
  columns,
  rowCount = 10,
  showPagination = true,
  className = "",
}: TableSkeletonProps) {
  const gridTemplateColumns = `repeat(${Math.max(columns.length, 1)}, minmax(0, 1fr))`;

  return (
    <div className={className}>
      <div className="admin-pages-table overflow-hidden rounded-[10px] border border-border">
        <div
          className="grid border-b border-border bg-chat-sidebar-bg px-4 py-3 text-sm font-semibold"
          style={{ gridTemplateColumns }}
        >
          {columns.map((col, index) => (
            <span key={col.key ?? `col-${index}`}>{col.title}</span>
          ))}
        </div>

        <div className="divide-y divide-border bg-chat-input-bg">
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className="grid items-center gap-3 px-4 py-3"
              style={{ gridTemplateColumns }}
            >
              {columns.map((col, colIndex) => {
                const widthPresets = ["70%", "85%", "60%", "75%", "90%"];
                const width = widthPresets[colIndex % widthPresets.length];
                return (
                  <Skeleton.Input
                    key={col.key ?? `cell-${rowIndex}-${colIndex}`}
                    active
                    size="small"
                    style={{ width }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {showPagination ? (
        <div className="mt-4 flex justify-end">
          <Pagination total={rowCount} pageSize={rowCount} disabled />
        </div>
      ) : null}
    </div>
  );
}
