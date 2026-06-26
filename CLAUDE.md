# CLAUDE.md

이 파일은 이 저장소에서 작업할 때 Claude Code(claude.ai/code)에게 주는 지침이다.

> **이건 당신이 아는 Next.js 가 아니다.** 이 버전(Next 16)은 breaking change 가 있어
> API·컨벤션·파일 구조가 학습 데이터와 다를 수 있다. 코드를 작성하기 전에
> `node_modules/next/dist/docs/` 의 관련 가이드를 읽고, deprecation 공지를 준수할 것.
> (원래 create-next-app 이 주입한 `AGENTS.md` 의 내용을 여기로 통합함.)

## 명령어

```bash
npm run dev      # 개발 서버 (Turbopack) — http://localhost:3000
npm run build    # 프로덕션 빌드; 전체 TypeScript 타입체크도 함께 수행
npm run lint     # ESLint (eslint-config-next)

npx drizzle-kit push      # src/lib/db/schema.ts 를 Neon DB 에 적용
npx drizzle-kit generate  # (선택) SQL 마이그레이션 파일을 ./drizzle 로 생성
```

`.env.local` 필요 (`.env.example` 복사): `DATABASE_URL` (Neon Postgres),
`ACCESS_PASSWORD` (8자 이상 — 앱 게이트 비밀번호), `SESSION_SECRET` (32자 이상 —
iron-session). `src/lib/env.ts` 가 zod 로 이를 검증하며 **하나라도 없으면 부팅 시 throw**
하므로, `npm run build` 에도 값이 설정돼 있어야 한다 (순수 타입체크용이면 더미 값으로 충분.
`drizzle-kit push` 는 `drizzle.config.ts` 를 통해 `.env.local` 을 읽는다).

테스트 러너는 설정돼 있지 않다. `src/lib/highlight.ts` 는 import 가 없는 순수 함수라,
Node 26 의 네이티브 TypeScript 지원으로 직접 실행할 수 있다: 절대 경로로 `.ts` 파일을
import 하는 `node test.mjs`.

## 아키텍처

영어 단어 암기용 Next.js 16 (App Router) 플래시카드 앱. 카드는 **Neon Postgres**(Drizzle
경유)에 저장되고, 앱 전체는 단일 **비밀번호 게이트**(iron-session) 뒤에 있다. 카드 UI 는
하나의 client 렌더 페이지다.

**데이터는 한 방향으로 흐른다: DB → Route Handlers → `repository` → `useCards` → 컴포넌트.**
카드는 *client* 훅에서 소비되므로 repository 는 DB 에 직접 접근할 수 없고, Route Handler 를
거쳐 HTTP 로 접근한다.

- **`src/lib/storage.ts` — 교체 지점.** 모든 영속화는 async `CardRepository` 인터페이스
  (`getAll/add/update/remove`)를 거친다. 구현체는 `apiRepository` 로, `/api/cards` Route
  Handler 를 `fetch` 한다 (same-origin 이라 세션 쿠키가 자동 전송됨). export 된 `repository`
  const 가 다른 백엔드로 바꿀 때 손대는 단 한 줄이다. `CardInput`(word/meaning/example)은
  사용자가 입력하는 부분집합.

- **`src/lib/db/` — 데이터베이스 계층 (`server-only`).** `schema.ts` 가 `cards` 테이블을
  정의 (uuid PK `defaultRandom`, `card_status` pgEnum, `created_at` timestamptz);
  `index.ts` 는 neon-http Drizzle 클라이언트; `cards.ts` 는 `getAllCards / createCard /
  updateCard / deleteCard` 를 담고 행 → `Card` 로 매핑한다 — 특히 `created_at` → epoch ms
  로 변환해 `Card.createdAt: number` 계약을 보존한다. `drizzle.config.ts`(루트)가
  `drizzle-kit push` 를 구동한다.

- **`src/app/api/` — Route Handlers.** `cards/route.ts`(GET/POST)와
  `cards/[id]/route.ts`(PATCH/DELETE) — 모든 핸들러는 `isAuthenticated(await getSession())`
  이 아니면 401, PATCH 는 body 를 허용된 필드 부분집합으로 정규화한다. `login/route.ts`
  (`ACCESS_PASSWORD` 와 상수시간 `timingSafeEqual` 비교 + 인메모리 rate-limit)와
  `logout/route.ts` 가 세션을 관리한다.

