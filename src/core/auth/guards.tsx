"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Loading } from "@/shared/components/ui/state";
import { useAuth } from "./auth-provider";

/** 화면용 가드. 진짜 방어는 서버(R15)가 한다. */
export function RequireAuth({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const denied = ready && (!user || (admin && user.role !== "ADMIN"));

  useEffect(() => {
    if (!denied) return;
    router.replace(user ? "/" : `/login?next=${encodeURIComponent(path)}`);
  }, [denied, user, router, path]);

  if (!ready || denied) return <Loading text={denied ? "이동하는 중이에요" : "확인하는 중이에요"} />;
  return <>{children}</>;
}
