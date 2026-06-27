import "server-only";
import { desc, eq } from "drizzle-orm";
import type { Card } from "@/types/card";
import type { CardInput } from "@/lib/storage";
import { db } from "./index";
import { cards } from "./schema";

type Row = typeof cards.$inferSelect;

// DB 가 갱신할 수 있는 필드만 허용 (id/createdAt 제외)
export type CardUpdate = Partial<
  Pick<Card, "word" | "meaning" | "example" | "status" | "favorite">
>;

function toCard(row: Row): Card {
  return {
    id: row.id,
    word: row.word,
    meaning: row.meaning,
    example: row.example,
    status: row.status,
    favorite: row.favorite,
    createdAt: row.createdAt.getTime(),
  };
}

export async function getAllCards(): Promise<Card[]> {
  // 즐겨찾기를 먼저, 그 안에서는 최신순으로 정렬한다.
  const rows = await db
    .select()
    .from(cards)
    .orderBy(desc(cards.favorite), desc(cards.createdAt));
  return rows.map(toCard);
}

export async function createCard(input: CardInput): Promise<Card> {
  const [row] = await db
    .insert(cards)
    .values({
      word: input.word.trim(),
      meaning: input.meaning.trim(),
      example: input.example.trim(),
    })
    .returning();
  return toCard(row);
}

export async function updateCard(id: string, patch: CardUpdate): Promise<Card> {
  const [row] = await db
    .update(cards)
    .set(patch)
    .where(eq(cards.id, id))
    .returning();
  if (!row) throw new Error(`Card not found: ${id}`);
  return toCard(row);
}

export async function deleteCard(id: string): Promise<void> {
  await db.delete(cards).where(eq(cards.id, id));
}
