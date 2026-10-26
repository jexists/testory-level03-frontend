'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, buttonClass } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';
import { api, errorMessage } from '@/lib/api';

interface Props {
  id: number;
  title: string;
  isClosed: boolean;
  deleted: boolean;
  /** 테스트 시작 전(모집 중·모집 마감)에만 마감 버튼을 보인다 */
  canClose: boolean;
}

/** 버튼을 누르는 동안 막고, 끝나면 알림을 띄운 뒤 화면을 새로 읽는다. */
function useRun() {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  async function run(action: () => Promise<unknown>, success: string, after?: () => void) {
    setBusy(true);
    try {
      await action();
      toast(success);
      router.refresh();
    } catch (e) {
      toast(errorMessage(e), 'error');
    } finally {
      after?.();
      setBusy(false);
    }
  }
  return { busy, run };
}

/** 삭제한 모집글을 되살린다. 모집글 상세 화면에서 쓰고, 한 번 더 물어본 뒤에 복구한다. */
function RestoreButton({ id, title }: { id: number; title: string }) {
  const { busy, run } = useRun();
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <Button variant="secondary" size="sm" disabled={busy} aria-label={`${title} 복구하기`} onClick={() => setConfirming(true)}>
        복구
      </Button>
      <ConfirmDialog
        open={confirming}
        loading={busy}
        title="이 모집글을 복구할까요?"
        description={
          <>
            <strong className="font-semibold text-ink">{title}</strong>
            <br />
            복구하면 테스터에게 다시 보이고, 신청·피드백도 그대로 이어져요.
          </>
        }
        confirmLabel="복구하기"
        onCancel={() => setConfirming(false)}
        onConfirm={() =>
          run(() => api(`/admin/recruitments/${id}/restore`, { method: 'PATCH' }), '복구했어요. 테스터에게 다시 보여요.', () => setConfirming(false))
        }
      />
    </>
  );
}

/** 모집글 상세 위쪽의 관리 버튼: 수정 · 마감/마감 해제 · 삭제. 마감은 테스트 시작 전에만 보이고, 삭제된 글은 복구만 할 수 있다. */
export function RecruitmentActions({ id, title, isClosed, deleted, canClose }: Props) {
  const { busy, run } = useRun();
  const [confirming, setConfirming] = useState(false);

  if (deleted) return <RestoreButton id={id} title={title} />;

  return (
    <div className="flex flex-wrap gap-1.5">
      <Link href={`/admin/recruitments/${id}/edit`} className={buttonClass('secondary', 'sm')} aria-label={`${title} 수정하기`}>
        수정
      </Link>
      {canClose && (
        <Button
          variant="secondary"
          size="sm"
          disabled={busy}
          aria-label={`${title} ${isClosed ? '마감 해제하기' : '마감하기'}`}
          onClick={() =>
            run(
              () => api(`/admin/recruitments/${id}/${isClosed ? 'reopen' : 'close'}`, { method: 'PATCH' }),
              isClosed ? '마감을 해제했어요.' : '마감했어요.',
            )
          }
        >
          {isClosed ? '마감 해제' : '마감'}
        </Button>
      )}
      <Button variant="secondary" size="sm" className="text-danger hover:bg-bug-tint" disabled={busy} aria-label={`${title} 삭제하기`} onClick={() => setConfirming(true)}>
        삭제
      </Button>
      <ConfirmDialog
        open={confirming}
        danger
        loading={busy}
        title="이 모집글을 삭제할까요?"
        description={
          <>
            <strong className="font-semibold text-ink">{title}</strong>
            <br />
            삭제해도 데이터는 남아요. 테스터에게는 보이지 않고, 대시보드의 &lsquo;삭제된 글&rsquo;에서 복구할 수 있어요.
          </>
        }
        confirmLabel="삭제하기"
        onCancel={() => setConfirming(false)}
        onConfirm={() => run(() => api(`/admin/recruitments/${id}`, { method: 'DELETE' }), '삭제했어요.', () => setConfirming(false))}
      />
    </div>
  );
}
