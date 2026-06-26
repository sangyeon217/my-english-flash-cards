import { NextResponse, type NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import type { SessionData } from "@/lib/session";
import { SESSION_COOKIE_NAME } from "@/lib/session";

// Next.js 16: Middleware 는 Proxy 로 개명됨. optimistic 리다이렉트 용도로만 사용하고
// 실제 인증 enforcement 는 (protected)/layout.tsx 와 각 API 핸들러가 담당한다.
const MAX_AGE_SECONDS = 60 * 60 * 8;

export async function proxy(req: NextRequest) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    return new NextResponse("Server misconfigured", { status: 500 });
  }

  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, {
    password: secret,
    cookieName: SESSION_COOKIE_NAME,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE_SECONDS,
    },
  });

  const ok =
    session.authenticated === true &&
    typeof session.issuedAt === "number" &&
    Date.now() - session.issuedAt < MAX_AGE_SECONDS * 1000;

  if (ok) return res;
  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  matcher: ["/"],
};
