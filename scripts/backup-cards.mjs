// Neon DB 의 cards 데이터를 JSON 으로 백업하는 standalone 스크립트.
//
// DB 데이터 유실에 대비한 export. 앱 계층(src/lib/db/*, env.ts, server-only)에
// 의존하지 않고 직접 조회한다 — 백업은 절대 실패하면 안 되므로 zod 검증/번들러 결합을
// 피한다. 이미 설치된 의존성만 사용: @neondatabase/serverless, dotenv.
//
// 실행: `npm run backup` (또는 `node scripts/backup-cards.mjs`).
// .env.local 의 DATABASE_URL 을 사용하며, 결과는 backups/cards-<timestamp>.json 으로
// 저장된다. 주기 실행(백업 스케줄링)은 로컬 cron/launchd 로 사용자가 설정한다.

import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

config({ path: join(root, ".env.local") });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error(
    "❌ DATABASE_URL 이 없습니다. 레포 루트의 .env.local 을 확인하세요.",
  );
  process.exit(1);
}

// 로컬시각 기준 YYYYMMDD-HHmmss 타임스탬프 (파일명용).
function timestamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  );
}

try {
  const sql = neon(databaseUrl);

  // src/lib/db/cards.ts 의 getAllCards 와 동일한 정렬(즐겨찾기 우선, 그 안에서 최신순).
  const rows = await sql`
    select id, word, meaning, example, status, favorite, created_at
    from cards
    order by favorite desc, created_at desc
  `;

  // src/types/card.ts 의 Card 계약에 맞춰 매핑 (createdAt 은 epoch ms).
  const cards = rows.map((row) => ({
    id: row.id,
    word: row.word,
    meaning: row.meaning,
    example: row.example,
    status: row.status,
    favorite: row.favorite,
    createdAt: new Date(row.created_at).getTime(),
  }));

  const payload = {
    exportedAt: new Date().toISOString(),
    count: cards.length,
    cards,
  };

  const dir = join(root, "backups");
  await mkdir(dir, { recursive: true });
  const fileName = `cards-${timestamp()}.json`;
  await writeFile(
    join(dir, fileName),
    JSON.stringify(payload, null, 2) + "\n",
    "utf8",
  );

  console.log(`✅ ${cards.length}개 카드를 backups/${fileName} 에 백업했습니다.`);

  // 새 백업이 안전히 저장된 뒤에만 이전 백업 파일을 정리한다(최신 1개만 유지).
  const stale = (await readdir(dir)).filter(
    (f) => f !== fileName && /^cards-\d{8}-\d{6}\.json$/.test(f),
  );
  await Promise.all(stale.map((f) => unlink(join(dir, f))));
  if (stale.length > 0) {
    console.log(`🧹 이전 백업 ${stale.length}개를 삭제했습니다.`);
  }
} catch (err) {
  console.error("❌ 백업 실패:", err);
  process.exit(1);
}