- **인증 — `src/lib/{env,session,rate-limit}.ts` + `src/proxy.ts`.** iron-session 단일
  비밀번호 게이트. **Next 16 은 Middleware 를 Proxy 로 개명**: `src/proxy.ts`(matcher
  `["/"]`)는 `/login` 으로의 *optimistic* 리다이렉트일 뿐이다. 실제 enforcement 는
  `src/app/(protected)/layout.tsx`(서버 측 리다이렉트)와 API 401 에 있다 — 방어 심층화.
  그 레이아웃은 children 위에 sticky `src/components/Header.tsx`(브랜드 마크 + ghost
  로그아웃 버튼)도 렌더한다. 홈 페이지는 `src/app/(protected)/page.tsx`(`(protected)`
  라우트 그룹이라 `/` 에서 서빙됨); `src/app/login/` 이 게이트.

- **`src/hooks/useCards.ts` — 유일한 상태 소유자.** `useEffect` 에서 카드를 로드하고,
  목록 + `learning | memorized | all` 필터(기본 `learning`)를 보유하며, 모든 mutation 을
  감싼다 (낙관적 React 상태 업데이트 *및* repository 호출). 홈 페이지가 유일한 소비자이고,
  그 아래 컴포넌트들은 표현용이며 콜백을 받는다.

- **`src/lib/highlight.ts` + `HighlightedText.tsx` — 단어 강조.** `splitByWord`(순수,
  정규식 이스케이프, 대소문자 무시, 무손실 재조합)가 예문을 카드 단어의 등장 위치 기준으로
  쪼개고, `HighlightedText` 가 매치를 `<mark>` 로 감싼다. 자동 강조는 부분 문자열 기반이라
  의도적으로 굴절형은 매치하지 않는다 (run → running).

- **`src/components/FlashCard.tsx`** — 클릭 시 앞면(단어 + 강조 예문) ↔ 뒷면(뜻) 뒤집힘.
  3D 플립은 커스텀 유틸리티가 아니라 **Tailwind v4 arbitrary CSS**(`[perspective:1000px]`,
  `[transform-style:preserve-3d]`, `[transform:rotateY(180deg)]`,
  `[backface-visibility:hidden]`)를 쓴다. 카드 내부 액션 버튼은 `e.stopPropagation()` 을
  호출해 플립이 트리거되지 않게 한다.

## 컨벤션

- Tailwind **v4** (`globals.css` 의 `@import "tailwindcss"` 를 통한 CSS 기반 설정;
  `tailwind.config.js` 없음). 라이트 테마 전용 — 카드 UI 가 밝은 표면을 전제하므로 기본
  다크 `prefers-color-scheme` 블록은 제거됐다. `globals.css` 에는 활성 버튼의
  `cursor: pointer` 를 복원하는 base 규칙도 있다 (v4 preflight 가 기본을 `default` 로 둠).
- 브랜드 마크는 동기화가 필요한 두 곳에 존재한다: favicon `src/app/icon.svg`(정적 파일
  컨벤션)와 `src/components/Header.tsx` 안의 인라인 `BrandMark` SVG (정적 파일은 React
  컴포넌트가 될 수 없어서 생기는 중복).
- 경로 별칭 `@/*` → `src/*`.
- `Card` 스키마(`src/types/card.ts`)는 DB 계층·storage·UI 가 공유하는 계약이다.
  `CardInput`(word/meaning/example)은 사용자 입력 부분집합; `id`(uuid),
  `status`(기본 `learning`), `createdAt` 은 insert 시 DB 가 채우고 `src/lib/db/cards.ts`
  에서 `Card` 로 매핑된다.
- server-only 모듈(`src/lib/db/*`, `src/lib/session.ts`, `src/lib/rate-limit.ts`)은
  `import "server-only"` 로 시작한다; client 컴포넌트로 절대 import 하지 말 것.
- UI 문구는 한국어; `<html lang="ko">`.
