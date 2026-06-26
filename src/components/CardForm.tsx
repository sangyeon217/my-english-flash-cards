"use client";

import { useState } from "react";
import type { CardInput } from "@/lib/storage";
import { HighlightedText } from "./HighlightedText";

interface Props {
  open: boolean;
  // 값이 있으면 수정 모드, 없으면 추가 모드.
  initial?: CardInput;
  onClose: () => void;
  onSubmit: (input: CardInput) => Promise<void>;
}

// 단어 추가/수정 공용 모달. initial 이 주어지면 수정 모드로 동작한다.
export function CardForm({ open, initial, onClose, onSubmit }: Props) {
  const editing = initial != null;
  const [word, setWord] = useState(initial?.word ?? "");
  const [meaning, setMeaning] = useState(initial?.meaning ?? "");
  const [example, setExample] = useState(initial?.example ?? "");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const valid = word.trim() && meaning.trim() && example.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    await onSubmit({ word, meaning, example });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      {/* 입력 내용 유실 방지를 위해 오버레이 클릭으로는 닫지 않는다. */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          {editing ? "단어 수정" : "단어 추가"}
        </h2>

        <Field label="영어 단어">
          <input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="resilient"
            autoFocus
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
          />
        </Field>

        <Field label="뜻">
          <input
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            placeholder="회복력 있는, 탄력 있는"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
          />
        </Field>

        <Field label="예문 (원서 인용)">
          <textarea
            value={example}
            onChange={(e) => setExample(e.target.value)}
            placeholder="Children are remarkably resilient and recover quickly..."
            rows={3}
            className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
          />
        </Field>

        {/* 강조 미리보기 */}
        {example.trim() && word.trim() && (
          <div className="mb-4 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <span className="mb-1 block text-xs text-slate-400">미리보기</span>
            <HighlightedText text={example} word={word} />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!valid || submitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {editing ? "저장" : "추가"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
