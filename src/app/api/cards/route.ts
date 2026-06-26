import { NextResponse } from "next/server";
import { getSession, isAuthenticated } from "@/lib/session";
import { createCard, getAllCards } from "@/lib/db/cards";

async function authed() {
  return isAuthenticated(await getSession());
}

const unauthorized = () =>
  NextResponse.json({ error: "unauthorized" }, { status: 401 });

export async function GET() {
  if (!(await authed())) return unauthorized();
  return NextResponse.json(await getAllCards());
}

export async function POST(req: Request) {
  if (!(await authed())) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const { word, meaning, example } = (body ?? {}) as Record<string, unknown>;
  if (
    typeof word !== "string" ||
    typeof meaning !== "string" ||
    typeof example !== "string" ||
    !word.trim() ||
    !meaning.trim() ||
    !example.trim()
  ) {
    return NextResponse.json({ error: "invalid_card" }, { status: 400 });
  }

  const card = await createCard({ word, meaning, example });
  return NextResponse.json(card, { status: 201 });
}
