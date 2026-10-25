import type { ReactNode } from 'react';

/** 로그인·가입 화면의 공통 틀: 가운데 한 칸짜리 패널 */
export function AuthShell({ title, description, children, footer }: { title: string; description: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="container-page flex justify-center py-10 sm:py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl">{title}</h1>
          <p className="text-sm text-muted">{description}</p>
        </div>
        <div className="panel p-6 sm:p-7">{children}</div>
        <p className="text-center text-sm text-muted">{footer}</p>
      </div>
    </div>
  );
}
