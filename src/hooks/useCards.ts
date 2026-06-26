"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Card, CardStatus } from "@/types/card";
import { repository, type CardInput } from "@/lib/storage";

export type Filter = CardStatus | "all";

export interface FilterCounts {
  all: number;
  learning: number;
  memorized: number;
}

// 카드 목록 상태 + CRUD + 필터를 관리하는 훅.
// 저장소(repository)와 UI 사이를 연결한다.
export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("learning"); // 기본: 암기중

  useEffect(() => {
    let active = true;
    repository.getAll().then((loaded) => {
      if (!active) return;
      setCards(loaded);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const addCard = useCallback(async (input: CardInput) => {
    const card = await repository.add(input);
    setCards((prev) => [card, ...prev]);
  }, []);

  const toggleStatus = useCallback(
    async (id: string) => {
      const card = cards.find((c) => c.id === id);
      if (!card) return;
      const status: CardStatus =
        card.status === "learning" ? "memorized" : "learning";
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c)),
      );
      await repository.update(id, { status });
    },
    [cards],
  );

  const removeCard = useCallback(async (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    await repository.remove(id);
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? cards : cards.filter((c) => c.status === filter)),
    [cards, filter],
  );

  const counts: FilterCounts = useMemo(
    () => ({
      all: cards.length,
      learning: cards.filter((c) => c.status === "learning").length,
      memorized: cards.filter((c) => c.status === "memorized").length,
    }),
    [cards],
  );

  return {
    cards: filtered,
    loading,
    filter,
    setFilter,
    counts,
    addCard,
    toggleStatus,
    removeCard,
  };
}
