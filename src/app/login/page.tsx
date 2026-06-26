import { redirect } from "next/navigation";
import { getSession, isAuthenticated } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (isAuthenticated(await getSession())) {
    redirect("/");
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My English Flash Cards
          </h1>
          <p className="mt-2 text-sm text-slate-500">접근 비밀번호를 입력하세요</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
