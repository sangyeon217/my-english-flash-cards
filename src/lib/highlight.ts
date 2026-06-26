// 예문을 단어 출현 위치 기준으로 잘라 강조 렌더링에 쓰는 순수 함수.
// 컴포넌트와 분리되어 있어 단위 테스트가 쉽다.

export interface TextPart {
  text: string;
  match: boolean; // 강조 대상 여부
}

// 정규식 특수문자 이스케이프
function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * `text`를 `word`(대소문자 무시) 출현 위치로 분할한다.
 * 매치된 조각은 match=true 로 표시된다.
 * word 가 비어 있거나 발견되지 않으면 전체를 단일 비매치 조각으로 반환.
 */
export function splitByWord(text: string, word: string): TextPart[] {
  const target = word.trim();
  if (!target) return [{ text, match: false }];

  // 캡처 그룹으로 split 하면 매치된 부분도 결과 배열에 포함된다.
  const regex = new RegExp(`(${escapeRegExp(target)})`, "gi");
  const lower = target.toLowerCase();

  return text
    .split(regex)
    .filter((piece) => piece.length > 0)
    .map((piece) => ({ text: piece, match: piece.toLowerCase() === lower }));
}
