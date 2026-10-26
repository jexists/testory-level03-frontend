import type { Metadata } from 'next';
import { DemoReset } from '@/features/admin/demo-reset';
import { PageHeader } from '@/features/admin/page-header';

export const metadata: Metadata = { title: '시연 데이터' };

export default function AdminDemoPage() {
  return (
    <>
      <PageHeader title="시연 데이터" />
      <section aria-labelledby="demo-reset" className="panel max-w-2xl space-y-5 p-5 sm:p-6">
        <div className="space-y-2">
          <h2 id="demo-reset" className="text-lg">
            시연 데이터 초기화
          </h2>
          <p className="text-sm text-ink-soft">시연용 가상 데이터를 지우고 다시 만들어요. 관리자 계정은 남아요. 테스터 20명, 모집글 5개, 피드백 30건, AI 분석 2개 버전이 만들어져요.</p>
          <p className="text-sm text-muted">실제로 쓰는 데이터가 있는 환경에서는 누르지 마세요. 지워진 데이터는 되돌릴 수 없어요.</p>
        </div>
        <DemoReset />
      </section>
    </>
  );
}
