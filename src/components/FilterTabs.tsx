"use client";

import type { Filter, FilterCounts } from "@/hooks/useCards";

interface Props {
  filter: Filter;
  counts: FilterCounts;
  onChange: (filter: Filter) => void;
}

const TABS: { key: Filter; label: string }[] = [
  { key: "learning", label: "암기중" },
  { key: "memorized", label: "암기완료" },
  { key: "all", label: "전체" },
];

export function FilterTabs({ filter, counts, onChange }: Props) {
  return (
    <div className="inline-flex gap-1 rounded-lg bg-slate-100 p-1">
      {TABS.map((tab) => {
        const active = filter === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              active
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
            <span
              className={`ml-1.5 text-xs ${
                active ? "text-slate-400" : "text-slate-400"
              }`}
            >
              {counts[tab.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
