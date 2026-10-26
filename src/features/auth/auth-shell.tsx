import type { ReactNode } from 'react';

/** 로그인·가입 화면의 공통 틀: 카드 없이 가운데 정렬한 한 칸짜리 폼 */
export function AuthShell({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="container-page flex justify-center py-12 sm:py-20">
      <div className="w-full max-w-md">
        <div className="space-y-12">
          <h1 className="text-center text-2xl font-bold tracking-tight">{title}</h1>
          {children}
        </div>
        <p className="mt-6 text-center text-sm text-muted">{footer}</p>
      </div>
    </div>
  );
}
