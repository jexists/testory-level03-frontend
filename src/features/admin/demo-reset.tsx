'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Notice } from '@/components/ui/state-view';
import { useToast } from '@/components/ui/toast';
import { api, errorMessage } from '@/lib/api';
import type { DemoCounts } from '@/lib/types';

export function DemoReset() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [counts, setCounts] = useState<DemoCounts | null>(null);
  const [error, setError] = useState('');
  const lock = useRef(false);

  async function reset() {
    if (lock.current) return;
    lock.current = true;
    setRunning(true);
    setError('');
    try {
      const result = await api<DemoCounts>('/admin/demo/reset', { method: 'POST' });
      setCounts(result);
      setOpen(false);
      toast('시연 데이터를 초기화했어요.');
      router.refresh();
    } catch (e) {
      setOpen(false);
      setCounts(null);
      setError(errorMessage(e));
    } finally {
      lock.current = false;
      setRunning(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && <Notice tone="error">{error}</Notice>}
      {counts && (
        <Notice tone="success">
          테스터 {counts.testers}명, 모집글 {counts.recruitments}개, 피드백 {counts.feedbacks}건, AI 분석 {counts.analyses}개 버전을 만들었어요.
        </Notice>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="danger" onClick={() => setOpen(true)} loading={running}>
          시연 데이터 초기화
        </Button>
        {running && <p className="text-sm text-muted">데이터를 다시 만드는 중이에요. 3~10초쯤 걸려요.</p>}
      </div>
      <ConfirmDialog
        open={open}
        danger
        loading={running}
        title="시연 데이터를 초기화할까요?"
        description="지금 있는 테스터, 모집글, 신청, 피드백, AI 분석이 모두 지워지고 가상 데이터로 바뀌어요. 되돌릴 수 없어요."
        confirmLabel="시연 데이터 초기화"
        onCancel={() => setOpen(false)}
        onConfirm={reset}
      />
    </div>
  );
}
