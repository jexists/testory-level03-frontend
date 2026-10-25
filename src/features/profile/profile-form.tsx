"use client";
import { useState, type FormEvent } from "react";
import { http } from "@/core/api/http";
import { useAuth } from "@/core/auth/auth-provider";
import { DevicePicker, type DeviceValue } from "@/features/auth/device-picker";
import { Button } from "@/shared/components/ui/button";
import { Field, TextInput } from "@/shared/components/ui/field";
import { useToast } from "@/shared/components/ui/toast";
import type { User } from "@/shared/types/api";

/** 내 기기 정보를 고칠 수 있는 유일한 화면(R7). */
export function ProfileForm() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [device, setDevice] = useState<DeviceValue>({ os: user?.deviceType ?? "", modelId: user?.deviceModelId ?? null });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      let u = await http.patch<User>("/me", { nickname });
      if (device.os && device.modelId !== null) u = await http.patch<User>("/me/device", { deviceType: device.os, deviceModelId: device.modelId });
      else if (!user?.deviceType) throw new Error("내 기기를 선택해 주세요.");
      setUser(u);
      toast("저장했어요");
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <Field label="이메일"><p className="flex h-12 items-center text-sub">{user?.email}</p></Field>
      <Field label="닉네임"><TextInput value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={50} /></Field>
      <div>
        <p className="mb-1 font-semibold">내 기기</p>
        <p className="mb-4 text-sm text-sub">모집글에 신청하면 신청한 순간의 기기가 함께 기록돼요. 여기서 바꿔도 이미 한 신청은 그대로예요.</p>
        <DevicePicker value={device} onChange={setDevice} />
      </div>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <Button type="submit" block disabled={busy}>{busy ? "저장하는 중이에요" : "저장하기"}</Button>
    </form>
  );
}
