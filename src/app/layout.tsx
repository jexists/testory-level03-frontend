import type { Metadata, Viewport } from "next";
import "pretendard/dist/web/variable/pretendardvariable.css";
import "./globals.css";
import { AuthProvider } from "@/core/auth/auth-provider";
import { Header } from "@/shared/components/layout/header";
import { ToastProvider } from "@/shared/components/ui/toast";

export const metadata: Metadata = {
  title: { default: "테스토리", template: "%s · 테스토리" },
  description: "베타테스터 모집과 피드백을 한곳에서 관리해요.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <ToastProvider>
            <Header />
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
