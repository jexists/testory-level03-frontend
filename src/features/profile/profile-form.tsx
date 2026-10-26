'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
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
  const [confirming, setConfirming] = useState(false);

  // 입력이 맞으면 바로 저장하지 않고, 이미 한 신청은 그대로라는 걸 먼저 확인받는다
  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const invalid = deviceErrors(device);
    setFieldErrors(invalid);
    if (Object.keys(invalid).length > 0) return;
    setConfirming(true);
  }

  async function save() {
    setBusy(true);
    try {
      await api('/me/device', { method: 'PATCH', body: deviceToBody(device) });
      toast('내 기기 정보를 저장했어요.');
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {error && <Notice tone="error">{error}</Notice>}
      <DevicePicker value={device} onChange={setDevice} errors={fieldErrors} idPrefix="profile" />
      <div className="flex justify-end">
        <Button type="submit" loading={busy}>
          기기 정보 저장
        </Button>
      </div>
      <ConfirmDialog
        open={confirming}
        title="기기 정보를 바꿀까요?"
        description={
          <>
            앞으로 하는 신청부터 새 기기로 신청돼요. 이미 한 신청의 기기 정보는 자동으로 바뀌지 않아요.
            <br />
            새 기기로 참여하려면 그 신청을 취소하고 다시 신청해 주세요.
          </>
        }
        confirmLabel="변경"
        loading={busy}
        onConfirm={save}
        onCancel={() => setConfirming(false)}
      />
    </form>
  );
}
