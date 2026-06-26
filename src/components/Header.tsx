"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

// favicon(src/app/icon.svg)과 동일한 브랜드 마크 — 헤더와 탭 아이콘의 통일감 유지.
function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="7" fill="#2563eb" />
      <rect x="6.5" y="11" width="15" height="13" rx="2.5" fill="#bfdbfe" />
      <rect x="10" y="8" width="15" height="16" rx="2.5" fill="#ffffff" />
      <text
        x="17.5"
        y="20.5"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="12"
        fontWeight="700"
        fill="#2563eb"
        textAnchor="middle"
      >
        A
      </text>
    </svg>
  );
}

export function Header() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-2">
          <BrandMark className="h-7 w-7" />
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            My English Flash Cards
          </span>
        </div>
        <button
          onClick={handleLogout}
          aria-label="로그아웃"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-200/60 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">로그아웃</span>
        </button>
      </div>
    </header>
  );
}
