import type { Metadata } from 'next';
import '@fontsource/ibm-plex-sans-kr/400.css';
import '@fontsource/ibm-plex-sans-kr/500.css';
import '@fontsource/ibm-plex-sans-kr/600.css';
import '@fontsource/ibm-plex-sans-kr/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import { SiteHeader } from '@/components/layout/site-header';
import { ToastProvider } from '@/components/ui/toast';
import { getCurrentUser } from '@/lib/server-api';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Testory — 베타테스터 모집·피드백 관리', template: '%s · Testory' },
  description: '앱 베타테스터를 모집하고, 신청과 피드백을 한곳에서 관리하는 서비스예요.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
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
          <main id="main">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
