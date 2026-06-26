import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// 카드 암기 상태 enum (src/types/card.ts 의 CardStatus 와 동일 집합)
export const cardStatus = pgEnum("card_status", ["learning", "memorized"]);

// cards 테이블. 기존 Card 타입 계약을 그대로 보존한다.
// (createdAt 은 timestamp 로 저장하고 데이터 계층에서 epoch ms 로 매핑)
export const cards = pgTable("cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  word: text("word").notNull(),
  meaning: text("meaning").notNull(),
  example: text("example").notNull(),
  status: cardStatus("status").notNull().default("learning"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
