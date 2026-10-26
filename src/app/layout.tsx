import type { Metadata } from 'next';
import '@fontsource/ibm-plex-sans-kr/400.css';
import '@fontsource/ibm-plex-sans-kr/500.css';
import '@fontsource/ibm-plex-sans-kr/600.css';
import '@fontsource/ibm-plex-sans-kr/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import { SiteHeader } from '@/components/layout/site-header';
import { Notice } from '@/components/ui/state-view';
import { ToastProvider } from '@/components/ui/toast';
import { ApiError } from '@/lib/api';
import { getCurrentUser } from '@/lib/server-api';
import type { User } from '@/lib/types';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Testory — 베타테스터 모집·피드백 관리', template: '%s · Testory' },
  description: '앱 베타테스터를 모집하고, 신청과 피드백을 한곳에서 관리하는 서비스예요.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // 백엔드에 닿지 않아도 화면 틀은 그리고, 위쪽에 연결 오류를 알린다.
  let user: User | null = null;
  let serverError = '';
  try {
    user = await getCurrentUser();
  } catch (e) {
    serverError = e instanceof ApiError ? e.message : '서버에 연결할 수 없어요. 잠시 뒤 다시 시도해 주세요.';
  }
  return (
    <html lang="ko">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-control focus:bg-ink focus:px-3 focus:py-2 focus:text-sm focus:text-white"
        >
          본문으로 건너뛰기
        </a>
        <ToastProvider>
          <SiteHeader user={user} />
          {serverError && (
            <div className="container-page pt-4">
              <Notice tone="error">{serverError}</Notice>
            </div>
          )}
          <main id="main">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
