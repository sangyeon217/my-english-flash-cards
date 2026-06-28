"use client";

import { useState } from "react";
import type { Card } from "@/types/card";
import { speak } from "@/lib/speech";
import { HighlightedText } from "./HighlightedText";

interface Props {
  card: Card;
  onToggleStatus: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (card: Card) => void;
  onRemove: (card: Card) => void;
}

// 앞면: 단어 + (강조된) 예문 / 뒷면: 뜻. 클릭하면 3D 뒤집힘.
export function FlashCard({
  card,
  onToggleStatus,
  onToggleFavorite,
  onEdit,
  onRemove,
}: Props) {
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
            <div className="flex items-baseline gap-2">
              <StatusToggle
                memorized={memorized}
                onToggle={() => onToggleStatus(card.id)}
              />
              <span className="text-xs text-slate-400">탭하여 뜻 보기</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(card.id);
                }}
                aria-label={card.favorite ? "즐겨찾기 해제" : "즐겨찾기"}
                aria-pressed={card.favorite}
                className={`rounded-md p-1.5 transition ${
                  card.favorite
                    ? "text-amber-400 hover:bg-amber-50"
                    : "text-slate-400 hover:bg-amber-50 hover:text-amber-400"
                }`}
              >
                <StarIcon filled={card.favorite} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(card);
                }}
                aria-label="수정"
                className="rounded-md p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
              >
                <PencilIcon />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(card);
                }}
                aria-label="삭제"
                className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              >
                <TrashIcon />
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                {card.word}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speak(card.word);
                }}
                aria-label="발음 듣기"
                className="rounded-md p-1.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
              >
                <SpeakerIcon />
              </button>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              <HighlightedText text={card.example} word={card.word} />
            </p>
          </div>
        </div>

        {/* ---------- 뒷면: 뜻 ---------- */}
        <div className="absolute inset-0 flex flex-col rounded-xl border border-slate-200 bg-slate-900 p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex items-start justify-between">
            <div className="flex items-baseline gap-2">
              <StatusToggle
                memorized={memorized}
                onToggle={() => onToggleStatus(card.id)}
              />
              <span className="text-xs text-slate-400">탭하여 단어로</span>
            </div>
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

// 즐겨찾기 버튼용 별 아이콘. filled 면 채워서(즐겨찾기 상태), 아니면 외곽선만.
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2Z" />
    </svg>
  );
}

// 발음 버튼용 스피커 아이콘 (인라인 SVG — 프로젝트에 아이콘 라이브러리 없음).
function SpeakerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

// 수정 버튼용 연필 아이콘 (인라인 SVG — 프로젝트에 아이콘 라이브러리 없음).
function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

// 삭제 버튼용 휴지통 아이콘 (인라인 SVG — 프로젝트에 아이콘 라이브러리 없음).
function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
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

