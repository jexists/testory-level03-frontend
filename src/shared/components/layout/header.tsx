"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/core/auth/auth-provider";
import { cn } from "@/shared/utils/format";

function NavLink({ href, children, match }: { href: string; children: React.ReactNode; match?: string }) {
  const path = usePathname();
  const active = path === href || (match ? path.startsWith(match) : false);
  return (
    <Link href={href} className={cn("flex min-h-11 shrink-0 items-center px-2.5 text-[15px]", active ? "font-semibold text-ink" : "text-sub hover:text-ink")}>
      {children}
    </Link>
  );
}

export function Header() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const admin = user?.role === "ADMIN";

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex w-full max-w-[1040px] items-center gap-2 px-3 py-1">
        <Link href={admin ? "/admin" : "/"} className="flex min-h-11 shrink-0 items-center px-2 text-lg font-bold">테스토리</Link>
        <nav aria-label="주 메뉴" className="flex min-w-0 flex-1 items-center overflow-x-auto no-scrollbar">
          {admin ? (
            <>
              <NavLink href="/admin">현황</NavLink>
              <NavLink href="/admin/recruitments" match="/admin/recruitments">모집글 관리</NavLink>
              <NavLink href="/admin/feedbacks">피드백</NavLink>
              <NavLink href="/admin/analysis">AI 분석</NavLink>
              <NavLink href="/admin/demo">시연 데이터</NavLink>
            </>
          ) : (
            <>
              <NavLink href="/" match="/recruitments">모집글</NavLink>
              {user && <NavLink href="/me/applications">내 신청</NavLink>}
              {user && <NavLink href="/me/feedbacks">내 피드백</NavLink>}
              {user && <NavLink href="/me">마이페이지</NavLink>}
            </>
          )}
        </nav>
        <div className="flex shrink-0 items-center">
          {!ready ? null : user ? (
            <button type="button" className="min-h-11 px-2.5 text-[15px] text-sub hover:text-ink" onClick={() => { logout(); router.push("/"); }}>
              로그아웃
            </button>
          ) : (
            <>
              <NavLink href="/login">로그인</NavLink>
              <Link href="/signup" className="flex min-h-11 items-center px-2.5 text-[15px] font-semibold text-brand">가입하기</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
