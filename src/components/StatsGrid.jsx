import React from "react";
import Card from "./Card";

export default function StatsGrid({ items }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="p-3">
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#8e7e66]">
            {item.label}
          </div>
          <div className="mt-2 flex items-end justify-between gap-2">
            <div className="text-2xl font-bold text-[var(--ink)] app-title">{item.value}</div>
            <div className="rounded-lg bg-[#f1e2d2] px-2 py-1 text-[10px] font-semibold text-[#7f573e]">
              {item.note}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
