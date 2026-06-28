// Web Speech API 로 단어 발음을 읽어주는 client 전용 유틸.
// 별도 라이브러리 없이 브라우저 내장 speechSynthesis 만 사용한다.
// "use client" 컴포넌트에서만 호출할 것 (SSR 가드는 두지만 서버 호출은 의미 없음).

// speechSynthesis 사용 가능 여부. 버튼 노출/비활성 판단용.
export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// 품질 좋은 영어 음성 이름 (우선순위순). 플랫폼별 대표 음성.
// Chrome: Google US English / macOS: Samantha 등 / Windows·Edge: Microsoft Aria 등.
const PREFERRED_VOICE_NAMES = [
  "Google US English",
  "Microsoft Aria Online (Natural) - English (United States)",
  "Microsoft Zira",
  "Samantha",
  "Ava",
  "Allison",
  "Zoe",
  "Evan",
  "Susan",
];

// macOS 의 장난/저품질 음성 — 단어 발음용으로는 부적합하므로 제외한다.
const NOVELTY_VOICES = new Set([
  "Albert", "Bad News", "Bahh", "Bells", "Boing", "Bubbles", "Cellos",
  "Deranged", "Good News", "Hysterical", "Jester", "Junior", "Kathy",
  "Organ", "Pipe Organ", "Princess", "Ralph", "Trinoids", "Whisper",
  "Wobble", "Zarvox", "Bruce", "Fred", "Superstar", "Grandma", "Grandpa",
  "Reed", "Rocko", "Sandy", "Shelley", "Flo", "Eddy",
]);

// Chrome 등은 첫 getVoices() 호출 시 빈 배열을 반환하고 voiceschanged 이벤트 후 채워진다.
// 모듈 로드 시 한 번 구독해 캐시를 채워두면, 첫 클릭부터 좋은 음성이 잡힌다.
let cachedVoices: SpeechSynthesisVoice[] = [];
function refreshVoices() {
  if (isSpeechSupported()) cachedVoices = window.speechSynthesis.getVoices();
}
if (isSpeechSupported()) {
  refreshVoices();
  window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
}

// 사용 가능한 음성 중 영어 음성을 best-effort 로 고른다.
// 1) PREFERRED_VOICE_NAMES 우선  2) 장난 음성 제외한 en-US  3) 장난 음성 제외한 en
// 모두 실패하면 undefined → 호출부는 브라우저 기본 음성으로 폴백한다.
// 후속 성별 옵션은 이 함수에 gender 인자를 더하는 식으로 확장한다.
export function pickEnglishVoice(): SpeechSynthesisVoice | undefined {
  if (!isSpeechSupported()) return undefined;
  const voices = cachedVoices.length
    ? cachedVoices
    : window.speechSynthesis.getVoices();

  for (const name of PREFERRED_VOICE_NAMES) {
    const match = voices.find((v) => v.name === name);
    if (match) return match;
  }

  const isEnglish = (v: SpeechSynthesisVoice, prefix: string) =>
    v.lang.replace("_", "-").toLowerCase().startsWith(prefix) &&
    !NOVELTY_VOICES.has(v.name);

  return (
    voices.find((v) => isEnglish(v, "en-us")) ??
    voices.find((v) => isEnglish(v, "en"))
  );
}

// 주어진 텍스트를 영어로 읽어준다. 연타 시 이전 발화를 취소하고 새로 시작한다.
export function speak(
  text: string,
  opts: { voice?: SpeechSynthesisVoice; rate?: number } = {},
): void {
  if (!isSpeechSupported() || !text) return;
  const synth = window.speechSynthesis;
  // 이전 발화가 남아 있으면 취소해 큐 적체를 막는다.
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = opts.rate ?? 0.95;
  const voice = opts.voice ?? pickEnglishVoice();
  if (voice) utterance.voice = voice;

  synth.speak(utterance);
}
