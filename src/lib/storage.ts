import type { Card } from "@/types/card";

// 카드 저장소 추상화 계층.
// 모든 메서드는 Promise 를 반환한다. 구현체는 Route Handler(/api/cards)를 통해
// DB 에 접근하는 apiRepository 다.

export interface CardInput {
  word: string;
  meaning: string;
  example: string;
}

export interface CardRepository {
  getAll(): Promise<Card[]>;
  add(input: CardInput): Promise<Card>;
  update(id: string, patch: Partial<Omit<Card, "id">>): Promise<Card>;
  remove(id: string): Promise<void>;
}

// --- API(Route Handler) 구현 ---

async function parse<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

export const apiRepository: CardRepository = {
  async getAll() {
    return parse<Card[]>(await fetch("/api/cards"));
  },

  async add(input) {
    return parse<Card>(
      await fetch("/api/cards", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(input),
      }),
    );
  },

  async update(id, patch) {
    return parse<Card>(
      await fetch(`/api/cards/${id}`, {
        method: "PATCH",
        headers: JSON_HEADERS,
        body: JSON.stringify(patch),
      }),
    );
  },

  async remove(id) {
    const res = await fetch(`/api/cards/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`API error ${res.status}`);
  },
};

// 저장소 교체 지점: 백엔드 연동이 필요하면 이 한 줄을 다른 구현체로 교체한다.
export const repository: CardRepository = apiRepository;
