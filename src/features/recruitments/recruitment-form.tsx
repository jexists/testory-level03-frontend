"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/shared/components/ui/button";
import { Field, TextArea, TextInput } from "@/shared/components/ui/field";
import { Segmented } from "@/shared/components/ui/tabs";
import { useToast } from "@/shared/components/ui/toast";
import type { RecruitmentDetail, RecruitmentKind, RecruitmentInput } from "@/shared/types/api";
import { fromLocalInput, toLocalInput } from "@/shared/utils/format";
import { recruitmentsApi } from "./api";
import { DeviceConditionsEditor } from "./device-conditions-editor";

export function RecruitmentForm({ initial }: { initial?: RecruitmentDetail }) {
  const router = useRouter();
  const toast = useToast();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [kind, setKind] = useState<RecruitmentKind>(initial?.kind ?? "FEATURE");
  const [capacity, setCapacity] = useState(String(initial?.capacity ?? 15));
  const [startAt, setStartAt] = useState(initial ? toLocalInput(initial.startAt) : "");
  const [endAt, setEndAt] = useState(initial ? toLocalInput(initial.endAt) : "");
  const [devices, setDevices] = useState<RecruitmentInput["devices"]>(
    initial?.devices.map((d) => ({ os: d.os, scope: d.scope, deviceModelId: d.deviceModelId })) ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const body: RecruitmentInput = {
        title, description, kind, capacity: capacity === "" ? (undefined as unknown as number) : Number(capacity),
        startAt: fromLocalInput(startAt), endAt: fromLocalInput(endAt), devices,
      };
      if (initial) await recruitmentsApi.update(initial.id, body); else await recruitmentsApi.create(body);
      toast(initial ? "수정했어요" : "모집글을 만들었어요");
      router.push("/admin/recruitments");
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <Field label="제목"><TextInput value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} /></Field>
      <Field label="설명"><TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="어떤 테스트인지, 무엇을 확인해야 하는지 적어 주세요." /></Field>
      <Field label="모집 종류">
        <Segmented label="모집 종류" value={kind} onChange={setKind} options={[{ value: "APP_FULL", label: "앱 전체" }, { value: "FEATURE", label: "기능별" }]} />
      </Field>
      <Field label="정원" hint={initial ? `지금 ${initial.participantCount}명이 참여 중이라 그보다 줄일 수 없어요.` : "1명 이상 50명 이하, 정하지 않으면 15명이에요."}>
        <TextInput type="number" inputMode="numeric" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="테스트 시작" hint="이 시각 전까지만 신청·취소할 수 있어요."><TextInput type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} /></Field>
        <Field label="테스트 종료"><TextInput type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} /></Field>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-sub">참여할 수 있는 기기</p>
        <DeviceConditionsEditor value={devices} onChange={setDevices} />
      </div>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2">
        <ButtonLink href="/admin/recruitments" variant="secondary">닫기</ButtonLink>
        <Button type="submit" disabled={busy} className="flex-1">{busy ? "저장하는 중이에요" : initial ? "수정하기" : "모집글 만들기"}</Button>
      </div>
    </form>
  );
}
