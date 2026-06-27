// 카드의 암기 상태: 암기중(learning) / 암기완료(memorized)
export type CardStatus = "learning" | "memorized";

export interface Card {
  id: string; // crypto.randomUUID()
  word: string; // 영어 단어
  meaning: string; // 뜻 (한국어)
  example: string; // 원서에서 인용한 예문
  status: CardStatus;
  favorite: boolean; // 즐겨찾기 여부 (즐겨찾기는 목록 상단에 우선 정렬)
  createdAt: number; // Date.now()
}
