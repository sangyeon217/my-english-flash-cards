import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit 은 Next.js 밖에서 실행되므로 .env.local 을 직접 로드한다.
config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
