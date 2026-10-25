'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/state-view';
import { useToast } from '@/components/ui/toast';
import { DevicePicker } from '@/features/auth/device-picker';
import { api, errorMessage } from '@/lib/api';
import type { Os, User } from '@/lib/types';

/** 내 기기 정보를 고칠 수 있는 유일한 화면 */
export function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const { toast } = useToast();
  const [os, setOs] = useState<Os | ''>(user.deviceType ?? '');
  const [modelId, setModelId] = useState<number | ''>(user.deviceModel?.id ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!os || modelId === '') return setError('내 기기를 선택해 주세요.');
    setBusy(true);
    try {
      await api('/me/device', { method: 'PATCH', body: { deviceType: os, deviceModelId: modelId } });
      toast('내 기기 정보를 저장했어요.');
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} noValidate className="space-y-4">
      {error && <Notice tone="error">{error}</Notice>}
      <DevicePicker os={os} modelId={modelId} onChange={(v) => (setOs(v.os), setModelId(v.modelId))} idPrefix="profile" />
      <p className="text-xs text-muted">이미 한 신청에 남은 기기 정보는 바뀌지 않아요. 앞으로 하는 신청부터 새 기기가 쓰여요.</p>
      <div className="flex justify-end">
        <Button type="submit" loading={busy}>
          기기 정보 저장
        </Button>
      </div>
    </form>
  );
}
