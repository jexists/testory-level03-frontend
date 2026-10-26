'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/state-view';
import { useToast } from '@/components/ui/toast';
import { DevicePicker, deviceErrors, deviceFromUser, deviceToBody, type DeviceErrors } from '@/features/auth/device-picker';
import { api, errorMessage } from '@/lib/api';
import type { User } from '@/lib/types';

/** 내 기기 정보를 고칠 수 있는 유일한 화면 */
export function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const { toast } = useToast();
  const [device, setDevice] = useState(() => deviceFromUser(user));
  const [fieldErrors, setFieldErrors] = useState<DeviceErrors>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const invalid = deviceErrors(device);
    setFieldErrors(invalid);
    if (Object.keys(invalid).length > 0) return;
    setBusy(true);
    try {
      await api('/me/device', { method: 'PATCH', body: deviceToBody(device) });
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
      <DevicePicker value={device} onChange={setDevice} errors={fieldErrors} idPrefix="profile" />
      <p className="text-xs text-muted">이미 한 신청에 남은 기기 정보는 바뀌지 않아요. 앞으로 하는 신청부터 새 기기가 쓰여요.</p>
      <div className="flex justify-end">
        <Button type="submit" loading={busy}>
          기기 정보 저장
        </Button>
      </div>
    </form>
  );
}
