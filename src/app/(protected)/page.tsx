"use client";

import { useState } from "react";
import { useCards } from "@/hooks/useCards";
import { FlashCard } from "@/components/FlashCard";
import { FilterTabs } from "@/components/FilterTabs";
import { AddCardForm } from "@/components/AddCardForm";

export default function Home() {
  const {
    cards,
    loading,
    filter,
    setFilter,
    counts,
    addCard,
    toggleStatus,
    removeCard,
  } = useCards();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <FilterTabs filter={filter} counts={counts} onChange={setFilter} />
        <button
          onClick={() => setFormOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          + 단어 추가
        </button>
      </div>

      {loading ? (
        <p className="py-20 text-center text-sm text-slate-400">불러오는 중…</p>
      ) : cards.length === 0 ? (
        <EmptyState filter={filter} onAdd={() => setFormOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <FlashCard
              key={card.id}
              card={card}
              onToggleStatus={toggleStatus}
              onRemove={removeCard}
            />
          ))}
        </div>
      )}

      <AddCardForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onAdd={addCard}
      />
    </main>
  );
}

function EmptyState({ filter, onAdd }: { filter: string; onAdd: () => void }) {
  const message =
    filter === "memorized"
      ? "아직 암기완료한 단어가 없어요."
      : filter === "learning"
        ? "암기중인 단어가 없어요. 단어를 추가해보세요."
        : "저장된 단어가 없어요. 단어를 추가해보세요.";
  return (
    <div className="flex flex-col items-center gap-4 py-20">
      <p className="text-sm text-slate-400">{message}</p>
      <button
        onClick={onAdd}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
      >
        + 단어 추가
      </button>
    </div>
  );
}
