'use client';

import clsx from 'clsx';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { StageBadge } from '@/components/ui/badge';
import { Button, LinkButton } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ListRow } from '@/components/ui/list-row';
import { Notice } from '@/components/ui/state-view';
import { useToast } from '@/components/ui/toast';
import { api, errorMessage } from '@/lib/api';
import { formatDate, formatPeriod } from '@/lib/format';
import type { MyApplication } from '@/lib/types';

export function MyApplications({ items, feedbackCounts = {} }: { items: MyApplication[]; feedbackCounts?: Record<number, number> }) {
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

  /** 오른쪽 글자 버튼: 시작 전이면 신청 취소, 테스트 중 피드백 0건이면 피드백 쓰기(파란색), 쓴 피드백이 있으면 내 피드백 */
  function action(a: MyApplication, narrow = false) {
    if (a.status !== 'APPLIED') return null;
    if (a.canCancel) {
      return (
        <Button variant="ghost" size="sm" className={clsx('text-danger! hover:bg-bug-tint', narrow && '-ml-3')} onClick={() => setTarget(a)}>
          신청 취소
        </Button>
      );
    }
    // 피드백 버튼은 상세 화면으로 넘어가므로 › 를 붙인다
    const href = `/recruitments/${a.recruitment.id}#feedback`;
    const written = !!feedbackCounts[a.recruitment.id];
    if (!written && a.recruitment.stage !== 'TESTING') return null;
    return (
      <LinkButton
        href={href}
        variant="ghost"
        size="sm"
        className={clsx('gap-0.5 pr-2', !written && 'text-brand-ink! hover:bg-brand-tint', narrow && '-ml-3')}
      >
        {written ? '내 피드백' : '피드백 쓰기'}
        <ChevronRight className="size-4" aria-hidden />
      </LinkButton>
    );
  }

  return (
    <>
      {error && (
        <div className="border-b border-line p-4">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      <ul className="divide-y divide-line">
        {items.map((a) => {
          const narrow = action(a, true);
          const wide = action(a);
          return (
            <ListRow
              key={a.id}
              href={`/recruitments/${a.recruitment.id}`}
              title={a.recruitment.title}
              badge={
                a.status === 'APPLIED' ? (
                  <StageBadge stage={a.recruitment.stage} />
                ) : (
                  <span className="inline-flex rounded-chip bg-sunken px-2 py-0.5 text-xs font-semibold leading-5 text-muted">취소함</span>
                )
              }
              meta={
                <>
                  <span className="whitespace-nowrap">{formatPeriod(a.recruitment.startAt, a.recruitment.endAt)}</span>
                  <span className="hidden sm:inline" aria-hidden>
                    ·
                  </span>
                  <span className="whitespace-nowrap">피드백 마감 {formatDate(a.recruitment.feedbackDueAt)}</span>
                </>
              }
              // 좁은 화면에서는 제목이 눌리지 않게 버튼을 날짜 아래에 둔다
              footer={narrow && <div className="sm:hidden">{narrow}</div>}
              trailing={wide && <div className="hidden shrink-0 sm:block">{wide}</div>}
            />
          );
        })}
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
