'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Chip, StatusBadge } from '@/components/ui/badge';
import { Button, LinkButton } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Notice } from '@/components/ui/state-view';
import { SeatStrip } from '@/components/ui/seat-strip';
import { useToast } from '@/components/ui/toast';
import { api, errorMessage } from '@/lib/api';
import { osText } from '@/lib/labels';
import type { Recruitment, User } from '@/lib/types';

/** 화면 안내용 확인이다. 실제로 신청이 되는지는 서버가 다시 판단한다. */
function deviceAllowed(r: Recruitment, user: User): boolean {
  if (!(user.deviceType || user.deviceOsName) || !user.deviceModel) return false;
  // 조건이 없으면 모든 기기. 직접 입력한 OS·모델은 목록 기준 조건에 맞지 않는다.
  if (r.devices.length === 0) return true;
  return r.devices.some((d) =>
    d.scope === 'ALL' ? d.os === user.deviceType : user.deviceModel!.id !== null && d.deviceModelId === user.deviceModel!.id,
  );
}

const CLOSED_TEXT: Record<string, string> = {
  FULL: '정원이 모두 차서 마감됐어요. 누군가 취소하면 다시 열려요.',
  MANUAL: '담당자가 모집을 마감했어요.',
  STARTED: '테스트가 이미 시작되어 신청할 수 없어요.',
};

export function ApplyPanel({ recruitment: r, user }: { recruitment: Recruitment; user: User | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState('');
  const mine = r.myApplication?.status === 'APPLIED' ? r.myApplication : null;
  const started = r.phase !== 'UPCOMING';

  async function apply() {
    setBusy(true);
    setError('');
    try {
      await api(`/recruitments/${r.id}/applications`, { method: 'POST' });
      toast('신청했어요.');
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    if (!mine) return;
    setBusy(true);
    setError('');
    try {
      await api(`/applications/${mine.id}`, { method: 'DELETE' });
      toast('신청을 취소했어요.');
      setConfirmOpen(false);
      router.refresh();
    } catch (e) {
      setConfirmOpen(false);
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const allowed = user ? deviceAllowed(r, user) : true;

  return (
    <aside aria-label="신청" className="panel space-y-5 p-5 lg:sticky lg:top-20">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base">자리 현황</h2>
          <StatusBadge status={r.status} reason={r.closedReason} />
        </div>
        <SeatStrip capacity={r.capacity} filled={r.participants} closed={r.status === 'CLOSED'} size="lg" />
        <p className="text-sm text-muted">
          <span className="font-mono text-xl font-medium text-ink">{r.remaining}</span> 자리 남음 · 정원 {r.capacity}명 중 {r.participants}명 참여
        </p>
      </div>

      {error && <Notice tone="error">{error}</Notice>}

      {!user ? (
        <div className="space-y-2 border-t border-line pt-4">
          <p className="text-sm text-muted">신청하려면 로그인이 필요해요.</p>
          <LinkButton href={`/login?next=/recruitments/${r.id}`} className="w-full">
            로그인하고 신청하기
          </LinkButton>
        </div>
      ) : user.role === 'ADMIN' ? (
        <p className="border-t border-line pt-4 text-sm text-muted">관리자 계정은 신청할 수 없어요. 테스터 계정으로 로그인해 주세요.</p>
      ) : (
        <div className="space-y-4 border-t border-line pt-4">
          <div className="space-y-1.5">
            <p className="text-sm font-semibold">내 기기</p>
            {(user.deviceType || user.deviceOsName) && user.deviceModel ? (
              <p className="flex flex-wrap items-center gap-2 text-sm">
                <Chip>{osText(user.deviceType, user.deviceOsName)}</Chip>
                <span>{user.deviceModel.modelName}</span>
              </p>
            ) : (
              <p className="text-sm text-danger">내 기기가 등록되어 있지 않아요.</p>
            )}
            <p className="text-xs text-muted">
              여기서는 바꿀 수 없어요. 바꾸려면{' '}
              <Link href="/me" className="font-semibold text-brand underline-offset-4 hover:underline">
                마이페이지
              </Link>
              로 이동해 주세요.
            </p>
          </div>

          {mine ? (
            <div className="space-y-2">
              <Notice tone="success">이 모집에 참여 중이에요.</Notice>
              {started ? (
                <p className="text-xs text-muted">테스트가 시작되어 더는 취소할 수 없어요.</p>
              ) : (
                <Button variant="secondary" className="w-full" onClick={() => setConfirmOpen(true)}>
                  신청 취소하기
                </Button>
              )}
            </div>
          ) : r.status === 'OPEN' ? (
            <div className="space-y-2">
              {!allowed && user.deviceModel && (
                <Notice tone="error">내 기기는 이 모집의 허용 기기에 없어요. 위의 허용 기기 조건을 확인해 주세요.</Notice>
              )}
              <Button className="w-full" onClick={apply} loading={busy} disabled={!allowed}>
                신청하기
              </Button>
              <p className="text-xs text-muted">테스트 시작 전까지 취소하고 다시 신청할 수 있어요.</p>
            </div>
          ) : (
            <p className="text-sm text-muted">{CLOSED_TEXT[r.closedReason ?? 'MANUAL']}</p>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="신청을 취소할까요?"
        description="테스트가 시작되기 전에는 다시 신청할 수 있어요. 자리가 모두 찼다면 다시 신청하지 못할 수 있어요."
        confirmLabel="신청 취소하기"
        cancelLabel="계속 참여하기"
        danger
        loading={busy}
        onConfirm={cancel}
        onCancel={() => setConfirmOpen(false)}
      />
    </aside>
  );
}
