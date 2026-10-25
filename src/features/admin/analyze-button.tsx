'use client';

import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/state-view';
import { useToast } from '@/components/ui/toast';
import { api, errorMessage } from '@/lib/api';
import type { AnalysisDetail } from '@/lib/types';

/** 새 분석은 5~20초쯤 걸릴 수 있다. 실행 중에는 버튼을 막아 두 번 눌리지 않게 한다. */
export function AnalyzeButton({ recruitmentId, disabledReason }: { recruitmentId: number; disabledReason?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);

  async function run() {
    if (lock.current) return;
    lock.current = true;
    setRunning(true);
    setError('');
    try {
      const saved = await api<AnalysisDetail>(`/admin/recruitments/${recruitmentId}/analyses`, { method: 'POST' });
      toast(`새 분석(v${saved.versionNo})을 저장했어요.`);
      router.push(`/admin/analysis?recruitmentId=${recruitmentId}&version=${saved.versionNo}`);
      router.refresh();
    } catch (e) {
      // 실패해도 이미 저장된 버전은 그대로 보여 준다.
      setError(errorMessage(e));
    } finally {
      lock.current = false;
      setRunning(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={run} loading={running} disabled={!!disabledReason}>
          {!running && <Sparkles className="size-4" aria-hidden />}
          {running ? '분석하는 중' : 'AI 분석 실행'}
        </Button>
        {running && <p className="text-sm text-muted">피드백을 읽고 있어요. 잠시만 기다려 주세요.</p>}
        {disabledReason && <p className="text-sm text-muted">{disabledReason}</p>}
      </div>
      {error && <Notice tone="error">{error}</Notice>}
    </div>
  );
}
