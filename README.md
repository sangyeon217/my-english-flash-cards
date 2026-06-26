# My English Flash Cards

원서에서 인용한 예문과 함께 모르는 단어를 모아 반복 학습하는 플래시카드 앱.

- **앞면**: 단어 + 예문 (예문 속 단어는 자동 강조)
- **뒷면**: 뜻 (카드를 클릭하면 뒤집힘)
- **상태**: `암기중` / `암기완료` — 기본은 암기중만 표시, 필터로 전환
- 단어 추가/삭제, 상태 토글 지원

## 실행

```bash
npm install

# 1) 환경변수 설정: .env.example 을 복사해 값 채우기
cp .env.example .env.local
#   DATABASE_URL    — Neon Postgres 연결 문자열
#   ACCESS_PASSWORD — 앱 접근 비밀번호 (8자 이상)
#   SESSION_SECRET  — 세션 암호화 시크릿 (32자 이상, openssl rand -base64 32)

# 2) DB 스키마 적용 (cards 테이블 생성)
npx drizzle-kit push

# 3) 개발 서버
npm run dev
# http://localhost:3000  →  /login 에서 ACCESS_PASSWORD 로 로그인
```

## 구조

```
src/
  app/
    (protected)/    # 로그인 게이트 뒤의 학습 화면 (layout.tsx 가 인증 검증 + Header, page.tsx = 학습 화면)
    login/          # 비밀번호 로그인 페이지
    api/            # Route Handlers: cards, cards/[id], login, logout
    icon.svg        # favicon (브랜드 마크) — Header 의 BrandMark 와 동일 디자인
  components/        # Header, FlashCard, CardForm(추가/수정 공용 모달), FilterTabs, HighlightedText
  hooks/             # useCards — 목록/CRUD/필터 상태
  lib/
    highlight.ts     # 예문 단어 강조 (순수 함수)
    storage.ts       # CardRepository 추상화 + apiRepository(/api/cards fetch)
    env.ts           # 환경변수 검증 (zod)
    session.ts       # iron-session 세션
    rate-limit.ts    # 로그인 rate limit
    db/              # Drizzle: schema / 클라이언트 / 카드 데이터 접근 (server-only)
  proxy.ts           # 인증 optimistic 리다이렉트 (Next 16: 구 middleware)
  types/             # Card 타입
drizzle.config.ts    # drizzle-kit 설정
```

## 데이터 / 인증

- 카드는 **Neon Postgres**(Drizzle ORM)에 저장. 카드는 client 훅에서 소비되므로 DB 접근은
  **Route Handler(`/api/cards`)를 거쳐 HTTP**로 이뤄짐. 저장소는 `CardRepository`(async)
  인터페이스로 추상화되어 있어, 백엔드 교체 시 `src/lib/storage.ts`의 `repository` 한 줄만
  바꾸면 됨.
- 혼자 쓰는 앱이라 **단일 비밀번호 게이트**(`iron-session`)로 전체를 보호. 실제 인증 검증은
  `(protected)/layout.tsx` 와 각 API 핸들러(401)가 담당하고, `src/proxy.ts` 는 보조적
  리다이렉트.
- **Vercel** 배포: `DATABASE_URL` / `ACCESS_PASSWORD` / `SESSION_SECRET` 3개를 프로젝트
  Environment Variables 에 등록.

## 기술 스택

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Neon Postgres + Drizzle ORM · iron-session · lucide-react
