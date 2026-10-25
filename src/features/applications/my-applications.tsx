'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Chip } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Notice } from '@/components/ui/state-view';
import { useToast } from '@/components/ui/toast';
import { api, errorMessage } from '@/lib/api';
import { formatDateTime, formatPeriod } from '@/lib/format';
import { OS_LABEL } from '@/lib/labels';
import type { MyApplication } from '@/lib/types';

export function MyApplications({ items }: { items: MyApplication[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [target, setTarget] = useState<MyApplication | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function cancel() {
    if (!target) return;
    setBusy(true);
    setError('');
    try {
      await api(`/applications/${target.id}`, { method: 'DELETE' });
      toast('신청을 취소했어요.');
      setTarget(null);
      router.refresh();
    } catch (e) {
      setTarget(null);
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {error && (
        <div className="border-b border-line p-4">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      <ul className="divide-y divide-line">
        {items.map((a) => (
          <li key={a.id} className="grid gap-3 px-5 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2 className="text-base">
                  <Link href={`/recruitments/${a.recruitment.id}`} className="hover:text-brand-ink hover:underline">
                    {a.recruitment.title}
                  </Link>
                </h2>
                {a.status === 'APPLIED' ? <Chip tone="brand">참여 중</Chip> : <Chip>취소</Chip>}
              </div>
              <p className="text-sm text-muted">
                테스트 기간 {formatPeriod(a.recruitment.startAt, a.recruitment.endAt)} <span aria-hidden>·</span> 신청 {formatDateTime(a.appliedAt)}
                {a.cancelledAt && <> · 취소 {formatDateTime(a.cancelledAt)}</>}
              </p>
              <p className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted">신청 당시 기기</span>
                <Chip>{OS_LABEL[a.deviceType]}</Chip>
                <span className="text-sm">{a.deviceModel}</span>
              </p>
            </div>
            {a.status === 'APPLIED' &&
              (a.canCancel ? (
                <Button variant="secondary" size="sm" onClick={() => setTarget(a)}>
                  신청 취소
                </Button>
              ) : (
                <span className="text-xs text-muted">테스트가 시작되어 취소할 수 없어요</span>
              ))}
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={!!target}
        title="신청을 취소할까요?"
        description={target && `‘${target.recruitment.title}’ 신청을 취소해요. 테스트 시작 전에는 다시 신청할 수 있어요.`}
        confirmLabel="신청 취소하기"
        cancelLabel="계속 참여하기"
        danger
        loading={busy}
        onConfirm={cancel}
        onCancel={() => setTarget(null)}
      />
    </>
  );
}
