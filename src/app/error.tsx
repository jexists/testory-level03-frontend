'use client';

import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/state-view';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-page py-16">
      <div className="panel">
        <ErrorState
          title="화면을 불러오지 못했어요"
          description="잠시 뒤 다시 시도해 주세요. 계속 안 되면 서버가 깨어나는 중일 수 있어요(첫 접속은 1분쯤 걸려요)."
          action={<Button onClick={reset}>다시 시도</Button>}
        />
      </div>
    </div>
  );
}
