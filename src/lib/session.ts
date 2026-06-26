import "server-only";
import type { SessionOptions } from "iron-session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { env } from "./env";

export type SessionData = {
  authenticated: boolean;
  issuedAt?: number;
};

export const SESSION_COOKIE_NAME = "flashcards_session";

const MAX_AGE_SECONDS = 60 * 60 * 8; // 8시간

const sessionOptions: SessionOptions = {
  password: env.SESSION_SECRET,
  cookieName: SESSION_COOKIE_NAME,
  cookieOptions: {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export function isAuthenticated(
  session: SessionData | null | undefined,
): boolean {
  if (!session?.authenticated) return false;
  if (!session.issuedAt) return false;
  const ageSeconds = (Date.now() - session.issuedAt) / 1000;
  return ageSeconds < MAX_AGE_SECONDS;
}
