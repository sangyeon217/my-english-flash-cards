"use client";

import { useState } from "react";
import type { Card } from "@/types/card";
import { useCards } from "@/hooks/useCards";
import { FlashCard } from "@/components/FlashCard";
import { FilterTabs } from "@/components/FilterTabs";
import { CardForm } from "@/components/CardForm";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function Home() {
  const {
    cards,
    loading,
    filter,
    setFilter,
    counts,
    addCard,
    editCard,
    toggleStatus,
    removeCard,
  } = useCards();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Card | null>(null);
  const [deleting, setDeleting] = useState<Card | null>(null);

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
              onEdit={setEditing}
              onRemove={setDeleting}
            />
          ))}
        </div>
      )}

      {/* 추가 모달 — open 토글 시 key 로 remount 해 입력값을 초기화한다. */}
      <CardForm
        key={formOpen ? "add-open" : "add-closed"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={addCard}
      />

      {/* 수정 모달 — 대상 카드를 key 로 써서 카드별로 폼을 새로 채운다. */}
      <CardForm
        key={editing ? `edit-${editing.id}` : "edit-closed"}
        open={editing != null}
        initial={
          editing
            ? {
                word: editing.word,
                meaning: editing.meaning,
                example: editing.example,
              }
            : undefined
        }
        onClose={() => setEditing(null)}
        onSubmit={(input) => editCard(editing!.id, input)}
      />

      {/* 삭제 확인 모달 — 확인을 눌러야 실제로 삭제한다. */}
      <ConfirmDialog
        open={deleting != null}
        title="정말 삭제하시겠습니까?"
        message={
          deleting
            ? `"${deleting.word}" 단어를 삭제합니다. 이 동작은 되돌릴 수 없습니다.`
            : undefined
        }
        confirmLabel="삭제"
        onConfirm={() => {
          if (deleting) removeCard(deleting.id);
          setDeleting(null);
        }}
        onClose={() => setDeleting(null)}
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
