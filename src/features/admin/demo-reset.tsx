'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';
import { api, errorMessage } from '@/lib/api';
import type { DemoCounts } from '@/lib/types';

/** 사용자 메뉴의 "시연 데이터 초기화"를 누르면 뜨는 확인 창. 끝나면 만든 개수를 알림으로 보여 준다. */
export function DemoResetDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const lock = useRef(false);

  async function reset() {
    if (lock.current) return;
    lock.current = true;
    setRunning(true);
    try {
      const c = await api<DemoCounts>('/admin/demo/reset', { method: 'POST' });
      toast(`시연 데이터를 초기화했어요. 테스터 ${c.testers}명, 모집글 ${c.recruitments}개, 피드백 ${c.feedbacks}건, AI 분석 ${c.analyses}개 버전을 만들었어요.`);
      onClose();
      router.refresh();
    } catch (e) {
      toast(errorMessage(e), 'error');
      onClose();
    } finally {
      lock.current = false;
      setRunning(false);
    }
  }

  return (
    <ConfirmDialog
      open={open}
      danger
      loading={running}
      title="시연 데이터를 초기화할까요?"
      description={
        <>
          지금 있는 테스터, 모집글, 신청, 피드백, AI 분석이 모두 지워지고 가상 데이터(테스터 20명, 모집글 5개, 피드백 30건, AI 분석 2개 버전)로 바뀌어요. 관리자 계정은 남아요.
          <br />
          <strong className="font-semibold text-ink">되돌릴 수 없으니 실제 데이터가 있는 환경에서는 누르지 마세요.</strong>
          {running && (
            <>
              <br />
              데이터를 다시 만드는 중이에요. 3~10초쯤 걸려요.
            </>
          )}
        </>
      }
      confirmLabel="초기화하기"
      onCancel={onClose}
      onConfirm={reset}
    />
  );
}
