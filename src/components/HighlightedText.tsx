import { splitByWord } from "@/lib/highlight";

interface Props {
  text: string;
  word: string;
}

// 예문(text) 안에서 단어(word)를 자동으로 강조해 렌더링한다.
export function HighlightedText({ text, word }: Props) {
  const parts = splitByWord(text, word);
  return (
    <span>
      {parts.map((part, i) =>
        part.match ? (
          <mark
            key={i}
            className="rounded bg-yellow-200 px-0.5 font-semibold text-slate-900"
          >
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </span>
  );
}
