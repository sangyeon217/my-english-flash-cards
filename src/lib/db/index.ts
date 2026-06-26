import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/lib/env";
import * as schema from "./schema";

// Neon 서버리스 HTTP 드라이버 기반 Drizzle 클라이언트.
const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });
