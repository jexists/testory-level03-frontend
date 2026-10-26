'use client';

import { CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Chip, StageBadge } from '@/components/ui/badge';
import { Button, LinkButton } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { InfoTip } from '@/components/ui/info-tip';
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

/** 내 기기 한 줄. 카드와 기기 변경 안내 모달이 같이 쓴다. */
function myDevice(user: User) {
  return (user.deviceType || user.deviceOsName) && user.deviceModel ? (
    <p className="flex flex-wrap items-center gap-2 text-sm text-ink">
      <Chip>{osText(user.deviceType, user.deviceOsName)}</Chip>
      <span>{user.deviceModel.modelName}</span>
    </p>
  ) : (
    <p className="text-sm text-danger">내 기기가 등록되어 있지 않아요.</p>
  );
}

export function ApplyPanel({ recruitment: r, user }: { recruitment: Recruitment; user: User | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [error, setError] = useState('');
  const mine = r.myApplication?.status === 'APPLIED' ? r.myApplication : null;
  const started = r.phase !== 'UPCOMING';

  async function apply() {
    setBusy(true);
    setError('');
    try {
      await api(`/recruitments/${r.id}/applications`, { method: 'POST' });
      toast('신청했어요.');
      setApplyOpen(false);
      router.refresh();
    } catch (e) {
      setApplyOpen(false);
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
    <aside aria-label="신청" className="panel flex flex-col gap-5 p-5 lg:sticky lg:top-20">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base">자리 현황</h2>
          <StageBadge stage={r.stage} />
        </div>
        <SeatStrip capacity={r.capacity} filled={r.participants} closed={r.status === 'CLOSED'} size="lg" />
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="text-lg font-semibold text-ink">
            <span className="font-mono">{r.remaining}</span>자리 남음
          </p>
          <p className="text-sm text-muted">
            정원 {r.capacity}명 중 {r.participants}명 참여
          </p>
        </div>
      </div>

      {error && <Notice tone="error">{error}</Notice>}

      {!user ? (
        // 신청을 받지 않는 모집글이면 로그인으로 보내지 않고 마감을 보여 준다.
        r.status === 'OPEN' ? (
          <LinkButton href={`/login?next=/recruitments/${r.id}`} className="w-full">
            로그인하고 신청하기
          </LinkButton>
        ) : (
          <Button className="w-full" disabled>
            신청 마감
          </Button>
        )
      ) : user.role === 'ADMIN' ? (
        <Button className="w-full" disabled>
          신청 불가
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-0.5 text-sm font-semibold">
                내 기기
                <InfoTip label="내 기기">기기 변경을 원하면 마이페이지에서 변경이 가능합니다</InfoTip>
              </p>
            </div>
            {myDevice(user)}
          </div>

          {mine ? (
            <div className="space-y-3">
              {/* 모집 신청이 끝났다는 뜻의 읽기 전용 표시. 모집글 단계 배지와는 별개다. */}
              <p role="status" className="flex items-center justify-center gap-2 rounded-control bg-praise-tint py-2.5 text-base font-bold text-praise">
                <CheckCircle2 className="size-5" aria-hidden />
                참여 완료
              </p>
              {/* 테스트가 시작되면 취소할 수 없어서 버튼을 보여 주지 않는다. */}
              {!started && (
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
              <Button className="w-full" onClick={() => setApplyOpen(true)} loading={busy} disabled={!allowed}>
                신청하기
              </Button>
            </div>
          ) : (
            <Button className="w-full" disabled>
              신청 마감
            </Button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={applyOpen}
        title="신청할까요?"
        description="테스트 시작 전까지는 취소하고 다시 신청할 수 있어요. 정원이 다 차면 테스트가 바로 시작돼요."
        confirmLabel="신청하기"
        loading={busy}
        onConfirm={apply}
        onCancel={() => setApplyOpen(false)}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="신청을 취소할까요?"
        description="테스트가 시작되기 전에는 다시 신청할 수 있어요. 그사이 정원이 다 차면 테스트가 시작되어 다시 신청하지 못해요."
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
