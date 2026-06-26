import { redirect } from "next/navigation";
import { getSession, isAuthenticated } from "@/lib/session";
import { Header } from "@/components/Header";

export const dynamic = "force-dynamic";

// 보호 라우트의 실제 인증 enforcement 지점.
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAuthenticated(await getSession())) {
    redirect("/login");
  }
  return (
    <>
      <Header />
      {children}
    </>
  );
}
