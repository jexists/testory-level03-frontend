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
}

export function RecruitmentRowActions({ id, title, isClosed, deleted }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    try {
      await action();
      toast(success);
      setConfirming(false);
      router.refresh();
    } catch (e) {
      toast(errorMessage(e), 'error');
      setConfirming(false);
    } finally {
      setBusy(false);
    }
  }

  const link = buttonClass('secondary', 'sm');
  return (
    <div className="flex flex-wrap gap-1.5">
      <Link href={`/admin/recruitments/${id}/applicants`} className={link} aria-label={`${title} 신청자 보기`}>
        신청자
      </Link>
      {!deleted && (
        <Link href={`/admin/recruitments/${id}/edit`} className={link} aria-label={`${title} 수정하기`}>
          수정
        </Link>
      )}
      {!deleted && (
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
      <Link href={`/admin/analysis?recruitmentId=${id}`} className={link} aria-label={`${title} AI 분석 보기`}>
        AI 분석
      </Link>
      {!deleted && (
        <>
          <Button variant="ghost" size="sm" className="text-danger hover:bg-bug-tint" disabled={busy} aria-label={`${title} 삭제하기`} onClick={() => setConfirming(true)}>
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
                삭제해도 데이터는 남아요. 테스터에게는 보이지 않아요.
              </>
            }
            confirmLabel="삭제하기"
            onCancel={() => setConfirming(false)}
            onConfirm={() => run(() => api(`/admin/recruitments/${id}`, { method: 'DELETE' }), '삭제했어요.')}
          />
        </>
      )}
    </div>
  );
}
