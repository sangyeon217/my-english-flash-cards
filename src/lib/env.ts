import { z } from "zod";

// 서버 환경변수 검증. 누락/오설정 시 부팅 시점에 즉시 실패시켜
// 런타임에서 모호한 에러가 나는 것을 방지한다.
const schema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  ACCESS_PASSWORD: z.string().min(8, "ACCESS_PASSWORD must be at least 8 chars"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 chars"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(
    `\n[env] Environment validation failed.\n${issues}\n\n` +
      `Copy .env.example to .env.local and fill in the values.\n`,
  );
}

export const env = parsed.data;
