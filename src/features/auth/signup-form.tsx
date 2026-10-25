"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/core/auth/auth-provider";
import { Button } from "@/shared/components/ui/button";
import { Field, TextInput } from "@/shared/components/ui/field";
import { DevicePicker, type DeviceValue } from "./device-picker";
import { detectOs } from "./detect-os";

export function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();
  const [f, setF] = useState({ email: "", password: "", nickname: "" });
  const [device, setDevice] = useState<DeviceValue>({ os: "", modelId: null });
  const [detected, setDetected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // 브라우저 정보로 OS 를 미리 골라 둔다. 못 찾으면 직접 고르게 둔다.
  useEffect(() => {
    const os = detectOs();
    if (os) { setDevice({ os, modelId: null }); setDetected(true); }
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await signup({ ...f, deviceType: device.os, deviceModelId: device.modelId });
      router.replace("/");
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <Field label="이메일"><TextInput type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="name@example.com" /></Field>
      <Field label="비밀번호" hint="8자 이상으로 만들어 주세요."><TextInput type="password" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
      <Field label="닉네임"><TextInput value={f.nickname} onChange={(e) => setF({ ...f, nickname: e.target.value })} maxLength={50} /></Field>
      <div>
        <DevicePicker value={device} onChange={setDevice} />
        {detected && <p className="mt-2 text-sm text-faint">사용 중인 기기를 보고 OS를 미리 골랐어요. 맞지 않으면 바꿔 주세요.</p>}
      </div>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <Button type="submit" block disabled={busy}>{busy ? "가입하는 중이에요" : "가입하기"}</Button>
      <p className="text-center text-sub">이미 계정이 있나요? <Link href="/login" className="font-semibold text-brand">로그인하기</Link></p>
    </form>
  );
}
