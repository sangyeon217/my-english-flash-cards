"use client";

import { useState } from "react";
import type { Card } from "@/types/card";
import { HighlightedText } from "./HighlightedText";

interface Props {
  card: Card;
  onToggleStatus: (id: string) => void;
  onRemove: (id: string) => void;
}

// 앞면: 단어 + (강조된) 예문 / 뒷면: 뜻. 클릭하면 3D 뒤집힘.
export function FlashCard({ card, onToggleStatus, onRemove }: Props) {
  const [flipped, setFlipped] = useState(false);
  const memorized = card.status === "memorized";

  return (
    <div className="h-64 w-full [perspective:1000px]">
      <div
        onClick={() => setFlipped((f) => !f)}
        className={`relative h-full w-full cursor-pointer rounded-xl shadow-md transition-transform duration-500 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* ---------- 앞면: 단어 + 예문 ---------- */}
        <div className="absolute inset-0 flex flex-col rounded-xl border border-slate-200 bg-white p-5 [backface-visibility:hidden]">
          <div className="flex items-start justify-between">
            <StatusToggle
              memorized={memorized}
              onToggle={() => onToggleStatus(card.id)}
            />
            <span className="text-xs text-slate-400">탭하여 뜻 보기</span>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-3">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              {card.word}
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              <HighlightedText text={card.example} word={card.word} />
            </p>
          </div>

          <div className="flex items-center justify-end border-t border-slate-100 pt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(card.id);
              }}
              aria-label="삭제"
              className="rounded-md px-2 py-1.5 text-xs text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            >
              삭제
            </button>
          </div>
        </div>

        {/* ---------- 뒷면: 뜻 ---------- */}
        <div className="absolute inset-0 flex flex-col rounded-xl border border-slate-200 bg-slate-900 p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex items-start justify-between">
            <StatusToggle
              memorized={memorized}
              onToggle={() => onToggleStatus(card.id)}
            />
            <span className="text-xs text-slate-400">탭하여 단어로</span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <span className="mb-2 text-xs uppercase tracking-wider text-slate-400">
              {card.word}
            </span>
            <p className="text-xl font-semibold text-white">{card.meaning}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 상태 표시 + 토글을 겸하는 배지. 클릭/탭하면 상태 전환, 호버하면 동작 툴팁 표시.
function StatusToggle({
  memorized,
  onToggle,
}: {
  memorized: boolean;
  onToggle: () => void;
}) {
  const action = memorized ? "암기중으로 되돌리기" : "암기완료로 표시";
  return (
    <span className="group relative inline-block">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label={action}
        className={`cursor-pointer rounded-full px-2 py-0.5 text-xs font-medium transition ${
          memorized
            ? "bg-slate-100 text-slate-500 hover:bg-slate-200"
            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
        }`}
      >
        {memorized ? "암기완료" : "암기중"}
      </button>
      <span className="pointer-events-none absolute bottom-full left-0 z-10 mb-1 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 shadow transition-opacity duration-150 group-hover:opacity-100">
        {action}
      </span>
    </span>
  );
}

