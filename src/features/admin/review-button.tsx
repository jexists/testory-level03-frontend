'use client';

import { CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/state-view';
import { useToast } from '@/components/ui/toast';
import { api, errorMessage } from '@/lib/api';

/** 최신 분석 결과를 다 봤다고 표시한다. 모집글이 "종료" 단계가 된다. */
export function ReviewButton({ recruitmentId }: { recruitmentId: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function review() {
    setBusy(true);
    setError('');
    try {
      await api(`/admin/recruitments/${recruitmentId}/analyses/review`, { method: 'POST' });
      toast('확인 완료했어요. 이 모집글은 종료로 바뀌어요.');
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={review} loading={busy}>
        {!busy && <CheckCircle2 className="size-4" aria-hidden />}
        확인 완료
      </Button>
      {error && <Notice tone="error">{error}</Notice>}
    </div>
  );
}
