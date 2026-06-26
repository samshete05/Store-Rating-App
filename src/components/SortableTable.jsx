import React from "react";
import Card from "./Card";
import { formatRating } from "../utils/helpers";

function SortIcon({ active, direction }) {
  return (
    <span className="ml-2 text-[10px] font-bold text-[#9a8a72]">
      {active ? (direction === "asc" ? "▲" : "▼") : "↕"}
    </span>
  );
}

export default function SortableTable({
  title,
  description,
  columns,
  rows,
  sortConfig,
  onSort,
  emptyMessage = "No records found.",
  rowActions,
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-[#eadfcd] pb-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="app-title text-lg font-bold text-[var(--ink)]">{title}</h3>
          {description ? <p className="mt-1 text-[13px] text-[#7c705f]">{description}</p> : null}
        </div>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full divide-y divide-[#efe6d9] text-left">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`whitespace-nowrap px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a8a72] ${
                    column.sortable ? "cursor-pointer select-none hover:text-[#6f5f47]" : ""
                  }`}
                  onClick={column.sortable ? () => onSort(column.key) : undefined}
                >
                  <span className="inline-flex items-center">
                    {column.label}
                    {column.sortable ? (
                      <SortIcon
                        active={sortConfig.key === column.key}
                        direction={sortConfig.direction}
                      />
                    ) : null}
                  </span>
                </th>
              ))}
              {rowActions ? (
                <th className="whitespace-nowrap px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a8a72]">
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#efe6d9]">
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-[#f7f1e8]">
                  {columns.map((column) => (
                    <td key={column.key} className="whitespace-nowrap px-4 py-2.5 text-xs text-[#5f5444]">
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                  {rowActions ? (
                    <td className="whitespace-nowrap px-4 py-2.5 text-xs text-[#5f5444]">
                      {rowActions(row)}
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-4 py-3 text-center text-xs text-[#8b7d69]"
                  colSpan={columns.length + (rowActions ? 1 : 0)}
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function RatingPill({ value }) {
  return (
    <span className="inline-flex rounded-full bg-[#f4e4c6] px-2.5 py-1 text-[10px] font-semibold text-[#735320]">
      {formatRating(value)}
    </span>
  );
}
