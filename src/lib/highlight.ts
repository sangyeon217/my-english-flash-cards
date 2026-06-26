// 예문을 단어 출현 위치 기준으로 잘라 강조 렌더링에 쓰는 함수.
// 굴절형(-s/-ed/-ing/-ies, 불규칙형 swept 등)도 전체 토큰을 매치하기 위해
// compromise(nlp)로 기준 단어의 활용형을 생성한다.

import nlp from "compromise";

export interface TextPart {
  text: string;
  match: boolean; // 강조 대상 여부
}

// 정규식 특수문자 이스케이프
function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// 사전식 표제어에서 자리표시자로 쓰여 예문엔 실제 단어로 대체되는 토큰 — 매치에서 제외한다.
// 관용구에서 실제 단어로 쓰일 수 있는 흔한 말(it/that 등)은 일부러 넣지 않는다.
const PLACEHOLDERS = new Set([
  "somebody",
  "someone",
  "something",
  "one's",
  "sb",
  "sth",
]);

/**
 * 한 단어의 굴절형 표면형 집합을 만든다.
 * compromise 로 동사 활용(불규칙 포함)과 명사 단/복수를 생성하고, 원형도 포함한다.
 * 예문에 실제로 등장할 때만 매치되므로 과생성은 무해하다.
 */
function inflectedForms(word: string): string[] {
  const base = word.toLowerCase().trim();
  if (!base) return [];
  const forms = new Set<string>([base]);

  // tag() 는 문서를 in-place 로 갱신한다 — 강제 태깅 후 활용형을 뽑으면
  // 동사/명사로 인식되지 않는 단어도 굴절형을 생성할 수 있다.
  const verbDoc = nlp(base);
  verbDoc.tag("Verb");
  const [conjugation] = verbDoc.verbs().conjugate();
  if (conjugation) {
    for (const value of Object.values(conjugation)) {
      // "will sweep" 같은 다중 토큰(미래형 등)은 제외
      if (value && !/\s/.test(value)) forms.add(value.toLowerCase());
    }
  }

  for (const toForm of ["toPlural", "toSingular"] as const) {
    const nounDoc = nlp(base);
    nounDoc.tag("Noun");
    const noun = nounDoc.nouns()[toForm]().text();
    if (noun && !/\s/.test(noun)) forms.add(noun.toLowerCase());
  }

  return [...forms].filter(Boolean);
}

// 굴절형 대안 패턴 — 긴 표면형을 먼저 두어 최장 일치를 보장한다.
function formsAlternation(token: string): string {
  return inflectedForms(token)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|");
}

// 단어/구를 굴절형까지 매치하는 정규식을 만든다(전역, 대소문자 무시).
function buildMatcher(word: string): RegExp {
  const target = word.trim();

  // 구(공백 포함): 정확 일치를 먼저 시도하고, 안 되면 자리표시자를 건너뛰고
  // 각 토큰을 굴절형으로, 토큰 사이엔 최대 2개의 filler 단어를 허용해 매치한다.
  if (/\s/.test(target)) {
    const exact = escapeRegExp(target);
    const tokens = target
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => !PLACEHOLDERS.has(t));
    const lenient = tokens
      .map((t) => `(?:${formsAlternation(t)})`)
      .join("(?:\\s+\\w+){0,2}\\s+");
    return new RegExp(`(${exact}|${lenient})`, "gi");
  }

  return new RegExp(`\\b(${formsAlternation(target)})\\b`, "gi");
}

/**
 * `text`를 `word`의 출현 위치(굴절형 포함, 대소문자 무시)로 분할한다.
 * 매치된 조각은 match=true 로 표시된다.
 * word 가 비어 있거나 발견되지 않으면 전체를 단일 비매치 조각으로 반환.
 */
export function splitByWord(text: string, word: string): TextPart[] {
  if (!word.trim()) return [{ text, match: false }];

  const parts: TextPart[] = [];
  let cursor = 0;
  for (const m of text.matchAll(buildMatcher(word))) {
    const start = m.index ?? 0;
    const matched = m[0];
    if (!matched) continue; // 빈 매치 방어
    if (start > cursor) parts.push({ text: text.slice(cursor, start), match: false });
    parts.push({ text: matched, match: true });
    cursor = start + matched.length;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false });

  return parts.length > 0 ? parts : [{ text, match: false }];
}
