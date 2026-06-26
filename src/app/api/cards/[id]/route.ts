import { NextResponse } from "next/server";
import { getSession, isAuthenticated } from "@/lib/session";
import { deleteCard, updateCard, type CardUpdate } from "@/lib/db/cards";

async function authed() {
  return isAuthenticated(await getSession());
}

const unauthorized = () =>
  NextResponse.json({ error: "unauthorized" }, { status: 401 });

// 들어온 JSON 에서 허용된 필드만 추출해 안전한 patch 로 정규화한다.
function sanitizePatch(body: unknown): CardUpdate {
  const src = (body ?? {}) as Record<string, unknown>;
  const patch: CardUpdate = {};
  if (typeof src.word === "string" && src.word.trim())
    patch.word = src.word.trim();
  if (typeof src.meaning === "string" && src.meaning.trim())
    patch.meaning = src.meaning.trim();
  if (typeof src.example === "string" && src.example.trim())
    patch.example = src.example.trim();
  if (src.status === "learning" || src.status === "memorized")
    patch.status = src.status;
  return patch;
}

export async function PATCH(
  req: Request,
  ctx: RouteContext<"/api/cards/[id]">,
) {
  if (!(await authed())) return unauthorized();
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const patch = sanitizePatch(body);
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "empty_patch" }, { status: 400 });
  }

  try {
    return NextResponse.json(await updateCard(id, patch));
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/cards/[id]">,
) {
  if (!(await authed())) return unauthorized();
  const { id } = await ctx.params;
  await deleteCard(id);
  return NextResponse.json({ ok: true });
}
